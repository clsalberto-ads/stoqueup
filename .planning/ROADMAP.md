# Roadmap: StoqueUp

## Overview

StoqueUp será desenvolvido em 5 fases sequenciais para garantir que o fluxo operacional básico (estoque -> venda -> produção) esteja sólido antes de avançarmos para inteligência de dados. O projeto começa pela fundação da infraestrutura e autenticação, passa pelos módulos transacionais de vendas e produção, e culmina em um dashboard de gestão de risco.

## Phases

- [x] **Phase 1: Fundação & Gestão de Produtos** - Setup inicial, Auth ABAC e CRUD de produtos com limites.
- [x] **Phase 2: Módulo de Vendas & Gatilhos** - Fluxo de saída de estoque e automação de bloqueio.
- [x] **Phase 3: Módulo de Produção & Liberação** - Fluxo de entrada de estoque e automação de desbloqueio.
- [ ] **Phase 4: Inteligência & Dashboard** - Métricas de giro, médias móveis e semáforo de risco.
- [ ] **Phase 5: Polimento & Validação MVP** - Notificações, refinamento de UI e testes finais.

## Phase Details

### Phase 1: Fundação & Gestão de Produtos
**Goal**: Estabelecer a base técnica e o cadastro central de produtos.
**Depends on**: Nothing
**Requirements**: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, INVT-01, INVT-02]
**Success Criteria**:
  1. Infraestrutura (Docker, Next.js, Drizzle, Postgres) operando corretamente.
  2. Usuário pode se logar e o sistema reconhece seu papel (Manager/Employee).
  3. Manager pode cadastrar e editar um produto com limites de estoque configuráveis.
**Plans**: 3 plans

Plans:
- [x] 01-01: Setup do projeto e infraestrutura Docker.
- [x] 01-02: Implementação de Autenticação e Autorização (Better Auth).
- [x] 01-03: CRUD de Produtos e visualização básica de inventário.

### Phase 2: Módulo de Vendas & Gatilhos
**Goal**: Implementar o registro de saídas e a primeira automação crítica.
**Depends on**: Phase 1
**Requirements**: [SALE-01, SALE-02, SALE-03, SALE-04, INVT-03, INVT-04, PROD-01]
**Success Criteria**:
  1. Registrar uma venda decrementa o estoque de forma transacional (sem erro de concorrência).
  2. Produto muda para status "Bloqueado" automaticamente ao atingir `qtd_minima`.
  3. Uma tarefa de produção 'Pendente' é criada automaticamente no Módulo de Produção.
**Plans**: 2 plans

Plans:
- [x] 02-01: Registro de vendas e log de transações de estoque.
- [x] 02-02: Automação de bloqueio de venda e criação de tarefa de produção.

### Phase 3: Módulo de Produção & Liberação
**Goal**: Implementar a gestão de tarefas e o retorno do produto para venda.
**Depends on**: Phase 2
**Requirements**: [PROD-02, PROD-03, PROD-04, PROD-05, PROD-06]
**Success Criteria**:
  1. Employee pode visualizar e atualizar o status de tarefas de produção.
  2. Concluir uma tarefa incrementa o estoque e libera o produto para venda se atingir `min_para_venda`.
  3. Sistema bloqueia a criação de novas tarefas se o estoque atingir `qtd_maxima`.
**Plans**: 2 plans

Plans:
- [x] 03-01: Gestão de ciclo de vida de Tarefas de Produção.
- [x] 03-02: Incremento de estoque e automação de liberação para venda.

### Phase 4: Inteligência & Dashboard
**Goal**: Transformar dados brutos em indicadores de gestão de risco.
**Depends on**: Phase 3
**Requirements**: [DASH-01, DASH-02, DASH-03]
**Success Criteria**:
  1. Dashboard exibe "Dias Restantes" calculado dinamicamente.
  2. Usuário pode alternar a média de vendas entre 7, 15 e 30 dias.
  3. Semáforo de risco (Verde/Amarelo/Vermelho) indica visualmente o estado da operação.
**Plans**: 2 plans

Plans:
- [ ] 04-01: Cálculo de médias móveis e métricas de giro.
- [ ] 04-02: Dashboard visual com gráficos e indicadores de risco.

### Phase 5: Polimento & Validação MVP
**Goal**: Garantir que a experiência do usuário seja fluida e premium.
**Depends on**: Phase 4
**Success Criteria**:
  1. UI/UX refinada seguindo a inspiração do Kyte com estética moderna.
  2. Fluxos de ponta a ponta testados e sem bugs críticos.
**Plans**: 1 plan

Plans:
- [ ] 05-01: Ajustes finais de UI, notificações e preparo para entrega.

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fundação | 3/3 | Complete | 2026-05-01 |
| 2. Vendas | 2/2 | Complete | 2026-05-01 |
| 3. Produção | 2/2 | Complete | 2026-05-01 |
| 4. Inteligência | 0/2 | Not started | - |
| 5. Polimento | 0/1 | Not started | - |

---
*Roadmap defined: 2026-05-01*
*Last updated: 2026-05-01 after initialization*
