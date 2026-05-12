"use server"

import { db } from "@/db";
import { products, inventoryLogs } from "@/db/schema";
import { eq, sql, gt, and } from "drizzle-orm";
import { auth } from "./auth";
import { headers } from "next/headers";

/**
 * Função interna — calcula métricas de um produto sem verificar sessão.
 * Chamada por getCompanyOverview que já autenticou o usuário.
 */
async function computeProductMetrics(productId: string, daysRange: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysRange);

    const salesData = await db
        .select({ qty: sql<number>`COALESCE(SUM(ABS(${inventoryLogs.change})), 0)` })
        .from(inventoryLogs)
        .where(and(
            eq(inventoryLogs.productId, productId),
            eq(inventoryLogs.type, "SALE"),
            gt(inventoryLogs.createdAt, cutoffDate)
        ));

    const average30d = Number(salesData[0]?.qty ?? 0) / daysRange;

    const product = await db.query.products.findFirst({
        where: eq(products.id, productId)
    });

    if (!product) throw new Error("Produto não encontrado");

    // Cálculo de Dias Restantes (Runway)
    const daysRemaining = average30d > 0
        ? Math.floor(product.currentStock / average30d)
        : (product.currentStock > 0 ? 999 : 0); // 999 = estoque sem consumo registrado

    let status: 'CRITICAL' | 'WARNING' | 'HEALTHY' = 'HEALTHY';
    if (daysRemaining < 3) status = 'CRITICAL';
    else if (daysRemaining <= 7) status = 'WARNING';

    return {
        average30d,
        daysRemaining,
        status,
        currentStock: product.currentStock,
        qtdMinima: product.qtdMinima
    };
}

/**
 * Retorna métricas detalhadas de um produto (versão pública com auth).
 */
export async function getProductMetrics(productId: string, daysRange: number = 30) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session) throw new Error("Não autorizado");

    return computeProductMetrics(productId, daysRange);
}

/**
 * Retorna uma visão geral da empresa para o Dashboard.
 */
export async function getCompanyOverview(daysRange: number = 30) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session) throw new Error("Não autorizado");

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysRange);

    const totalSalesResult = await db
        .select({ total: sql<number>`SUM(${inventoryLogs.change})` })
        .from(inventoryLogs)
        .where(and(
            eq(inventoryLogs.type, "SALE"),
            gt(inventoryLogs.createdAt, cutoffDate)
        ));
    
    const totalSales = Math.abs(Number(totalSalesResult[0]?.total ?? 0));

    // Total de receita (valor acumulado em vendas)
    const revenueResult = await db
        .select({
            total: sql<number>`COALESCE(SUM(ABS(${inventoryLogs.change}) * ${products.price} / 100), 0)`
        })
        .from(inventoryLogs)
        .innerJoin(products, eq(inventoryLogs.productId, products.id))
        .where(and(
            eq(inventoryLogs.type, "SALE"),
            gt(inventoryLogs.createdAt, cutoffDate)
        ));

    const totalRevenue = Number(revenueResult[0]?.total ?? 0);

    // 2. Saúde do estoque — usa função interna (sem dupla verificação de sessão)
    const allProducts = await db.select().from(products);
    const health = { critical: 0, warning: 0, healthy: 0 };

    const productsWithMetrics = await Promise.all(
        allProducts.map(async (p) => {
            const m = await computeProductMetrics(p.id, daysRange);
            if (m.status === 'CRITICAL') health.critical++;
            else if (m.status === 'WARNING') health.warning++;
            else health.healthy++;
            return { ...p, metrics: m };
        })
    );

    // 3. Vendas diárias (período configurado) para o gráfico
    const chartDays = Math.max(daysRange, 15);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - chartDays);

    const dailySalesResult = await db
        .select({
            day: sql<string>`TO_CHAR(${inventoryLogs.createdAt}, 'DD/MM')`,
            qty: sql<number>`COALESCE(SUM(ABS(${inventoryLogs.change})), 0)`
        })
        .from(inventoryLogs)
        .where(and(
            eq(inventoryLogs.type, "SALE"),
            gt(inventoryLogs.createdAt, startDate)
        ))
        .groupBy(sql`TO_CHAR(${inventoryLogs.createdAt}, 'DD/MM')`)
        .orderBy(sql`TO_CHAR(${inventoryLogs.createdAt}, 'DD/MM')`);

    const chartData: { date: string; sales: number }[] = dailySalesResult.map(row => ({
        date: row.day as string,
        sales: Number(row.qty)
    }));

    return {
        totalSales30d: totalSales,
        totalRevenue,
        salesDaysRange: daysRange,
        health,
        chartData,
        topProducts: productsWithMetrics
            .sort((a, b) => b.metrics.average30d - a.metrics.average30d)
            .slice(0, 5)
    };
}
