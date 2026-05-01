import { db } from "@/db"
import { productionTasks, products } from "@/db/schema"
import { desc, eq } from "drizzle-orm"
import { ProductionCard } from "@/components/production/production-card"
import { CreateTaskModal } from "@/components/production/create-task-modal"
import { auth } from "@/lib/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Factory } from "lucide-react"

export default async function ProductionPage() {
    const session = await auth.api.getSession();
    const isAdmin = session?.user.role === "admin";

    const allProducts = await db.select().from(products);
    
    const tasks = await db
        .select({
            id: productionTasks.id,
            productId: productionTasks.productId,
            productName: products.name,
            status: productionTasks.status,
            quantity: productionTasks.quantity,
            createdAt: productionTasks.createdAt,
        })
        .from(productionTasks)
        .innerJoin(products, eq(productionTasks.productId, products.id))
        .orderBy(desc(productionTasks.createdAt))

    const pending = tasks.filter(t => t.status === "PENDING" || t.status === "IN_PROGRESS")
    const completed = tasks.filter(t => t.status === "COMPLETED")

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão de Produção</h1>
                    <p className="text-slate-500 mt-2">
                        Acompanhe as ordens de reposição e gerencie o fluxo de produção.
                    </p>
                </div>
                {isAdmin && <CreateTaskModal products={allProducts} />}
            </div>

            <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2 bg-slate-100 p-1">
                    <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Em Aberto ({pending.length})
                    </TabsTrigger>
                    <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Concluídas ({completed.length})
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="active" className="mt-6">
                    {pending.length === 0 ? (
                        <Card className="border-dashed border-2 bg-slate-50">
                            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center mb-4 text-slate-400">
                                    <Factory className="h-10 w-10" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900">Sem tarefas pendentes</h3>
                                <p className="text-slate-500 max-w-sm mt-2">
                                    O sistema criará tarefas automaticamente quando o estoque atingir o limite mínimo.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {pending.map((task) => (
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
                    {completed.length === 0 ? (
                        <p className="text-center py-10 text-slate-500 italic">Nenhuma produção concluída recentemente.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-80">
                            {completed.map((task) => (
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
            </Tabs>
        </div>
    )
}
