"use client"

import { useState, useTransition } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus } from "lucide-react"
import { createManualProductionTask } from "@/lib/inventory-actions"
import { toast } from "sonner"

interface CreateTaskModalProps {
    products: {
        id: string
        name: string
        description?: string | null
        currentStock: number
        qtdMaxima: number
    }[]
    pendingQtyByProduct: Record<string, number>
}

export function CreateTaskModal({ products, pendingQtyByProduct }: CreateTaskModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedProductId, setSelectedProductId] = useState("")
    const [quantity, setQuantity] = useState(0)
    const [isPending, startTransition] = useTransition()

    const selectedProduct = products.find(p => p.id === selectedProductId)
    const pendingQty = selectedProduct ? (pendingQtyByProduct[selectedProduct.id] || 0) : 0
    const maxAllowed = selectedProduct ? Math.max(0, selectedProduct.qtdMaxima - selectedProduct.currentStock - pendingQty) : 0

    const handleConfirm = () => {
        if (!selectedProductId || quantity <= 0) {
            toast.error("Selecione um produto e uma quantidade válida");
            return;
        }

        startTransition(async () => {
            const result = await createManualProductionTask(selectedProductId, quantity);
            if (result.success) {
                toast.success("Ordem de produção criada!");
                setIsOpen(false);
                setSelectedProductId("");
                setQuantity(0);
            } else {
                toast.error(`Erro: ${result.error}`);
            }
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger 
                render={
                    <Button className="bg-primary hover:bg-primary/80">
                        <Plus className="mr-2 h-4 w-4" /> Nova Produção
                    </Button>
                }
            />
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nova Ordem de Produção</DialogTitle>
                    <DialogDescription>
                        Crie uma tarefa manual para repor o estoque de um produto.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="product">Produto</Label>
                        <Select onValueChange={(val) => setSelectedProductId(val ?? "")} value={selectedProductId}>
                            <SelectTrigger className="!h-auto min-h-9 !w-full">
                                <SelectValue placeholder="Selecione o produto" className="!line-clamp-none items-start">
                                    {(value: string | null) => {
                                        if (!value) return <span className="text-muted-foreground">Selecione o produto</span>;
                                        const product = products.find(p => p.id === value);
                                        if (!product) return null;
                                        return (
                                            <div className="flex flex-col items-start gap-0 leading-tight">
                                                <span className="text-sm font-medium">{product.name}</span>
                                                {product.description && (
                                                    <span className="text-xs text-muted-foreground line-clamp-1">{product.description}</span>
                                                )}
                                            </div>
                                        );
                                    }}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        <div className="flex flex-col gap-0.5 py-0.5 leading-tight">
                                            <span className="font-medium text-sm">{p.name}</span>
                                            {p.description && (
                                                <span className="text-xs text-muted-foreground line-clamp-1">{p.description}</span>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedProduct && (
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span>Estoque atual: <span className="font-semibold text-foreground">{selectedProduct.currentStock}</span></span>
                                {pendingQty > 0 && (
                                    <span>Em produção: <span className="font-semibold text-foreground">{pendingQty}</span></span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantidade (Máx: {maxAllowed})</Label>
                        <Input
                            id="quantity"
                            type="number"
                            value={quantity}
                            max={maxAllowed}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                        />
                        {quantity > maxAllowed && (
                            <p className="text-xs text-destructive font-medium">A quantidade excede o limite máximo permitido.</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleConfirm} 
                        disabled={isPending || quantity > maxAllowed || quantity <= 0 || !selectedProductId} 
                        className="bg-primary hover:bg-primary/80"
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Criar Tarefa
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
