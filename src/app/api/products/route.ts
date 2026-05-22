import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { products, productionTasks } from "@/db/schema";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createProductSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    price: z.number().min(0),
    qtdMinima: z.number().min(0),
    qtdMaxima: z.number().min(1),
    minParaVenda: z.number().min(0),
    imageUrl: z.string().url().nullable().optional(),
}).refine(d => d.qtdMinima <= d.minParaVenda, {
    message: "A quantidade mínima não pode ser maior que o mínimo para venda",
}).refine(d => d.minParaVenda <= d.qtdMaxima, {
    message: "O mínimo para venda não pode ser maior que a quantidade máxima",
});

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { message: "Dados inválidos", errors: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const { name, description, price, qtdMinima, qtdMaxima, minParaVenda, imageUrl } = parsed.data;

    // Converte preço de reais para centavos
    const priceInCents = Math.round(price * 100);

    const result = await db.transaction(async (tx) => {
        const [product] = await tx.insert(products).values({
            id: crypto.randomUUID(),
            name,
            description: description ?? null,
            price: priceInCents,
            qtdMinima,
            qtdMaxima,
            minParaVenda,
            imageUrl: imageUrl ?? null,
            currentStock: 0,
            statusVenda: minParaVenda <= 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        if (minParaVenda > 0) {
            const initialQuantity = Math.max(1, Math.min(minParaVenda, qtdMaxima));
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

    return NextResponse.json(result, { status: 201 });
}
