"use client"

import { Suspense, useState, useTransition } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { RegisterSaleModal } from "@/components/sales/register-sale-modal"
import { SalesTable, GroupedSale } from "@/components/sales/sales-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { updateSale } from "@/lib/inventory-actions"
import { toast } from "sonner"

interface SalesPageContentProps {
    initialSales: GroupedSale[]
    initialProducts: {
        id: string
        name: string
        currentStock: number
        price: number
    }[]
    totalCount: number
    totalPages: number
    currentPage: number
}

function SalesPageContent({ initialSales, initialProducts, totalPages, currentPage }: SalesPageContentProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [isEditing, setIsEditing] = useState(false)
    const [editingSale, setEditingSale] = useState<GroupedSale | null>(null)
    const [editedItems, setEditedItems] = useState<GroupedSale['items']>([])
    const [isPending, startTransition] = useTransition()

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", newPage.toString())
        router.push(`/dashboard/sales?${params.toString()}`)
    }

    const handleEditSale = (sale: GroupedSale) => {
        setEditingSale(sale)
        setEditedItems([...sale.items])
        setIsEditing(true)
    }

    const handleUpdateItemQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            setEditedItems(prev => prev.filter(item => item.id !== itemId))
        } else {
            setEditedItems(prev =>
                prev.map(item => item.id === itemId ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price } : item)
            )
        }
    }

    const handleSaveEdit = () => {
        if (!editingSale) return

        startTransition(async () => {
            const result = await updateSale(editingSale.id, editedItems, editingSale.items)
            if (result.success) {
                toast.success("Venda atualizada com sucesso!")
                setIsEditing(false)
                setEditingSale(null)
                router.refresh()
            } else {
                toast.error(`Erro: ${result.error}`)
            }
        })
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setEditingSale(null)
        setEditedItems([])
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Histórico de Vendas</h1>
                    <p className="text-muted-foreground mt-2">
                        Acompanhe todas as saídas de estoque e vendas realizadas.
                    </p>
                </div>
                <RegisterSaleModal products={initialProducts} />
            </div>

            <SalesTable
                sales={initialSales}
                showCard={true}
                title="Vendas Recentes"
                description="Lista das transações de venda"
                pagination={totalPages > 1 ? {
                    page: currentPage,
                    totalPages,
                    onPageChange: handlePageChange
                } : undefined}
                onEditSale={handleEditSale}
            />

            <Dialog open={isEditing} onOpenChange={(open) => !open && handleCancelEdit()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Venda</DialogTitle>
                        <p className="text-sm text-muted-foreground">
                            {editingSale && new Date(editingSale.createdAt).toLocaleString('pt-BR')}
                        </p>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <div className="space-y-2">
                            {editedItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 p-2 rounded-md border bg-background text-sm">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{item.productName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {(item.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/un
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            variant="outline"
                                            size="icon-sm"
                                            className="h-7 w-7"
                                            onClick={() => handleUpdateItemQuantity(item.id, item.quantity - 1)}
                                        >-</Button>
                                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                                        <Button
                                            variant="outline"
                                            size="icon-sm"
                                            className="h-7 w-7"
                                            onClick={() => handleUpdateItemQuantity(item.id, item.quantity + 1)}
                                        >+</Button>
                                    </div>
                                    <span className="font-semibold text-primary w-20 text-right shrink-0">
                                        {(item.subtotal / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center p-3 bg-muted rounded-md border border-border">
                            <span className="text-sm font-medium text-foreground">Total</span>
                            <span className="text-lg font-bold text-primary">
                                {(editedItems.reduce((acc, item) => acc + item.subtotal, 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isPending}>
                            Cancelar
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={isPending || editedItems.length === 0}
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default function SalesPageClient({ initialSales, initialProducts, totalCount, totalPages, currentPage }: SalesPageContentProps) {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-8">Carregando...</div>}>
            <SalesPageContent
                initialSales={initialSales}
                initialProducts={initialProducts}
                totalCount={totalCount}
                totalPages={totalPages}
                currentPage={currentPage}
            />
        </Suspense>
    )
}