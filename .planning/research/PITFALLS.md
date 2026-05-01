# Research: Common Pitfalls

**Analysis Date:** 2026-05-01

## Technical Risks
1. **Inventory Drift**: When the physical stock doesn't match the digital record.
    - *Mitigation*: Enable "Inventory Adjustment" (Manual Correction) for Managers only.
2. **Race Conditions**: Two sales happening at the exact same time when only 1 item is left.
    - *Mitigation*: Use database-level `CHECK` constraints (inventory >= 0) and transactions.
3. **Ghost Bloqueios**: Product blocked but never re-activated because the production lot was deleted or canceled.
    - *Mitigation*: Robust "Re-evaluation" logic on any inventory change (Sales, Production, Correction).

## UX Risks
1. **Over-Automation**: Too many tasks being created automatically can overwhelm the Employee.
    - *Mitigation*: Task consolidation (one active task per product).
2. **Dashboard Clutter**: Too many KPIs for a small business owner.
    - *Mitigation*: Focus on "Days Left" as the primary risk metric.

---
*Research synthesized: 2026-05-01*
