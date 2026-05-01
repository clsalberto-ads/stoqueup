---
phase: 03
plan: 02
title: Interface de Gestão de Produção
slug: 03-02-ui-producao
wave: 2
depends_on: [03-01-logica]
files_modified: [src/app/dashboard/production/page.tsx, src/components/production/production-card.tsx, src/components/production/complete-production-modal.tsx]
requirements: [PROD-02, PROD-03]
autonomous: true
---

# Plan: 03-02-UI-PRODUCAO

Criação da página de produção e componentes visuais para gestão de tarefas.

## Tasks

<task id="1" type="execute">
<read_first>
- src/components/layout/sidebar.tsx
</read_first>
<action>
Adicionar link "Produção" (`/dashboard/production`) na Sidebar (se ainda não existir ou estiver com URL errada).
</action>
<acceptance_criteria>
- Sidebar tem link funcional para Produção.
</acceptance_criteria>
</task>

<task id="2" type="execute">
<read_first>
- src/components/products/product-card.tsx (para inspiração)
</read_first>
<action>
Criar o componente `ProductionCard`.
Deve exibir: Nome do produto, quantidade planejada, status atual (Badge), data de criação.
Botões:
- "Iniciar" (se PENDING) -> chama `updateProductionStatus`.
- "Concluir" (se IN_PROGRESS) -> abre o modal de conferência.
</action>
<acceptance_criteria>
- Componente visualmente alinhado com o design system.
- Botões disparam as ações corretas.
</acceptance_criteria>
</task>

<task id="3" type="execute">
<read_first>
- src/components/ui/dialog.tsx (precisa ser instalado via shadcn se não houver)
</read_first>
<action>
Instalar `dialog` via shadcn e criar `CompleteProductionModal`.
O modal deve ter um input numérico para confirmar a quantidade produzida e botão de confirmação.
</action>
<acceptance_criteria>
- Modal abre ao clicar em Concluir.
- Permite informar a quantidade e chama `completeProduction`.
</acceptance_criteria>
</task>

<task id="4" type="execute">
<read_first>
- src/db/schema.ts
</read_first>
<action>
Criar `src/app/dashboard/production/page.tsx`.
Listar tarefas de produção filtradas por status (ex: Tabs para Pendentes e Concluídas).
</action>
<acceptance_criteria>
- Página `/dashboard/production` exibe as tarefas atuais.
</acceptance_criteria>
</task>

## Verification

### Automated Tests
- N/A

### Manual Verification (UAT)
- [ ] Iniciar uma tarefa e ver o status mudar para "Produzindo".
- [ ] Concluir uma tarefa via modal e ver a notificação de sucesso.
