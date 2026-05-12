export const dynamic = 'force-dynamic'
import { db } from "@/db"
import { inventoryLogs, products } from "@/db/schema"
import { eq, desc, and, sql } from "drizzle-orm"

import SalesPageClient from "./sales-page-client"

const ITEMS_PER_PAGE = 8

interface GroupedSale {
    id: string
    createdAt: Date
    items: {
        id: string
        productName: string
        quantity: number
        price: number
        subtotal: number
    }[]
    totalItems: number
    totalValue: number
}

async function getSalesData(page: number) {
    const offset = (page - 1) * ITEMS_PER_PAGE

    const whereClause = eq(inventoryLogs.type, "SALE")

    const groupedQuery = db
        .select({
            dateKey: sql<string>`TO_CHAR(${inventoryLogs.createdAt}, 'YYYY-MM-DD"T"HH24:MI')`,
            createdAt: sql<Date>`MAX(${inventoryLogs.createdAt})`,
        })
        .from(inventoryLogs)
        .where(whereClause)
        .groupBy(sql`TO_CHAR(${inventoryLogs.createdAt}, 'YYYY-MM-DD"T"HH24:MI')`)
        .orderBy(desc(sql`MAX(${inventoryLogs.createdAt})`))

    const countResult = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(inventoryLogs)
        .where(whereClause)

    const totalGroups = countResult[0]?.count ?? 0
    const totalPages = Math.ceil(totalGroups / ITEMS_PER_PAGE)

    if (totalGroups === 0) {
        return { sales: [], totalCount: 0, totalPages, page }
    }

    const groupedRows = await groupedQuery.limit(ITEMS_PER_PAGE).offset(offset)

    if (groupedRows.length === 0) {
        return { sales: [], totalCount: totalGroups, totalPages, page }
    }

    const salesMap: Record<string, GroupedSale> = {}
    const groupedDateKeys = groupedRows.map(r => r.dateKey)

    for (const row of groupedRows) {
        salesMap[row.dateKey] = {
            id: row.dateKey,
            createdAt: new Date(row.createdAt),
            items: [],
            totalItems: 0,
            totalValue: 0
        }
    }

    const allItemsResult = await db
        .select({
            id: inventoryLogs.id,
            productId: inventoryLogs.productId,
            change: inventoryLogs.change,
            createdAt: inventoryLogs.createdAt,
            productName: products.name,
            price: products.price,
        })
        .from(inventoryLogs)
        .innerJoin(products, eq(inventoryLogs.productId, products.id))
        .where(whereClause)

    for (const item of allItemsResult) {
        const itemDateKey = new Date(item.createdAt).toISOString().slice(0, 16)
        const matchingKey = groupedDateKeys.find(k => k.startsWith(itemDateKey))

        if (matchingKey && salesMap[matchingKey]) {
            const qty = Math.abs(item.change || 0)
            const subtotal = qty * item.price

            salesMap[matchingKey].items.push({
                id: item.id,
                productName: item.productName,
                quantity: qty,
                price: item.price,
                subtotal
            })

            salesMap[matchingKey].totalItems += qty
            salesMap[matchingKey].totalValue += subtotal
        }
    }

    const sales = Object.values(salesMap)
        .map(s => ({
            ...s,
            items: s.items.sort((a, b) => a.productName.localeCompare(b.productName))
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return { sales, totalCount: totalGroups, totalPages, page }
}

export default async function SalesPage({ searchParams }: { searchParams: { page?: string } }) {
    const page = parseInt(searchParams.page || "1", 10)

    const { sales, totalCount, totalPages } = await getSalesData(page)

    const availableProducts = await db
        .select({
            id: products.id,
            name: products.name,
            currentStock: products.currentStock,
            price: products.price,
        })
        .from(products)
        .orderBy(products.name)

    return (
        <SalesPageClient
            initialSales={sales}
            initialProducts={availableProducts}
            totalCount={totalCount}
            totalPages={totalPages}
            currentPage={page}
        />
    )
}