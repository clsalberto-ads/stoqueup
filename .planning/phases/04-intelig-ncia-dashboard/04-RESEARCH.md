# Phase 4: Inteligência & Dashboard - Research

**Date:** 2026-05-01
**Status:** ## RESEARCH COMPLETE

## Standard Stack
- **Styling**: Tailwind CSS (coexistindo com globals.css).
- **Dashboard**: Tremor.so (@tremor/react).
- **Icons**: Lucide React + Remix Icon (exigido pelo Tremor).
- **Logic**: SQL Window Functions via Drizzle `sql` helper.

## Architecture Patterns

### 1. Integração Tailwind + Vanilla
Para evitar conflitos, o Tailwind será configurado para processar apenas os arquivos necessários e o `globals.css` continuará sendo a fonte para estilos base.
- Instalação: `tailwindcss`, `postcss`, `autoprefixer`.
- Configuração: Adicionar o caminho do Tremor em `node_modules` no `content` do `tailwind.config.ts`.

### 2. Cálculo de Médias em SQL
Para calcular a média de 7, 15 e 30 dias:
- **Estratégia**: Agrupar `inventory_logs` por data (truncar timestamp para dia), somar quantidades de venda, e usar `AVG() OVER`.
- **Date Spine**: Como o PostgreSQL não garante linhas para dias sem vendas, usaremos `generate_series(now() - interval '30 days', now(), '1 day')` para criar uma sequência de datas e fazer um `LEFT JOIN` com os logs. Isso garante que dias sem vendas contem como `0` na média.

### 3. Semáforo de Risco (Runway)
- **Cálculo**: `current_stock / moving_average_30d`.
- **Fallback**: Se a média for 0 (sem vendas), o risco é considerado nulo/verde (a menos que o estoque seja 0).

## Don't Hand-Roll
- Não construir gráficos do zero com SVG ou Canvas; usar os componentes `AreaChart` e `BarList` do Tremor.
- Não fazer o cálculo de média móvel no Client-side.

## Common Pitfalls
- **Gaps nas Datas**: Se ignorarmos dias sem vendas, a média será inflada. O SQL deve garantir a inclusão de dias com valor zero.
- **TimeZone**: Logs são salvos em UTC. O agrupamento por dia deve considerar o fuso horário local para precisão.

## Code Examples

### SQL para Média Móvel (Conceito)
```sql
WITH daily_sales AS (
  SELECT 
    date_trunc('day', createdAt) as day,
    sum(abs(change)) as qty
  FROM inventory_logs
  WHERE type = 'SALE' AND productId = ?
  GROUP BY 1
),
date_range AS (
  SELECT generate_series(current_date - interval '30 days', current_date, '1 day')::date as day
)
SELECT 
  dr.day,
  COALESCE(ds.qty, 0) as sales,
  AVG(COALESCE(ds.qty, 0)) OVER (ORDER BY dr.day ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) as ma_30
FROM date_range dr
LEFT JOIN daily_sales ds ON dr.day = ds.day
```

## UI Components (Tremor)
- `Card` + `Metric`: Para KPIs principais.
- `AreaChart`: Para evolução das vendas.
- `Badge`: Para o semáforo de risco.
