"use server"

import { auth } from "./auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { products, productionTasks, inventoryLogs, notifications } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { supabase, PRODUCTS_BUCKET } from "./supabase";
import { defineAbilityFor } from "./ability";
import type { UserRole } from "./ability";

export async function createProduct(data: {
    name: string;
    description?: string;
    price: number;
    qtdMinima: number;
    qtdMaxima: number;
    minParaVenda: number;
    imageUrl?: string | null;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session || !session.user) {
        throw new Error("Não autorizado");
    }

    try {
        const priceInCents = Math.round(data.price * 100);

        const result = await db.transaction(async (tx) => {
            const [product] = await tx.insert(products).values({
                id: crypto.randomUUID(),
                name: data.name,
                description: data.description ?? null,
                price: priceInCents,
                qtdMinima: data.qtdMinima,
                qtdMaxima: data.qtdMaxima,
                minParaVenda: data.minParaVenda,
                imageUrl: data.imageUrl ?? null,
                currentStock: 0,
                statusVenda: data.minParaVenda <= 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            }).returning();

            // Se minParaVenda > 0 e o estoque inicial é 0, criar tarefa limitada ao máximo
            if (data.minParaVenda > 0) {
                const initialQuantity = Math.max(1, Math.min(data.minParaVenda, data.qtdMaxima));
                await tx.insert(productionTasks).values({
                    id: crypto.randomUUID(),
                    productId: product.id,
                    status: "PENDING",
                    quantity: initialQuantity,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }

            return product;
        });

        revalidatePath("/dashboard/products");
        revalidatePath("/dashboard/production");
        revalidatePath("/dashboard");
        return { success: true as const, product: result };
    } catch (error) {
        return { 
            success: false as const, 
            error: error instanceof Error ? error.message : "Erro desconhecido" 
        };
    }
}

export async function deleteProduct(productId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session || !session.user) {
        throw new Error("Não autorizado");
    }

    const ability = defineAbilityFor((session.user.role ?? "user") as UserRole);
    if (!ability.can("delete", "Products")) {
        throw new Error("Apenas administradores podem excluir produtos");
    }

    try {
        const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
        if (!product) return { success: false as const, error: "Produto não encontrado" };

        if (product.imageUrl) {
            const path = product.imageUrl.split("/").pop();
            if (path) {
                await supabase.storage.from(PRODUCTS_BUCKET).remove([path]);
            }
        }

        await db.transaction(async (tx) => {
            await tx.delete(inventoryLogs).where(eq(inventoryLogs.productId, productId));
            await tx.delete(productionTasks).where(eq(productionTasks.productId, productId));
            await tx.delete(products).where(eq(products.id, productId));
        });

        revalidatePath("/dashboard/products");
        revalidatePath("/dashboard/production");
        revalidatePath("/dashboard");
        return { success: true as const };
    } catch (error) {
        return { 
            success: false as const, 
            error: error instanceof Error ? error.message : "Erro desconhecido" 
        };
    }
}

export async function updateProduct(productId: string, data: {
    name: string;
    description?: string;
    price: number;
    qtdMinima: number;
    qtdMaxima: number;
    minParaVenda: number;
    imageUrl?: string | null;
    statusVenda?: boolean;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session || !session.user) {
        throw new Error("Não autorizado");
    }

    const ability = defineAbilityFor((session.user.role ?? "user") as UserRole);
    if (!ability.can("update", "Products")) {
        throw new Error("Apenas administradores podem editar produtos");
    }

    try {
        const priceInCents = Math.round(data.price * 100);

        await db.transaction(async (tx) => {
            const [current] = await tx
                .select()
                .from(products)
                .where(eq(products.id, productId))
                .limit(1);

            if (!current) throw new Error("Produto não encontrado");

            await tx.update(products)
                .set({
                    name: data.name,
                    description: data.description ?? null,
                    price: priceInCents,
                    qtdMinima: data.qtdMinima,
                    qtdMaxima: data.qtdMaxima,
                    minParaVenda: data.minParaVenda,
                    imageUrl: data.imageUrl ?? null,
                    statusVenda: data.statusVenda !== undefined ? data.statusVenda : current.statusVenda,
                    updatedAt: new Date(),
                })
                .where(eq(products.id, productId));

            // Verificar se já existe tarefa PENDING antes de criar nova
            const existingTask = await tx
                .select()
                .from(productionTasks)
                .where(and(
                    eq(productionTasks.productId, productId),
                    eq(productionTasks.status, "PENDING")
                ))
                .limit(1);

            if (existingTask.length === 0) {
                const needed = Math.max(1, Math.min(
                    data.minParaVenda - current.currentStock,
                    data.qtdMaxima - current.currentStock
                ));
                if (needed > 0) {
                    await tx.insert(productionTasks).values({
                        id: crypto.randomUUID(),
                        productId,
                        status: "PENDING",
                        quantity: needed,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                }
            }
        });

        revalidatePath("/dashboard/products");
        revalidatePath("/dashboard/production");
        revalidatePath("/dashboard/sales");
        revalidatePath("/dashboard");
        return { success: true as const };
    } catch (error) {
        return { 
            success: false as const, 
            error: error instanceof Error ? error.message : "Erro desconhecido" 
        };
    }
}
