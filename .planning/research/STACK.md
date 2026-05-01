# Research: Technology Stack (2025)

**Analysis Date:** 2026-05-01
**Domain:** Small/Medium Enterprise Inventory & Production Management

## Recommended Stack

### Frontend & Core
- **Next.js 16 (App Router)**: Utilizing React Server Components (RSC) for maximum performance and React Compiler for automatic memoization.
- **TypeScript**: Full type safety across the entire stack.
- **Tailwind CSS + shadcn/ui**: Modern, accessible UI components. Essential for dashboard complexity.

### Data Layer
- **PostgreSQL**: Robust relational database. Using JSONB for flexible product metadata if needed, but keeping core inventory strictly relational.
- **Drizzle ORM**: Lightweight, type-safe, and SQL-like. Enables schema-first design.
- **Zod**: Runtime schema validation for all inputs and environment variables.

### Logic & State
- **Server Actions**: Handling all mutations (Vendas, Produção) directly and securely.
- **TanStack Query (React Query)**: For client-side state, caching, and optimistic updates on the dashboard.
- **Zustand**: Lightweight global state for UI-specific needs (e.g., sidebar state, dashboard filters).

### Infrastructure
- **Better Auth**: Recommended for Next.js 16 to handle ABAC (Manager/Employee roles) natively.
- **Docker + Docker Compose**: Consistent development and production environments.

## Best Practices
- **Atomic Transactions**: Use Drizzle `db.transaction()` for every stock movement to prevent race conditions.
- **Repository Pattern**: Abstract data access from UI components to keep the codebase clean.
- **Server-Side Validation**: Never trust client input; validate everything with Zod in Server Actions.

---
*Research synthesized: 2026-05-01*
