"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, CheckCircle, Clock, Loader2, Factory } from "lucide-react"
import { updateProductionStatus } from "@/lib/inventory-actions"
import { CompleteProductionModal } from "./complete-production-modal"
import { toast } from "sonner"

interface ProductionCardProps {
    task: {
        id: string
        productId: string
        productName: string
        status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
        quantity: number
        createdAt: Date
    }
}

export function ProductionCard({ task }: ProductionCardProps) {
    const [isPending, startTransition] = useTransition()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleStart = () => {
        startTransition(async () => {
            const result = await updateProductionStatus(task.id, "IN_PROGRESS");
            if (result.success) {
                toast.success("Produção iniciada!");
            } else {
                toast.error(`Erro: ${result.error}`);
            }
        });
    }

    const statusMap = {
        PENDING: { label: "Pendente", color: "bg-slate-100 text-slate-700", icon: Clock },
        IN_PROGRESS: { label: "Produzindo", color: "bg-blue-100 text-blue-700", icon: Factory },
        COMPLETED: { label: "Concluído", color: "bg-green-100 text-green-700", icon: CheckCircle },
    }

    const { label, color, icon: StatusIcon } = statusMap[task.status]

    return (
        <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                <Badge variant="outline" className={`${color} border-none font-semibold flex gap-1 items-center`}>
                    <StatusIcon className="h-3 w-3" /> {label}
                </Badge>
                <span className="text-xs text-slate-400">
                    {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                </span>
            </CardHeader>
            
            <CardContent className="p-4 flex-1">
                <h3 className="font-bold text-slate-900 mb-1">{task.productName}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="font-medium">Lote Planejado:</span>
                    <span className="text-slate-900 font-bold">{task.quantity} unid.</span>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                {task.status === "PENDING" && (
                    <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                        onClick={handleStart}
                        disabled={isPending}
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                        Iniciar Produção
                    </Button>
                )}
                {task.status === "IN_PROGRESS" && (
                    <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                        onClick={() => setIsModalOpen(true)}
                        disabled={isPending}
                    >
                        <CheckCircle className="h-4 w-4" />
                        Concluir e Conferir
                    </Button>
                )}
                {task.status === "COMPLETED" && (
                    <div className="w-full py-2 text-center text-sm font-medium text-green-600 flex items-center justify-center gap-1">
                        <CheckCircle className="h-4 w-4" /> Concluído
                    </div>
                )}
            </CardFooter>

            <CompleteProductionModal 
                task={{
                    id: task.id,
                    productId: task.productId,
                    productName: task.productName,
                    plannedQuantity: task.quantity
                }}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </Card>
    )
}
