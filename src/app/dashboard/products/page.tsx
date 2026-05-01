import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { db } from "@/db"
import { products } from "@/db/schema"
import { Card, CardContent } from "@/components/ui/card"
import { ProductCard } from "@/components/products/product-card"
import { getProductMetrics } from "@/lib/analytics-actions"

export default async function ProductsPage() {
  const allProducts = await db.select().from(products)
  
  // D-06: Buscar métricas para cada produto
  const productsWithMetrics = await Promise.all(
    allProducts.map(async (p) => {
      const metrics = await getProductMetrics(p.id)
      return { ...p, metrics }
    })
  )

  // D-04: Ocultar da lista de vendas se currentStock < minParaVenda
  const availableProducts = productsWithMetrics.filter(p => p.currentStock >= p.minParaVenda)

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

      {availableProducts.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {availableProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
