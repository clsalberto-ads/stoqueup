"use client"

import { Suspense, useState, useTransition } from "react"
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
}

function SalesPageContent({ initialSales, initialProducts }: SalesPageContentProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editingSale, setEditingSale] = useState<GroupedSale | null>(null)
    const [editedItems, setEditedItems] = useState<GroupedSale['items']>([])
    const [isPending, startTransition] = useTransition()

    // Mapa produto → estoque atual para validação na edição
    const productStockMap = new Map(initialProducts.map(p => [p.id, p.currentStock]))

    const handleEditSale = (sale: GroupedSale) => {
        setEditingSale(sale)
        setEditedItems([...sale.items])
        setIsEditing(true)
    }

    const getMaxItemQuantity = (productId: string): number => {
        if (!editingSale) return 0
        const originalItem = editingSale.items.find(i => i.productId === productId)
        const currentStock = productStockMap.get(productId) ?? 0
        return (originalItem?.quantity ?? 0) + currentStock
    }

    const handleUpdateItemQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            setEditedItems(prev => prev.filter(item => item.id !== itemId))
            return
        }

        setEditedItems(prev =>
            prev.map(item => {
                if (item.id !== itemId) return item
                const maxQty = getMaxItemQuantity(item.productId)
                const clamped = Math.min(newQuantity, maxQty)
                return { ...item, quantity: clamped, subtotal: clamped * item.price }
            })
        )
    }

    const handleSaveEdit = () => {
        if (!editingSale) return

        startTransition(async () => {
            const result = await updateSale(editingSale.id, editedItems, editingSale.items)
            if (result.success) {
                toast.success("Venda atualizada com sucesso!")
                setIsEditing(false)
                setEditingSale(null)
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
                        Últimas vendas no período configurado.
                    </p>
                </div>
                <RegisterSaleModal products={initialProducts} />
            </div>

            <SalesTable
                sales={initialSales}
                showCard={true}
                title="Vendas Recentes"
                description="Lista das transações de venda"
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
                            {editedItems.map((item) => {
                                const maxQty = getMaxItemQuantity(item.productId)
                                const atMax = item.quantity >= maxQty
                                return (
                                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-md border bg-background text-sm">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{item.productName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {(item.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/un
                                            </p>
                                            {editingSale && (
                                                <p className="text-xs text-muted-foreground">
                                                    Estoque disp.: {productStockMap.get(item.productId) ?? 0}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                variant="outline"
                                                size="icon-sm"
                                                className="h-7 w-7"
                                                disabled={item.quantity <= 1}
                                                onClick={() => handleUpdateItemQuantity(item.id, item.quantity - 1)}
                                            >-</Button>
                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                            <Button
                                                variant="outline"
                                                size="icon-sm"
                                                className="h-7 w-7"
                                                disabled={atMax}
                                                onClick={() => handleUpdateItemQuantity(item.id, item.quantity + 1)}
                                            >+</Button>
                                        </div>
                                        <span className="font-semibold text-primary w-20 text-right shrink-0">
                                            {(item.subtotal / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </span>
                                    </div>
                                )
                            })}
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

export default function SalesPageClient({ initialSales, initialProducts }: SalesPageContentProps) {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-8">Carregando...</div>}>
            <SalesPageContent
                initialSales={initialSales}
                initialProducts={initialProducts}
            />
        </Suspense>
    )
}
