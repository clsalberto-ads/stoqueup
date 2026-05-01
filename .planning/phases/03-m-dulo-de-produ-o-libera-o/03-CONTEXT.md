# Phase 3: Módulo de Produção & Liberação - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase gerencia o ciclo de reposição de estoque. O foco é a transformação de tarefas de produção "Pendentes" em estoque físico disponível para venda, respeitando as travas de segurança (`minParaVenda` e `qtdMaxima`).

</domain>

<decisions>
## Implementation Decisions

### Gestão de Tarefas de Produção
- **D-01: Interface de Cards Ricos.** A página `/dashboard/production` exibirá as tarefas em uma lista de cards informativos. 
- **D-02: Fluxo de Status.** As tarefas seguirão o fluxo: `PENDING` -> `IN_PROGRESS` -> `COMPLETED`.
- **D-03: Conferência de Quantidade.** No momento da conclusão (`COMPLETED`), o sistema deve exibir um formulário/modal para o usuário informar a quantidade real produzida, que será usada para incrementar o estoque.

### Controle de Liberação e Vendas
- **D-04: Ocultação Automática.** Produtos com `currentStock < minParaVenda` serão filtrados e ocultados da listagem de vendas (`/dashboard/products`) para garantir que apenas itens "prontos para entrega" sejam oferecidos.
- **D-05: Travas de Segurança.** O incremento de estoque não pode ultrapassar a `qtdMaxima` do produto. Se a conferência indicar um valor superior, o sistema deve alertar ou truncar para o máximo permitido.

### Gestão Manual (Manager)
- **D-06: Criação Restrita.** Apenas usuários com role `admin` (Manager) podem criar tarefas de produção manualmente. A quantidade máxima permitida para criação manual é `(qtdMaxima - currentStock)`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos e Visão
- `.planning/ROADMAP.md` — Requisitos PROD-02 a 06.
- `.planning/phases/02-m-dulo-de-vendas-gatilhos/02-CONTEXT.md` — Lógica de criação automática de tarefas.

### Tecnologia e UI
- `src/db/schema.ts` — Tabela `production_tasks` já criada.
- `src/lib/inventory-actions.ts` — Padrão de Server Actions transacionais.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Componente `Badge` com variante `warning` (adicionado na Phase 2).
- Padrão de Toasts via `sonner`.
- Transações Drizzle em Server Actions.

### Established Patterns
- Uso de `useTransition` para feedback de loading em botões de ação.
- Revalidação de cache via `revalidatePath`.

</code_context>

<specifics>
## Specific Ideas
- Usar um "Stepper" visual nos cards de produção para indicar o progresso (Pendente -> Produzindo -> Concluído).
- O modal de conferência deve pré-preencher a quantidade com o valor planejado na criação da tarefa.

</specifics>

<deferred>
## Deferred Ideas
- Logs de Auditoria de Produção (quem concluiu, quando começou).
- Relatórios de Eficiência de Produção.

</deferred>

---

*Phase: 03-m-dulo-de-produ-o-libera-o*
*Context gathered: 2026-05-01*
