# Phase 01: Fundação & Gestão de Produtos - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-01
**Phase:** 01-fundacao-gestao-de-produtos
**Areas discussed:** Layout & Navegação, Fluxo de Autenticação, Cadastro de Produtos, Gestão de Imagens

---

## Layout & Navegação

| Option | Description | Selected |
|--------|-------------|----------|
| Sidebar Lateral Flexível | Barra lateral que se recolhe em desktop e mobile. | ✓ |
| Bottom Bar | Foco mobile-first como o Kyte. | |
| Sidebar + Bottom Bar | Híbrido entre os dois. | |

**User's choice:** Opção A (Sidebar Lateral Flexível).

---

## Fluxo de Autenticação

| Option | Description | Selected |
|--------|-------------|----------|
| Cadastro Aberto | Signup liberado para empresas e funcionários. | |
| Gestão Fechada | Manager cria funcionários manualmente. | ✓ |

**User's choice:** Opção B (Gestão Fechada).

---

## Cadastro de Produtos

| Option | Description | Selected |
|--------|-------------|----------|
| Modal Rápido | Cadastro em janela sobreposta. | |
| Página Dedicada | Cadastro em rota específica (/products/new). | ✓ |

**User's choice:** Opção B (Página Dedicada).

---

## Gestão de Imagens

| Option | Description | Selected |
|--------|-------------|----------|
| Com Fotos | Upload de imagens (Uploadthing/S3) no MVP. | ✓ |
| Sem Fotos | Apenas dados e ícones representativos. | |

**User's choice:** Opção A (Com Fotos).

---

## the agent's Discretion

- Escolha do provedor de storage para imagens.
- Estrutura de rotas interna do Next.js.
- Escolha de bibliotecas de UI (shadcn/ui já pré-aprovado).

## Deferred Ideas

- Signup público para funcionários (rejeitado para o MVP).
- Cadastro rápido via modal (rejeitado em favor de página dedicada).
