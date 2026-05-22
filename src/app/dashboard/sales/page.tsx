export const dynamic = 'force-dynamic'
import { db } from "@/db"
import { inventoryLogs, products } from "@/db/schema"
import { eq, desc, and, gt, sql } from "drizzle-orm"
import { getOrgSalesDaysRange } from "@/lib/analytics-actions"
import { authorize } from "@/lib/authorize"

import SalesPageClient from "./sales-page-client"

export interface GroupedSaleItem {
    id: string
    productId: string
    productName: string
    quantity: number
    price: number
    subtotal: number
}

interface GroupedSale {
    id: string
    createdAt: Date
    items: GroupedSaleItem[]
    totalItems: number
    totalValue: number
}

async function getSalesData(daysRange: number) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysRange)

    const whereClause = and(
        eq(inventoryLogs.type, "SALE"),
        gt(inventoryLogs.createdAt, cutoffDate)
    )

    const groupedRows = await db
        .select({
            dateKey: sql<string>`TO_CHAR(${inventoryLogs.createdAt}, 'YYYY-MM-DD"T"HH24:MI')`,
            createdAt: sql<Date>`MAX(${inventoryLogs.createdAt})`,
        })
        .from(inventoryLogs)
        .where(whereClause)
        .groupBy(sql`TO_CHAR(${inventoryLogs.createdAt}, 'YYYY-MM-DD"T"HH24:MI')`)
        .orderBy(desc(sql`MAX(${inventoryLogs.createdAt})`))

    if (groupedRows.length === 0) {
        return { sales: [] }
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
                productId: item.productId,
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

    return { sales }
}

export default async function SalesPage() {
    await authorize("read", "Sales")
    const daysRange = await getOrgSalesDaysRange()
    const { sales } = await getSalesData(daysRange)

    const availableProducts = await db
        .select({
            id: products.id,
            name: products.name,
            currentStock: products.currentStock,
            price: products.price,
        })
        .from(products)
        .where(eq(products.statusVenda, true))
        .orderBy(products.name)

    return (
        <SalesPageClient
            initialSales={sales}
            initialProducts={availableProducts}
        />
    )
}
