"use client"

import { StatCard } from "@/components/ui/stats-card"
import { TopProductsList } from "@/components/ui/top-products-list"
import { HealthCard } from "@/components/dashboard/health-card"

import { usePreferences } from "@/hooks/use-preferences"

interface MetricsData {
    totalSales30d: number
    totalRevenue: number
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

export function MetricsContent({ data }: { data: MetricsData }) {
    const { preferences } = usePreferences()
    const daysRange = preferences.salesDaysRange

    const statCards = [
        { title: `Receita (${daysRange} dias)`, value: data.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), description: "valor acumulado em vendas" },
        { title: "Saudável", value: data.health.healthy, description: "Produtos com > 7 dias de estoque" },
        { title: "Em Atenção", value: data.health.warning, description: "Produtos com 3-7 dias de estoque" },
        { title: "Crítico", value: data.health.critical, description: "Reposição imediata necessária" }
    ]

    return (
        <div className="space-y-4 p-1">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <HealthCard health={data.health} title="Saúde do Estoque" description="Situação geral dos produtos." />
                <TopProductsList 
                    products={data.topProducts} 
                    title={`Top Giro (${daysRange} dias)`}
                    description="Seus produtos mais vendidos."
                    showDaysRemaining={true}
                />
            </div>
        </div>
    )
}
