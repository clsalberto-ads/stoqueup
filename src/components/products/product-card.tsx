"use client"

import { products } from "@/db/schema"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, AlertTriangle, Loader2 } from "lucide-react"
import Image from "next/image"
import { sellProduct } from "@/lib/inventory-actions"
import { toast } from "sonner"
import { useTransition } from "react"

interface ProductCardProps {
    product: typeof products.$inferSelect
}

export function ProductCard({ product }: ProductCardProps) {
    const [isPending, startTransition] = useTransition();

    const isCritical = product.currentStock <= product.qtdMinima;
    const isOutOfStock = product.currentStock <= 0;

    const handleSell = () => {
        startTransition(async () => {
            const result = await sellProduct(product.id, 1);
            if (result.success) {
                toast.success(`Venda registrada: ${product.name}`);
            } else {
                toast.error(`Erro: ${result.error}`);
            }
        });
    };

    return (
        <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="aspect-video relative bg-slate-100 shrink-0">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                        Sem Imagem
                    </div>
                )}
                {isCritical && !isOutOfStock && (
                    <Badge variant="warning" className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-600 text-white border-none gap-1">
                        <AlertTriangle className="h-3 w-3" /> Reposição
                    </Badge>
                )}
                {isOutOfStock && (
                    <Badge variant="destructive" className="absolute top-2 right-2 gap-1">
                        Esgotado
                    </Badge>
                )}
            </div>
            
            <CardContent className="p-4 flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-900 truncate flex-1 mr-2">{product.name}</h3>
                    <span className="font-bold text-blue-600">
                        {(product.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">
                    {product.description || "Sem descrição"}
                </p>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">Estoque:</span>
                    <span className={`font-bold ${isCritical ? 'text-amber-600' : 'text-slate-900'}`}>
                        {product.currentStock} unid.
                    </span>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button 
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-2"
                    onClick={handleSell}
                    disabled={isPending || isOutOfStock}
                >
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <ShoppingCart className="h-4 w-4" />
                    )}
                    {isOutOfStock ? "Indisponível" : "Vender 1 un."}
                </Button>
            </CardFooter>
        </Card>
    );
}
