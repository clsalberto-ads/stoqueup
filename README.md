# StoqueUp

**Gestão inteligente de produção, estoque e vendas para PMEs.**

StoqueUp é uma plataforma web de gestão operacional voltada a pequenas e médias empresas que fabricam e vendem produtos físicos. O sistema conecta os pilares de **produção**, **estoque** e **vendas** em um único fluxo automatizado, eliminando a dependência de planilhas e garantindo decisões baseadas em dados em tempo real.

> Público-alvo: Confeitarias, cosméticos, vestuário e manufatura leve.

---

## Funcionalidades

### 📦 Gestão de Produtos
- Cadastro completo com nome, descrição, preço e imagem
- Configuração de limites: estoque mínimo (`qtdMinima`), máximo (`qtdMaxima`) e ponto de reabastecimento (`minParaVenda`)
- Status visual de disponibilidade (Disponível / Bloqueado)
- Upload de imagens via Supabase Storage

### 🛒 Módulo de Vendas
- Registro de vendas com decremento atômico e transacional
- Venda múltipla (carrinho) com rollback automático em caso de falha
- Bloqueio automático do produto ao atingir o estoque mínimo
- Criação automática de tarefa de produção pendente ao bloquear

### 🏭 Módulo de Produção
- Ciclo completo: Pendente → Em Andamento → Concluída
- Ao concluir: incremento do estoque (limitado ao `qtdMaxima`)
- Reativação automática da venda se o estoque atingir `minParaVenda`
- Geração de tarefas residuais para conclusões parciais

### 📊 Dashboard e Métricas
- Visão geral com cards de saúde do estoque (crítico / atenção / saudável)
- Cálculo de dias restantes baseado na média de vendas (7, 15 ou 30 dias)
- Gráfico de vendas ao longo do tempo (Recharts)
- Indicadores de risco com semáforo (verde / amarelo / vermelho)
- Top produtos mais vendidos

### 🔔 Notificações
- Notificações in-app para eventos críticos:
  - Produto bloqueado por estoque baixo
  - Tarefa de produção criada automaticamente
  - Produção concluída e estoque reabastecido

### 👥 Multiusuário e Permissões
- Três níveis de acesso via CASL:
  - **Admin**: gestão total do sistema
  - **Manager**: operações de vendas, produtos e produção
  - **User**: leitura de dashboard e execução de produção
- Autenticação por email e senha via Better Auth
- Suporte a múltiplas organizações (multi-tenant)

---

## Stack Tecnológica

| Categoria      | Tecnologia                                              |
| -------------- | ------------------------------------------------------- |
| **Framework**  | Next.js 16 (App Router) + React 19                      |
| **Linguagem**  | TypeScript (strict)                                     |
| **Banco**      | PostgreSQL 16 via Drizzle ORM 0.45                      |
| **Auth**       | Better Auth 1.6 + CASL (RBAC)                           |
| **Estilo**     | Tailwind CSS 4 + shadcn/ui (base-nova)                  |
| **Ícones**     | Lucide React + Remixicon                                |
| **Formulários**| react-hook-form + Zod 4                                 |
| **Storage**    | Supabase Storage (imagens de produto)                   |
| **Gráficos**   | Recharts 2                                              |
| **Testes**     | Playwright (E2E)                                        |

---

## Começando

### Pré-requisitos

- Node.js 20+
- Docker (para banco local) ou acesso a um PostgreSQL remoto
- Conta no Supabase (para storage de imagens — opcional em dev)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/stoqueup.git
cd stoqueup

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais
```

### Ambiente

Suba o banco PostgreSQL local com Docker (opcional):

```bash
docker compose up -d
```

Execute as migrações e popule o banco com dados de exemplo:

```bash
npx drizzle-kit push
npm run seed
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Usuários de teste (após seed)

| Email               | Senha        | Papel    |
| ------------------- | ------------ | -------- |
| `admin@stoqueup.com` | `password123` | Admin    |
| `manager@stoqueup.com` | `password123` | Manager  |
| `user@stoqueup.com` | `password123` | User     |

