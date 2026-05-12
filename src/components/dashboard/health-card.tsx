"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PRODUCT_STATUS } from "@/lib/product-status"
import { cn } from "@/lib/utils"

interface HealthStatus {
    critical: number
    warning: number
    healthy: number
}

interface HealthCardProps {
    health: HealthStatus
    title?: string
    description?: string
}

const statusOrder: Array<'CRITICAL' | 'WARNING' | 'HEALTHY'> = ['CRITICAL', 'WARNING', 'HEALTHY']

export function HealthCard({ health, title = "Saúde do Catálogo", description }: HealthCardProps) {
    const statusCounts = {
        CRITICAL: health.critical,
        WARNING: health.warning,
        HEALTHY: health.healthy
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {statusOrder.map((status) => {
                        const config = PRODUCT_STATUS[status]
                        const count = statusCounts[status]
                        const Icon = config.icon

                        return (
                            <div
                                key={status}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border",
                                    config.bgColor,
                                    config.borderColor
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={cn("h-5 w-5", config.textColor)} />
                                    <span className={cn("font-medium", config.textColor)}>{config.label}</span>
                                </div>
                                <Badge variant={config.badge}>{count} itens</Badge>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
