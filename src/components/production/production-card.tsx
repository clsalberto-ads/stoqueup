"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, CheckCircle, Clock, Loader2, Package, Calendar } from "lucide-react"
import { updateProductionStatus } from "@/lib/inventory-actions"
import { CompleteProductionModal } from "./complete-production-modal"
import { toast } from "sonner"

interface ProductionCardProps {
    task: {
        id: string
        productId: string
        productName: string
        productDescription?: string | null
        status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
        quantity: number
        createdAt: Date
    }
}

const statusConfig = {
    PENDING: { 
        label: "Pendente", 
        variant: "secondary" as const, 
        icon: Clock,
        buttonVariant: "default" as const,
        buttonText: "Iniciar Produção"
    },
    IN_PROGRESS: { 
        label: "Produzindo", 
        variant: "warning" as const, 
        icon: Package,
        buttonVariant: "default" as const,
        buttonStyle: "bg-emerald-600 hover:bg-emerald-700" as const,
        buttonText: "Concluir Produção"
    },
    COMPLETED: { 
        label: "Concluído", 
        variant: "secondary" as const, 
        icon: CheckCircle,
        buttonVariant: "outline" as const,
        buttonText: "Concluído"
    }
}

export function ProductionCard({ task }: ProductionCardProps) {
    const [isPending, startTransition] = useTransition()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const config = statusConfig[task.status]
    const StatusIcon = config.icon

    const handleStart = () => {
        startTransition(async () => {
            const result = await updateProductionStatus(task.id, "IN_PROGRESS")
            if (result.success) {
                toast.success("Produção iniciada!")
            } else {
                toast.error(`Erro: ${result.error}`)
            }
        })
    }

    return (
        <Card className="border-border shadow-sm hover:shadow-md transition-all flex flex-col h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <Badge variant={config.variant} className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                </div>
            </CardHeader>
            
            <CardContent className="pt-0 flex-1">
                <h3 className="font-semibold text-lg text-foreground">{task.productName}</h3>
                {task.productDescription && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3 mt-1">{task.productDescription}</p>
                )}
                {!task.productDescription && <div className="mb-3" />}
                
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Quantidade</span>
                        <span className="text-sm font-medium">{task.quantity} unid.</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-3">
                {task.status === "PENDING" && (
                    <Button 
                        className="w-full bg-primary hover:bg-primary/80 gap-2"
                        onClick={handleStart}
                        disabled={isPending}
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                        Iniciar Produção
                    </Button>
                )}
                {task.status === "IN_PROGRESS" && (
                    <Button 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                        onClick={() => setIsModalOpen(true)}
                        disabled={isPending}
                    >
                        <CheckCircle className="h-4 w-4" />
                        Concluir Produção
                    </Button>
                )}
                {task.status === "COMPLETED" && (
                    <div className="w-full py-2 text-center text-sm font-medium text-success flex items-center justify-center gap-1 bg-success/15 rounded-lg">
                        <CheckCircle className="h-4 w-4" />
                        Concluído
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