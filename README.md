# Insurance MVP

A lightweight digital insurance product discovery and lead/application platform (Indonesia market) — a public site for browsing insurance products, running a premium illustration, and submitting an application, plus an internal admin portal for reviewing and processing those applications through a manager-hierarchy approval workflow.

This is a business-process **MVP prototype**, not a production purchasing/underwriting platform. See [`Docs/PRD.md`](Docs/PRD.md) §6 for explicit in-scope/out-of-scope boundaries.

## Status

🔌 **Mostly wired.** [`Backends/`](Backends/) is a real, implemented, and verified NestJS + Prisma API. [`Frontends/`](Frontends/) ("PRAXIS Insurance") now calls it for real for: the entire public conversion funnel (browse → simulate → apply → submit), admin login/logout/session restore, the application review workflow (inbox, detail, start-review/approve/reject, assignment, internal notes, CSV export), and the dashboard. Still running on mock data ([`src/data/mockData.ts`](Frontends/src/data/mockData.ts)): Product CMS edits, Simulation Rules management, and Organization/Users management. See [`Docs/DATA-STRUCTURE.md`](Docs/DATA-STRUCTURE.md) for exactly what's wired vs. mock, and [`Docs/API-COLLECTION.postman.json`](Docs/API-COLLECTION.postman.json) to exercise the full API directly. [`docker-compose.yml`](docker-compose.yml) runs all three services (frontend, backend, Postgres) together locally.

## Stack

- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS v4 + Framer Motion — see [`Frontends/README.md`](Frontends/README.md)
- **Backend:** NestJS + Prisma (modular monolith) — see [`Backends/README.md`](Backends/README.md)
- **Database:** PostgreSQL
- **Typography:** Plus Jakarta Sans
- **Local environment:** Docker Compose (`docker compose up` — see below)

## Running locally

```
docker compose up --build
```

Starts Postgres (`:5432`), the backend (`:3001`), and the frontend (`:3000`). First run only, apply migrations and seed demo data into the backend container:

```
docker compose exec backend npm run prisma:migrate
docker compose exec backend npm run prisma:seed
```

Demo admin logins: any seeded staff email (e.g. `sarah.wijaya@praxis.co.id`) with password `praxis123` — full list with per-role capabilities in [`Docs/DUMMY_ACCESS.md`](Docs/DUMMY_ACCESS.md).

## Docs

| Doc | What it's for |
|---|---|
| [`Docs/PRD.md`](Docs/PRD.md) | Product requirements — problem, solution, business rules, scope |
| [`Docs/ARCHITECTURE.md`](Docs/ARCHITECTURE.md) | Full system architecture — schema, API surface, security, testing |
| [`Docs/ARCHITECTURE-ESSENTIAL.md`](Docs/ARCHITECTURE-ESSENTIAL.md) | Distilled version — only what's needed to start building and stay consistent (wins on conflict with ARCHITECTURE.md) |
| [`Docs/DATA-STRUCTURE.md`](Docs/DATA-STRUCTURE.md) | Living data-model doc — canonical schema + drift tracking, with revision history |
| [`Docs/FOLDER-STRUCTURE.md`](Docs/FOLDER-STRUCTURE.md) | Living repo folder/file layout, with revision history |
| [`Docs/AGENT.md`](Docs/AGENT.md) | Mandate any agentic AI must follow when working in this repo |
| [`Docs/API-LIST-V0.md`](Docs/API-LIST-V0.md) | Living backend API endpoint list, with revision history |
| [`Docs/FRONTEND-DESIGN-PROMPT.md`](Docs/FRONTEND-DESIGN-PROMPT.md) | Design brief for generating the frontend visual direction |
| [`Docs/DUMMY_ACCESS.md`](Docs/DUMMY_ACCESS.md) | Local demo access — URLs, seeded users, per-role capabilities |
| [`Docs/API-COLLECTION.postman.json`](Docs/API-COLLECTION.postman.json) | Every endpoint, importable into Postman or Insomnia |
| [`Docs/product-knowledge/`](Docs/product-knowledge/) | Research/reference notes behind the dummy PRAXIS product catalogue |

## Structure

```
insurance-mvp/
├── Docs/                     product/architecture docs (see table above)
├── Backends/                 NestJS + Prisma API (implemented, verified)
├── Frontends/                React + Vite app (mostly wired to Backends/ — see Status above)
└── docker-compose.yml        runs all three services together
```

## Scope at a glance

**Public:** product catalogue → product detail → premium simulator (illustration only) → application submission → confirmation.

**Admin:** login → dashboard → application inbox/detail → status workflow (`SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED`) → assignment via manager hierarchy → product CMS → simulation rule versioning → audit log.

Explicitly out of scope for this MVP: policy issuance, payments, KYC, medical underwriting, claims processing, mobile apps. Full list in [`Docs/PRD.md`](Docs/PRD.md) §6.
