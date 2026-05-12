"use client"

import { useState, useTransition } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, ShoppingCart, Trash2, Package, DollarSign } from "lucide-react"
import { sellMultipleProducts } from "@/lib/inventory-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Product {
    id: string
    name: string
    currentStock: number
    price: number
}

interface CartItem extends Product {
    quantity: number
}

interface RegisterSaleModalProps {
    products: Product[]
}

export function RegisterSaleModal({ products }: RegisterSaleModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [cart, setCart] = useState<CartItem[]>([])
    const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined)
    const [selectedProductName, setSelectedProductName] = useState<string>("")
    const [quantity, setQuantity] = useState(1)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const selectedProduct = products.find(p => p.id === selectedProductId)

    const getAvailableStock = (product: Product) => {
        const inCart = cart.find(item => item.id === product.id)?.quantity || 0;
        return product.currentStock - inCart;
    }

    const availableStockForSelected = selectedProduct ? getAvailableStock(selectedProduct) : 0;

    const handleProductSelect = (productId: string, productName: string) => {
        setSelectedProductId(productId)
        setSelectedProductName(productName)
        setQuantity(1)
    }

    const handleAddToCart = () => {
        if (!selectedProduct || quantity <= 0) {
            toast.error("Selecione um produto e uma quantidade válida");
            return;
        }

        if (quantity > availableStockForSelected) {
            toast.error("Quantidade excede o estoque disponível");
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.id === selectedProduct.id);
            if (existing) {
                return prev.map(item =>
                    item.id === selectedProduct.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { ...selectedProduct, quantity }];
        });

        setSelectedProductId(undefined);
        setSelectedProductName("");
        setQuantity(1);
    }

    const handleRemoveFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    }

    const handleConfirm = () => {
        if (cart.length === 0) {
            toast.error("Adicione itens ao carrinho");
            return;
        }

        startTransition(async () => {
            const items = cart.map(item => ({ productId: item.id, quantity: item.quantity }));
            const result = await sellMultipleProducts(items);
            if (result.success) {
                toast.success("Venda registrada com sucesso!");
                setIsOpen(false);
                setCart([]);
                setSelectedProductId("");
                setQuantity(1);
                router.refresh();
            } else {
                toast.error(`Erro: ${result.error}`);
            }
        });
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setCart([]);
            setSelectedProductId("");
            setQuantity(1);
        }
    }

    const grandTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger render={<Button className="bg-primary hover:bg-primary/80"><Plus className="mr-2 h-4 w-4" /> Nova Venda</Button>} />
            <DialogContent className="sm:max-w-175 max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Registrar Nova Venda
                    </DialogTitle>
                    <DialogDescription>
                        Selecione os produtos e informe as quantidades para registrar a venda.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-6 py-4">
                    {/* Section: Adicionar Produto */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Adicionar Produto
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-7 space-y-2">
                                    <Label htmlFor="product">Produto</Label>
                                    <Select
                                        value={selectedProductName}
                                        onValueChange={(val) => {
                                            const product = products.find(p => p.name === val);
                                            if (product) {
                                                handleProductSelect(product.id, product.name);
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o produto">
                                                {selectedProductName || "Selecione o produto"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="w-full">
                                            {products.map((p) => {
                                                const avail = getAvailableStock(p);
                                                return (
                                                    <SelectItem key={p.id} value={p.name} disabled={avail <= 0}>
                                                        <div className="flex items-center justify-between w-full gap-4">
                                                            <span>{p.name}</span>
                                                            <Badge variant="secondary" className="text-xs">
                                                                {avail} disponível
                                                            </Badge>
                                                        </div>
                                                    </SelectItem>
                                                )
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="col-span-3 space-y-2">
                                    <Label htmlFor="quantity">Quantidade</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        max={availableStockForSelected || 1}
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        disabled={!selectedProduct}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <Label>&nbsp;</Label>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="w-full h-10"
                                        onClick={handleAddToCart}
                                        disabled={!selectedProduct || quantity <= 0 || quantity > availableStockForSelected}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {selectedProduct && (
                                <div className="mt-3 p-3 bg-muted rounded-lg">
                                    <div className="flex items-center justify-between text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Estoque disponível: </span>
                                            <span className="font-medium">{availableStockForSelected} unidades</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Valor unitário: </span>
                                            <span className="font-medium text-primary">
                                                {(selectedProduct.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedProduct && quantity > availableStockForSelected && (
                                <p className="text-xs text-destructive font-medium">
                                    Quantidade indisponível no estoque.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section: Carrinho */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4" />
                                Carrinho de Vendas
                                <Badge variant="secondary">{totalItems} itens</Badge>
                            </CardTitle>
                            <CardDescription>
                                Produtos adicionados para esta venda.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {cart.length === 0 ? (
                                <div className="text-center py-8 bg-muted rounded-lg border border-dashed">
                                    <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                                    <p className="text-muted-foreground">Nenhum produto adicionado.</p>
                                    <p className="text-sm text-muted-foreground/70">Selecione um produto acima para adicionar ao carrinho.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {cart.map((item) => {
                                        const itemTotal = (item.price * item.quantity) / 100;
                                        return (
                                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                                            <div className="flex-1">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.quantity} x {(item.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="font-bold text-primary">
                                                        {itemTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    </p>
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.quantity} unid.
                                                    </Badge>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleRemoveFromCart(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Footer com Total */}
                <DialogFooter className="border-t pt-4 flex-col sm:flex-row gap-3">
                    <div className="flex items-center justify-between w-full sm:justify-end gap-4 py-3 sm:py-0 bg-muted rounded-lg px-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            <span>Total da Venda:</span>
                        </div>
                        <span className="text-2xl font-bold text-primary">
                            {(grandTotal / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending} className="flex-1 sm:flex-none">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={isPending || cart.length === 0}
                            className="flex-1 sm:flex-none bg-primary hover:bg-primary/80"
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Finalizar Venda
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
