"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UploadButton } from "@/lib/uploadthing"
import Image from "next/image"

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
    console.log({ ...data, imageUrl })
    // Aqui viria a Server Action para salvar
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto</Label>
              <Input id="name" {...form.register("name")} placeholder="Ex: Bolo de Chocolate" />
            </div>

            <div className="space-y-2">
              <Label>Imagem do Produto</Label>
              <div className="flex items-center gap-4 border rounded-lg p-4 bg-slate-50">
                {imageUrl ? (
                  <div className="relative h-20 w-20 rounded-md overflow-hidden border">
                    <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-md bg-slate-200 flex items-center justify-center text-slate-400">
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
              <h3 className="font-medium mb-4 text-slate-900">Limites de Automação de Estoque</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qtdMinima">Qtd. Mínima</Label>
                  <p className="text-xs text-slate-500 mb-1">Dispara produção</p>
                  <Input id="qtdMinima" type="number" {...form.register("qtdMinima", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minParaVenda">Mín. p/ Venda</Label>
                  <p className="text-xs text-slate-500 mb-1">Libera para venda</p>
                  <Input id="minParaVenda" type="number" {...form.register("minParaVenda", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qtdMaxima">Qtd. Máxima</Label>
                  <p className="text-xs text-slate-500 mb-1">Limite do estoque</p>
                  <Input id="qtdMaxima" type="number" {...form.register("qtdMaxima", { valueAsNumber: true })} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button">Cancelar</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Salvar Produto</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
