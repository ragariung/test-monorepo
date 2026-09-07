# Architecture — Essential (Next Steps)

Distilled from `ARCHITECTURE.md`. Only what's needed to start and stay consistent while building. Full rationale/ERD/API list live in the source doc.

---

## Confirmed stack

- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS v4 + Framer Motion (`motion` package) — lives in `Frontends/`, adopted as-is from the design-direction pass (was scaffolded as `insurance-frontends-mvp`, folder renamed to `Frontends/` to match repo structure)
- **Backend:** NestJS, modular monolith — lives in `Backends/`
- **DB:** PostgreSQL via Prisma
- **Local env:** Docker Compose (frontend :3000, backend :3001, postgres :5432)

Superseded: the original plan called for Next.js (App Router) and GSAP+Lenis for motion. The adopted frontend uses plain Vite + a lightweight custom client-side router (path string matched in `App.tsx`, no file-based routing) and Framer Motion instead — treat this as authoritative going forward. ARCHITECTURE.md's Next.js/Nuxt sections are historical context only.

---

## Typography

- Font: **Plus Jakarta Sans** (free, Google Fonts) for both public site and admin portal.

---

## Non-negotiable principles

1. **API is the source of truth** — no pricing, authz, or workflow logic trusted from the frontend.
2. **DB-backed content** — products/benefits/eligibility/simulation rules are rows, not hardcoded pages.
3. **Version financial logic** — simulation rules are versioned; an application stores which version priced it.
4. **Snapshot on submit** — applications store a snapshot of product + simulation data at submission time; later product edits must not rewrite history.
5. **Every mutation is audited** — status changes, assignment, product publish, rate changes, user/role changes.
6. **Deny-by-default RBAC**, enforced server-side only (UI hiding is not security).
7. **Manager hierarchy must be acyclic** — validate before persisting any `manager_id` change.
8. **No arbitrary status PATCH** — workflow transitions are command endpoints (`/submit`, `/approve`, `/reject`, etc.), each checking state + permission + scope + audit.

---

## Backend module layout (`Backends/src/`)

```
auth/  users/  organization/  roles/  permissions/
products/  product-rates/  simulator/
applications/  workflow/  audit/  files/  health/
```

## Frontend route layout (`Frontends/src/`, matched in `App.tsx`)

```
views/public/  → /, /products, /products/:slug, /products/:slug/simulate, /apply, /application/success/:reference
views/admin/   → /admin/login, /admin/dashboard, /admin/applications, /admin/applications/:id,
                 /admin/products, /admin/products/:slug/simulation-rules,
                 /admin/organization (also serves /admin/users, /admin/roles), /admin/audit
```

Currently rendered from `src/data/mockData.ts` — every view needs its data source swapped from mock data to real API calls once `Backends/` exists. No page should be assumed "done" until that swap happens (per "API is the source of truth").

---

## Minimum schema to unblock early work

Core tables (full column list in ARCHITECTURE.md §8.2): `users` (self-referencing `manager_id`), `roles`, `permissions`, `user_roles`, `products`, `product_benefits`, `product_documents`, `product_eligibility`, `simulation_rule_versions`, `simulation_runs`, `applications`, `application_assignments`, `application_status_history`, `application_notes`, `audit_logs`.

Key constraints to build in from day one:
- `simulation_rule_versions`: unique `(product_id, version)`
- `applications.reference_no`: unique, generated on submit
- `products.status`: `DRAFT | PUBLISHED | ARCHIVED` — only `PUBLISHED` is public
- `applications.status`: `DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED | REJECTED`

---

## API conventions

- Prefix everything `/api/v1/...`
- Public: `GET /products`, `GET /products/:slug`, `POST /simulations`, `POST /applications`, `POST /applications/:id/submit`
- Admin: auth + CRUD + command endpoints per workflow (see ARCHITECTURE.md §12)

---

## Frontend ↔ backend wiring

- Browser calls NestJS **directly** on its own origin (`:3001` locally) — **direct CORS**, not a proxy/rewrite.
- NestJS must configure CORS to allow the frontend origin (`:3000` locally / actual domain in deployment), with credentials enabled if cookie-based sessions are used.

## File storage (hero images, brochures)

- **Local disk volume** for MVP — NestJS writes uploads to a Docker volume and serves them itself (via the `files/` module). No S3/MinIO for MVP; revisit only if production hosting requires it.

---

## Phase 1 — Foundation checklist (when we resume build)

- [ ] Repo scaffold: `Backends/` (NestJS) — `Frontends/` is already scaffolded
- [ ] `docker-compose.yml`: frontend, backend, postgres, uploads volume (+ optional Adminer)
- [ ] NestJS CORS config allowing frontend origin
- [ ] Prisma init + first migration (users/roles/permissions/products skeleton)
- [ ] Shared TS types/contracts location (`packages/contracts` or equivalent)
- [ ] `GET /health`, `GET /ready` (ready = verifies Postgres connectivity)
- [ ] Review and strip the AI-Studio/Lovable leftovers in `Frontends/` not used by this project: `@google/genai` dependency, `express`/`dotenv`/`server.js` scaffolding, `.env.example`'s `GEMINI_API_KEY`/`APP_URL` — none of this is part of the insurance-MVP spec

---

## Status

Frontend scaffolded and adopted (`Frontends/`, React 19 + Vite + Tailwind + Framer Motion, currently on mock data). Backend not started (`Backends/` is empty). Next real milestone is the NestJS + Postgres + Docker Compose foundation, then wiring the frontend off mock data onto real endpoints.
