"use server"

import { auth } from "./auth";
import { db } from "@/db";
import { products, inventoryLogs, productionTasks } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Registra uma venda de produto, decrementando o estoque e disparando gatilhos se necessário.
 */
export async function sellProduct(productId: string, quantity: number) {
    const session = await auth.api.getSession();
    
    if (!session || !session.user) {
        throw new Error("Não autorizado");
    }

    try {
        const result = await db.transaction(async (tx) => {
            // 1. Decremento atômico com verificação de estoque
            const updated = await tx
                .update(products)
                .set({
                    currentStock: sql`${products.currentStock} - ${quantity}`,
                    updatedAt: new Date()
                })
                .where(and(
                    eq(products.id, productId),
                    gte(products.currentStock, quantity)
                ))
                .returning();

            const product = updated[0];

            if (!product) {
                throw new Error("Estoque insuficiente ou produto não encontrado");
            }

            // 2. Registrar no log de inventário
            await tx.insert(inventoryLogs).values({
                id: crypto.randomUUID(),
                productId: product.id,
                userId: session.user.id,
                change: -quantity,
                type: "SALE",
                createdAt: new Date(),
            });

            // 3. Verificar gatilho de produção (qtdMinima)
            if (product.currentStock <= product.qtdMinima) {
                // Verificar se já existe uma tarefa pendente para este produto
                const existingTask = await tx
                    .select()
                    .from(productionTasks)
                    .where(and(
                        eq(productionTasks.productId, product.id),
                        eq(productionTasks.status, "PENDING")
                    ))
                    .limit(1);

                if (existingTask.length === 0) {
                    await tx.insert(productionTasks).values({
                        id: crypto.randomUUID(),
                        productId: product.id,
                        status: "PENDING",
                        quantity: product.qtdMaxima - product.currentStock, // Sugestão: completar até o máximo
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                }
            }

            return { success: true as const, product };
        });

        revalidatePath("/dashboard/products");
        revalidatePath("/dashboard/sales");
        
        return result;
    } catch (error) {
        console.error("Erro ao processar venda:", error);
        return { 
            success: false as const, 
            error: error instanceof Error ? error.message : "Erro desconhecido" 
        };
    }
}

/**
 * Atualiza o status de uma tarefa de produção.
 */
export async function updateProductionStatus(taskId: string, newStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED") {
    const session = await auth.api.getSession();
    
    if (!session || !session.user) {
        throw new Error("Não autorizado");
    }

    try {
        await db.update(productionTasks)
            .set({ 
                status: newStatus,
                updatedAt: new Date()
            })
            .where(eq(productionTasks.id, taskId));

        revalidatePath("/dashboard/production");
        return { success: true as const };
    } catch (error) {
        return { 
            success: false as const, 
            error: error instanceof Error ? error.message : "Erro desconhecido" 
        };
    }
}

/**
 * Conclui uma produção, incrementando o estoque com conferência.
 */
export async function completeProduction(taskId: string, productId: string, actualQuantity: number) {
    const session = await auth.api.getSession();
    
    if (!session || !session.user) {
        throw new Error("Não autorizado");
    }

    try {
        const result = await db.transaction(async (tx) => {
            // 1. Obter produto para verificar qtd_maxima
            const product = await tx.query.products.findFirst({
                where: eq(products.id, productId)
            });

            if (!product) throw new Error("Produto não encontrado");

            // 2. Calcular novo estoque com trava de segurança (D-05)
            let newStock = product.currentStock + actualQuantity;
            let adjustmentMessage = "";

            if (newStock > product.qtdMaxima) {
                const diff = newStock - product.qtdMaxima;
                newStock = product.qtdMaxima;
                adjustmentMessage = ` (Estoque limitado ao máximo de ${product.qtdMaxima}. Excesso de ${diff} ignorado)`;
            }

            // 3. Atualizar estoque
            await tx.update(products)
                .set({ 
                    currentStock: newStock,
                    updatedAt: new Date()
                })
                .where(eq(products.id, productId));

            // 4. Marcar tarefa como concluída
            await tx.update(productionTasks)
                .set({ 
                    status: "COMPLETED",
                    updatedAt: new Date()
                })
                .where(eq(productionTasks.id, taskId));

            // 5. Log de inventário
            await tx.insert(inventoryLogs).values({
                id: crypto.randomUUID(),
                productId,
                userId: session.user.id,
                change: actualQuantity,
                type: "PRODUCTION",
                createdAt: new Date()
            });

            return { success: true as const, message: `Produção concluída!${adjustmentMessage}` };
        });

        revalidatePath("/dashboard/products");
        revalidatePath("/dashboard/production");
        return result;
    } catch (error) {
        return { 
            success: false as const, 
            error: error instanceof Error ? error.message : "Erro desconhecido" 
        };
    }
}

/**
 * Cria uma tarefa de produção manual (Apenas Manager).
 */
export async function createManualProductionTask(productId: string, quantity: number) {
    const session = await auth.api.getSession();
    
    if (!session || !session.user || session.user.role !== "admin") {
        throw new Error("Ação permitida apenas para administradores");
    }

    try {
        const product = await db.query.products.findFirst({
            where: eq(products.id, productId)
        });

        if (!product) throw new Error("Produto não encontrado");

        // Trava D-06
        const maxAllowed = product.qtdMaxima - product.currentStock;
        if (quantity > maxAllowed) {
            throw new Error(`Quantidade máxima permitida para este produto no momento é ${maxAllowed}`);
        }

        await db.insert(productionTasks).values({
            id: crypto.randomUUID(),
            productId,
            status: "PENDING",
            quantity,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        revalidatePath("/dashboard/production");
        return { success: true as const };
    } catch (error) {
        return { 
            success: false as const, 
            error: error instanceof Error ? error.message : "Erro desconhecido" 
        };
    }
}
