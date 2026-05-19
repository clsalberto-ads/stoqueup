import { ProductForm } from "@/components/products/product-form"
import { authorize } from "@/lib/authorize"

export default async function NewProductPage() {
    await authorize("create", "Products")
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Novo Produto</h1>
        <p className="text-muted-foreground mt-2">
          Preencha os dados para cadastrar um novo produto no catálogo.
        </p>
      </div>

      <ProductForm />
    </div>
  )
}
