export const dynamic = 'force-dynamic'
import { db } from "@/db"
import { productionTasks, products } from "@/db/schema"
import { eq, desc, sql } from "drizzle-orm"
import { authorize } from "@/lib/authorize"
import { defineAbilityFor } from "@/lib/ability"
import type { UserRole } from "@/lib/ability"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

import ProductionPageClient from "./production-page-client"

const ITEMS_PER_PAGE = 8

export default async function ProductionPage(props: { searchParams: Promise<{ page?: string }> }) {
    await authorize("read", "Production")
    const searchParams = await props.searchParams
    const session = await auth.api.getSession({ headers: await headers() })
    const ability = defineAbilityFor((session?.user.role ?? "user") as UserRole)
    const canCreateTasks = ability.can("create", "Production")

    const allProducts = await db
        .select({
            id: products.id,
            name: products.name,
            description: products.description,
            currentStock: products.currentStock,
            qtdMaxima: products.qtdMaxima,
            price: products.price,
        })
        .from(products)
    
    const pendingTasks = await db
        .select({
            id: productionTasks.id,
            productId: productionTasks.productId,
            productName: products.name,
            productDescription: products.description,
            status: productionTasks.status,
            quantity: productionTasks.quantity,
            createdAt: productionTasks.createdAt,
        })
        .from(productionTasks)
        .innerJoin(products, eq(productionTasks.productId, products.id))
        .where(eq(productionTasks.status, "PENDING"))
        .orderBy(desc(productionTasks.createdAt), desc(productionTasks.id))

    const inProgressTasks = await db
        .select({
            id: productionTasks.id,
            productId: productionTasks.productId,
            productName: products.name,
            productDescription: products.description,
            status: productionTasks.status,
            quantity: productionTasks.quantity,
            createdAt: productionTasks.createdAt,
        })
        .from(productionTasks)
        .innerJoin(products, eq(productionTasks.productId, products.id))
        .where(eq(productionTasks.status, "IN_PROGRESS"))
        .orderBy(desc(productionTasks.createdAt), desc(productionTasks.id))

    const pending = [...pendingTasks, ...inProgressTasks]

    // Soma quantidades pendentes (PENDING + IN_PROGRESS) por produto
    const pendingQtyByProduct = pending.reduce<Record<string, number>>((acc, task) => {
        acc[task.productId] = (acc[task.productId] || 0) + task.quantity;
        return acc;
    }, {})

    const page = parseInt(searchParams.page || "1", 10)
    const offset = (page - 1) * ITEMS_PER_PAGE

    const completedTasks = await db
        .select({
            id: productionTasks.id,
            productId: productionTasks.productId,
            productName: products.name,
            productDescription: products.description,
            status: productionTasks.status,
            quantity: productionTasks.quantity,
            createdAt: productionTasks.createdAt,
        })
        .from(productionTasks)
        .innerJoin(products, eq(productionTasks.productId, products.id))
        .where(eq(productionTasks.status, "COMPLETED"))
        .orderBy(desc(productionTasks.createdAt), desc(productionTasks.id))
        .limit(ITEMS_PER_PAGE)
        .offset(offset)

    const totalCompletedCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(productionTasks)
        .where(eq(productionTasks.status, "COMPLETED"))

    return (
        <ProductionPageClient 
            initialPending={pending.map(t => ({
                ...t,
                status: t.status
            }))}
            initialCompleted={completedTasks.map(t => ({
                ...t,
                status: t.status
            }))}
            initialProducts={allProducts.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                currentStock: p.currentStock,
                qtdMaxima: p.qtdMaxima,
                price: p.price
            }))}
            totalCompletedCount={Number(totalCompletedCount[0]?.count || 0)}
            isAdmin={canCreateTasks}
            pendingQtyByProduct={pendingQtyByProduct}
        />
    )
}