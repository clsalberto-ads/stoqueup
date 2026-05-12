"use client"

import { useState, useTransition, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { completeProduction } from "@/lib/inventory-actions"
import { toast } from "sonner"

interface CompleteProductionModalProps {
    task: {
        id: string
        productId: string
        productName: string
        plannedQuantity: number
    }
    isOpen: boolean
    onClose: () => void
}

export function CompleteProductionModal({ task, isOpen, onClose }: CompleteProductionModalProps) {
    const [quantity, setQuantity] = useState(task.plannedQuantity)
    const [isPending, startTransition] = useTransition()

    // Sincroniza quantity com a task atual sempre que a modal abre
    useEffect(() => {
        if (isOpen) setQuantity(task.plannedQuantity)
    }, [isOpen, task.plannedQuantity])

    const handleConfirm = () => {
        startTransition(async () => {
            const result = await completeProduction(task.id, task.productId, quantity);
            if (result.success) {
                toast.success(result.message || "Produção concluída!");
                onClose();
            } else {
                toast.error(`Erro: ${result.error}`);
            }
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Concluir Produção</DialogTitle>
                    <DialogDescription>
                        Confirme a quantidade real produzida para <strong>{task.productName}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">
                            Quantidade
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm} disabled={isPending} className="bg-primary hover:bg-primary/80">
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar e Incrementar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
