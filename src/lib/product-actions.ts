"use server"

import { auth } from "./auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { products, productionTasks } from "@/db/schema";
import { revalidatePath } from "next/cache";

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

            // Cria automaticamente a tarefa de produção inicial para o produto com estoque zero
            await tx.insert(productionTasks).values({
                id: crypto.randomUUID(),
                productId: product.id,
                status: "PENDING",
                quantity: Math.max(data.qtdMaxima, 1), // Garante pelo menos 1 unidade na ordem
                createdAt: new Date(),
                updatedAt: new Date(),
            });

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
