export const dynamic = 'force-dynamic'
import { db } from "@/db"
import { products } from "@/db/schema"
import { ProductsClient } from "@/components/products/products-client"
import { getProductMetrics } from "@/lib/analytics-actions"

export default async function ProductsPage() {
  const allProducts = await db.select().from(products)
  
  const productsWithMetrics = await Promise.all(
    allProducts.map(async (p) => {
      const metrics = await getProductMetrics(p.id)
      return { ...p, metrics }
    })
  )

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Produtos</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie seu catálogo de produtos e visualize o status atual do estoque.
        </p>
      </div>

      <ProductsClient products={productsWithMetrics} />
    </div>
  )
}