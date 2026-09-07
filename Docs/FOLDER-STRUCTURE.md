# Folder Structure

Living documentation of this repository's actual folder/file layout. Companion to `PRD.md`, `ARCHITECTURE.md`, and `ARCHITECTURE-ESSENTIAL.md`.

**Rule: every change that adds, removes, renames, or moves a folder (or meaningfully changes what's inside one) must be reflected here, with a new revision row below, in the same change.** This file describes what actually exists on disk today — not the aspirational structure (that lives in `ARCHITECTURE.md`).

---

## Revision history

| Date | Change | Notes |
|---|---|---|
| 2026-09-07 | Added `jsPDF` dependency; `Frontends/src/lib/csv.ts` and `receipt-pdf.ts` | Real CSV export (Applications Inbox) and a real PDF application receipt (public success page) — both were toast-only placeholders before, found via live testing. See `DATA-STRUCTURE.md`'s matching revision rows. |
| 2026-09-06 | Added `Frontends/src/lib/` (`api.ts`, `adapters.ts`) | New API-client layer for the frontend↔backend wiring pass — see `DATA-STRUCTURE.md`'s matching revision row for what's actually wired vs. still mock. Also added `Docs/API-COLLECTION.postman.json` (Postman/Insomnia-importable collection covering every endpoint) and `Docs/product-knowledge/` (research/reference docs for the dummy product catalogue). |
| 2026-09-06 | Removed `Frontends/src/components/common/QuickNavigator.tsx` | Dev/QA leftover from the AI-Studio/Lovable generation tool — a floating "Pratinjau Halaman" overlay rendered on every page (public and admin) exposing the full admin route map with no auth gate, and a dead link to a non-existent `/design-system` route. Not referenced anywhere in `PRD.md`/`ARCHITECTURE.md`. Removed its import + render call from `App.tsx` and deleted the file; verified the frontend still serves (HTTP 200, no console/HMR errors) with it gone. |
| 2026-09-06 | Backend scaffolded | `Backends/` now contains a real NestJS + Prisma app (see §3) plus a `Dockerfile`/`.dockerignore`. Root `docker-compose.yml` added, wiring `postgres` + `backend` + `frontend` together; `Frontends/` also got a `Dockerfile`/`.dockerignore` so it runs in that compose stack instead of only standalone. |
| 2026-09-06 | Reverted backend folder name | `insurance-backend-mvp/` → `Backends/`. Frontend kept its generic `Frontends/` name after adoption, so backend follows the same plural-generic convention for consistency. Supersedes the rename recorded in the row below. |
| 2026-09-06 | Initial version | Documents the repo after: adopting the design-pass output as the permanent frontend (`insurance-frontends-mvp` → `Frontends/`), renaming `Backends/` → `insurance-backend-mvp/` (later reverted, see row above), and adding this Docs governance set. |

---

## 1. Top-level

```
insurance-mvp/
├── Docs/                     product, architecture, and process documentation
├── Frontends/                React + Vite frontend app — auth/applications/dashboard/products wired to Backends/, rest still on mock data (see §2)
├── Backends/                 NestJS + Prisma backend — real, implemented and verified (see §3)
├── docker-compose.yml        wires postgres + backend + frontend together for local dev
└── README.md                 project overview
```

## 2. `Frontends/` (actual, as of this revision)

```
Frontends/
├── README.md
├── index.html
├── metadata.json            app name/description (from the design-pass export)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── Dockerfile               dev-mode container (npm install, npm run dev on :3000)
├── .dockerignore
├── .env.example             contains unused AI-Studio leftovers — see Docs/ARCHITECTURE-ESSENTIAL.md cleanup note
├── public/
│   └── assets/
└── src/
    ├── main.tsx
    ├── App.tsx              route matching for both public + admin surfaces
    ├── index.css            Tailwind entry + design tokens (color/font variables)
    ├── types.ts             frontend-side data shapes — see Docs/DATA-STRUCTURE.md for drift vs. canonical schema
    ├── lib/
    │   ├── api.ts           typed fetch client, one function per Backends/ endpoint (see Docs/API-LIST-V0.md)
    │   ├── adapters.ts      converts backend response shapes into the frontend's existing mock-era types
    │   ├── csv.ts           minimal CSV escaping + real browser download (no library)
    │   └── receipt-pdf.ts   generates the real application-receipt PDF (jsPDF), client-side only
    ├── context/
    │   └── AppContext.tsx   app-wide state — real for auth/applications/staff/audit/products/public submit funnel, still mock for simulation rules & product-CMS edits
    ├── data/
    │   └── mockData.ts      still used for: simulation rule display data, and the public simulate/apply funnel (not yet wired)
    ├── components/
    │   ├── common/          Navbar, Footer, Button, Modal, StatusChip, ToastContainer
    │   └── admin/           AdminLayout
    └── views/
        ├── public/          HomeView, CatalogueView, ProductDetailView, SimulatorView, ApplyView, SuccessView
        └── admin/           AdminLoginView, AdminDashboardView, ApplicationsInboxView, ApplicationDetailView,
                              ProductCmsView, SimulationRulesView, OrganizationView, AuditLogView
```

## 3. `Backends/` (real, implemented and verified as of this revision)

Module layout is a deliberately simplified version of `ARCHITECTURE-ESSENTIAL.md`'s target — no separate `organization/`, `roles/`, `permissions/`, `product-rates/`, `workflow/`, or `files/` modules; see the "Deliberately not implemented" note in `DATA-STRUCTURE.md` §2 for why (RBAC is a fixed enum + static permission map instead of DB-backed roles; hierarchy lives on `users/`; simulation rules live in their own `simulation-rules/` module instead of folded into products; workflow transitions live directly in `applications/`).

```
Backends/
├── README.md                how to run locally, module list, demo login credentials
├── Dockerfile                dev-mode container (npm install, prisma generate, npm run dev on :3001)
├── .dockerignore
├── .env.example
├── package.json
├── nest-cli.json
├── tsconfig.json / tsconfig.build.json
├── prisma/
│   ├── schema.prisma        real, implemented schema — see DATA-STRUCTURE.md §2
│   ├── seed.ts               seeds 7 staff users (one per StaffRole), 6 products, 1 ACTIVE rule version each, 6 sample applications
│   └── migrations/           one folder per schema change (`<timestamp>_<name>/`) — don't enumerate these here, see DATA-STRUCTURE.md's revision history for what each schema change was
└── src/
    ├── main.ts               global prefix /api/v1, CORS, cookie-parser, ValidationPipe
    ├── app.module.ts
    ├── prisma/               PrismaService + PrismaModule
    ├── auth/                 login/logout/me, JwtAuthGuard, PermissionsGuard, static role→permission map
    ├── users/                admin user list/create, manager assignment with cycle detection
    ├── products/             public list/detail, admin CRUD + publish/archive
    ├── simulation-rules/     admin: list/create draft/activate rule versions
    ├── simulator/            POST /simulations + SimulationEngine (the real premium calculation)
    ├── applications/         public create+submit, admin inbox/detail/workflow actions/dashboard summary
    ├── audit/                AuditService (write) + admin GET /audit (read)
    └── health/               GET /health, GET /ready
```

Full endpoint-by-endpoint detail lives in `API-LIST-V0.md`.

## 4. `Docs/`

```
Docs/
├── PRD.md                       product requirements — problem, solution, business rules, scope
├── ARCHITECTURE.md              full system architecture — schema, API surface, security, testing
├── ARCHITECTURE-ESSENTIAL.md    distilled architecture — what's needed to build & stay consistent (authoritative on conflict with ARCHITECTURE.md)
├── DATA-STRUCTURE.md            living data-model doc — canonical schema + drift tracking (this doc's sibling)
├── FOLDER-STRUCTURE.md          this file
├── AGENT.md                     mandate for any agentic AI working in this repo
├── API-LIST-V0.md               living API endpoint list, updated as the backend is built
├── FRONTEND-DESIGN-PROMPT.md    design brief used to generate the frontend's visual direction
├── DUMMY_ACCESS.md              local demo access: URLs, seeded users, per-role can/can't
├── API-COLLECTION.postman.json  every endpoint, importable directly into Postman or Insomnia
└── product-knowledge/           research/reference notes behind the dummy PRAXIS product catalogue (see its own README)
```

---

## 5. Naming notes

- `Frontends/` and `Backends/` deliberately use the same plural-generic naming convention — the frontend kept this name when its design-pass output was adopted, and the backend follows suit for consistency (see revision history above; it briefly went through `insurance-backend-mvp/` before being reverted).
- Root folder casing (`insurance-mvp` vs `Insurance-mvp`) is inconsistent across earlier history in this project due to the OS's case-insensitive filesystem — they are the same directory, not a duplicate.
