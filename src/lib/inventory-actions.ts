"use server"

import { auth } from "./auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { products, inventoryLogs, productionTasks, notifications } from "@/db/schema";
import { eq, and, gte, lt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { defineAbilityFor } from "./ability";
import type { UserRole } from "./ability";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Verifica se o estoque do produto está abaixo do mínimo após uma movimentação.
 * Se sim: bloqueia venda, cria tarefa de produção (se não houver uma PENDING),
 * e registra notificação.
 *
 * Deve ser chamada DENTRO de uma transação Drizzle (tx).
 */
async function checkAndTriggerProduction(
    tx: any,
    product: {
        id: string;
        name: string;
        currentStock: number;
        qtdMinima: number;
        qtdMaxima: number;
        minParaVenda: number;
    },
    userId: string,
) {
    if (product.currentStock >= product.qtdMinima) return;

    // Bloquear venda
    await tx
        .update(products)
        .set({ statusVenda: false, updatedAt: new Date() })
        .where(eq(products.id, product.id));

    // Evitar duplicatas de tarefa
    const existingTask = await tx
        .select()
        .from(productionTasks)
        .where(
            and(
                eq(productionTasks.productId, product.id),
                eq(productionTasks.status, "PENDING"),
            ),
        )
        .limit(1);

    if (existingTask.length === 0) {
        const maxCap = product.qtdMaxima > 0
            ? product.qtdMaxima - product.currentStock
            : Infinity;
        const neededQuantity = Math.max(
            1,
            Math.min(
                product.minParaVenda - product.currentStock,
                maxCap,
            ),
        );

        await tx.insert(productionTasks).values({
            id: crypto.randomUUID(),
            productId: product.id,
            status: "PENDING",
            quantity: neededQuantity,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    // Notificação dentro da mesma transação
    await tx.insert(notifications).values({
        id: crypto.randomUUID(),
        userId,
        title: "Estoque Crítico!",
        content: `O estoque de ${product.name} está abaixo do mínimo (${product.currentStock}/${product.qtdMinima}). Tarefa de produção criada para repor.`,
        isRead: false,
        createdAt: new Date(),
    });
}

/**
 * Verifica se o estoque do produto atingiu minParaVenda e reativa a venda.
 * Deve ser chamada DENTRO de uma transação Drizzle (tx).
 */
async function checkAndReactivateSale(
    tx: any,
    productId: string,
    productName: string,
    userId: string,
) {
    const updated = await tx.query.products.findFirst({
        where: eq(products.id, productId),
    });

    if (!updated) return;
    if (updated.currentStock >= updated.minParaVenda && !updated.statusVenda) {
        // Só reativa se houver tarefa de produção para este produto — indica bloqueio automático
        const hasProductionTask = await tx
            .select()
            .from(productionTasks)
            .where(eq(productionTasks.productId, productId))
            .limit(1);

        if (hasProductionTask.length === 0) return;

        await tx
            .update(products)
            .set({ statusVenda: true, updatedAt: new Date() })
            .where(eq(products.id, productId));

        await tx.insert(notifications).values({
            id: crypto.randomUUID(),
            userId,
            title: "Vendas Reativadas",
            content: `O produto ${productName} atingiu o nível mínimo para venda (${updated.currentStock}/${updated.minParaVenda}) e foi liberado.`,
            isRead: false,
            createdAt: new Date(),
        });
    }
}

// ---------------------------------------------------------------------------
// Venda individual
// ---------------------------------------------------------------------------

/**
 * Registra uma venda de produto, decrementando o estoque e disparando gatilhos se necessário.
 */
export async function sellProduct(productId: string, quantity: number) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user) {
        throw new Error("Não autorizado");
    }

    try {
        const result = await db.transaction(async (tx) => {
            // 1. Decremento atômico (apenas produtos com venda ativa)
            const updated = await tx
                .update(products)
                .set({
                    currentStock: sql`${products.currentStock} - ${quantity}`,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(products.id, productId),
                        eq(products.statusVenda, true),
                        gte(products.currentStock, quantity),
                    ),
                )
                .returning();

            const product = updated[0];

            if (!product) {
                throw new Error(
                    "Estoque insuficiente, produto não encontrado ou venda bloqueada",
                );
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

            // 3. Verificar gatilho de produção
            await checkAndTriggerProduction(tx, product, session.user.id);

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
            error: error instanceof Error ? error.message : "Erro desconhecido",
        };
    }
}

// ---------------------------------------------------------------------------
// Venda múltipla (carrinho)
// ---------------------------------------------------------------------------

/**
 * Registra uma venda com múltiplos produtos (carrinho de compras).
 */
export async function sellMultipleProducts(
    items: { productId: string; quantity: number }[],
) {
    const session = await auth.api.getSession({
        headers: await headers(),
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
                // 1. Decremento atômico (apenas produtos com venda ativa)
                const updated = await tx
                    .update(products)
                    .set({
                        currentStock: sql`${products.currentStock} - ${item.quantity}`,
                        updatedAt: transactionTime,
                    })
                    .where(
                        and(
                            eq(products.id, item.productId),
                            eq(products.statusVenda, true),
                            gte(products.currentStock, item.quantity),
                        ),
                    )
                    .returning();

                const product = updated[0];

                if (!product) {
                    throw new Error(
                        `Estoque insuficiente ou produto não encontrado para o ID: ${item.productId}`,
                    );
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
                await checkAndTriggerProduction(tx, product, session.user.id);
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
            error: error instanceof Error ? error.message : "Erro desconhecido",
        };
    }
}

// ---------------------------------------------------------------------------
// Status da tarefa
// ---------------------------------------------------------------------------

/**
 * Atualiza o status de uma tarefa de produção.
 */
export async function updateProductionStatus(
    taskId: string,
    newStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED",
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user) {
        throw new Error("Não autorizado");
    }

    try {
        await db
            .update(productionTasks)
            .set({
                status: newStatus,
                updatedAt: new Date(),
            })
            .where(eq(productionTasks.id, taskId));

        revalidatePath("/dashboard/production");
        return { success: true as const };
    } catch (error) {
        return {
            success: false as const,
            error: error instanceof Error ? error.message : "Erro desconhecido",
        };
    }
}

// ---------------------------------------------------------------------------
// Completar produção
// ---------------------------------------------------------------------------

/**
 * Conclui uma produção, incrementando o estoque com conferência.
 */
export async function completeProduction(
    taskId: string,
    productId: string,
    actualQuantity: number,
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user) {
        throw new Error("Não autorizado");
    }

    try {
        const result = await db.transaction(async (tx) => {
            // 0. Obter a tarefa
            const task = await tx.query.productionTasks.findFirst({
                where: eq(productionTasks.id, taskId),
            });

            if (!task) throw new Error("Tarefa de produção não encontrada");

            // 1. Obter produto
            const product = await tx.query.products.findFirst({
                where: eq(products.id, productId),
            });

            if (!product) throw new Error("Produto não encontrado");

            // 2. Atualizar estoque
            // Se qtdMaxima for 0 (sem limite configurado), não aplicar cap
            const cap = product.qtdMaxima;
            let adjustmentMessage = "";

            if (cap > 0) {
                const diff = product.currentStock + actualQuantity - cap;
                if (diff > 0) {
                    adjustmentMessage = ` (Estoque limitado ao máximo de ${cap}. Excesso de ${diff} ignorado)`;
                }

                await tx
                    .update(products)
                    .set({
                        currentStock: sql`LEAST(${products.currentStock} + ${actualQuantity}, ${cap})`,
                        updatedAt: new Date(),
                    })
                    .where(eq(products.id, productId));
            } else {
                // Sem limite máximo → incremento direto
                await tx
                    .update(products)
                    .set({
                        currentStock: sql`${products.currentStock} + ${actualQuantity}`,
                        updatedAt: new Date(),
                    })
                    .where(eq(products.id, productId));
            }

            // 3. Marcar tarefa como concluída
            await tx
                .update(productionTasks)
                .set({
                    status: "COMPLETED",
                    quantity: actualQuantity,
                    updatedAt: new Date(),
                })
                .where(eq(productionTasks.id, taskId));

            // 4. Se produção parcial, criar tarefa residual
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
                createdAt: new Date(),
            });

            // 6. Reativar venda se atingiu minParaVenda
            await checkAndReactivateSale(tx, productId, product.name, session.user.id);

            // 7. Notificar conclusão
            const reativado =
                product.currentStock + Math.min(actualQuantity, cap > 0 ? cap - product.currentStock : actualQuantity) >=
                product.minParaVenda;

            await tx.insert(notifications).values({
                id: crypto.randomUUID(),
                userId: session.user.id,
                title: "Produção Concluída",
                content: `Lote de ${actualQuantity} unidades de ${product.name} foi adicionado ao estoque.${
                    reativado ? " Produto liberado para venda." : ""
                }`,
                isRead: false,
                createdAt: new Date(),
            });

            return {
                success: true as const,
                message: `Produção concluída!${adjustmentMessage}`,
            };
        });

        revalidatePath("/dashboard/products");
        revalidatePath("/dashboard/production");
        revalidatePath("/dashboard/metrics");
        revalidatePath("/dashboard");
        return result;
    } catch (error) {
        return {
            success: false as const,
            error: error instanceof Error ? error.message : "Erro desconhecido",
        };
    }
}

// ---------------------------------------------------------------------------
// Criar tarefa manual
// ---------------------------------------------------------------------------

/**
 * Cria uma tarefa de produção manual (requer permissão "create" em "Production").
 */
export async function createManualProductionTask(
    productId: string,
    quantity: number,
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user) {
        throw new Error("Não autorizado");
    }

    const ability = defineAbilityFor((session.user.role ?? "user") as UserRole);
    if (!ability.can("create", "Production")) {
        throw new Error("Você não tem permissão para criar tarefas de produção");
    }

    try {
        const product = await db.query.products.findFirst({
            where: eq(products.id, productId),
        });

        if (!product) throw new Error("Produto não encontrado");

        // Trava D-06
        const maxAllowed = product.qtdMaxima - product.currentStock;
        if (quantity > maxAllowed) {
            throw new Error(
                `Quantidade máxima permitida para este produto no momento é ${maxAllowed}`,
            );
        }

        // Verificar se já existe tarefa PENDING para este produto
        const existingTask = await db
            .select()
            .from(productionTasks)
            .where(
                and(
                    eq(productionTasks.productId, productId),
                    eq(productionTasks.status, "PENDING"),
                ),
            )
            .limit(1);

        if (existingTask.length > 0) {
            throw new Error(
                "Já existe uma tarefa de produção pendente para este produto",
            );
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
            error: error instanceof Error ? error.message : "Erro desconhecido",
        };
    }
}

