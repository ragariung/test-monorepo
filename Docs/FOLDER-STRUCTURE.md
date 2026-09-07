# Folder Structure

Living documentation of this repository's actual folder/file layout. Companion to `PRD.md`, `ARCHITECTURE.md`, and `ARCHITECTURE-ESSENTIAL.md`.

**Rule: every change that adds, removes, renames, or moves a folder (or meaningfully changes what's inside one) must be reflected here, with a new revision row below, in the same change.** This file describes what actually exists on disk today — not the aspirational structure (that lives in `ARCHITECTURE.md`).

---

## Revision history

| Date | Change | Notes |
|---|---|---|
| 2026-09-07 | Added `Frontends/src/components/common/ChatWidget.tsx` and `Frontends/src/lib/chat-api.ts` | The actual chat UI for the "PRAXIS Assistant" workflow — a floating widget rendered on every public page (wired in `App.tsx`, not `admin/*`). Talks directly to n8n's Chat Trigger webhook (`VITE_CHAT_WEBHOOK_URL` in `docker-compose.yml`), not `Backends/` — kept in its own `lib/chat-api.ts` rather than `api.ts` since the contract and backend are different (see `Automation/README.md`). Session id is a `crypto.randomUUID()` persisted in `sessionStorage` (per-tab, matches the n8n workflow's now in-RAM-only memory — see next row). |
| 2026-09-07 | Added a `Chat Memory` node to `Automation/workflows/praxis-assistant-001.json` | Multi-turn conversations need the agent to remember earlier turns in the same session (e.g. name given two messages ago); the workflow had no memory node until this change, so every message was answered in isolation. Uses n8n's `memoryBufferWindow` (in-RAM, keyed by the Chat Trigger's own `sessionId`, last 10 turns) — see `Automation/README.md`'s workflow diagram. |
| 2026-09-07 | Added `Automation/` (self-hosted n8n) and `Backends/src/applications/leads.controller.ts` | New top-level folder for the "PRAXIS Assistant" chat workflow platform — see its own `Automation/README.md` and `DATA-STRUCTURE.md`/`API-LIST-V0.md`'s matching revision rows for the new `POST /leads` endpoint and schema change it required. `docker-compose.yml` got a new `n8n` service (image-only, no Dockerfile — same precedent as `postgres`). Key design choice: n8n's native Git-based Source Control feature requires a paid license, so workflow portability instead uses n8n's free CLI export/import, with exported JSON bind-mounted into `Automation/workflows/` so it's an ordinary git-tracked file — see `Automation/README.md` for the full mechanism. |
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
├── Frontends/                React + Vite frontend app — auth/applications/dashboard/products/public funnel wired to Backends/, rest still on mock data (see §2)
├── Backends/                 NestJS + Prisma backend — real, implemented and verified (see §3)
├── Automation/                self-hosted n8n ("PRAXIS Assistant" chat workflow) — see §4
├── docker-compose.yml        wires postgres + backend + frontend + n8n together for local dev
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
    │   ├── chat-api.ts      typed client for the n8n "PRAXIS Assistant" chat webhook (Automation/) - separate from api.ts, different backend/contract
    │   ├── adapters.ts      converts backend response shapes into the frontend's existing mock-era types
    │   ├── csv.ts           minimal CSV escaping + real browser download (no library)
    │   └── receipt-pdf.ts   generates the real application-receipt PDF (jsPDF), client-side only
    ├── context/
    │   └── AppContext.tsx   app-wide state — real for auth/applications/staff/audit/products/public submit funnel, still mock for simulation rules & product-CMS edits
    ├── data/
    │   └── mockData.ts      still used for: simulation rule display data, and the public simulate/apply funnel (not yet wired)
    ├── components/
    │   ├── common/          Navbar, Footer, Button, Modal, StatusChip, ToastContainer, ChatWidget (public pages only)
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
    ├── applications/         public create+submit + lead capture (leads.controller.ts), admin inbox/detail/workflow actions/dashboard summary
    ├── audit/                AuditService (write) + admin GET /audit (read)
    └── health/               GET /health, GET /ready
```

Full endpoint-by-endpoint detail lives in `API-LIST-V0.md`.

## 4. `Automation/` (n8n — the "PRAXIS Assistant" chat workflow)

```
Automation/
├── README.md              what n8n is for here, how to run it, Gemini API key setup, the git-portability mechanism
├── .env.example            reference-only (same pattern as Backends/.env.example — not consumed by docker-compose.yml)
├── workflows/               git-tracked exported workflow JSON — the actual portability mechanism (see README)
│   └── praxis-assistant-001.json
└── scripts/
    ├── export-workflows.sh  writes workflow JSON here after editing in the n8n UI
    └── import-workflows.sh  restores workflows from here on a fresh/different machine
```

No Dockerfile — uses the official `n8nio/n8n` image directly in `docker-compose.yml` (same precedent as the `postgres` service), pinned to `n8nio/n8n:2.37.10`. SQLite backing store, isolated in its own `n8n_data` named volume — not shared with the app's Postgres database. The Gemini API key (LLM provider) is stored as an n8n credential in its own encrypted store, not committed to git or put in `docker-compose.yml`.

`praxis-assistant-001.json` is an AI Agent (`@n8n/n8n-nodes-langchain.agent`) with two tools attached (`toolHttpRequest` nodes calling `Backends/`'s `GET /products` and `POST /leads`) plus a Gemini chat model node — node types/versions and the `ai_languageModel`/`ai_tool` connection schema were confirmed against this exact pinned n8n version's own installed node source (not assumed from docs, which lag reality), then verified by importing into the running instance and round-tripping an export back out to confirm every node and connection survived intact.

**`N8N_BASIC_AUTH_ACTIVE`/`_USER`/`_PASSWORD` are deprecated and non-functional in n8n v2** (confirmed live — requests succeeded with and without credentials) — not set in `docker-compose.yml`. n8n v2 uses its own built-in owner account instead, created via a one-time setup screen on first UI visit.

## 5. `Docs/`

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

## 6. Naming notes

- `Frontends/` and `Backends/` deliberately use the same plural-generic naming convention — the frontend kept this name when its design-pass output was adopted, and the backend follows suit for consistency (see revision history above; it briefly went through `insurance-backend-mvp/` before being reverted).
- Root folder casing (`insurance-mvp` vs `Insurance-mvp`) is inconsistent across earlier history in this project due to the OS's case-insensitive filesystem — they are the same directory, not a duplicate.
