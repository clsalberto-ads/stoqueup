"use client"

import { products } from "@/db/schema"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, TrendingUp, AlertTriangle, CheckCircle, Pencil } from "lucide-react"
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
    onEdit?: (product: typeof products.$inferSelect & {
        metrics: {
            daysRemaining: number
            average30d: number
            status: 'CRITICAL' | 'WARNING' | 'HEALTHY'
        }
    }) => void
}

const infoBoxStyles = "flex flex-col items-center justify-center p-2 rounded-lg bg-muted text-center min-w-[70px]"

export function ProductCard({ product, onEdit }: ProductCardProps) {
    const status = PRODUCT_STATUS[product.metrics.status]
    const priceFormated = (product.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    return (
        <Card className="overflow-hidden border-border shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
            <div className="aspect-[4/3] relative bg-gradient-to-br from-muted to-muted/50 shrink-0">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-1">
                        <Package className="h-12 w-12 text-muted-foreground/30" />
                        <span className="text-xs text-muted-foreground/40">Sem imagem</span>
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <Badge variant={product.statusVenda ? "default" : "secondary"} className={!product.statusVenda ? "opacity-60" : ""}>
                        {product.statusVenda ? "Ativo" : "Inativo"}
                    </Badge>
                </div>
                {onEdit && (
                    <div className="absolute top-2 left-2 opacity-70 hover:opacity-100 transition-opacity max-sm:opacity-100">
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-8 w-8 p-0 shadow-sm"
                            onClick={() => onEdit(product)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
            
            <CardContent className="p-4 flex-1 flex flex-col gap-3">
                <h3 className="font-bold text-lg text-foreground line-clamp-1">{product.name}</h3>

                <div className="text-2xl font-extrabold text-primary">
                    {priceFormated}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {product.description || "Produto de qualidade"}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-auto">
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