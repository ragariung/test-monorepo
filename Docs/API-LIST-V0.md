# API List — v0

Living list of this project's backend API surface. "v0" refers to this document's own revision track (the pre-launch/MVP-build documentation pass), independent of the API's own URL versioning (`/api/v1/...`).

**Rule: every backend change that adds, changes, removes, or deprecates an endpoint must be reflected here, with a new revision row below, in the same change.** This file describes what actually exists in `Backends/` — not just what's planned.

---

## Revision history

| Date | Change | Notes |
|---|---|---|
| 2026-09-07 | `POST /simulations` and `POST /leads` both gained an optional `sessionId`; `POST /leads` also gained an optional `simulationRunId` | Lets the "PRAXIS Assistant" chat workflow (`Automation/`) offer a real premium quote (Uang Pertanggungan/Masa Pembayaran/Frekuensi Bayar) and have it saved with a captured lead. `POST /simulations`'s `sessionId` is just persisted onto the new `SimulationRun`. `POST /leads`: if `simulationRunId` is given, that exact `SimulationRun` is validated (must belong to the same `productId`) and attached; else if `sessionId` is given, `ApplicationsService.createLead()` looks up the most recent valid `SimulationRun` for that `(sessionId, productId)` pair itself and attaches it if found (no error if none exists — a lead with no prior simulation is normal). Deliberately **not** relying on the chatbot's LLM to carry an opaque `simulationRunId` across conversation turns — found unreliable in live testing (`Automation/README.md`'s "Bugs found and fixed" #3) — so the n8n workflow sends `sessionId` via a plain n8n expression, not a model-supplied argument. See `DATA-STRUCTURE.md`'s matching revision row for the `SimulationRun.sessionId` schema change. Verified live: simulate with sessionId → capture lead with same sessionId, no simulationRunId → resulting `Application.simulationSnapshot` has the real premium figures; explicit bad `simulationRunId` → 404; no simulation in session → lead still captures fine with `simulationSnapshot: null` (unchanged prior behavior). |
| 2026-09-07 | New public endpoint: `POST /leads` | Backs the "PRAXIS Assistant" n8n chat workflow (`Automation/`) — see `DATA-STRUCTURE.md`'s matching revision row for the schema change this required (several `Application` columns relaxed to nullable) and why. Lightweight lead capture: creates an `Application` with `status: DRAFT`, no `simulationRunId` needed. `productId` is required (chat always resolves a product first) and `consent: true` is required (mirrors `POST /applications`'s consent gate — PRD.md §9 applies to leads too, not just formal submissions); at least one of `applicant.email`/`applicant.phone` is required, everything else about the applicant is optional. Writes an `ApplicationStatusHistory` row (`null → DRAFT`) and an audit log entry (`LEAD_CAPTURED`, actor `PRAXIS Assistant (n8n)`). Verified live: happy path (201), missing both contact methods (400), consent false (400), unknown productId (404), and confirmed the resulting row is `DRAFT` with an audit entry. |
| 2026-09-07 | `GET /admin/applications` list rows now include `sumAssured`, `paymentTermYears`, `estimatedMonthlyPremium`; detail's `simulationSnapshot` now includes `sumAssured`/`paymentTermYears`/`paymentFrequency` | Found via live testing: the Applications Inbox showed "Rp 0" for Uang Pertanggungan and Estimasi Premi on every row. Root cause: `simulationSnapshot` (written at submit time, both the real path and `prisma/seed.ts`) never captured `sumAssured`/`paymentTermYears` in the first place — only the premium figures — and `mapInboxRow()` didn't expose any simulation data to the list endpoint at all. Fixed at the source (`applications.service.ts`'s `createAndSubmit()` and `mapInboxRow()`, plus `seed.ts`), not patched in the frontend. Note: there is no `GET /applications` (only `POST /applications` exists publicly) — reading applications requires `GET /admin/applications` (authenticated). Quarterly/semi-annual/annual premium and total-estimated-payment are still detail-only, not exposed on the list row (only "estimated monthly premium" is, since that's the only premium figure the inbox table itself renders). |
| 2026-09-07 | Frontend now calls `POST /simulations` and `POST /applications` | Closes the public conversion funnel (the actual core business flow per `PRD.md`'s "primary conversion funnel"). Found via live testing that a submitted public application never reached the backend. See `DATA-STRUCTURE.md`'s matching revision row for the full fix. Verified live: simulate → submit → application confirmed present in `GET /admin/applications`. |
| 2026-09-06 | Frontend wiring, phase 1 — see `DATA-STRUCTURE.md`/`FOLDER-STRUCTURE.md` for the code-side detail | `Frontends/` now actually calls: `POST /auth/login`, `POST /auth/logout`, `GET /me`, `GET /admin/applications`, `GET /admin/applications/:id`, `POST .../start-review`, `POST .../approve`, `POST .../reject`, `POST .../assign`, `POST .../notes`, `GET /admin/users`, `GET /admin/audit`, `GET /products` (public). Every response shape was verified live against the running stack before being adapted into the frontend's pre-existing types — see `Frontends/src/lib/adapters.ts`. Not yet called by the frontend: `GET /admin/dashboard/summary` (the dashboard view still aggregates client-side from the now-real `applications`/`auditLogs` arrays, which is accurate at MVP data volumes but won't scale — a documented v0 simplification, not a bug), `POST /applications`, `POST /simulations` (public funnel still mock), all of Admin Products/Simulation Rules/Users-write/Organization (CMS-style admin screens still mock). Also added a companion Postman/Insomnia collection: `Docs/API-COLLECTION.postman.json`. |
| 2026-09-06 | Tightened `POST /admin/applications/:id/notes` permission | Was `applications:read`; changed to a new `applications:note` permission. Cause: adding the `AUDITOR` role (which holds `applications:read` for viewing) would otherwise have let a "read-only, no mutation" role add notes — a real contradiction of its own documented purpose. `applications:note` is granted to `UNDERWRITER_MANAGER`, `SENIOR_UNDERWRITER`, `UNDERWRITER`, and `TELE_CONSULTANT` (preserving "any operational staff can add a note"), but not `AUDITOR`. Verified live: auditor → 403, tele-consultant → 201. |
| 2026-09-06 | Backend implemented — every endpoint below flipped to `Implemented` | Built from a full read-through of every `Frontends/` view + its mock data/business logic, so the surface below is grounded in what the UI actually needs (plus a few PRD-required endpoints the current frontend doesn't call yet, flagged below). Verified end-to-end over real HTTP against a live Postgres during the build (login/logout/me, permission enforcement, the full application state machine incl. 409s on invalid transitions, assignment, notes, dashboard counts, rule draft/activate incl. auto-retiring the old `ACTIVE` version, product CMS incl. publish/archive, manager-cycle rejection, audit log). Three deviations from the original plan seeded in the 2026-09-06 "Initial version" row: (1) `POST /applications` creates **and** submits atomically (`status: SUBMITTED` immediately) instead of the two-step `POST /applications` (draft) → `POST /applications/:id/submit` — the real frontend never uses a save-as-draft flow, so the two-step version would be unused complexity; (2) added `GET /admin/dashboard/summary` (not in the original architecture doc) because the real dashboard view needs aggregate counts and must not fetch the entire unpaginated applications table client-side to compute them; (3) reference-number format resolved to `PRX-{year}-{5-digit-random}`, matching the frontend mock's own format exactly. |
| 2026-09-06 | Initial version | Seeded from the planned API surface in `ARCHITECTURE.md` §12. `Backends/` does not exist yet — every endpoint below is status `Planned`. |

---

## Status legend

- **Planned** — designed, not implemented.
- **Implemented** — exists in `Backends/`, matches this doc.
- **Changed** — implemented but with a documented deviation from the original plan (see Notes).
- **Deprecated** — was implemented, no longer available.

All routes are prefixed `/api/v1`. Auth is a JWT in an httpOnly `praxis_session` cookie (`credentials: true` CORS, no bearer-token flow). Permission strings are checked against a static role→permission map in `Backends/src/auth/role-permissions.ts` — see `DATA-STRUCTURE.md` §2 for why this replaced a DB-backed roles/permissions schema.

---

## Public API

| Method | Path | Auth | Status | Notes |
|---|---|---|---|---|
| GET | `/products` | none | Implemented | `PUBLISHED` products only, with benefits/coverage/eligibility/documents included |
| GET | `/products/:slug` | none | Implemented | 404 if missing or not `PUBLISHED` |
| POST | `/simulations` | none | Implemented | Server-side only; loads product's `ACTIVE` `SimulationRuleVersion`, runs `SimulationEngine`, persists a `SimulationRun` (valid or not), returns premiums + a fixed illustration disclaimer. Optional `sessionId` (chat workflow only) is persisted onto the `SimulationRun` for later auto-attach by `POST /leads` |
| POST | `/applications` | none | Changed | Single-shot create+submit (see revision note above) — not the two-step `DRAFT`→`submit` originally planned. Requires `consent: true`; references an existing `simulationRunId`; snapshots product + simulation; generates `referenceNo`; writes initial status history + audit log |
| POST | `/leads` | none | Implemented | Not in the original architecture doc — added for the "PRAXIS Assistant" n8n chat workflow (`Automation/`). Creates a `DRAFT` application with no simulation attached by default; `productId` + `consent: true` required, at least one of `applicant.email`/`applicant.phone` required, everything else about the applicant optional. Optional `simulationRunId` (explicit) or `sessionId` (auto-lookup of the most recent valid `SimulationRun` for that session+product) attaches a real premium quote to the lead — see revision row above |

## Admin API — auth

| Method | Path | Auth | Status | Notes |
|---|---|---|---|---|
| POST | `/auth/login` | none | Implemented | `{ email, password }`, argon2 verify, sets `praxis_session` cookie; generic 401 on failure (no user-enumeration) |
| POST | `/auth/logout` | session | Implemented | Clears the cookie |
| GET | `/me` | session | Implemented | Returns current user's public profile (never the password hash) |

## Admin API — applications

| Method | Path | Auth | Status | Notes |
|---|---|---|---|---|
| GET | `/admin/applications` | session + `applications:read` | Implemented | Filters: `status`, `productId`, `assignedTo` (user id or `unassigned`), `search` (ref/name/email/phone); paginated (`page`, `pageSize`, max 100). Each row includes `sumAssured`, `paymentTermYears`, `estimatedMonthlyPremium` (read from the application's `simulationSnapshot`) |
| GET | `/admin/applications/:id` | session + `applications:read` | Implemented | Full detail incl. notes + status history, newest first. **Not scoped** to assigned reviewer/manager in v0 — any authenticated staff with the permission can view any application (documented simplification, see `role-permissions.ts` comment) |
| POST | `/admin/applications/:id/start-review` | session + `applications:review` | Implemented | `SUBMITTED → UNDER_REVIEW` only; 409 otherwise |
| POST | `/admin/applications/:id/approve` | session + `applications:approve` | Implemented | `UNDER_REVIEW → APPROVED` only; 409 otherwise |
| POST | `/admin/applications/:id/reject` | session + `applications:reject` | Implemented | Valid from `SUBMITTED` or `UNDER_REVIEW`; `reason` required (400 if blank) |
| POST | `/admin/applications/:id/assign` | session + `applications:assign` | Implemented | `{ userId: string \| null }`; closes any current assignment, opens a new one (or leaves unassigned) |
| POST | `/admin/applications/:id/notes` | session + `applications:note` | Implemented | Any operational staff role can add an internal note — deliberately excludes `AUDITOR` (read-only) |
| GET | `/admin/dashboard/summary` | session + `applications:read` | Implemented | **Added beyond the original plan** — see revision note above |

## Admin API — products & simulation rules

| Method | Path | Auth | Status | Notes |
|---|---|---|---|---|
| GET | `/admin/products` | session + `products:read` | Implemented | All statuses, with related content |
| POST | `/admin/products` | session + `products:write` | Implemented | Creates `DRAFT`. **The current frontend's "Add Product" button doesn't call this yet** — it only shows a toast (`ProductCmsView`). Endpoint exists per PRD requirement, ready for the frontend to wire up |
| PATCH | `/admin/products/:id` | session + `products:write` | Implemented | Matches exactly what `ProductCmsView`'s edit form sends |
| POST | `/admin/products/:id/publish` | session + `products:publish` | Implemented | |
| POST | `/admin/products/:id/archive` | session + `products:publish` | Implemented | |
| GET | `/admin/products/:id/simulation-rules` | session + `simulation_rules:read` | Implemented | Newest version first |
| POST | `/admin/products/:id/simulation-rules` | session + `simulation_rules:write` | Implemented | Creates a `DRAFT` version, `version` = max existing + 1. **The current frontend's `SimulationRulesView` sandbox edits local component state only** — it isn't wired to this endpoint yet (see `DATA-STRUCTURE.md` §3 for the related mock calculation bug) |
| PATCH | `/admin/simulation-rules/:id/activate` | session + `simulation_rules:write` | Implemented | Atomically retires the previous `ACTIVE` version for that product, verified during build |

## Admin API — users, organization, audit

| Method | Path | Auth | Status | Notes |
|---|---|---|---|---|
| GET | `/admin/users` | session + `users:manage` | Implemented | Never returns the password hash |
| POST | `/admin/users` | session + `users:manage` | Implemented | **Not called by the frontend yet** — `OrganizationView`'s "Undang Karyawan Baru" button only shows a toast |
| PATCH | `/admin/users/:id/manager` | session + `organization:manage` | Implemented | Walks the proposed manager chain upward; rejects direct and indirect cycles with 400 — verified during build. **Not called by the frontend yet** — `OrganizationView` only displays a static hierarchy tree, no edit UI |
| GET | `/admin/audit` | session + `audit:read` | Implemented | Filters: `search`, `action`. Capped at 200 rows, newest first — no pagination yet (v0 limitation, fine at current data volume) |

## Operational

| Method | Path | Auth | Status | Notes |
|---|---|---|---|---|
| GET | `/health` | none | Implemented | `{ status: 'ok' }` |
| GET | `/ready` | none | Implemented | Runs a real Prisma query; 503 on failure |

---

## Not implemented (out of `Backends/src/` scope for v0)

- Dynamic `roles`/`permissions`/`user_roles` tables — replaced by a static role→permission map (`DATA-STRUCTURE.md` §2).
- Per-record hierarchy-scoped access (e.g. "only my assigned applications or my reports'") — any user with the relevant permission can act on any application in v0. Revisit only once there's a real reason (multiple managers actually needing separation), per the anti-overengineering guidance in `ARCHITECTURE-ESSENTIAL.md`.
- File uploads (`files/` module) — no product hero-image/brochure upload endpoint yet; product `documents`/`heroImage` fields exist in the schema but nothing writes to disk yet.

## Resolved (previously open questions)

- Payment-frequency enum: backend canonical is `MONTHLY|QUARTERLY|SEMI_ANNUAL|ANNUAL`. The frontend mock's Indonesian labels still need a mapping layer when the frontend is wired up — see `DATA-STRUCTURE.md` §3.
- Reference-number format: `PRX-{year}-{5-digit-random}`, implemented.
