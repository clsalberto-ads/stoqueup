# Phase 2: Módulo de Vendas & Gatilhos - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase foca na operacionalização das saídas de estoque (Vendas) e na automação do ciclo de vida do produto através de gatilhos de quantidade mínima. O objetivo é entregar o fluxo de baixa de estoque e a geração automática de ordens de produção.

</domain>

<decisions>
## Implementation Decisions

### Fluxo de Vendas (PDV Rápido)
- **D-01: Botão de Venda Direta.** Cada card de produto na listagem principal terá um botão de ação rápida "Vender" para decrementar o estoque de forma ágil, sem necessidade de navegar para uma tela complexa de checkout para vendas simples.
- **D-02: Histórico Centralizado.** Uma nova página `/dashboard/sales` será acessível via Sidebar, listando todas as transações de venda realizadas, com data, produto, quantidade e valor.

### Gatilhos e Automação de Estoque
- **D-03: Gatilho de Produção Informativo.** Quando o `currentStock` atingir ou cair abaixo de `qtdMinima`, o sistema deve:
    1. Criar automaticamente uma entrada na tabela `production_tasks` com status `PENDING`.
    2. Exibir um aviso visual forte no card do produto (ex: selo "Estoque Crítico").
    3. **Importante:** Diferente da visão inicial, a venda **não será bloqueada** enquanto houver estoque físico disponível (Giro Contínuo).

### Notificações e Status
- **D-04: Feedback de Produção.** O sistema deve exibir um Toast de notificação quando uma tarefa de produção for marcada como concluída (embora o CRUD de produção seja expandido na Fase 3, a lógica de alerta deve ser estabelecida aqui).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos e Visão
- `.planning/ROADMAP.md` — Requisitos SALE-01 a 04, INVT-03, INVT-04 e PROD-01.
- `new-project.md` — Definição dos cálculos de média e lógica de reposição.

### Tecnologia e UI
- `.planning/phases/01-fundacao-gestao-de-produtos/01-UI-SPEC.md` — Contrato visual (Cores Slate/Blue, Tipografia Inter).
- `src/db/schema.ts` — Tabelas `products` e `inventory_logs` já estabelecidas.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Componente `Button` (Base UI) com `buttonVariants`.
- Layout `DashboardLayout` com Sidebar flexível.
- Client Drizzle e DB Schema em `src/db/`.

### Established Patterns
- Uso de `render` prop para polimorfismo em vez de `asChild`.
- Server Actions para mutações de dados (visto em `auth-actions.ts`).

</code_context>

<specifics>
## Specific Ideas
- O botão de venda deve ter um feedback de sucesso (micro-animação ou toast rápido) para confirmar o decremento do estoque.
- O aviso de "Estoque Crítico" deve seguir a cor de destaque do design system (laranja/amarelo de advertência).

</specifics>

<deferred>
## Deferred Ideas
- Dashboard de Giro (Fase 4).
- Impressão de Recibos/Comprovantes de Venda.

</deferred>

---

*Phase: 02-m-dulo-de-vendas-gatilhos*
*Context gathered: 2026-05-01*
