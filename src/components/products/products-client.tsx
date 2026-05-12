"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Plus, Package, Pencil } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ProductCard } from "@/components/products/product-card"
import { toast } from "sonner"
import { updateProduct } from "@/lib/product-actions"
import { ImageUploader } from "@/components/ui/image-uploader"

interface ProductWithMetrics {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  qtdMinima: number
  qtdMaxima: number
  minParaVenda: number
  currentStock: number
  createdAt: Date
  updatedAt: Date
  statusVenda: boolean
  metrics: {
    daysRemaining: number
    average30d: number
    status: 'CRITICAL' | 'WARNING' | 'HEALTHY'
  }
}

interface ProductsClientProps {
  products: ProductWithMetrics[]
}

export function ProductsClient({ products }: ProductsClientProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductWithMetrics | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    qtdMinima: 0,
    qtdMaxima: 0,
    minParaVenda: 0,
    imageUrl: null as string | null,
  })

  useEffect(() => {
    if (!isCreateOpen) {
      setFormData({
        name: "",
        description: "",
        price: 0,
        qtdMinima: 0,
        qtdMaxima: 0,
        minParaVenda: 0,
        imageUrl: null,
      })
    }
  }, [isCreateOpen])

  const handleEditClick = (product: ProductWithMetrics) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price / 100,
      qtdMinima: product.qtdMinima,
      qtdMaxima: product.qtdMaxima,
      minParaVenda: product.minParaVenda,
      imageUrl: product.imageUrl,
    })
    setIsEditOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!editingProduct) return
    
    if (!formData.name || formData.name.length < 2) {
      toast.error("Nome deve ter pelo menos 2 caracteres")
      return
    }
    if (formData.price <= 0) {
      toast.error("Preço deve ser maior que zero")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updateProduct(editingProduct.id, {
        name: formData.name,
        description: formData.description || undefined,
        price: formData.price,
        qtdMinima: formData.qtdMinima,
        qtdMaxima: formData.qtdMaxima,
        minParaVenda: formData.minParaVenda,
        imageUrl: formData.imageUrl,
      })
      
      if (!result.success) {
        toast.error(result.error || "Erro ao atualizar produto")
        return
      }
      toast.success("Produto atualizado com sucesso!")
      setIsEditOpen(false)
      window.location.reload()
    } catch {
      toast.error("Erro de conexão")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || formData.name.length < 2) {
      toast.error("Nome deve ter pelo menos 2 caracteres")
      return
    }
    if (formData.price <= 0) {
      toast.error("Preço deve ser maior que zero")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Erro ao criar produto")
        return
      }
      toast.success("Produto criado com sucesso!")
      setIsCreateOpen(false)
      window.location.reload()
    } catch {
      toast.error("Erro de conexão")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button className="bg-primary hover:bg-primary/80" onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted">
          <CardHeader className="pb-3 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl font-semibold text-center">Nenhum produto cadastrado</CardTitle>
            <CardDescription className="text-center max-w-sm mx-auto">
              Comece adicionando seu primeiro produto ao catálogo para gerenciar o estoque.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-center">
            <Button variant="outline" className="mt-2" onClick={() => setIsCreateOpen(true)}>
              Adicionar Primeiro Produto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onEdit={handleEditClick} />
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Novo Produto
            </DialogTitle>
            <DialogDescription>
              Cadastre as informações básicas e os limites de automação para este produto.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Informações do Produto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prod-name">Nome do Produto</Label>
                  <Input 
                    id="prod-name" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Bolo de Chocolate"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prod-desc">Descrição (opcional)</Label>
                  <Input 
                    id="prod-desc" 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Bolo de chocolate com cobertura"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Imagem do Produto</Label>
                  <ImageUploader 
                    value={formData.imageUrl}
                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prod-price">Preço de Venda (R$)</Label>
                  <Input 
                    id="prod-price" 
                    type="number" 
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0,00"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Limites de Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prod-qtdmin" className="text-sm">Mínima</Label>
                    <Input 
                      id="prod-qtdmin" 
                      type="number"
                      value={formData.qtdMinima}
                      onChange={(e) => setFormData({ ...formData, qtdMinima: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">Dispara produção</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prod-minvenda" className="text-sm">Mín. Venda</Label>
                    <Input 
                      id="prod-minvenda" 
                      type="number"
                      value={formData.minParaVenda}
                      onChange={(e) => setFormData({ ...formData, minParaVenda: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">Libera venda</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prod-qtdmax" className="text-sm">Máxima</Label>
                    <Input 
                      id="prod-qtdmax" 
                      type="number"
                      value={formData.qtdMaxima}
                      onChange={(e) => setFormData({ ...formData, qtdMaxima: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">Limite estoque</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/80" 
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Salvando..." : "Salvar Produto"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Editar Produto
            </DialogTitle>
            <DialogDescription>
              Atualize as informações do produto e os limites de estoque.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Informações do Produto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome do Produto</Label>
                  <Input 
                    id="edit-name" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Bolo de Chocolate"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-desc">Descrição (opcional)</Label>
                  <Input 
                    id="edit-desc" 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Bolo de chocolate com cobertura"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Imagem do Produto</Label>
                  <ImageUploader 
                    value={formData.imageUrl}
                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-price">Preço de Venda (R$)</Label>
                  <Input 
                    id="edit-price" 
                    type="number" 
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0,00"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Limites de Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-qtdmin" className="text-sm">Mínima</Label>
                    <Input 
                      id="edit-qtdmin" 
                      type="number"
                      value={formData.qtdMinima}
                      onChange={(e) => setFormData({ ...formData, qtdMinima: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">Dispara produção</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-minvenda" className="text-sm">Mín. Venda</Label>
                    <Input 
                      id="edit-minvenda" 
                      type="number"
                      value={formData.minParaVenda}
                      onChange={(e) => setFormData({ ...formData, minParaVenda: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">Libera venda</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-qtdmax" className="text-sm">Máxima</Label>
                    <Input 
                      id="edit-qtdmax" 
                      type="number"
                      value={formData.qtdMaxima}
                      onChange={(e) => setFormData({ ...formData, qtdMaxima: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">Limite estoque</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/80" 
              disabled={isSubmitting}
              onClick={handleEditSubmit}
            >
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}