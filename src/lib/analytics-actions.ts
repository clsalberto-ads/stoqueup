"use server"

import { db } from "@/db";
import { inventoryLogs, products } from "@/db/schema";
import { eq, sql, and, desc } from "drizzle-orm";
import { auth } from "./auth";

/**
 * Retorna métricas detalhadas de um produto, incluindo média móvel e dias restantes.
 */
export async function getProductMetrics(productId: string) {
    const session = await auth.api.getSession();
    if (!session) throw new Error("Não autorizado");

    // Query para calcular média móvel de 30 dias considerando dias com zero vendas
    // 1. Gerar série de datas (últimos 30 dias)
    // 2. Fazer join com os logs de venda
    // 3. Calcular a média
    const metrics = await db.execute(sql`
        WITH date_series AS (
            SELECT generate_series(
                CURRENT_DATE - INTERVAL '29 days',
                CURRENT_DATE,
                '1 day'
            )::date AS day
        ),
        daily_sales AS (
            SELECT 
                DATE_TRUNC('day', "createdAt")::date AS day,
                SUM(ABS(change)) AS qty
            FROM inventory_logs
            WHERE "productId" = ${productId} AND type = 'SALE'
            GROUP BY 1
        )
        SELECT 
            AVG(COALESCE(ds.qty, 0))::float AS average_30d
        FROM date_series dr
        LEFT JOIN daily_sales ds ON dr.day = ds.day
    `);

    const average30d = (metrics[0] as any)?.average_30d || 0;
    
    // Buscar estoque atual
    const product = await db.query.products.findFirst({
        where: eq(products.id, productId)
    });

    if (!product) throw new Error("Produto não encontrado");

    // Cálculo de Dias Restantes (Runway)
    const daysRemaining = average30d > 0 
        ? Math.floor(product.currentStock / average30d) 
        : (product.currentStock > 0 ? 999 : 0); // 999 indica estoque "infinito" se não há vendas

    // Determinar Status do Semáforo
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
 * Retorna uma visão geral da empresa para o Dashboard.
 */
export async function getCompanyOverview() {
    const session = await auth.api.getSession();
    if (!session) throw new Error("Não autorizado");

    // 1. Total de vendas nos últimos 30 dias
    const totalSales = await db.execute(sql`
        SELECT SUM(ABS(change)) as total
        FROM inventory_logs
        WHERE type = 'SALE' AND "createdAt" > NOW() - INTERVAL '30 days'
    `);

    // 2. Saúde do estoque (Contagem por status)
    const allProducts = await db.select().from(products);
    const health = { critical: 0, warning: 0, healthy: 0 };

    // Para o overview, vamos processar em paralelo as métricas de risco
    const productsWithMetrics = await Promise.all(
        allProducts.map(async (p) => {
            const m = await getProductMetrics(p.id);
            if (m.status === 'CRITICAL') health.critical++;
            else if (m.status === 'WARNING') health.warning++;
            else health.healthy++;
            return { ...p, metrics: m };
        })
    );

    // 3. Vendas diárias (últimos 15 dias) para o gráfico
    const chartData = await db.execute(sql`
        WITH date_series AS (
            SELECT generate_series(
                CURRENT_DATE - INTERVAL '14 days',
                CURRENT_DATE,
                '1 day'
            )::date AS day
        ),
        daily_sales AS (
            SELECT 
                DATE_TRUNC('day', "createdAt")::date AS day,
                SUM(ABS(change)) AS qty
            FROM inventory_logs
            WHERE type = 'SALE'
            GROUP BY 1
        )
        SELECT 
            TO_CHAR(dr.day, 'DD/MM') as date,
            COALESCE(ds.qty, 0)::int as sales
        FROM date_series dr
        LEFT JOIN daily_sales ds ON dr.day = ds.day
        ORDER BY dr.day ASC
    `);

    return {
        totalSales30d: (totalSales[0] as any)?.total || 0,
        health,
        chartData: chartData as any[],
        topProducts: productsWithMetrics
            .sort((a, b) => b.metrics.average30d - a.metrics.average30d)
            .slice(0, 5)
    };
}
