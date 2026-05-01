# StoqueUp

## What This Is

StoqueUp é uma plataforma web de gestão operacional voltada a pequenas e médias empresas que fabricam e vendem produtos físicos. O sistema conecta os pilares de produção, estoque e vendas em um único fluxo automatizado, eliminando a dependência de planilhas e garantindo decisões baseadas em dados em tempo real.

## Core Value

Ser a fonte única de verdade sobre o ciclo de vida de um produto físico — desde sua fabricação até o momento da venda — garantindo que os estoques estejam sempre saudáveis e a produção alinhada à demanda.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **Configuração de Produtos**: Cadastro com campos `qtd_minima`, `qtd_maxima` e `min_para_venda`.
- [ ] **Autenticação ABAC**: Perfis `manager` (gestão total) e `employee` (foco em produção e visualização de estoque).
- [ ] **Módulo de Vendas**: Registro de vendas com decremento transacional de estoque e badge de status (Disponível/Bloqueado).
- [ ] **Módulo de Produção**: Gestão de tarefas (Pendente, Em Andamento, Concluída) com incremento de estoque na conclusão.
- [ ] **Automações de Fluxo**: 
    - Bloqueio de venda e disparo de produção ao atingir `qtd_minima`.
    - Liberação de venda ao atingir `min_para_venda`.
    - Sugestão de quantidade produzida (entre `min_para_venda` e `qtd_maxima`).
- [ ] **Dashboard de Inteligência**: 
    - Cálculo de dias restantes baseado em média de vendas (períodos de 7, 15 ou 30 dias).
    - Indicadores visuais de risco (semáforo verde/amarelo/vermelho).
- [ ] **Histórico Unificado**: Rastreabilidade total de entradas (produção) e saídas (vendas) por produto.

### Out of Scope

- **Integração com Marketplaces**: Conexão com iFood/Mercado Livre (v2.0).
- **Gestão de Insumos**: Controle de matéria-prima (foco inicial é produto acabado).
- **Módulo Financeiro**: Fluxo de caixa e contas a pagar/receber (foco é operacional).

## Context

- Baseado no Market Requirements Document (MRD) v1.0.
- Referência Visual: Inspiração no sistema Kyte (cores e conceitos), mas com uma interface nova e moderna.
- Público-alvo: Confeitarias, cosméticos, vestuário e manufatura leve.

## Constraints

- **Tech Stack**: Next.js 16, TypeScript, TailwindCSS (shadcn/ui), Drizzle ORM, PostgreSQL.
- **Autenticação**: Better Auth.
- **Arquitetura**: Todas as movimentações de estoque devem ser **atômicas e transacionais** (proibir estoque negativo).
- **Deploy**: Docker + Docker Compose.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Período de Média Flexível | Gestor pode alternar entre 7, 15 e 30 dias para análise de giro. | — Pending |
| Sugestão de Lote | Sistema sugere quantidade para atingir pelo menos o `min_para_venda`. | — Pending |
| Inspiração Kyte | Aproveitar padrões de sucesso de UX do Kyte com design proprietário. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-01 after initialization*
