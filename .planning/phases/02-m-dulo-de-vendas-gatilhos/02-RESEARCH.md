# Phase 2: Módulo de Vendas & Gatilhos - Research

**Date:** 2026-05-01
**Status:** ## RESEARCH COMPLETE

## Standard Stack
- **ORM**: Drizzle ORM (Transações via `db.transaction`).
- **Database**: PostgreSQL (Atomic updates e constraints).
- **UI Feedback**: Sonner (Toast notifications para Next.js 19/React 19).
- **Icons**: Lucide React.

## Architecture Patterns

### 1. Transações Atômicas de Estoque
Toda venda deve ser processada dentro de uma transação Drizzle para garantir que o decremento do estoque e a criação do log sejam uma operação única (Tudo ou Nada).
- Padrão: `db.transaction(async (tx) => { ... })`.
- Segurança: Utilizar `sql`${products.currentStock} - ${quantity}`` para evitar race conditions.

### 2. Gatilho de Produção (Hook in Action)
A verificação de estoque mínimo deve ocorrer imediatamente após o decremento, ainda dentro da transação ou logo após o sucesso.
- Fluxo: `Update Stock` -> `Check currentStock < qtdMinima` -> `Insert Production Task if true`.
- Evitar duplicação: Verificar se já existe uma tarefa `PENDING` para o produto antes de criar uma nova.

## Don't Hand-Roll
- Não criar sistema de filas (Queues) complexo (ex: BullMQ) para esta fase. Como o volume é baixo e a regra é simples, o processamento síncrono no Server Action é suficiente e mais robusto para um MVP.
- Não implementar autenticação customizada; continuar usando o middleware do Better Auth.

## Common Pitfalls
- **Overselling**: Vender mais do que o estoque físico. Resolvido com `where(gte(products.currentStock, quantity))`.
- **Race Conditions**: Dois usuários vendendo o mesmo item ao mesmo tempo. Resolvido com updates atômicos no SQL.
- **Client-Side Math**: Nunca calcular o novo saldo de estoque no frontend ou no JS do servidor antes de salvar. Deixar o banco fazer a subtração.

## Code Examples

### Exemplo de Venda + Gatilho
```typescript
await db.transaction(async (tx) => {
  // 1. Decremento Atômico
  const result = await tx.update(products)
    .set({ currentStock: sql`${products.currentStock} - ${qty}` })
    .where(and(eq(products.id, id), gte(products.currentStock, qty)))
    .returning();

  const updatedProduct = result[0];
  if (!updatedProduct) throw new Error("Estoque insuficiente");

  // 2. Log de Movimentação
  await tx.insert(inventoryLogs).values({ ... });

  // 3. Gatilho de Produção
  if (updatedProduct.currentStock <= updatedProduct.qtdMinima) {
    const existingTask = await tx.select().from(productionTasks)
      .where(and(eq(productId, id), eq(status, 'PENDING')));
    
    if (existingTask.length === 0) {
      await tx.insert(productionTasks).values({ ... });
    }
  }
});
```

## UI & Feedback
- Instalar `sonner` para exibir Toasts.
- No botão "Vender", usar `useTransition` do React para gerenciar o estado de loading e feedback.
