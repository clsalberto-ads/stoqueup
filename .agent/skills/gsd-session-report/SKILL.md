---
name: gsd-session-report
description: Gera um relatório de sessão com estimativas de uso de tokens, resumo do trabalho e resultados
---

<objective>
Generate a structured SESSION_REPORT.md document capturing session outcomes, work performed, and estimated resource usage. Provides a shareable artifact for post-session review.
</objective>

<execution_context>
@.agent/get-shit-done/workflows/session-report.md
</execution_context>

<process>
Execute the session-report workflow from @.agent/get-shit-done/workflows/session-report.md end-to-end.
</process>
