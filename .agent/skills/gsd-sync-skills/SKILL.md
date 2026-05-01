---
name: gsd-sync-skills
description: Sincroniza habilidades GSD gerenciadas entre raízes de tempo de execução para que usuários de múltiplos ambientes permaneçam alinhados após uma atualização
---


<objective>
Sync managed `gsd-*` skill directories from one canonical runtime's skills root to one or more destination runtime skills roots.

Routes to the sync-skills workflow which handles:
- Argument parsing (--from, --to, --dry-run, --apply)
- Runtime skills root resolution via install.js --skills-root
- Diff computation (CREATE / UPDATE / REMOVE per destination)
- Dry-run reporting (default — no writes)
- Apply execution (copy and remove with idempotency)
- Non-GSD skill preservation (only gsd-* dirs are touched)
</objective>
