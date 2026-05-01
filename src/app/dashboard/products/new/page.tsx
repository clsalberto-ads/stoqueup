import { ProductForm } from "@/components/products/product-form"

export default function NewProductPage() {
  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Novo Produto</h1>
        <p className="text-slate-500 mt-2">
          Cadastre as informações básicas e os limites de automação para este produto.
        </p>
      </div>
      
      <ProductForm />
    </div>
  )
}
