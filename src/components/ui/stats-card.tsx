import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
    title: string
    value: number | string
    description?: string
    icon?: LucideIcon
    iconClassName?: string
    valueClassName?: string
    className?: string
}

export function StatCard({
    title,
    value,
    description,
    icon: Icon,
    iconClassName,
    valueClassName,
    className
}: StatCardProps) {
    return (
        <Card className={cn("", className)}>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                    <div className={cn("text-3xl font-bold", valueClassName)}>
                        {value}
                    </div>
                    {Icon && (
                        <Icon className={cn("h-5 w-5 text-muted-foreground", iconClassName)} />
                    )}
                </div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

interface StatsGridProps {
    stats: StatCardProps[]
    className?: string
}

export function StatsGrid({ stats, className }: StatsGridProps) {
    return (
        <div className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
            className
        )}>
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    )
}