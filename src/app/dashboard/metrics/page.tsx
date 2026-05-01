import { getCompanyOverview } from "@/lib/analytics-actions"
import { Card, Text, Metric, AreaChart, Title, BarList, Flex, Badge, Grid } from "@tremor/react"
import { AlertTriangle, CheckCircle, TrendingUp, Package } from "lucide-react"

export default async function MetricsPage() {
    const data = await getCompanyOverview()

    const statusConfig = {
        CRITICAL: { color: "rose", icon: AlertTriangle, label: "Crítico" },
        WARNING: { color: "amber", icon: AlertTriangle, label: "Atenção" },
        HEALTHY: { color: "emerald", icon: CheckCircle, label: "Saudável" },
    }

    return (
        <div className="space-y-8 p-1">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inteligência de Dados</h1>
                <p className="text-slate-500 mt-2">
                    Análise preditiva e saúde geral do seu estoque.
                </p>
            </div>

            {/* KPI Cards */}
            <Grid numItemsSm={2} numItemsLg={4} className="gap-6">
                <Card decoration="top" decorationColor="blue">
                    <Flex alignItems="start">
                        <div className="truncate">
                            <Text>Vendas (30 dias)</Text>
                            <Metric>{data.totalSales30d} un</Metric>
                        </div>
                        <Badge icon={TrendingUp}>Mensal</Badge>
                    </Flex>
                </Card>
                <Card decoration="top" decorationColor="emerald">
                    <Text>Saudável</Text>
                    <Metric>{data.health.healthy}</Metric>
                    <Text className="mt-2 text-xs">Produtos com > 7 dias de estoque</Text>
                </Card>
                <Card decoration="top" decorationColor="amber">
                    <Text>Em Atenção</Text>
                    <Metric>{data.health.warning}</Metric>
                    <Text className="mt-2 text-xs">Produtos com 3-7 dias de estoque</Text>
                </Card>
                <Card decoration="top" decorationColor="rose">
                    <Text>Crítico</Text>
                    <Metric>{data.health.critical}</Metric>
                    <Text className="mt-2 text-xs">Reposição imediata necessária</Text>
                </Card>
            </Grid>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Evolution Chart */}
                <Card className="lg:col-span-2">
                    <Title>Evolução de Vendas (15 dias)</Title>
                    <AreaChart
                        className="h-72 mt-4"
                        data={data.chartData}
                        index="date"
                        categories={["sales"]}
                        colors={["blue"]}
                        valueFormatter={(number: number) => `${number} un`}
                        showLegend={false}
                    />
                </Card>

                {/* Top Products */}
                <Card>
                    <Title>Top Giro (Média 30d)</Title>
                    <div className="mt-4 space-y-4">
                        {data.topProducts.map((p) => {
                            const config = statusConfig[p.metrics.status]
                            return (
                                <div key={p.id} className="flex items-center justify-between group">
                                    <div className="space-y-1">
                                        <Text className="font-medium text-slate-900 truncate max-w-[150px]">{p.name}</Text>
                                        <div className="flex items-center gap-2">
                                            <Badge color={config.color} size="xs">{p.metrics.daysRemaining} dias</Badge>
                                            <Text className="text-xs">{p.metrics.average30d.toFixed(1)}/dia</Text>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Text className="text-xs text-slate-400">Estoque</Text>
                                        <Text className="font-bold">{p.currentStock}</Text>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            </div>
        </div>
    )
}
