export const dynamic = 'force-dynamic'
import { getCompanyOverview } from "@/lib/analytics-actions"
import { MetricsContent } from "@/components/metrics/metrics-content"

export default async function MetricsPage({ searchParams }: { searchParams: { days?: string } }) {
    const daysRange = searchParams.days ? parseInt(searchParams.days, 10) : 30
    const data = await getCompanyOverview(daysRange)

    return <MetricsContent data={data} />
}