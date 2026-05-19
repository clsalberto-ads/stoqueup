export const dynamic = 'force-dynamic'
import { getCompanyOverview, getOrgSalesDaysRange } from "@/lib/analytics-actions"
import { MetricsContent } from "@/components/metrics/metrics-content"
import { authorize } from "@/lib/authorize"

export default async function MetricsPage(props: { searchParams: Promise<{ days?: string }> }) {
    await authorize("read", "Metrics")
    const searchParams = await props.searchParams
    const orgDays = await getOrgSalesDaysRange()
    const daysRange = searchParams.days ? parseInt(searchParams.days, 10) : orgDays
    const data = await getCompanyOverview(daysRange)

    return <MetricsContent data={data} />
}