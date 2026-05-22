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
import { toast } from "sonner"
import { createProduct } from "@/lib/product-actions"
import { uploadProductImage } from "@/lib/upload-actions"
import Image from "next/image"
import { Loader2, Upload, X } from "lucide-react"

const productSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  price: z.number().min(0, "O preço deve ser positivo"),
  qtdMinima: z.number().min(0, "Deve ser positivo"),
  qtdMaxima: z.number().min(1, "Deve ser pelo menos 1"),
  minParaVenda: z.number().min(0, "Deve ser positivo"),
}).refine(d => d.qtdMinima <= d.minParaVenda, {
  message: "A quantidade mínima não pode ser maior que o mínimo para venda",
  path: ["qtdMinima"],
}).refine(d => d.minParaVenda <= d.qtdMaxima, {
  message: "O mínimo para venda não pode ser maior que a quantidade máxima",
  path: ["minParaVenda"],
})

type ProductFormValues = z.infer<typeof productSchema>

export function ProductForm() {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [preview, setPreview] = React.useState<string | null>(null)
  const router = useRouter()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

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

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Apenas imagens são permitidas")
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 4MB")
      return
    }

    setIsUploading(true)
    setPreview(URL.createObjectURL(file))

    const formData = new FormData()
    formData.set("file", file)

    const result = await uploadProductImage(formData)

    if ("url" in result) {
      setImageUrl(result.url)
      toast.success("Imagem enviada com sucesso!")
    } else {
      toast.error(result.error)
      setPreview(null)
    }

    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

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

  const displayUrl = preview || imageUrl

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
              <div className="flex items-center gap-6 border rounded-lg p-4 bg-muted">
                {displayUrl ? (
                  <div className="relative h-28 w-28 shrink-0 rounded-lg overflow-hidden shadow-sm bg-background">
                    <Image
                      src={displayUrl}
                      alt="Produto"
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => { setImageUrl(null); setPreview(null) }}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="h-28 w-28 shrink-0 rounded-lg bg-background flex items-center justify-center text-muted-foreground border-2 border-dashed border-border">
                    <div className="text-center">
                      <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground/50" />
                      <span className="text-xs">Sem Foto</span>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Enviando...</>
                  ) : (
                    <><Upload className="h-4 w-4 mr-1" /> {displayUrl ? "Trocar Foto" : "Escolher Foto"}</>
                  )}
                </Button>
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
