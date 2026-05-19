import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getCompanyOverview, getOrgSalesDaysRange } from "@/lib/analytics-actions"
import { StatsGrid } from "@/components/ui/stats-card"
import { HealthCard } from "@/components/dashboard/health-card"
import { TopProductsList } from "@/components/ui/top-products-list"

export default async function DashboardPage(props: { searchParams: Promise<{ days?: string }> }) {
    const searchParams = await props.searchParams
    const orgDays = await getOrgSalesDaysRange()
    const daysRange = searchParams.days ? parseInt(searchParams.days, 10) : orgDays
    const data = await getCompanyOverview(daysRange)

    const stats = [
        {
            title: `Receita (${daysRange} dias)`,
            value: data.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            description: "valor acumulado em vendas"
        },
        {
            title: "Produtos Críticos",
            value: data.health.critical,
            description: "precisam reposição",
            valueClassName: "text-destructive"
        },
        {
            title: "Em Atenção",
            value: data.health.warning,
            description: "precisam atenção",
            valueClassName: "text-warning"
        },
        {
            title: "Estoque Saudável",
            value: data.health.healthy,
            description: "produtos OK",
            valueClassName: "text-success"
        }
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Visão Geral</h1>
                    <p className="text-muted-foreground mt-2">
                        Período de análise: {daysRange} dias.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" nativeButton={false} render={<Link href={`/dashboard/metrics?days=${daysRange}`} />}>
                        Ver Analíticos Completos
                    </Button>
                    <Button className="bg-primary hover:bg-primary/80" nativeButton={false} render={<Link href="/dashboard/products" />}>
                        Gerenciar Estoque
                    </Button>
                </div>
            </div>

            <StatsGrid stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <HealthCard health={data.health} />
                <TopProductsList
                    products={data.topProducts}
                    title="Produtos de Maior Giro"
                    description={`Seus produtos mais vendidos nos últimos ${daysRange} dias.`}
                    maxItems={3}
                />
            </div>
        </div>
    )
}