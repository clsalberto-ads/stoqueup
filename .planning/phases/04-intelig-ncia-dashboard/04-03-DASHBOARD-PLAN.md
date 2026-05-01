---
phase: 04
plan: 03
title: Dashboard de Indicadores e Semáforo
slug: 04-03-dashboard
wave: 3
depends_on: [04-02-analytics]
files_modified: [src/app/dashboard/metrics/page.tsx, src/components/products/product-card.tsx, src/components/layout/sidebar.tsx]
requirements: [DASH-01, DASH-03]
autonomous: true
---

# Plan: 04-03-DASHBOARD

Construção da interface visual de inteligência e integração no catálogo de produtos.

## Tasks

<task id="1" type="execute">
<read_first>
- src/components/layout/sidebar.tsx
</read_first>
<action>
Adicionar link "Indicadores" (`/dashboard/metrics`) na Sidebar com o ícone `BarChart`.
</action>
<acceptance_criteria>
- Sidebar contém o novo item.
</acceptance_criteria>
</task>

<task id="2" type="execute">
<read_first>
- src/app/dashboard/metrics/page.tsx
</read_first>
<action>
Criar a página de métricas utilizando componentes do **Tremor**:
- `Grid` com `Card` e `Metric` para os totais.
- `AreaChart` para evolução das vendas diárias.
- `BarList` ou `Table` para os produtos com maior risco.
</action>
<acceptance_criteria>
- Página visualmente atraente e funcional.
- Gráficos carregam dados reais.
</acceptance_criteria>
</task>

<task id="3" type="execute">
<read_first>
- src/components/products/product-card.tsx
</read_first>
<action>
Integrar o indicador de risco no card de produto:
- Chamar `getProductMetrics` (pode ser via componente pai e passar props).
- Exibir badge com a cor do semáforo (Vermelho, Amarelo, Verde) e o texto "X dias rest."
</action>
<acceptance_criteria>
- Cada card mostra claramente o risco de desabastecimento.
- As cores seguem a regra: <3 vermelho, 3-7 amarelo, >7 verde.
</acceptance_criteria>
</task>

## Verification

### Automated Tests
- N/A

### Manual Verification (UAT)
- [ ] Navegar até a página de Indicadores e ver os gráficos.
- [ ] Na lista de produtos, validar se a cor do semáforo faz sentido com a média de vendas do item.
