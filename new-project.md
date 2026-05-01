# StoqueUp — MRD v1.0

> **Market Requirements Document** · Versão 1.0 · Abril 2026  
> Módulos: 🏭 Produção · 🛒 Vendas · 📦 Estoque  
> Status: MVP · Confidencial — Uso Interno

---

## Sumário

1. [Visão do Produto](#1-visão-do-produto)
2. [Problema & Solução](#2-problema--solução)
3. [Perfis de Usuário](#3-perfis-de-usuário)
4. [Módulos do Sistema](#4-módulos-do-sistema)
5. [Fluxos de Automação](#5-fluxos-de-automação)
6. [Regras de Negócio](#6-regras-de-negócio)
7. [Métricas & Indicadores](#7-métricas--indicadores)
8. [Stack Tecnológico](#8-stack-tecnológico)
9. [Roadmap de Entrega](#9-roadmap-de-entrega)

---

## 1. Visão do Produto

**StoqueUp** é uma plataforma web de gestão operacional voltada a pequenas e médias empresas que fabricam e vendem produtos físicos. O sistema conecta três pilares do negócio — _produção, estoque e vendas_ — em um único fluxo automatizado, eliminando a dependência de planilhas, comunicação manual entre times e decisões baseadas em dados desatualizados.

> **Declaração de Visão**  
> Ser a fonte única de verdade sobre o ciclo de vida de um produto físico — desde sua fabricação até o momento da venda — garantindo que os estoques estejam sempre dentro de limites saudáveis e que a equipe de produção saiba exatamente o que e quando produzir.

### Missão

Automatizar as decisões operacionais de rotina (bloqueio de venda, abertura de tarefas de produção, liberação de produtos) para que gestores foquem em decisões estratégicas e não em controle reativo de estoque.

---

## 2. Problema & Solução

Empresas que produzem e vendem produtos físicos enfrentam gargalos recorrentes na operação diária por falta de integração entre as áreas. Os cenários mais comuns incluem:

### Problemas Atuais

| # | Problema |
|---|----------|
| 1 | Vendas realizadas sem estoque disponível |
| 2 | Estoque negativo por falta de controle em tempo real |
| 3 | Produção excessiva gerando obsolescência e desperdício |
| 4 | Comunicação manual entre vendas e produção com erros |
| 5 | Sem visibilidade de dias restantes de venda |
| 6 | Produtos bloqueados manualmente com esquecimento de reativação |
| 7 | Estoque acima do máximo sem alerta preventivo |
| 8 | Histórico de produção e vendas fragmentado |

### Soluções do StoqueUp

| # | Solução |
|---|---------|
| 1 | Bloqueio automático de venda ao atingir nível mínimo |
| 2 | Controle transacional com incremento/decremento em tempo real |
| 3 | Alerta e bloqueio de produção ao atingir nível máximo |
| 4 | Tarefas de produção geradas automaticamente pelo sistema |
| 5 | Cálculo contínuo de dias restantes baseado na média de vendas |
| 6 | Liberação automática para venda ao atingir mínimo de vendas |
| 7 | Dashboard de estoque com indicadores visuais de risco |
| 8 | Histórico unificado por produto com rastreabilidade |

> **Público-Alvo**  
> Pequenas e médias empresas com produção própria e canal de vendas direto — confeitarias, cosméticos, vestuário, alimentos, bebidas artesanais e manufatura leve. Times de 2 a 50 pessoas com necessidade de controle operacional sem complexidade de ERP.

---

## 3. Perfis de Usuário

O StoqueUp opera com dois perfis de acesso distintos, refletindo a separação entre responsabilidades gerenciais e operacionais da empresa. O controle de acesso é aplicado por rota e por ação — não apenas na interface, mas também nas regras da API.

### 👔 Manager — `role: manager`

_Gestor / Administrador_

**Permissões concedidas:**
- ✅ Acesso completo ao **Módulo de Vendas**
- ✅ Acesso completo ao **Módulo de Estoque**
- ✅ Alterar o **preço de venda** dos produtos
- ✅ Configurar limites de estoque (`qtd_minima`, `qtd_maxima`, `min_para_venda`)
- ✅ Visualizar dashboard e métricas completas
- ✅ Visualizar histórico de movimentações
- ✅ Cadastrar e editar produtos
- ✅ Gerenciar usuários
- ➖ Módulo de Produção: somente leitura

---

### 🔧 Employee — `role: employee`

_Colaborador / Operador_

**Permissões concedidas:**
- ✅ Acesso completo ao **Módulo de Produção**
- ✅ Gerenciar tarefas de produção (iniciar, concluir, cancelar)
- ✅ Registrar lotes de produção concluídos
- ✅ **Visualizar** o Módulo de Estoque (somente leitura)
- ✅ Ver histórico de movimentações
- ❌ Não pode alterar preços ou configurações
- ❌ Sem acesso ao Módulo de Vendas
- ❌ Sem acesso a métricas financeiras
- ❌ Sem acesso a cadastro de produtos ou gestão de usuários

---

### Matriz de Permissões

| Funcionalidade | Manager | Employee |
|---|:---:|:---:|
| Registrar vendas | ✅ | — |
| Visualizar histórico de vendas | ✅ | — |
| Alterar preço de venda | ✅ | ❌ |
| Ver dashboard de estoque | ✅ | ✅ |
| Configurar limites de estoque | ✅ | ❌ |
| Gerenciar tarefas de produção | — | ✅ |
| Registrar lotes produzidos | — | ✅ |
| Ver histórico de movimentações | ✅ | ✅ |
| Ver métricas e KPIs | ✅ | — |
| Cadastrar / editar produtos | ✅ | ❌ |
| Gerenciar usuários | ✅ | ❌ |

> **Nota de Implementação**  
> O controle de acesso deve ser aplicado em **duas camadas**: na interface (ocultando rotas e ações não permitidas) e na API (validando o `role` do token JWT em cada endpoint). Um Employee que tente acessar uma rota de vendas diretamente via URL deve receber `403 Forbidden`.

---

## 4. Módulos do Sistema

### 🏭 Módulo de Produção

_Gerencia a fabricação e incrementa o estoque_

#### Responsabilidades

| Tipo | Funcionalidade |
|------|---------------|
| `REQ` | Receber e gerenciar tarefas de produção (criadas manualmente ou automaticamente) |
| `REQ` | Registrar lotes de produção com quantidade produzida e data |
| `AUTO` | Incrementar o estoque ao confirmar a conclusão de um lote |
| `AUTO` | Verificar se o estoque atingiu o mínimo para venda após cada incremento |
| `AUTO` | Enviar sinal de liberação para o Módulo de Vendas quando atingir o mínimo |
| `REGRA` | Bloquear novas tarefas de produção se o estoque já estiver no nível máximo |
| `REQ` | Listar tarefas por status: Pendente · Em andamento · Concluída · Cancelada |
| `REQ` | Histórico de lotes produzidos com rastreabilidade por produto |

#### Estados de uma Tarefa de Produção

```
Pendente → Em Andamento → Concluída
                        ↘ Cancelada
```

---

### 🛒 Módulo de Vendas

_Registra vendas e decrementa o estoque_

#### Responsabilidades

| Tipo | Funcionalidade |
|------|---------------|
| `REQ` | Registrar vendas com produto, quantidade, canal e data |
| `AUTO` | Decrementar o estoque ao confirmar uma venda |
| `AUTO` | Verificar nível do estoque após cada venda |
| `AUTO` | Bloquear produto para venda quando estoque atingir o nível mínimo |
| `AUTO` | Disparar criação de tarefa de produção ao bloquear produto |
| `REGRA` | Impedir registro de venda de produto bloqueado na interface |
| `REQ` | Exibir badge visual de status do produto (Disponível / Bloqueado) |
| `REQ` | Histórico de vendas com filtro por produto, período e canal |

#### Status do Produto para Venda

| Status | Condição |
|--------|----------|
| ✅ **Disponível** | Estoque acima do mínimo para venda |
| 🔴 **Bloqueado** | Estoque no nível mínimo ou abaixo |

---

### 📦 Módulo de Estoque

_Visão consolidada com alertas e métricas_

#### Responsabilidades

| Tipo | Funcionalidade |
|------|---------------|
| `REQ` | Dashboard com visão geral de todos os produtos e quantidades atuais |
| `REQ` | Indicadores visuais: quantidade atual, mínimo, máximo e status |
| `AUTO` | Calcular dias restantes de venda com base na média do período configurável |
| `REGRA` | Alertar quando estoque atingir o nível máximo configurado por produto |
| `REGRA` | Alertar quando dias restantes estiver abaixo do limiar de risco |
| `REQ` | Histórico de movimentações (entradas de produção + saídas de vendas) |
| `REQ` | Configuração de mínimo, máximo e mínimo para venda por produto |
| `REQ` | Filtros por categoria de produto, status e nível de risco |

#### Campos por Produto no Dashboard

| Campo | Descrição | Origem |
|-------|-----------|--------|
| `qtd_atual` | Quantidade em estoque neste momento | Calculado |
| `qtd_minima` | Gatilho de bloqueio de venda e início de produção | Configurável |
| `qtd_maxima` | Limite superior — bloqueia novas tarefas de produção | Configurável |
| `min_para_venda` | Quantidade mínima para liberar venda automaticamente | Configurável |
| `media_vendas` | Média diária de vendas no período selecionado | Calculado |
| `dias_restantes` | `qtd_atual ÷ media_vendas` | Calculado |
| `status_venda` | Disponível / Bloqueado | Automático |

---

## 5. Fluxos de Automação

O coração do StoqueUp é a integração automática entre os módulos. Os fluxos abaixo eliminam a necessidade de intervenção humana nas transições críticas de operação.

### Fluxo 1 — Venda abaixo do mínimo

> _Trigger: venda registrada → verificação de estoque_

```
[Venda Registrada]
       │
       ▼
[Decrementa Estoque]
       │
       ▼
 qtd ≤ qtd_minima ?
       │ SIM
       ▼
[Bloqueia Produto] ──────────────────────────────►[status = BLOQUEADO]
       │
       ▼
[Cria Tarefa de Produção] ───────────────────────► prioridade: Alta
```

### Fluxo 2 — Produção libera para venda

> _Trigger: lote de produção concluído → verificação de liberação_

```
[Lote Concluído]
       │
       ▼
[Incrementa Estoque]
       │
       ▼
 qtd ≥ min_para_venda ?
       │ SIM
       ▼
[Libera Produto] ────────────────────────────────►[status = DISPONÍVEL]
       │
       ▼
[Venda Habilitada no Módulo de Vendas]
```

### Fluxo 3 — Estoque atingiu o máximo

> _Trigger: incremento de estoque → verificação de capacidade_

```
[Lote Concluído]
       │
       ▼
[Incrementa Estoque]
       │
       ▼
 qtd ≥ qtd_maxima ?
       │ SIM
       ▼
[Bloqueia Novas Tarefas de Produção]
       │
       ▼
[Notificação ao Gestor] ─────────────────────────► alerta de capacidade
```

---

## 6. Regras de Negócio

| ID | Gatilho | Condição | Ação Automática |
|----|---------|----------|-----------------|
| `RN-01` | Venda confirmada | Estoque pós-venda ≤ `qtd_minima` | Bloquear produto para venda + criar tarefa de produção |
| `RN-02` | Lote de produção concluído | Estoque pós-incremento ≥ `min_para_venda` | Liberar produto para venda automaticamente |
| `RN-03` | Lote de produção concluído | Estoque pós-incremento ≥ `qtd_maxima` | Bloquear novas tarefas de produção + alertar gestor |
| `RN-04` | Tentativa de venda | Produto com `status = Bloqueado` | Impedir registro da venda na interface |
| `RN-05` | Tentativa de nova tarefa de produção | Estoque atual ≥ `qtd_maxima` | Bloquear criação da tarefa + exibir mensagem de capacidade |
| `RN-06` | Cálculo de dias restantes | Contínuo (recalculado a cada transação) | `dias_restantes = qtd_atual / media_vendas_periodo` |
| `RN-07` | Tarefa de produção automática | Gerada por `RN-01` | Tarefa criada com prioridade **Alta** e produto vinculado |
| `RN-08` | Cancelamento de venda | Produto bloqueado pós-cancelamento com `qtd > qtd_minima` | Re-verificar e liberar produto se condição atendida |

> ⚠️ **Restrição Crítica**  
> Toda movimentação de estoque (incremento por produção ou decremento por venda) deve ser **transacional e atômica**. Não é permitido estoque negativo. Qualquer operação que resulte em saldo negativo deve ser rejeitada com mensagem clara ao usuário.

---

## 7. Métricas & Indicadores

### KPIs do Dashboard

| Indicador | Fórmula | Descrição |
|-----------|---------|-----------|
| **Dias Restantes** | `qtd_atual ÷ media_vendas/dia` | Quantos dias o estoque atual sustenta as vendas |
| **Média de Vendas** | `total_vendas_período ÷ dias_período` | Unidades vendidas por dia no período configurado |
| **Nível de Estoque** | `qtd_atual ÷ qtd_maxima × 100` | Percentual de ocupação em relação ao limite máximo |
| **Produtos Bloqueados** | `COUNT(status = bloqueado)` | Quantidade de produtos aguardando produção |
| **Tarefas Pendentes** | `COUNT(tarefas.status = pendente)` | Ordens de produção em aberto |
| **Giro de Estoque** | `total_vendas ÷ estoque_médio` | Velocidade de rotação do inventário no período |

### Indicadores Visuais de Risco

| Cor | Condição | Significado |
|-----|----------|-------------|
| 🟢 **Verde** | `dias_restantes > 14` | Estoque saudável |
| 🟡 **Amarelo** | `dias_restantes` entre 7 e 14 | Atenção — planejar produção |
| 🔴 **Vermelho** | `dias_restantes < 7` ou produto bloqueado | Crítico — produção urgente |
| ⚫ **Cinza** | Sem vendas no período | Sem referência histórica |

---

## 8. Stack Tecnológico

### Sugerido

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16 |
| Linguagem | TypeScript |
| Estilo | TailwindCSS |
| Componentes UI | Shadcn/UI |
| Backend / API | Next.js API Routes |
| ORM | Drizzle ORM |
| Banco de Dados | PostgreSQL |
| Autenticação | Better Auth |
| Infra | Docker + Compose |
| Estado Global | Zustand |
| Queries / Cache | TanStack Query |
| Charts | Shadcn/UI Charts |
| Linting / Formating | Biome |

**importante:**: 
- inicie o projeto com o comando `npx shadcn@latest init --preset b6VOFGyrC4 --template next` para já vir com o tailwind e shadcn configurado. 
- utilize as imagens do diretorio ./references para cores e composiçoes visuais do frontend.

### Alternativa de Backend

O stack pode ser adaptado para separar o backend com **FastAPI (Python) + SQLAlchemy 2.0 async** caso seja necessário maior controle sobre as regras de negócio, fila de automações ou integração com sistemas externos via API REST dedicada.

---

## 9. Roadmap de Entrega

### Fase 1 — Fundação (4 semanas)

**Entregas:**
- Cadastro de produtos com campos de configuração (`qtd_minima`, `qtd_maxima`, `min_para_venda`)
- Módulo de Estoque com visão de quantidade
- Autenticação básica com perfis `manager` e `employee`
- Setup de infra com Docker

---

### Fase 2 — Módulo de Vendas (3 semanas)

**Entregas:**
- Registro de vendas com decremento transacional
- Bloqueio automático ao atingir nível mínimo (`RN-01`, `RN-04`)
- Disparo de criação de tarefa de produção (`RN-07`)
- Badge de status por produto na interface

---

### Fase 3 — Módulo de Produção (3 semanas)

**Entregas:**
- Gestão de tarefas por status (Pendente → Em Andamento → Concluída)
- Registro de lotes com incremento de estoque
- Liberação automática para venda (`RN-02`)
- Bloqueio de produção ao atingir máximo (`RN-03`, `RN-05`)

---

### Fase 4 — Dashboard & Inteligência de Estoque (2 semanas)

**Entregas:**
- Cálculo de dias restantes e média de vendas (`RN-06`)
- Indicadores visuais de risco (semáforo verde/amarelo/vermelho)
- Histórico unificado de movimentações por produto
- Filtros por categoria, status e nível de risco

---

### Fase 5 — Polimento, Notificações & Testes (2 semanas)

**Entregas:**
- Notificações in-app e por e-mail para alertas críticos
- Relatórios exportáveis por período
- Testes E2E dos fluxos de automação
- Revisão de UX e performance

---

> **Meta do MVP**  
> Ao final da Fase 4, o sistema deve ser capaz de operar os três módulos de forma integrada e autônoma, sem necessidade de intervenção manual nas transições de estado de estoque — este é o critério de sucesso do MVP.

---

*StoqueUp — MRD v1.0 · Abril 2026 · Confidencial — Uso Interno*