---

## Variáveis de Ambiente

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/stoqueup"

# Better Auth
BETTER_AUTH_SECRET="seu-secret-aqui"
BETTER_AUTH_URL="http://localhost:3000"

# Supabase (Storage de imagens)
NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anon"
```

---

## Scripts Disponíveis

| Comando             | Descrição                                    |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Inicia o servidor de desenvolvimento         |
| `npm run build`     | Compila o projeto para produção              |
| `npm start`         | Inicia o servidor de produção                |
| `npm run lint`      | Executa o ESLint em todo o projeto           |
| `npm run seed`      | Popula o banco com dados de exemplo          |
| `npx drizzle-kit push` | Aplica as migrações ao banco             |
| `npx drizzle-kit generate` | Gera nova migração                     |
| `npm test`          | Executa os testes E2E (Playwright)           |

---

## Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── login/              # Página de login
│   ├── dashboard/          # Área protegida
│   │   ├── products/       # CRUD de produtos
│   │   ├── sales/          # Histórico de vendas
│   │   ├── production/     # Ordens de produção
│   │   ├── metrics/        # Analytics e gráficos
│   │   └── settings/       # Configurações (admin)
│   └── api/                # API routes
├── components/             # Componentes React
│   ├── ui/                 # Primitivas shadcn/ui
│   ├── layout/             # Sidebar, user menu
│   ├── products/           # Componentes de produto
│   ├── sales/              # Componentes de venda
│   ├── production/         # Componentes de produção
│   └── metrics/            # Gráficos e dashboards
├── db/
│   ├── schema.ts           # Schema Drizzle (11 tabelas)
│   └── migrations/         # Migrations SQL
├── lib/
│   ├── auth.ts             # Configuração Better Auth
│   ├── ability.ts          # Definição de permissões (CASL)
│   ├── inventory-actions.ts # Lógica de estoque (transacional)
│   └── analytics-actions.ts # Métricas e consultas
└── hooks/                  # React hooks customizados
```

---

## Regras de Negócio

### 🚦 Fluxo de Estoque

Todas as movimentações de estoque são **atômicas e transacionais** dentro de transações Drizzle.

```
Venda realizada
  → Decrementa currentStock
  → Se stock < qtdMinima → Bloqueia produto + Cria task de produção + Notificação
  → Registra inventory_log (tipo SALE)

Produção concluída
  → Incrementa currentStock (limitado a qtdMaxima)
  → Se stock >= minParaVenda → Reativa venda + Notificação
  → Marca task como COMPLETED + Registra inventory_log (tipo PRODUCTION)
  → Se excedeu qtdMaxima → Cria task residual com excedente
```

### 🛡️ Autorização (CASL)

| Recurso            | Admin     | Manager   | User      |
| ------------------ | --------- | --------- | --------- |
| Dashboard          | Gerenciar | Ler       | Ler       |
| Produtos           | Gerenciar | Gerenciar | —         |
| Vendas             | Gerenciar | Gerenciar | —         |
| Produção           | Gerenciar | Gerenciar | Gerenciar |
| Métricas           | Gerenciar | Ler       | —         |
| Configurações      | Gerenciar | Ler       | Ler       |
| Usuários           | Gerenciar | —         | —         |

---

## Deploy

O projeto está configurado para deploy na [Vercel](https://vercel.com) com PostgreSQL via Supabase.

```bash
npm run build
```

Consulte a [documentação de deploy Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para mais detalhes.

---

## Testes

Testes E2E com Playwright:

```bash
npx playwright test          # Executa todos os testes
npx playwright test --ui     # Modo UI interativo
npx playwright show-report   # Abre o relatório HTML
```

---

## Licença

Projeto privado — todos os direitos reservados.

---

<p align="center">Built with Next.js 16, Drizzle ORM, Tailwind CSS e Better Auth.</p>
