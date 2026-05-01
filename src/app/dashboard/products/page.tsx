import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { db } from "@/db"
import { products } from "@/db/schema"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default async function ProductsPage() {
  const allProducts = await db.select().from(products)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Produtos</h1>
          <p className="text-slate-500 mt-2">
            Gerencie seu catálogo de produtos e visualize o status atual do estoque.
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" render={<Link href="/dashboard/products/new" />}>
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      {allProducts.length === 0 ? (
        <Card className="border-dashed border-2 bg-slate-50">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center mb-4">
              <Plus className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Nenhum produto cadastrado</h3>
            <p className="text-slate-500 max-w-sm mt-2">
              Comece adicionando seu primeiro produto ao catálogo para gerenciar o estoque.
            </p>
            <Button variant="outline" className="mt-6" render={<Link href="/dashboard/products/new" />}>
              Adicionar Primeiro Produto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-video relative bg-slate-100">
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    Sem Imagem
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900">{product.name}</h3>
                  <span className="text-blue-600 font-semibold">R$ {(product.price / 100).toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-slate-500">Estoque Atual</p>
                    <p className="font-medium text-slate-900">{product.currentStock} un</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Mínimo</p>
                    <p className="font-medium text-slate-900">{product.qtdMinima} un</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
