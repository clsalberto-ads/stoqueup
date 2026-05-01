---
phase: 1
slug: fundacao-gestao-de-produtos
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-01
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | vitest.config.ts (Wave 0 installs) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test --run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | — | — | N/A | config | `docker-compose ps` | ✅ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | AUTH-01 | — | N/A | unit | `npm test auth.spec.ts` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 2 | AUTH-02 | — | N/A | integration | `npm test org.spec.ts` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 1 | INVT-02 | — | N/A | unit | `npm test schema.spec.ts` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 3 | INVT-01 | — | N/A | e2e | `npm test product-crud.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — Framework setup.
- [ ] `src/lib/auth.spec.ts` — Auth unit test stubs.
- [ ] `src/db/schema.spec.ts` — Schema validation stubs.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Image Upload | — | Requires UI/Media interactions | Upload product image and check if it displays on the product page. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
