"use server"

import { auth } from "./auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { products, inventoryLogs, productionTasks } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification-actions";

/**
 * Registra uma venda de produto, decrementando o estoque e disparando gatilhos se necessário.
 */
export async function sellProduct(productId: string, quantity: number) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
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
                await tx.update(products)
                    .set({ statusVenda: false, updatedAt: new Date() })
                    .where(eq(products.id, product.id))
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
                
                // 4. Notificar estoque crítico
                await createNotification(
                    session.user.id,
                    "Estoque Crítico!",
                    `O produto ${product.name} atingiu o nível mínimo (${product.qtdMinima}). Reposição necessária.`
                );
            }

            return { success: true as const, product };
        });

        revalidatePath("/dashboard/products");
        revalidatePath("/dashboard/sales");
        revalidatePath("/dashboard/metrics");
        revalidatePath("/dashboard");
        
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
 * Registra uma venda com múltiplos produtos (carrinho de compras).
 */
export async function sellMultipleProducts(items: { productId: string, quantity: number }[]) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session || !session.user) {
        throw new Error("Não autorizado");
    }

    if (!items || items.length === 0) {
        return { success: false as const, error: "Nenhum item informado" };
    }

    try {
        const transactionTime = new Date();
        await db.transaction(async (tx) => {
            for (const item of items) {
                // 1. Decremento atômico
                const updated = await tx
                    .update(products)
                    .set({
                        currentStock: sql`${products.currentStock} - ${item.quantity}`,
                        updatedAt: transactionTime
                    })
                    .where(and(
                        eq(products.id, item.productId),
                        gte(products.currentStock, item.quantity)
                    ))
                    .returning();

                const product = updated[0];

                if (!product) {
                    throw new Error(`Estoque insuficiente ou produto não encontrado para o ID: ${item.productId}`);
                }

                // 2. Registrar no log
                await tx.insert(inventoryLogs).values({
                    id: crypto.randomUUID(),
                    productId: product.id,
                    userId: session.user.id,
                    change: -item.quantity,
                    type: "SALE",
                    createdAt: transactionTime,
                });

                // 3. Verificar gatilho de produção
                if (product.currentStock <= product.qtdMinima) {
                    await tx.update(products)
                        .set({ statusVenda: false, updatedAt: transactionTime })
                        .where(eq(products.id, product.id))

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
                            quantity: Math.max(product.qtdMaxima - product.currentStock, 1),
                            createdAt: transactionTime,
                            updatedAt: transactionTime,
                        });
                    }
                    
                    await createNotification(
                        session.user.id,
                        "Estoque Crítico!",
                        `O produto ${product.name} atingiu o nível mínimo. Reposição necessária.`
                    );
                }
            }
        });

        revalidatePath("/dashboard/products");
        revalidatePath("/dashboard/sales");
        revalidatePath("/dashboard/metrics");
        revalidatePath("/dashboard");
        
        return { success: true as const };
    } catch (error) {
        console.error("Erro ao processar venda múltipla:", error);
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
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
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
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session || !session.user) {
        throw new Error("Não autorizado");
    }

    try {
        const result = await db.transaction(async (tx) => {
            // 0. Obter a tarefa para verificar a quantidade original
            const task = await tx.query.productionTasks.findFirst({
                where: eq(productionTasks.id, taskId)
            });

            if (!task) throw new Error("Tarefa de produção não encontrada");

            // 1. Obter produto para verificar qtd_maxima
            const product = await tx.query.products.findFirst({
                where: eq(products.id, productId)
            });

            if (!product) throw new Error("Produto não encontrado");

            // 2. Atualizar estoque com trava de segurança atômica (D-05)
            const cap = product.qtdMaxima;
            const diff = product.currentStock + actualQuantity - cap;
            let adjustmentMessage = "";

            if (diff > 0) {
                adjustmentMessage = ` (Estoque limitado ao máximo de ${cap}. Excesso de ${diff} ignorado)`;
            }

            await tx.update(products)
                .set({
                    currentStock: sql`LEAST(${products.currentStock} + ${actualQuantity}, ${cap})`,
                    updatedAt: new Date()
                })
                .where(eq(products.id, productId));

            // 4. Marcar tarefa como concluída e atualizar quantidade para a real confirmada
            await tx.update(productionTasks)
                .set({ 
                    status: "COMPLETED",
                    quantity: actualQuantity, // Garante que o histórico mostre apenas o que foi feito
                    updatedAt: new Date()
                })
                .where(eq(productionTasks.id, taskId));

            // 4.5. Se a produção foi parcial, criar uma nova tarefa para a quantidade restante
            if (actualQuantity < task.quantity) {
                const remaining = task.quantity - actualQuantity;
                await tx.insert(productionTasks).values({
                    id: crypto.randomUUID(),
                    productId,
                    status: "PENDING",
                    quantity: remaining,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                adjustmentMessage += ` (Tarefa residual de ${remaining} unid. gerada automaticamente)`;
            }

            // 5. Log de inventário
            await tx.insert(inventoryLogs).values({
                id: crypto.randomUUID(),
                productId,
                userId: session.user.id,
                change: actualQuantity,
                type: "PRODUCTION",
                createdAt: new Date()
            });

            // 6. Reativar venda se estoque atingiu minParaVenda
            const updatedProduct = await tx.query.products.findFirst({
                where: eq(products.id, productId)
            })

            if (updatedProduct && updatedProduct.currentStock >= updatedProduct.minParaVenda && !updatedProduct.statusVenda) {
                await tx.update(products)
                    .set({ statusVenda: true, updatedAt: new Date() })
                    .where(eq(products.id, productId))
            }

            // 7. Notificar conclusão
            await createNotification(
                session.user.id,
                "Produção Concluída",
                `Lote de ${actualQuantity} unidades de ${product.name} foi adicionado ao estoque.`
            );

            return { success: true as const, message: `Produção concluída!${adjustmentMessage}` };
        });

        revalidatePath("/dashboard/products");
        revalidatePath("/dashboard/production");
        revalidatePath("/dashboard/metrics");
        revalidatePath("/dashboard");
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
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
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
        revalidatePath("/dashboard/metrics");
        revalidatePath("/dashboard");
        return { success: true as const };
    } catch (error) {
        return { 
            success: false as const, 
            error: error instanceof Error ? error.message : "Erro desconhecido" 
        };
    }
}

interface SaleItemUpdate {
    id: string
    productId: string
    productName: string
    quantity: number
    price: number
    subtotal: number
}

interface SaleItemOriginal {
    id: string
    productId: string
    productName: string
    quantity: number
    price: number
    subtotal: number
}

export async function updateSale(saleId: string, updatedItems: SaleItemUpdate[], originalItems: SaleItemOriginal[]) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        throw new Error("Não autorizado");
    }

    try {
        await db.transaction(async (tx) => {
            for (const originalItem of originalItems) {
                const updatedItem = updatedItems.find(i => i.id === originalItem.id)

                if (!updatedItem || updatedItem.quantity <= 0) {
                    await tx
                        .update(products)
                        .set({
                            currentStock: sql`${products.currentStock} + ${originalItem.quantity}`,
                            updatedAt: new Date()
                        })
                        .where(eq(products.id, originalItem.productId))

                    await tx
                        .delete(inventoryLogs)
                        .where(eq(inventoryLogs.id, originalItem.id))

                    continue
                }

                if (originalItem.quantity === updatedItem.quantity) {
                    continue
                }

                const quantityDiff = updatedItem.quantity - originalItem.quantity

                if (quantityDiff < 0) {
                    await tx
                        .update(products)
                        .set({
                            currentStock: sql`${products.currentStock} + ${Math.abs(quantityDiff)}`,
                            updatedAt: new Date()
                        })
                        .where(eq(products.id, originalItem.productId))
                } else {
                    const product = await tx.query.products.findFirst({
                        where: eq(products.id, originalItem.productId)
                    })

                    if (!product) {
                        throw new Error(`Produto não encontrado para o item: ${originalItem.productName}`)
                    }

                    if (product.currentStock < quantityDiff) {
                        throw new Error(`Estoque insuficiente para: ${originalItem.productName}. Disponível: ${product.currentStock}`)
                    }

                    await tx
                        .update(products)
                        .set({
                            currentStock: sql`${products.currentStock} - ${quantityDiff}`,
                            updatedAt: new Date()
                        })
                        .where(eq(products.id, originalItem.productId))
                }

                await tx
                    .update(inventoryLogs)
                    .set({
                        change: -updatedItem.quantity,
                    })
                    .where(eq(inventoryLogs.id, originalItem.id))
            }
        })

        revalidatePath("/dashboard/sales");
        revalidatePath("/dashboard/products");
        revalidatePath("/dashboard/metrics");
        revalidatePath("/dashboard");

        return { success: true as const };
    } catch (error) {
        console.error("Erro ao atualizar venda:", error)
        return {
            success: false as const,
            error: error instanceof Error ? error.message : "Erro desconhecido"
        }
    }
}
