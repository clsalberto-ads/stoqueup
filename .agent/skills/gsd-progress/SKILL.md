---
name: gsd-progress
description: Verifica o progresso do projeto, mostra o contexto e encaminha para a próxima ação (executar ou planejar). Use --forensic para anexar uma auditoria de integridade de 6 verificações após o relatório padrão.
---

<objective>
Check project progress, summarize recent work and what's ahead, then intelligently route to the next action - either executing an existing plan or creating the next one.

Provides situational awareness before continuing work.
</objective>

<execution_context>
@.agent/get-shit-done/workflows/progress.md
</execution_context>

<process>
Execute the progress workflow from @.agent/get-shit-done/workflows/progress.md end-to-end.
Preserve all routing logic (Routes A through F) and edge case handling.
</process>
