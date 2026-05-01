# Phase 4: Inteligência & Dashboard - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase transforma o StoqueUp de um sistema de registro em uma ferramenta de gestão estratégica. O foco é a análise preditiva do estoque baseada no ritmo real de vendas, fornecendo indicadores visuais claros para a tomada de decisão do Manager.

</domain>

<decisions>
## Implementation Decisions

### Stack de Dados e UI
- **D-01: Framework Visual.** Instalação e configuração do Tailwind CSS para suporte à biblioteca **Tremor.so**. O dashboard utilizará os componentes do Tremor para gráficos e KPIs.
- **D-02: Cálculo via SQL.** O cálculo da média móvel de vendas (7, 15 e 30 dias) será realizado diretamente no banco de dados para máxima performance, utilizando queries agregadas ou views.

### Regras de Inteligência (Semáforo de Risco)
- **D-03: Métrica "Dias de Estoque".** O indicador principal será o `Estoque Atual / Média de Vendas Diária (30 dias)`.
- **D-04: Escala de Alerta:**
    - 🔴 **Crítico:** < 3 dias de cobertura.
    - 🟡 **Atenção:** 3 a 7 dias de cobertura.
    - 🟢 **Saudável:** > 7 dias de cobertura.

### Exposição da Inteligência
- **D-05: Dashboard Central.** Nova página `/dashboard/metrics` com gráficos de evolução de vendas e visão geral de produtos em risco.
- **D-06: Indicadores In-Context.** Cada card de produto exibirá um badge ou ícone colorido com a previsão de dias restantes, permitindo ao usuário ver o risco sem sair da lista principal.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos e Visão
- `.planning/ROADMAP.md` — Requisitos de inteligência (Fase 4).
- `new-project.md` — Definição original dos cálculos de média móvel.

### Tecnologia
- [Tremor Documentation](https://www.tremor.so/docs) — Referência para os componentes de UI.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `inventoryLogs` (tipo SALE) — Fonte de dados para os cálculos.
- `products` (currentStock) — Comparador para os dias restantes.

### Established Patterns
- Server Actions para buscar dados processados.
- Uso de `revalidatePath` para manter os indicadores frescos após vendas.

</code_context>

<specifics>
## Specific Ideas
- Criar uma "View" ou função de utilidade `calculateStockRunway(productId)` que encapsule a lógica do semáforo.
- O Dashboard deve permitir alternar entre as médias de 7, 15 e 30 dias para análise de sazonalidade.

</specifics>

<deferred>
## Deferred Ideas
- Exportação de relatórios em PDF/Excel.
- Alertas por E-mail de estoque crítico.

</deferred>

---

*Phase: 04-inteligencia-dashboard*
*Context gathered: 2026-05-01*
