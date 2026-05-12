"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Factory } from "lucide-react"
import { ProductionCard } from "@/components/production/production-card"
import { CreateTaskModal } from "@/components/production/create-task-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"

const ITEMS_PER_PAGE = 8

interface TaskData {
    id: string
    productId: string
    productName: string
    status: string
    quantity: number
    createdAt: Date
}

interface ProductionPageContentProps {
    initialPending: TaskData[]
    initialCompleted: TaskData[]
    initialProducts: { id: string; name: string; currentStock: number; qtdMaxima: number; price: number }[]
    totalCompletedCount: number
    isAdmin: boolean
}

function ProductionPageContent({ initialPending, initialCompleted, initialProducts, totalCompletedCount, isAdmin }: ProductionPageContentProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const page = parseInt(searchParams.get("page") || "1", 10)
    const totalPages = Math.ceil(totalCompletedCount / ITEMS_PER_PAGE)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Produção</h1>
                    <p className="text-muted-foreground mt-2">
                        Acompanhe as ordens de reposição e gerencie o fluxo de produção.
                    </p>
                </div>
                {isAdmin && <CreateTaskModal products={initialProducts} />}
            </div>

            <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2 bg-muted p-1">
                    <TabsTrigger value="active" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        Em Aberto ({initialPending.length})
                    </TabsTrigger>
                    <TabsTrigger value="history" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        Concluídas ({totalCompletedCount})
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="active" className="mt-6">
                    {initialPending.length === 0 ? (
                        <Card className="border-dashed border-2 bg-muted">
                            <CardHeader className="pb-3 text-center">
                                <div className="mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                                    <Factory className="h-10 w-10" />
                                </div>
                                <CardTitle className="text-xl font-semibold text-center">Sem tarefas pendentes</CardTitle>
                                <CardDescription className="text-center max-w-sm mx-auto">
                                    O sistema criará tarefas automaticamente quando o estoque atingir o limite mínimo.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {initialPending.map((task) => (
                                <ProductionCard 
                                    key={task.id} 
                                    task={{
                                        ...task,
                                        status: task.status as "PENDING" | "IN_PROGRESS" | "COMPLETED"
                                    }} 
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    {initialCompleted.length === 0 ? (
                        <Card className="border-dashed border-2 bg-muted">
                            <CardHeader className="pb-3 text-center">
                                <CardTitle className="text-xl font-semibold text-center">Nenhuma produção concluída</CardTitle>
                                <CardDescription className="text-center">
                                    As tarefas concluídas aparecerão aqui.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 opacity-80">
                                {initialCompleted.map((task) => (
                                    <ProductionCard 
                                        key={task.id} 
                                        task={{
                                            ...task,
                                            status: task.status as "PENDING" | "IN_PROGRESS" | "COMPLETED"
                                        }} 
                                    />
                                ))}
                            </div>

                            <Pagination 
                                page={page} 
                                totalPages={totalPages} 
                                onPageChange={(newPage) => router.push(`/dashboard/production?page=${newPage}`)}
                                className="mt-4"
                            />
                        </>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default function ProductionPageClient({ initialPending, initialCompleted, initialProducts, totalCompletedCount, isAdmin }: ProductionPageContentProps) {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-8">Carregando...</div>}>
            <ProductionPageContent 
                initialPending={initialPending} 
                initialCompleted={initialCompleted}
                initialProducts={initialProducts}
                totalCompletedCount={totalCompletedCount}
                isAdmin={isAdmin}
            />
        </Suspense>
    )
}