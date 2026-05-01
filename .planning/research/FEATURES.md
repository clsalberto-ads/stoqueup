# Research: Feature Ecosystem

**Analysis Date:** 2026-05-01
**Goal:** Identify standard and advanced features for StoqueUp MVP+

## Core Inventory Features
- **Transaction History (Audit Trail)**: Every `+` or `-` must be logged with timestamp, user, and reason.
- **Stock Level Alerts**: Visual cues for "At risk" (Yellow) and "Critical" (Red) based on sales velocity.
- **Batch/Lot Tracking**: Essential for food/cosmetics (expirations). *Note: Consider adding to Phase 3.*

## Production Management
- **Status Lifecycle**: Pendente -> Em Andamento -> Concluída.
- **Auto-Sugestão de Lote**: Algorithm to suggest producing enough to reach `min_para_venda` but staying under `qtd_maxima`.
- **Worker Assignment**: Ability to see who is handling which production task.

## Sales & Automation
- **Real-time Availability**: Immediate block/unblock of products based on transactional inventory updates.
- **Sales Velocity Calculation**: Moving average (7, 15, 30 days) to predict "Days Left".

## Dashboard & Analytics
- **Inventory Turn (Giro de Estoque)**: KPI to show how fast products are moving.
- **Risk Indicators**: High-visibility "Critical Stock" widgets for Managers.

---
*Research synthesized: 2026-05-01*
