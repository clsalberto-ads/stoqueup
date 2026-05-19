"use server"

import { auth } from "./auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { products, productionTasks, inventoryLogs } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { supabase, PRODUCTS_BUCKET } from "./supabase";

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
                statusVenda: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            }).returning();

            if (data.minParaVenda > 0) {
                await tx.insert(productionTasks).values({
                    id: crypto.randomUUID(),
                    productId: product.id,
                    status: "PENDING",
                    quantity: data.minParaVenda,
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

    if (session.user.role !== "admin") {
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

    if (session.user.role !== "admin") {
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
                    statusVenda: data.statusVenda ?? true,
                    updatedAt: new Date(),
                })
                .where(eq(products.id, productId));

            const needed = data.minParaVenda - current.currentStock;
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
