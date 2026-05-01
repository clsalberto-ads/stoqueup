# Phase 5: Polimento & Validação MVP - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta é a fase final do MVP. O objetivo é transformar o protótipo funcional em um produto polido, confiável e esteticamente impecável. Focaremos na experiência do usuário (UX), na persistência de alertas e na garantia de qualidade através de testes.

</domain>

<decisions>
## Implementation Decisions

### Centro de Notificações
- **D-01: Persistência de Alertas.** Implementação de uma tabela `notifications` para armazenar alertas de estoque crítico e conclusões de produção.
- **D-02: Interface do Sino.** Um componente de Sino no cabeçalho que exibe um badge de "não lidas" e um dropdown com o histórico recente.

### Customização e UX
- **D-03: Login Premium.** Refatoração da página de login para seguir a identidade visual do StoqueUp (Slate 900, destaques em Blue 600, tipografia Inter).
- **D-04: Empty States Ricos.** Todas as listagens (Produtos, Vendas, Produção) devem ter estados vazios com ilustrações Lucide e calls-to-action claros.
- **D-05: Micro-animações.** Uso de `tailwindcss-animate` para transições suaves de entrada de elementos e hover effects.

### Qualidade e Testes
- **D-06: Suíte Playwright.** Configuração de testes de integração "End-to-End" para o fluxo crítico: `Login -> Venda -> Gatilho de Produção -> Incremento de Estoque`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos e Visão
- `.planning/ROADMAP.md` — Requisitos de polimento final.
- `.planning/phases/01-*/01-UI-SPEC.md` — Guia de cores e fontes.

### Tecnologia
- [Playwright Documentation](https://playwright.dev/docs/intro) — Referência para os testes E2E.
- `src/lib/auth.ts` — Base para a customização do login.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Componente `Dialog` e `Badge` (serão usados no Centro de Notificações).
- Configuração de Tailwind v4 (já suporta animações nativas).

### Established Patterns
- Server Actions para marcar notificações como lidas.
- Componentes client-side para o dropdown de notificações.

</code_context>

<specifics>
## Specific Ideas
- As notificações devem ser criadas automaticamente via "triggers" no código (dentro das Server Actions de venda e conclusão de produção).

</specifics>

<deferred>
## Deferred Ideas
- Aplicativo Mobile Nativo.
- Integração com WhatsApp.

</deferred>

---

*Phase: 05-polimento-valida-o-mvp*
*Context gathered: 2026-05-01*
