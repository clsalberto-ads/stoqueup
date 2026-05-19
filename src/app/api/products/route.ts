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
    qtdMaxima: z.number().min(0),
    minParaVenda: z.number().min(0),
    imageUrl: z.string().url().nullable().optional(),
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

    const [product] = await db.insert(products).values({
        id: crypto.randomUUID(),
        name,
        description: description ?? null,
        price: priceInCents,
        qtdMinima,
        qtdMaxima,
        minParaVenda,
        imageUrl: imageUrl ?? null,
        currentStock: 0,
        statusVenda: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning();

    if (minParaVenda > 0) {
        await db.insert(productionTasks).values({
            id: crypto.randomUUID(),
            productId: product.id,
            status: "PENDING",
            quantity: minParaVenda,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/production");
    revalidatePath("/dashboard");

    return NextResponse.json(product, { status: 201 });
}