// ---------------------------------------------------------------------------
// Interfaces para updateSale
// ---------------------------------------------------------------------------

interface SaleItemUpdate {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
}

interface SaleItemOriginal {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
}

// ---------------------------------------------------------------------------
// Editar venda
// ---------------------------------------------------------------------------

/**
 * Atualiza os itens de uma venda existente, ajustando estoques e disparando
 * gatilhos de produção / reativação conforme necessário.
 */
export async function updateSale(
    saleId: string,
    updatedItems: SaleItemUpdate[],
    originalItems: SaleItemOriginal[],
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user) {
        throw new Error("Não autorizado");
    }

    try {
        // saleId é "YYYY-MM-DDTHH:MM" (data-chave do agrupamento por minuto)
        const saleStart = new Date(saleId);
        const saleEnd = new Date(saleStart.getTime() + 60_000);

        await db.transaction(async (tx) => {
            for (const originalItem of originalItems) {
                const updatedItem = updatedItems.find(
                    (i) => i.productId === originalItem.productId,
                );

                // Item removido → devolver estoque
                if (!updatedItem || updatedItem.quantity <= 0) {
                    const product = await tx.query.products.findFirst({
                        where: eq(products.id, originalItem.productId),
                    });

                    if (!product) continue;

                    await tx
                        .update(products)
                        .set({
                            currentStock:
                                sql`${products.currentStock} + ${originalItem.quantity}`,
                            updatedAt: new Date(),
                        })
                        .where(eq(products.id, originalItem.productId));

                    // Deletar log da venda com filtro de minuto para não afetar outras vendas
                    await tx
                        .delete(inventoryLogs)
                        .where(
                            and(
                                eq(inventoryLogs.productId, originalItem.productId),
                                eq(inventoryLogs.change, -originalItem.quantity),
                                eq(inventoryLogs.type, "SALE"),
                                gte(inventoryLogs.createdAt, saleStart),
                                lt(inventoryLogs.createdAt, saleEnd),
                            ),
                        );

                    // Verificar se estoque agora é suficiente para reativar
                    await checkAndReactivateSale(
                        tx,
                        originalItem.productId,
                        originalItem.productName,
                        session.user.id,
                    );

                    continue;
                }

                // Quantidade inalterada
                if (originalItem.quantity === updatedItem.quantity) {
                    continue;
                }

                const quantityDiff =
                    updatedItem.quantity - originalItem.quantity;

                if (quantityDiff < 0) {
                    // Devolvendo estoque (quantidade reduzida na venda)
                    const returnQty = Math.abs(quantityDiff);

                    await tx
                        .update(products)
                        .set({
                            currentStock:
                                sql`${products.currentStock} + ${returnQty}`,
                            updatedAt: new Date(),
                        })
                        .where(eq(products.id, originalItem.productId));

                    // Atualizar log com filtro de minuto
                    await tx
                        .update(inventoryLogs)
                        .set({ change: -updatedItem.quantity })
                        .where(
                            and(
                                eq(inventoryLogs.productId, originalItem.productId),
                                eq(inventoryLogs.change, -originalItem.quantity),
                                eq(inventoryLogs.type, "SALE"),
                                gte(inventoryLogs.createdAt, saleStart),
                                lt(inventoryLogs.createdAt, saleEnd),
                            ),
                        );

                    // Verificar reativação
                    await checkAndReactivateSale(
                        tx,
                        originalItem.productId,
                        originalItem.productName,
                        session.user.id,
                    );
                } else {
                    // Aumentando quantidade → mais estoque saindo
                    const product = await tx.query.products.findFirst({
                        where: eq(products.id, originalItem.productId),
                    });

                    if (!product) {
                        throw new Error(
                            `Produto não encontrado para o item: ${originalItem.productName}`,
                        );
                    }

                    if (!product.statusVenda) {
                        throw new Error(
                            `Produto bloqueado para venda: ${originalItem.productName}`,
                        );
                    }

                    if (product.currentStock < quantityDiff) {
                        throw new Error(
                            `Estoque insuficiente para: ${originalItem.productName}. Disponível: ${product.currentStock}, necessário: ${quantityDiff}`,
                        );
                    }

                    await tx
                        .update(products)
                        .set({
                            currentStock:
                                sql`${products.currentStock} - ${quantityDiff}`,
                            updatedAt: new Date(),
                        })
                        .where(eq(products.id, originalItem.productId));

                    // Atualizar log com filtro de minuto
                    await tx
                        .update(inventoryLogs)
                        .set({ change: -updatedItem.quantity })
                        .where(
                            and(
                                eq(inventoryLogs.productId, originalItem.productId),
                                eq(inventoryLogs.change, -originalItem.quantity),
                                eq(inventoryLogs.type, "SALE"),
                                gte(inventoryLogs.createdAt, saleStart),
                                lt(inventoryLogs.createdAt, saleEnd),
                            ),
                        );

                    // Obter o estado atualizado do produto para o helper
                    const updatedProduct = await tx.query.products.findFirst({
                        where: eq(products.id, originalItem.productId),
                    });

                    if (updatedProduct) {
                        await checkAndTriggerProduction(
                            tx,
                            updatedProduct,
                            session.user.id,
                        );
                    }
                }
            }

            // -----------------------------------------------------------------------
            // Itens NOVOS adicionados na edição (existem em updatedItems mas não em originalItems)
            // -----------------------------------------------------------------------
            const originalIds = new Set(originalItems.map(i => i.productId));
            const addedItems = updatedItems.filter(
                i => !originalIds.has(i.productId) && i.quantity > 0,
            );

            for (const item of addedItems) {
                const product = await tx.query.products.findFirst({
                    where: eq(products.id, item.productId),
                });

                if (!product) {
                    throw new Error(`Produto não encontrado: ${item.productName}`);
                }

                if (!product.statusVenda) {
                    throw new Error(
                        `Produto bloqueado para venda: ${item.productName}`,
                    );
                }

                if (product.currentStock < item.quantity) {
                    throw new Error(
                        `Estoque insuficiente para: ${item.productName}. Disponível: ${product.currentStock}, necessário: ${item.quantity}`,
                    );
                }

                // Deduzir estoque
                await tx
                    .update(products)
                    .set({
                        currentStock: sql`${products.currentStock} - ${item.quantity}`,
                        updatedAt: new Date(),
                    })
                    .where(eq(products.id, item.productId));

                // Criar log de inventário com timestamp da venda original
                await tx.insert(inventoryLogs).values({
                    id: crypto.randomUUID(),
                    productId: item.productId,
                    userId: session.user.id,
                    change: -item.quantity,
                    type: "SALE",
                    createdAt: saleStart,
                });

                // Notificação
                await tx.insert(notifications).values({
                    id: crypto.randomUUID(),
                    userId: session.user.id,
                    title: "Venda alterada",
                    content: `${item.quantity} un. de ${item.productName} adicionadas na venda #${saleId}.`,
                    isRead: false,
                    createdAt: new Date(),
                });

                // Gatilho de produção
                await checkAndTriggerProduction(tx, product, session.user.id);
            }
        });

        revalidatePath("/dashboard/sales");
        revalidatePath("/dashboard/products");
        revalidatePath("/dashboard/metrics");
        revalidatePath("/dashboard");

        return { success: true as const };
    } catch (error) {
        console.error("Erro ao atualizar venda:", error);
        return {
            success: false as const,
            error: error instanceof Error ? error.message : "Erro desconhecido",
        };
    }
}
