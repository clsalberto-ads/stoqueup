"use client"

import { useState } from "react"
import { Eye, ShoppingCart, Loader2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Pagination } from "@/components/ui/pagination"
import { EmptyState } from "@/components/ui/empty-state"

export type GroupedSaleItem = {
    id: string
    productId: string
    productName: string
    quantity: number
    price: number
    subtotal: number
}

export type GroupedSale = {
    id: string
    createdAt: Date
    items: GroupedSaleItem[]
    totalItems: number
    totalValue: number
}

interface SalesTableProps {
    sales: GroupedSale[]
    isLoading?: boolean
    showCard?: boolean
    title?: string
    description?: string
    pagination?: {
        page: number
        totalPages: number
        onPageChange: (page: number) => void
    }
    onEditSale?: (sale: GroupedSale) => void
}

export function SalesTable({
    sales,
    isLoading,
    showCard = true,
    title = "Vendas Recentes",
    description,
    pagination,
    onEditSale
}: SalesTableProps) {
    const [selectedSale, setSelectedSale] = useState<GroupedSale | null>(null)

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground mt-4">Carregando...</p>
            </div>
        )
    }

    const content = (
        <>
            {sales.length === 0 ? (
                <EmptyState
                    icon={ShoppingCart}
                    title="Nenhuma venda registrada"
                    description="As vendas realizadas aparecerão aqui agrupadas por transação."
                />
            ) : (
                <>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left text-muted-foreground">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted border-b border-border">
                                <tr>
                                    <th className="px-6 py-3">Data da Venda</th>
                                    <th className="px-6 py-3">Qtd. Itens</th>
                                    <th className="px-6 py-3">Valor Total</th>
                                    <th className="px-6 py-3 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map((sale) => (
                                    <tr key={sale.id} className="bg-background border-b border-border hover:bg-muted transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                                            {new Date(sale.createdAt).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 text-foreground font-semibold">
                                            {sale.totalItems} un.
                                        </td>
                                        <td className="px-6 py-4 text-primary font-bold">
                                            {(sale.totalValue / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {onEditSale && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-muted-foreground hover:text-foreground hover:bg-muted"
                                                        onClick={() => onEditSale(sale)}
                                                    >
                                                        <Pencil className="h-4 w-4 sm:mr-1" />
                                                        <span className="hidden sm:inline">Editar</span>
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-muted-foreground hover:text-primary hover:bg-muted"
                                                    onClick={() => setSelectedSale(sale)}
                                                >
                                                    <Eye className="h-4 w-4 sm:mr-2" />
                                                    <span className="hidden sm:inline">Ver Detalhes</span>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <Pagination
                            page={pagination.page}
                            totalPages={pagination.totalPages}
                            onPageChange={pagination.onPageChange}
                            className="mt-4"
                        />
                    )}
                </>
            )}

            <Dialog open={!!selectedSale} onOpenChange={(open) => !open && setSelectedSale(null)}>
                <DialogContent className="sm:max-w-125">
                    <DialogHeader>
                        <DialogTitle>Detalhes da Venda</DialogTitle>
                        <DialogDescription>
                            Realizada em {selectedSale && new Date(selectedSale.createdAt).toLocaleString('pt-BR')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4">
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left text-muted-foreground">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted border-b border-border">
                                    <tr>
                                        <th className="px-4 py-2">Produto</th>
                                        <th className="px-4 py-2">Qtd</th>
                                        <th className="px-4 py-2 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedSale?.items.map((item) => (
                                        <tr key={item.id} className="bg-background border-b last:border-b-0 border-border">
                                            <td className="px-4 py-2 font-medium text-foreground">
                                                {item.productName}
                                            </td>
                                            <td className="px-4 py-2 text-foreground">
                                                {item.quantity}x
                                            </td>
                                            <td className="px-4 py-2 text-right font-semibold text-foreground">
                                                {(item.subtotal / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex justify-between items-center p-4 bg-muted rounded-lg border border-border">
                            <span className="font-medium text-foreground">Total Pago</span>
                            <span className="text-xl font-bold text-primary">
                                {selectedSale && (selectedSale.totalValue / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )

    if (showCard) {
        return (
            <Card className="border-border shadow-sm">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    {content}
                </CardContent>
            </Card>
        )
    }

    return content
}