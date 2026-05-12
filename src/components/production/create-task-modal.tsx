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
        currentStock: number
        qtdMaxima: number
    }[]
}

export function CreateTaskModal({ products }: CreateTaskModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedProductId, setSelectedProductId] = useState("")
    const [quantity, setQuantity] = useState(0)
    const [isPending, startTransition] = useTransition()

    const selectedProduct = products.find(p => p.id === selectedProductId)
    const maxAllowed = selectedProduct ? selectedProduct.qtdMaxima - selectedProduct.currentStock : 0

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
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o produto" />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.name} (Estoque: {p.currentStock})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
