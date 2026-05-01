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

            return { success: true, product };
        });

        revalidatePath("/dashboard/products");
        revalidatePath("/dashboard/sales");
        
        return result;
    } catch (error) {
        console.error("Erro ao processar venda:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Erro desconhecido" 
        };
    }
}
