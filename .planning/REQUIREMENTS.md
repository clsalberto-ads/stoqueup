# Requirements: StoqueUp

**Defined:** 2026-05-01
**Core Value:** Ser a fonte única de verdade sobre o ciclo de vida de um produto físico — desde sua fabricação até o momento da venda.

## v1 Requirements

Requirements for MVP (Phases 1-4).

### Authentication & Roles (AUTH)

- [ ] **AUTH-01**: User can log in with email and password.
- [ ] **AUTH-02**: System enforces ABAC roles: `manager` and `employee`.
- [ ] **AUTH-03**: `manager` can register and edit products.
- [ ] **AUTH-04**: `employee` is restricted from editing prices and settings.

### Inventory Management (INVT)

- [ ] **INVT-01**: User can view current stock levels for all products.
- [ ] **INVT-02**: User can configure `qtd_minima`, `qtd_maxima`, and `min_para_venda` per product.
- [ ] **INVT-03**: System maintains a transaction log for all stock movements.
- [ ] **INVT-04**: System prevents negative stock (transactional integrity).

### Sales Management (SALE)

- [ ] **SALE-01**: User can register sales (decrementing inventory).
- [ ] **SALE-02**: System automatically blocks sales when stock <= `qtd_minima`.
- [ ] **SALE-03**: System prevents registering sales for blocked products.
- [ ] **SALE-04**: System displays "Disponível/Bloqueado" status badge.

### Production Management (PROD)

- [ ] **PROD-01**: System automatically creates production tasks when stock <= `qtd_minima`.
- [ ] **PROD-02**: Production tasks suggest quantity to reach at least `min_para_venda`.
- [ ] **PROD-03**: User can manage task lifecycle (Pendente -> Em Andamento -> Concluída).
- [ ] **PROD-04**: System increments inventory upon task completion.
- [ ] **PROD-05**: System automatically releases product for sale when stock >= `min_para_venda`.
- [ ] **PROD-06**: System blocks new production tasks if stock >= `qtd_maxima`.

### Dashboard & Intelligence (DASH)

- [ ] **DASH-01**: System calculates daily sales average based on 7, 15, or 30 days.
- [ ] **DASH-02**: System calculates "Days Left" (Current Stock / Average).
- [ ] **DASH-03**: Dashboard displays visual risk semaphor (Green > 14d, Yellow 7-14d, Red < 7d).

## v2 Requirements

### Notifications & Reports

- **REPT-01**: Export monthly movement reports (PDF/CSV).
- **NOTF-01**: Email notifications for low stock/critical risk.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Marketplace Integration | v2.0 priority |
| Raw Material Tracking | MVP focuses on finished goods |
| Full Financial Ledger | MVP focuses on operational flow |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| INVT-01 | Phase 1 | Pending |
| INVT-02 | Phase 1 | Pending |
| INVT-03 | Phase 1 | Pending |
| INVT-04 | Phase 1 | Pending |
| SALE-01 | Phase 2 | Pending |
| SALE-02 | Phase 2 | Pending |
| SALE-03 | Phase 2 | Pending |
| SALE-04 | Phase 2 | Pending |
| PROD-01 | Phase 2 | Pending |
| PROD-02 | Phase 3 | Pending |
| PROD-03 | Phase 3 | Pending |
| PROD-04 | Phase 3 | Pending |
| PROD-05 | Phase 3 | Pending |
| PROD-06 | Phase 3 | Pending |
| DASH-01 | Phase 4 | Pending |
| DASH-02 | Phase 4 | Pending |
| DASH-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-01*
*Last updated: 2026-05-01 after initial definition*
