"use client"

import { ShoppingCart, TrendingUp, Package, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stats-card"
import { HealthCard } from "@/components/dashboard/health-card"
import { TopProductsList } from "@/components/ui/top-products-list"
import { SalesAreaChart } from "./sales-area-chart"

import { cn } from "@/lib/utils"

interface MetricsData {
    totalSales30d: number
    totalRevenue: number
    salesDaysRange: number
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
    totalProducts: number
    outOfStock: number
    belowMinStock: number
    totalStockItems: number
    totalStockValue: number
    avgDailySales: number
    salesTrend: {
        value: number
        isPositive: boolean
    }
}

export function MetricsContent({ data }: { data: MetricsData }) {
    const daysRange = data.salesDaysRange

    const statCards = [
        {
            title: `Vendas (${daysRange} dias)`,
            value: `${data.totalSales30d}`,
            description: `Média: ${data.avgDailySales}/dia`,
            icon: ShoppingCart,
            valueClassName: "text-foreground",
        },
        {
            title: "Receita Total",
            value: data.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            description: "Valor acumulado em vendas",
            icon: TrendingUp,
            valueClassName: "text-primary",
        },
        {
            title: "Produtos em Estoque",
            value: `${data.totalProducts - data.outOfStock}`,
            description: `${data.totalStockItems} itens | ${data.totalProducts} cadastrados`,
            icon: Package,
            valueClassName: "text-foreground",
        },
        {
            title: "Estoque Crítico",
            value: `${data.health.critical}`,
            description: data.health.critical === 1 ? "1 produto precisa reposição" : `${data.health.critical} produtos precisam reposição`,
            icon: AlertTriangle,
            iconClassName: "text-destructive",
            valueClassName: "text-destructive",
        },
    ]

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Inteligência de Dados</h1>
                <p className="text-muted-foreground mt-2">
                    Análise preditiva e saúde geral do seu estoque. Período: {daysRange} dias.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, index) => (
                    <StatCard key={index} {...card} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Vendas no Período</CardTitle>
                                <CardDescription>
                                    Evolução diária de vendas nos últimos {daysRange} dias
                                </CardDescription>
                            </div>
                            {data.salesTrend.value !== 0 && (
                                <span
                                    className={cn(
                                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
                                        data.salesTrend.isPositive
                                            ? "bg-emerald-500/10 text-emerald-600"
                                            : "bg-destructive/10 text-destructive"
                                    )}
                                >
                                    {data.salesTrend.isPositive ? "↑" : "↓"} {Math.abs(data.salesTrend.value)}%
                                </span>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <SalesAreaChart data={data.chartData} />
                    </CardContent>
                </Card>

                <HealthCard
                    health={data.health}
                    title="Saúde do Estoque"
                    description="Situação geral dos produtos no catálogo."
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TopProductsList
                    products={data.topProducts}
                    title={`Top Giro (${daysRange} dias)`}
                    description="Seus produtos mais vendidos no período."
                    showDaysRemaining
                    showStock
                    showAverage
                    className="lg:col-span-2"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Resumo do Estoque</CardTitle>
                        <CardDescription>Visão geral dos produtos cadastrados</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <StockRow label="Produtos cadastrados" value={data.totalProducts} />
                        <StockRow label="Produtos com estoque" value={data.totalProducts - data.outOfStock} />
                        <StockRow label="Itens em estoque" value={data.totalStockItems} />
                        <StockRow
                            label="Abaixo do mínimo"
                            value={data.belowMinStock}
                            highlight={data.belowMinStock > 0 ? "text-amber-600" : undefined}
                        />
                        <StockRow
                            label="Zerados"
                            value={data.outOfStock}
                            highlight={data.outOfStock > 0 ? "text-destructive" : undefined}
                        />
                        <hr className="border-border" />
                        <StockRow
                            label="Valor total do estoque"
                            value={data.totalStockValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            valueClassName="text-primary font-bold"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StockRow({
    label,
    value,
    highlight,
    valueClassName,
}: {
    label: string
    value: string | number
    highlight?: string
    valueClassName?: string
}) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className={cn("text-sm font-semibold", highlight, valueClassName)}>
                {value}
            </span>
        </div>
    )
}
