import { Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { PRODUCT_STATUS, ProductStatus } from "@/lib/product-status"

interface ProductListItemProps {
    id: string
    name: string
    currentStock: number
    metrics: {
        daysRemaining: number
        average30d: number
        status: ProductStatus
    }
    variant?: 'compact' | 'detailed'
    showDaysRemaining?: boolean
    showAverage?: boolean
    showStock?: boolean
    className?: string
}

export function ProductListItem({
    name,
    currentStock,
    metrics,
    variant = 'compact',
    showDaysRemaining = false,
    showAverage = true,
    showStock = true,
    className
}: ProductListItemProps) {
    const status = PRODUCT_STATUS[metrics.status]
    const isCompact = variant === 'compact'

    return (
        <div className={cn(
            "flex items-center justify-between rounded-lg border hover:bg-muted/50 transition-colors",
            isCompact ? "p-3" : "p-4",
            className
        )}>
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    <Package className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-medium">{name}</p>
                    {showAverage && (
                        <p className="text-xs text-muted-foreground">
                            {metrics.average30d.toFixed(1)} vendas/dia
                        </p>
                    )}
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                {showDaysRemaining && (
                    <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-md",
                        status.bgColor,
                        status.textColor
                    )}>
                        {metrics.daysRemaining === 999 ? '∞' : metrics.daysRemaining} dias
                    </span>
                )}
                {showStock && (
                    <Badge variant={status.badge}>
                        {currentStock} un.
                    </Badge>
                )}
            </div>
        </div>
    )
}