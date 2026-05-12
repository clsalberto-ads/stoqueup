"use client"

import { AreaChart } from "@tremor/react"

type ChartDataPoint = {
    date: string
    sales: number
}

export function SalesChart({ data }: { data: ChartDataPoint[] }) {
    return (
        <AreaChart
            className="h-72 mt-4"
            data={data}
            index="date"
            categories={["sales"]}
            colors={["blue"]}
            valueFormatter={(number: number) => `${number} un`}
            showLegend={false}
        />
    )
}
