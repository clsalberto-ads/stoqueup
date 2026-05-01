import { db } from "@/db"
import { inventoryLogs, products } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart } from "lucide-react"

export default async function SalesPage() {
    const sales = await db
        .select({
            id: inventoryLogs.id,
            productName: products.name,
            quantity: inventoryLogs.change,
            createdAt: inventoryLogs.createdAt,
            price: products.price,
        })
        .from(inventoryLogs)
        .innerJoin(products, eq(inventoryLogs.productId, products.id))
        .where(eq(inventoryLogs.type, "SALE"))
        .orderBy(desc(inventoryLogs.createdAt))

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Histórico de Vendas</h1>
                <p className="text-slate-500 mt-2">
                    Acompanhe todas as saídas de estoque e vendas realizadas.
                </p>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle>Vendas Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                    {sales.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                                <ShoppingCart className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">Nenhuma venda registrada</h3>
                            <p className="text-slate-500 max-w-xs mt-1">
                                As vendas realizadas através do catálogo de produtos aparecerão aqui.
                            </p>
                        </div>
                    ) : (
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-500">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3">Produto</th>
                                        <th className="px-6 py-3">Quantidade</th>
                                        <th className="px-6 py-3">Total Estimado</th>
                                        <th className="px-6 py-3">Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.map((sale) => (
                                        <tr key={sale.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                                {sale.productName}
                                            </td>
                                            <td className="px-6 py-4 text-slate-700 font-semibold">
                                                {Math.abs(sale.quantity)} un.
                                            </td>
                                            <td className="px-6 py-4 text-blue-600 font-bold">
                                                {((Math.abs(sale.quantity) * sale.price) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {new Date(sale.createdAt).toLocaleString('pt-BR')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
