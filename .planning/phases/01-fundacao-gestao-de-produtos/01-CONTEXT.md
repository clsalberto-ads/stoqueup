# Phase 1: Fundação & Gestão de Produtos - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase estabelece a base técnica do StoqueUp e o módulo central de produtos. O objetivo é entregar um ambiente funcional com autenticação restrita e capacidade de gerenciar o catálogo de produtos com imagens e limites de estoque.

</domain>

<decisions>
## Implementation Decisions

### Interface & Navegação
- **D-01:** Sidebar Lateral Flexível. O sistema utilizará uma barra lateral que se recolhe em desktop e se adapta para mobile via menu hambúrguer, mantendo um visual de dashboard profissional.

### Autenticação & Controle de Acesso
- **D-02:** Gestão Fechada de Usuários. Apenas o Manager pode criar contas de funcionários (Employees) e definir suas senhas iniciais. Não haverá signup aberto para funcionários.

### Cadastro de Produtos
- **D-03:** Página Dedicada de Cadastro. O formulário de novos produtos e edição terá sua própria página (`/products/new`, `/products/[id]/edit`) para permitir uma interface limpa e espaço para detalhamento dos limites de estoque e imagens.

### Gestão de Mídia
- **D-04:** Suporte a Imagens Ativo. O sistema deve permitir o upload de fotos para os produtos já nesta fase. A escolha tecnológica de storage (Uploadthing ou S3) fica a critério do planejador.

### the agent's Discretion
- Escolha da biblioteca específica de gráficos para o dashboard (será planejado na Fase 4, mas a base deve suportar).
- Estrutura exata de pastas dentro de `src/` (seguindo padrões de Next.js App Router).
- Provedor de Storage (S3, Uploadthing, etc).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos e Visão
- `new-project.md` — MRD original com regras de negócio e fluxos de automação.
- `.planning/PROJECT.md` — Decisões de projeto consolidadas (médias de 7/15/30 dias).
- `.planning/REQUIREMENTS.md` — Lista de requisitos v1 (AUTH-01 a 04, INVT-01 e 02).

### Tecnologia
- `.planning/research/STACK.md` — Pesquisa sobre Next.js 16, Drizzle e PostgreSQL.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Nenhum (Projeto Greenfield).

### Established Patterns
- Nenhum (A Fase 1 estabelecerá os primeiros padrões).

### Integration Points
- Conexão com banco de dados PostgreSQL via Drizzle.
- Integração com Better Auth para sessões e roles.

</code_context>

<specifics>
## Specific Ideas
- Inspiração visual: Sistema Kyte (estética limpa e funcional).
- Foco em "Premiumness": O design deve parecer um produto acabado e moderno, não um MVP básico.

</specifics>

<deferred>
## Deferred Ideas
- Integração com Marketplaces (v2.0).
- Gestão de Matéria-prima (Insumos).
- Módulo Financeiro completo.

</deferred>

---

*Phase: 01-fundacao-gestao-de-produtos*
*Context gathered: 2026-05-01*
