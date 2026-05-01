---
phase: 02
plan: 03
title: Interface de Vendas e Dashboard
slug: 02-03-ui
wave: 3
depends_on: [02-02-logica]
files_modified: [src/app/dashboard/products/page.tsx, src/components/products/product-card.tsx, src/app/dashboard/sales/page.tsx, src/components/layout/sidebar.tsx]
requirements: [SALE-04, INVT-03, INVT-04]
autonomous: true
---

# Plan: 02-03-UI

Integração da lógica de vendas na interface e criação da visualização de histórico.

## Tasks

<task id="1" type="execute">
<read_first>
- src/components/layout/sidebar.tsx
</read_first>
<action>
Adicionar link para "Vendas" (`/dashboard/sales`) na Sidebar.
Usar o ícone `ShoppingBag` da lucide-react.
</action>
<acceptance_criteria>
- Sidebar contém o item "Vendas".
</acceptance_criteria>
</task>

<task id="2" type="execute">
<read_first>
- src/app/dashboard/products/page.tsx
</read_first>
<action>
Refatorar a listagem de produtos para usar um componente `ProductCard` dedicado.
Adicionar o botão "Vender" em cada card.
Ao clicar em "Vender", disparar a action `sellProduct(id, 1)` e exibir um Toast de sucesso ou erro.
</action>
<acceptance_criteria>
- Cada produto tem um botão "Vender".
- Clicar no botão exibe um Toast indicando o resultado.
- A lista de produtos é revalidada e reflete o novo estoque.
</acceptance_criteria>
</task>

<task id="3" type="execute">
<read_first>
- src/app/dashboard/products/page.tsx
</read_first>
<action>
Adicionar Badge de "Estoque Crítico" ou "Reposição Necessária" no card do produto quando `currentStock <= qtdMinima`.
O badge deve ser visualmente distinto (ex: amarelo/laranja).
</action>
<acceptance_criteria>
- Produtos abaixo do mínimo exibem o alerta visual.
</acceptance_criteria>
</task>

<task id="4" type="execute">
<read_first>
- src/db/schema.ts
</read_first>
<action>
Criar a página `src/app/dashboard/sales/page.tsx` para listar as vendas.
A página deve buscar dados de `inventory_logs` onde `type = 'SALE'` e exibir em uma tabela.
Exibir: Nome do Produto, Quantidade, Data e Valor Total (baseado no preço do produto no momento da venda - *Nota: idealmente o log deveria guardar o preço da venda, mas usaremos o atual para simplificar nesta fase*).
</action>
<acceptance_criteria>
- Página `/dashboard/sales` exibe a tabela de vendas.
</acceptance_criteria>
</task>

## Verification

### Automated Tests
- N/A

### Manual Verification (UAT)
- [ ] Navegar pela sidebar até "Vendas".
- [ ] Realizar uma venda na página de produtos e ver o Toast.
- [ ] Verificar se o badge de estoque crítico apareceu após a venda.
- [ ] Verificar se a venda apareceu no histórico de vendas.
