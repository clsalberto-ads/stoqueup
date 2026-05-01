# Research: Architecture Patterns

**Analysis Date:** 2026-05-01

## Modular Monolith (Next.js)
- **Domain Separation**: Separate logic for `sales`, `inventory`, and `production` even if they share the same database.
- **Service Layer**: Common "InventoryService" used by both Sales (decrement) and Production (increment) to ensure consistent rule application.

## Transactional Integrity
- **ACID Movements**: Using database transactions to ensure that `Stock Level` and `Inventory Log` are updated simultaneously.
- **Optimistic vs Pessimistic Locking**: For high-concurrency (unlikely for PME MVP), row-level locking during stock decrement is recommended.

## ABAC Security
- **Role-Based Access Control**:
    - `Manager`: Access to `/sales`, `/inventory`, `/settings`.
    - `Employee`: Access to `/production`, `/inventory` (read-only).
- **Middleware Protection**: Validating roles at the Next.js Middleware level and inside Server Actions.

---
*Research synthesized: 2026-05-01*
