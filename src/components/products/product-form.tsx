"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UploadButton } from "@/lib/uploadthing"
import { toast } from "sonner"
import { createProduct } from "@/lib/product-actions"

const productSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  price: z.number().min(0, "O preço deve ser positivo"),
  qtdMinima: z.number().min(0),
  qtdMaxima: z.number().min(0),
  minParaVenda: z.number().min(0),
})

type ProductFormValues = z.infer<typeof productSchema>

export function ProductForm() {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const router = useRouter()

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      qtdMinima: 0,
      qtdMaxima: 0,
      minParaVenda: 0,
    },
  })

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true)
    try {
      const result = await createProduct({ ...data, imageUrl })
      if (!result.success) {
        toast.error(result.error || "Erro ao salvar produto")
        return
      }
      toast.success("Produto criado com sucesso!")
      router.push("/dashboard/products")
      router.refresh()
    } catch {
      toast.error("Erro de conexão. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto</Label>
              <Input id="name" {...form.register("name")} placeholder="Ex: Bolo de Chocolate" />
            </div>

            <div className="space-y-2">
              <Label>Imagem do Produto</Label>
              <div className="flex items-center gap-4 border rounded-lg p-4 bg-muted">
                {imageUrl ? (
                  <>
                    <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center text-muted-foreground overflow-hidden">
                      <img src={imageUrl} alt="Produto" className="object-cover w-full h-full" />
                    </div>
                    <button type="button" onClick={() => setImageUrl(null)} className="text-destructive hover:bg-destructive/10 px-3 py-1 rounded text-sm">
                      Remover
                    </button>
                  </>
                ) : (
                  <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                    Sem Foto
                  </div>
                )}
                <UploadButton
                  endpoint="productImage"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]) setImageUrl(res[0].url)
                  }}
                  onUploadError={(error: Error) => {
                    alert(`ERROR! ${error.message}`)
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço de Venda (R$)</Label>
                <Input id="price" type="number" step="0.01" {...form.register("price", { valueAsNumber: true })} />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-medium mb-4 text-foreground">Limites de Automação de Estoque</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="qtdMinima">Quantidade Mínima</Label>
                  <p className="text-xs text-muted-foreground">Dispara produção quando atingir</p>
                  <Input id="qtdMinima" type="number" {...form.register("qtdMinima", { valueAsNumber: true })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="minParaVenda">Mínimo para Venda</Label>
                  <p className="text-xs text-muted-foreground">Libera para venda quando atingir</p>
                  <Input id="minParaVenda" type="number" {...form.register("minParaVenda", { valueAsNumber: true })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="qtdMaxima">Quantidade Máxima</Label>
                  <p className="text-xs text-muted-foreground">Limite do estoque</p>
                  <Input id="qtdMaxima" type="number" {...form.register("qtdMaxima", { valueAsNumber: true })} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/80" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Produto"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}