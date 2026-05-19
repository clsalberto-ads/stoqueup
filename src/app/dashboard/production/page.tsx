export const dynamic = 'force-dynamic'
import { db } from "@/db"
import { productionTasks, products } from "@/db/schema"
import { eq, desc, sql } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

import ProductionPageClient from "./production-page-client"

const ITEMS_PER_PAGE = 8

export default async function ProductionPage(props: { searchParams: Promise<{ page?: string }> }) {
    const searchParams = await props.searchParams
    const session = await auth.api.getSession({
        headers: await headers()
    })
    const isAdmin = session?.user.role === "admin"

    const allProducts = await db
        .select({
            id: products.id,
            name: products.name,
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
            status: productionTasks.status,
            quantity: productionTasks.quantity,
            createdAt: productionTasks.createdAt,
        })
        .from(productionTasks)
        .innerJoin(products, eq(productionTasks.productId, products.id))
        .where(eq(productionTasks.status, "IN_PROGRESS"))
        .orderBy(desc(productionTasks.createdAt), desc(productionTasks.id))

    const pending = [...pendingTasks, ...inProgressTasks]

    const page = parseInt(searchParams.page || "1", 10)
    const offset = (page - 1) * ITEMS_PER_PAGE

    const completedTasks = await db
        .select({
            id: productionTasks.id,
            productId: productionTasks.productId,
            productName: products.name,
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
                currentStock: p.currentStock,
                qtdMaxima: p.qtdMaxima,
                price: p.price
            }))}
            totalCompletedCount={Number(totalCompletedCount[0]?.count || 0)}
            isAdmin={isAdmin}
        />
    )
}