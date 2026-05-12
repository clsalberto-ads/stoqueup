import { Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PRODUCT_STATUS, ProductStatus } from "@/lib/product-status"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ProductMetrics {
    daysRemaining: number
    average30d: number
    status: ProductStatus
}

interface ProductWithMetrics {
    id: string
    name: string
    currentStock: number
    metrics: ProductMetrics
}

interface TopProductsListProps {
    products: ProductWithMetrics[]
    title?: string
    description?: string
    maxItems?: number
    variant?: 'compact' | 'detailed'
    showDaysRemaining?: boolean
    showStock?: boolean
    showAverage?: boolean
    className?: string
}

export function TopProductsList({
    products,
    title = "Produtos de Maior Giro",
    description,
    maxItems,
    variant = 'compact',
    showDaysRemaining = false,
    showStock = true,
    showAverage = true,
    className
}: TopProductsListProps) {
    const displayProducts = maxItems ? products.slice(0, maxItems) : products

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {displayProducts.map((product) => {
                        const status = PRODUCT_STATUS[product.metrics.status]
                        const isCompact = variant === 'compact'

                        return (
                            <div
                                key={product.id}
                                className={cn(
                                    "flex items-center justify-between rounded-lg border hover:bg-muted/50 transition-colors",
                                    isCompact ? "p-3" : "p-4"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                        <Package className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                        {showAverage && (
                                            <p className="text-xs text-muted-foreground">
                                                {product.metrics.average30d.toFixed(1)} vendas/dia
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
                                            {product.metrics.daysRemaining === 999 ? '∞' : product.metrics.daysRemaining} dias
                                        </span>
                                    )}
                                    {showStock && (
                                        <Badge variant={status.badge}>
                                            {product.currentStock} un.
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}