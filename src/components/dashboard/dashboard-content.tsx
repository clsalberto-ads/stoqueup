"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Package } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePreferences } from "@/hooks/use-preferences"
import { HealthCard } from "./health-card"

interface DashboardData {
    totalSales30d: number
    health: {
        critical: number
        warning: number
        healthy: number
    }
    chartData: { date: string; sales: number }[]
    topProducts: {
        id: string
        name: string
        currentStock: number
        metrics: {
            daysRemaining: number
            average30d: number
            status: 'CRITICAL' | 'WARNING' | 'HEALTHY'
        }
    }[]
}

export function DashboardContent({ data }: { data: DashboardData }) {
    const { preferences } = usePreferences()
    const daysRange = preferences.salesDaysRange

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Visão Geral</h1>
                    <p className="text-muted-foreground mt-2">
                        Bem-vindo ao StoqueUp. Aqui está o resumo do seu negócio hoje ({daysRange} dias).
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" nativeButton={false} render={<Link href="/dashboard/metrics" />}>
                        Ver Analíticos Completos
                    </Button>
                    <Button className="bg-primary hover:bg-primary/80" nativeButton={false} render={<Link href="/dashboard/products" />}>
                        Gerenciar Estoque
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid - 4 colunas desktop, 2 tablet, 1 mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Vendas ({daysRange}d)</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="text-3xl font-bold">{data.totalSales30d}</div>
                        <p className="text-xs text-muted-foreground mt-1">unidades</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Crítico</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="text-3xl font-bold text-destructive">{data.health.critical}</div>
                        <p className="text-xs text-muted-foreground mt-1">precisam reposição</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Atenção</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="text-3xl font-bold text-amber-600">{data.health.warning}</div>
                        <p className="text-xs text-muted-foreground mt-1">atenção Needed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Saudável</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="text-3xl font-bold text-emerald-600">{data.health.healthy}</div>
                        <p className="text-xs text-muted-foreground mt-1">produtos OK</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <HealthCard health={data.health} />

                {/* Top Products Shortcut */}
                <Card>
                    <CardHeader>
                        <CardTitle>Produtos de Maior Giro ({daysRange}d)</CardTitle>
                        <CardDescription>Seus produtos mais vendidos nos últimos {daysRange} dias.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.topProducts.slice(0, 3).map((p) => (
                                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <Package className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{p.name}</p>
                                            <p className="text-xs text-muted-foreground">{p.metrics.average30d.toFixed(1)} vendas/dia</p>
                                        </div>
                                    </div>
                                    <Badge variant={p.metrics.status === 'CRITICAL' ? 'destructive' : p.metrics.status === 'WARNING' ? 'warning' : 'secondary'}>
                                        {p.currentStock} un.
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
