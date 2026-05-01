# Phase 5: Polimento & Validação MVP - Research

**Date:** 2026-05-01
**Status:** ## RESEARCH COMPLETE

## Standard Stack
- **Auth UI**: Custom React components + `authClient` do Better Auth.
- **Notifications**: Tabela PostgreSQL dedicada + Popover UI.
- **Testing**: Playwright (E2E) com persistência de sessão via `storageState`.
- **Animations**: `tailwindcss-animate` (nativo do Tailwind v4).

## Architecture Patterns

### 1. Centro de Notificações Persistente
- **Schema**: Tabela `notifications` com `userId`, `title`, `content`, `isRead` e `type`.
- **Trigger**: Server Actions de venda/produção chamarão uma função utilitária `createNotification(userId, title, content)`.
- **UI**: Popover no cabeçalho. Ao abrir, disparar Action para marcar todas as visíveis como "lidas".

### 2. Custom Login (Better Auth)
- **Implementação**: Abandonar o redirecionamento padrão e criar uma página em `/login`.
- **Fluxo**: Usar `authClient.signIn.email()` para autenticação.
- **Proteção**: Middleware de Next.js para redirecionar usuários logados para o `/dashboard`.

### 3. Estratégia de Testes E2E (Playwright)
- **Setup**: Configurar `auth.setup.ts` para realizar o login uma única vez por suíte de teste.
- **Cobertura**:
    1. Login bem-sucedido.
    2. Venda de produto -> Redução de estoque.
    3. Gatilho automático de produção ao atingir o mínimo.
    4. Conclusão de produção -> Incremento de estoque e notificação.

## Don't Hand-Roll
- Não reinventar o Popover; usar `shadcn/popover` ou `headlessui`.
- Não salvar sessões de teste manualmente em cookies; usar `storageState` do Playwright.

## Common Pitfalls
- **Race Conditions**: Notificações sendo criadas fora da transação de banco. Elas devem ser incluídas na `db.transaction`.
- **Playwright em Dev**: O Playwright pode ser instável com o Hot Reload do Next.js. Recomenda-se rodar os testes contra o build de produção (`next build && next start`).

## Code Examples

### Notification Schema
```typescript
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => user.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").notNull(),
});
```

### Playwright Auth Setup
```typescript
setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'admin@stoqueup.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
```
