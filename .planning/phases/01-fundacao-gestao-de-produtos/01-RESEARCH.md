# Research: Phase 1 - Fundação & Gestão de Produtos

**Analysis Date:** 2026-05-01

## 1. Authentication & RBAC (Better Auth)

Para o StoqueUp, a estrutura ideal utiliza os plugins `admin` e `organization` do Better Auth.

### Key Implementation Details:
- **Admin Plugin**: Permite que o `Manager` tenha super-poderes sobre o tenant.
- **Organization Plugin**: Essencial para o modelo de empresa. O Manager cria a organização e convida/cadastra os Employees.
- **Role Assignment**: Utilizar `admin` role para o Manager e `member` (ou custom `employee`) para os funcionários.
- **Middleware**: Proteger rotas como `/settings` e `/products/edit` para serem acessíveis apenas por usuários com role de Manager na organização ativa.

## 2. Gestão de Imagens (Uploadthing)

Para velocidade de entrega e experiência premium, o **Uploadthing** é a escolha recomendada sobre S3 puro.

### Benefits:
- Integração nativa com Next.js (Server Actions e Components).
- Gerenciamento de tipos de arquivo e limites de tamanho simplificado via `FileRouter`.
- Hook `useUploadThing` para progresso de upload no frontend.

## 3. UI Patterns (shadcn/ui Sidebar)

Utilizaremos o componente de `Sidebar` oficial do shadcn/ui.

### Structure:
- **Collapsible Sidebar**: Mantém o foco no conteúdo (inventário/vendas) em telas menores.
- **Role-based Links**: Esconder links de "Configurações" ou "Relatórios Financeiros" para Employees diretamente na sidebar.

## 4. Database Schema (Drizzle + PostgreSQL)

### `products` table:
- `id`: uuid (primary key)
- `name`: text
- `description`: text
- `price`: decimal
- `imageUrl`: text
- `qtd_minima`: integer (trigger para produção)
- `qtd_maxima`: integer (bloqueio de produção)
- `min_para_venda`: integer (liberação de venda)
- `status_venda`: boolean (bloqueado/disponível)

### `inventory_logs` table:
- `id`: serial
- `productId`: uuid (fk)
- `userId`: text (fk to user)
- `change`: integer (positivo para produção, negativo para venda)
- `type`: enum (SALE, PRODUCTION, ADJUSTMENT)
- `createdAt`: timestamp

## 5. Implementation Strategy

1. **Sprint 1 (Fundação)**: Setup Next.js, Docker e Better Auth base.
2. **Sprint 2 (Organização)**: Implementar fluxo de "Criar Empresa" e "Adicionar Funcionário".
3. **Sprint 3 (Produtos)**: CRUD de produtos com Uploadthing e Drizzle.

---
*Research synthesized: 2026-05-01*
