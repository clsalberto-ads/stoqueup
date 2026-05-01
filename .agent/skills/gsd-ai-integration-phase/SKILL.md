---
name: gsd-ai-integration-phase
description: Gera contrato de design de IA (AI-SPEC.md) para fases que envolvem construção de sistemas de IA — seleção de framework, orientação de implementação e estratégia de avaliação
---

<objective>
Create an AI design contract (AI-SPEC.md) for a phase involving AI system development.
Orchestrates gsd-framework-selector → gsd-ai-researcher → gsd-domain-researcher → gsd-eval-planner.
Flow: Select Framework → Research Docs → Research Domain → Design Eval Strategy → Done
</objective>

<execution_context>
@.agent/get-shit-done/workflows/ai-integration-phase.md
@.agent/get-shit-done/references/ai-frameworks.md
@.agent/get-shit-done/references/ai-evals.md
</execution_context>

<context>
Phase number: $ARGUMENTS — optional, auto-detects next unplanned phase if omitted.
</context>

<process>
Execute @.agent/get-shit-done/workflows/ai-integration-phase.md end-to-end.
Preserve all workflow gates.
</process>
