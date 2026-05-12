"use client"

import { products } from "@/db/schema"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import Image from "next/image"
import { PRODUCT_STATUS } from "@/lib/product-status"
import { cn } from "@/lib/utils"

interface ProductCardProps {
    product: typeof products.$inferSelect & {
        metrics: {
            daysRemaining: number
            average30d: number
            status: 'CRITICAL' | 'WARNING' | 'HEALTHY'
        }
    }
}

const infoBoxStyles = "flex flex-col items-center justify-center p-2 rounded-lg bg-muted/50 text-center min-w-[70px]"

export function ProductCard({ product }: ProductCardProps) {
    const status = PRODUCT_STATUS[product.metrics.status]
    const priceFormated = (product.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    return (
        <Card className="overflow-hidden border-border shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
            <div className="aspect-video relative bg-muted shrink-0">
                {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <Package className="h-16 w-16 text-muted-foreground/20" />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <Badge variant={product.statusVenda ? "default" : "secondary"} className={!product.statusVenda ? "opacity-60" : ""}>
                        {product.statusVenda ? "Ativo" : "Inativo"}
                    </Badge>
                </div>
            </div>
            
            <CardContent className="p-4 flex-1 flex flex-col gap-3">
                <h3 className="font-bold text-lg text-foreground line-clamp-1">{product.name}</h3>

                <div className="text-2xl font-extrabold text-primary">
                    {priceFormated}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {product.description || "Produto de qualidade"}
                </p>

                <div className="grid grid-cols-4 gap-2 mt-auto">
                    <div className={infoBoxStyles}>
                        <span className="text-xs text-muted-foreground">Estoque</span>
                        <span className="text-sm font-bold">{product.currentStock}</span>
                    </div>

                    <div className={infoBoxStyles}>
                        <span className="text-xs text-muted-foreground">Dias</span>
                        <span className="text-sm font-bold">
                            {product.metrics.daysRemaining === 999 ? "∞" : product.metrics.daysRemaining}
                        </span>
                    </div>

                    <div className={infoBoxStyles}>
                        <TrendingUp className="h-3 w-3 text-muted-foreground mb-0.5" />
                        <span className="text-sm font-bold">{product.metrics.average30d.toFixed(0)}</span>
                    </div>

                    <div className={cn(infoBoxStyles, status.bgColor)}>
                        {product.metrics.status === 'HEALTHY' ? (
                            <CheckCircle className={cn("h-4 w-4", status.textColor)} />
                        ) : (
                            <AlertTriangle className={cn("h-4 w-4", status.textColor)} />
                        )}
                        <span className={cn("text-xs font-medium", status.textColor)}>
                            {product.metrics.status === 'HEALTHY' ? 'OK' : product.metrics.status === 'WARNING' ? '⚠' : '!'}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}