# Data Structure

Living documentation of this project's data model — the canonical database schema and how it currently maps (or doesn't yet) to what's actually implemented in code. Companion to `PRD.md`, `ARCHITECTURE.md`, and `ARCHITECTURE-ESSENTIAL.md`.

**Rule: every change to the database schema, Prisma models, or the frontend's data types (`Frontends/src/types.ts`) must be reflected here, with a new revision row below, in the same change.** This file must never silently go stale.

---

## Revision history

| Date | Change | Notes |
|---|---|---|
| 2026-09-07 | Fixed incomplete `Application.simulationSnapshot`; frontend adapters now read real sumAssured/paymentTerm/premium instead of hardcoded 0 | Found via live testing: the admin inbox showed "Rp 0" for every application's sum assured and premium. Two compounding bugs: (1) `simulationSnapshot` (built in `applications.service.ts`'s `createAndSubmit()`, and mirrored in `prisma/seed.ts`) never included `sumAssured`/`paymentTermYears` — only the premium figures — even though the PRD principle is that the snapshot preserves the full historical simulation context; (2) the list endpoint's `mapInboxRow()` didn't surface any simulation data at all, and separately, `Frontends/src/lib/adapters.ts`'s `adaptInboxRow`/`adaptApplicationDetail` hardcoded `sumAssured: 0, paymentTerm: 0` regardless of what the backend sent. Fixed both ends: backend now writes and exposes the complete snapshot (`sumAssured`, `paymentTermYears`, `paymentFrequency` added), frontend adapters now read those real fields (`FREQUENCY_TO_FRONTEND` added for the enum reverse-mapping). Re-seeded the database with the corrected snapshot shape (this also cleared any ad-hoc test applications submitted during this session's wiring work — acceptable for local seed data, called out here for transparency). Verified live: `GET /admin/applications` and `GET /admin/applications/:id` both confirmed returning real, non-zero values post-fix. |
| 2026-09-07 | Real receipt PDF; widened `AppContext.lastSubmission` | Found via live testing: `SuccessView`'s "Unduh Tanda Terima (PDF)" button was a toast-only placeholder that never produced a file. Added `Frontends/src/lib/receipt-pdf.ts` (`jsPDF` dependency, generated client-side, no server round-trip) building a real PDF acknowledgment receipt — applicant data, product/simulation snapshot, submission timestamp, the same "not a policy" notice shown on the page. This required widening `AppContext.lastSubmission` from `{ reference, preferredContactTimeLabel, productName }` to `{ reference, submittedAt, applicant, simulation, productName }`, since a real receipt needs the full applicant + simulation data, not just a display label. `SuccessView` now shows an explicit warning (rather than silently failing or fabricating data) if the receipt is requested after `lastSubmission` is gone (e.g. a hard refresh — it's in-memory only, unchanged limitation from the prior revision). |
| 2026-09-07 | Frontend wiring, phase 2: public simulate → apply → submit funnel + real CSV export | Found via live testing: a submitted public application didn't appear in the admin inbox, because `submitApplication` was still local-only (generated a fake reference, never called the backend). Fixed properly, not just patched: `SimulatorView` now calls the real `POST /simulations` on a 350ms debounce per parameter change (no more local `calculateSimulation()` — the server is the actual source of truth for the premium number, per the architecture principle), carrying the real `simulationRunId` forward; `ApplyView` now calls the real `POST /applications` with that id and awaits it, showing a real error message on failure instead of a fake 400ms timeout; `SuccessView` now reads a new `lastSubmission` context field (set on successful submit) instead of a fake local record, since submitted applications live in the real backend now, not the shared `applications` array. Added `SimulationResult.simulationRunId?: string` to `types.ts`, and `adaptSimulationResult`/`FREQUENCY_TO_BACKEND`/`CONTACT_TIME_TO_BACKEND` to `adapters.ts`. Along the way, fixed a latent crash risk in both `SimulatorView` and `ApplyView`: both assumed `products[0]` always exists, which was safe when `products` was synchronous mock data but not now that it's fetched async and starts empty — both views now guard with a loading state. Verified live end-to-end over real HTTP: simulate → submit → confirmed the application appears in `GET /admin/applications`. Also wired the Applications Inbox's "Ekspor Data (CSV)" button (was a toast-only placeholder) to fetch full detail for every currently-filtered application and generate a real CSV download, since the inbox list endpoint alone doesn't carry premium/sum-assured figures needed for follow-up. |
| 2026-09-06 | Frontend wiring, phase 1: auth + application review workflow + dashboard + public product listing | Added `Frontends/src/lib/api.ts` (typed fetch client, one function per endpoint) and `Frontends/src/lib/adapters.ts` (converts every backend response shape into the pre-existing mock-era frontend types, so views needed no JSX changes). Widened `StaffUser.role` in `Frontends/src/types.ts` to add `'Underwriter'` and `'Auditor'` (previously only 4 of the 6 real `StaffRole` values had a display label). `AppContext.tsx` now: restores session via `GET /me` on load (new `authLoading` flag added to the context, consumed by a new route guard in `App.tsx`), fetches real `applications`/`staffList`/`auditLogs` once authenticated, fetches `products` from the public endpoint unconditionally (fixes a real bug this would otherwise have caused: the admin inbox's product filter dropdown was about to be sourced from 6 mock products with fake ids like `prod-1`, which would never match the real UUIDs on fetched applications — filtering by product would have silently always returned zero rows). `updateApplicationStatus`/`assignApplication`/`addApplicationNote` now call the real API and re-fetch the affected application's full detail afterward (list vs. detail endpoints return different shapes — see `applications.service.ts`'s `mapInboxRow` vs. `detail()` — so a full re-fetch is simpler and more correct than trying to reconcile partial response shapes). All response shapes were verified against the live stack before writing the adapters (see the curl output referenced in this session), including confirming Prisma `Decimal` fields (`minSumAssured`, `maxSumAssured`, `baseAnnualRatePerMillion`) serialize as JSON **strings**, not numbers — `adapters.ts`'s `toNumber()` handles this. Still mock/local (Phase 2): the public simulate→apply→submit funnel, Product CMS edits, Simulation Rules management, Organization/Users management. |
| 2026-09-06 | Added `AUDITOR` to `StaffRole`; fixed a seed-ordering bug | Cross-checked the implemented role set against `PRD.md` §5's suggested RBAC table and found the "Read-only / Auditor" role had no counterpart at all — every other role could mutate something. Added `StaffRole.AUDITOR` (migration `20260906072002_add_auditor_role`) with read-only permissions (`applications:read, products:read, simulation_rules:read, audit:read`, no writes) in `role-permissions.ts`, seeded as Citra Aditama (independent of the underwriting reporting line, per PRD's compliance-function intent). Also seeded a demo `UNDERWRITER`-role user (Rangga Pradipta, reporting to Sarah Wijaya) — the role existed in `role-permissions.ts` but had no seeded account, and PRD's role names (Super Admin/Product Admin/Reviewer/Manager/Auditor) still don't literally match the implemented ones (Underwriter Manager/Senior Underwriter/Underwriter/Tele-Consultant/Admin/Auditor) — see the mapping table below. Along the way, fixed `prisma/seed.ts`'s `seedUsers()`: its manager-ordering used a single non-transitive sort pass that only correctly orders one level of "has a manager" vs. "doesn't" — it silently couldn't guarantee correct creation order for a 3-level chain (Rangga → Sarah → Bambang). Replaced with a proper dependency-respecting loop. Verified live: auditor login + `GET /admin/audit` (200) + a mutating action (403), and the full 3-level manager chain resolving correctly, all against the running `docker-compose` stack. |
| 2026-09-06 | Backend implemented — schema is now real, not aspirational | `Backends/prisma/schema.prisma` now exists and is the actual source of truth (superseding the `ARCHITECTURE.md` §8 sketch this file previously summarized). Two deliberate simplifications from the original architecture: (1) RBAC dropped the `roles`/`permissions`/`user_roles` tables in favor of a fixed `StaffRole` enum on `User` + a static in-code permission map (`Backends/src/auth/role-permissions.ts`) — matches how the frontend already modeled roles as one fixed enum per user with a static capability matrix (`OrganizationView`'s hardcoded `roleCapabilities` table); (2) `simulation_rule_versions.formula_config` is a concrete shape (`{ maxAgePlusTerm, ageBands[], termMultipliers[], frequencyFactors }`), not a generic formula-type-agnostic blob — per the "don't build a generic formula engine" call already made below. Also fixed a real bug found in the frontend mock: `mockData.ts`'s `calculateSimulation` never actually read its own `SimulationRuleVersion` mock records (hardcoded age/term factors inline instead) — the real backend's `SimulationEngine` genuinely computes from the `ACTIVE` rule version's `formulaConfig`. Seeded with the same 6 products, 5 staff users, and 6 sample applications the frontend mock uses, translated into the real schema. |
| 2026-09-06 | Initial version | Captured canonical schema from `ARCHITECTURE.md` §8 and documented current drift against the already-scaffolded frontend mock types (`Frontends/src/types.ts`). No backend/database exists yet. |

---

## 1. Current implementation status

| Layer | Status |
|---|---|
| PostgreSQL schema / Prisma models | **Implemented.** `Backends/prisma/schema.prisma`, migration `20260906065109_init` generated and verified against a live Postgres during the build. Not yet applied to any long-running dev database in this repo — run `prisma:migrate` + `prisma:seed` (see `Backends/README.md`) to stand one up. |
| Backend API | **Implemented**, verified end-to-end over HTTP (see `API-LIST-V0.md`). |
| Frontend mock data shapes | **Exists**, in `Frontends/src/types.ts` + `Frontends/src/data/mockData.ts`. Still what the frontend actually renders from — **not yet wired to the real API.** |
| Reconciliation between frontend types and backend schema | **Not done.** See §3 — this is the next real piece of work, not yet started. |

The frontend's mock types are still *not* the source of truth — the schema in §2 (now real, implemented code) is. Wiring `Frontends/` off mock data onto the real endpoints in `API-LIST-V0.md` is the next milestone.

---

## 2. Canonical schema (source of truth: `Backends/prisma/schema.prisma`)

Full column-level detail lives in the schema file itself — this is the entity summary for quick reference.

| Model | Purpose | Key constraints |
|---|---|---|
| `User` | Internal staff accounts | unique `email`; `role` ∈ `StaffRole` enum (`UNDERWRITER_MANAGER \| SENIOR_UNDERWRITER \| UNDERWRITER \| TELE_CONSULTANT \| ADMIN \| AUDITOR`); self-referencing `managerId` (hierarchy, validated acyclic on write) |
| `Product` | Insurance product content | unique `slug`; `status` ∈ `DRAFT \| PUBLISHED \| ARCHIVED`; `category` ∈ `LIFE \| FAMILY \| CRITICAL_ILLNESS \| EDUCATION \| SAVINGS \| INVESTMENT` |
| `ProductBenefit` / `ProductCoverageDetail` / `ProductEligibilityCondition` | Product content children | FK `productId`, cascade delete |
| `ProductDocument` | Brochure/RIPLAY/terms links | FK `productId`; `documentType` ∈ `BROCHURE \| RIPLAY \| TERMS \| OTHER` |
| `SimulationRuleVersion` | Versioned premium formula | unique `(productId, version)`; `status` ∈ `DRAFT \| ACTIVE \| RETIRED`; `formulaConfig` JSON — concrete shape, see §2.1 |
| `SimulationRun` | Immutable record of each simulation (valid or not) | FK `productId`, `ruleVersionId` |
| `Application` | Lead/application record | unique `referenceNo` (format `PRX-{year}-{5 digits}`); `status` ∈ `DRAFT \| SUBMITTED \| UNDER_REVIEW \| APPROVED \| REJECTED`; carries `productSnapshot` / `simulationSnapshot` JSON |
| `ApplicationAssignment` | Reviewer assignment history | FK `applicationId`, `assignedToId`, `assignedById`; current owner = latest row with `unassignedAt: null` |
| `ApplicationStatusHistory` | Workflow transition log | FK `applicationId`, `changedById` |
| `ApplicationNote` | Reviewer notes | FK `applicationId`, `authorId` |
| `AuditLog` | Append-only audit trail | `entityType` + `entityId` + `beforeData`/`afterData` JSON; `actorLabel` covers non-staff actors (e.g. public applicants) when `actorId` is null |

**Deliberately not implemented** (see the 2026-09-06 revision row above for why): a dynamic `roles`/`permissions`/`user_roles` RBAC schema, and a generic formula-type-agnostic simulation engine. Both were judged overengineering for this MVP relative to what the frontend and PRD actually require; revisit only if a real second formula shape or a need for per-user custom roles actually materializes.

### 2.0 `StaffRole` vs. `PRD.md` §5's suggested role names

The implemented roles are named after the frontend's already-built, insurance-specific taxonomy, not PRD.md's generic suggested names. PRD.md itself calls these "suggested," so this is a deliberate substitution, not an oversight — but the mapping is worth keeping explicit since the names don't correspond 1:1:

| `PRD.md` §5 suggested role | Implemented `StaffRole` | Note |
|---|---|---|
| Super Admin | `ADMIN` | Full match (`*` permission) |
| Product Admin | *(folded into)* `UNDERWRITER_MANAGER` | No standalone role — product/simulation-rule write permissions live on the manager role instead |
| Reviewer | `UNDERWRITER` | Read + review, no approve/reject |
| Manager | `SENIOR_UNDERWRITER`, `UNDERWRITER_MANAGER` | Both can approve/reject/assign — PRD's "direct/indirect team" scoping is **not** enforced (see `API-LIST-V0.md`'s documented v0 simplification: any user with the permission can act on any application) |
| Read-only / Auditor | `AUDITOR` | Added 2026-09-06 (was missing entirely until this row's revision) |
| *(no PRD equivalent)* | `TELE_CONSULTANT` | Frontend-specific: outreach staff, `applications:read` only |

### 2.1 `SimulationRuleVersion.formulaConfig` shape

```ts
interface FormulaConfig {
  maxAgePlusTerm: number;
  ageBands: { min: number; max: number; factor: number }[];
  termMultipliers: { term: number; multiplier: number }[];
  frequencyFactors: { MONTHLY: number; QUARTERLY: number; SEMI_ANNUAL: number; ANNUAL: number };
}
```

Non-negotiable data rules (see `ARCHITECTURE-ESSENTIAL.md` for the full list):
- Applications snapshot product + simulation data at submit time — never re-derive from current product state.
- A product may have multiple `SimulationRuleVersion`s; only one is `ACTIVE` at a time (activating one atomically retires the previous `ACTIVE` version — implemented in `Backends/src/simulation-rules/`).
- `AuditLog` is append-only — no update/delete path exposed by the API.

---

## 3. Known drift: frontend mock types vs. real backend schema

`Frontends/src/types.ts` itself was never changed to match the backend's enums (still Indonesian/title-case strings) — instead, `Frontends/src/lib/adapters.ts` bridges the two at the API-client boundary, so every view keeps consuming the exact same frontend-shaped types as before. That mapping layer now exists and is live for the areas listed as "Bridged" below; drift rows marked "Still open" apply to the parts of the app still running on mock data (see the 2026-09-06 wiring revision above).

| Concept | Backend (`Backends/prisma/schema.prisma`) | Frontend mock (`types.ts`) | Status |
|---|---|---|---|
| Application status | `DRAFT \| SUBMITTED \| UNDER_REVIEW \| APPROVED \| REJECTED` | `'Submitted' \| 'Under Review' \| 'Approved' \| 'Rejected'` | **Bridged** — `adaptInboxRow`/`adaptApplicationDetail` map via `APPLICATION_STATUS_LABELS` (identical strings to the backend's own `status-labels.ts`) |
| Product status | `DRAFT \| PUBLISHED \| ARCHIVED` | `'Draft' \| 'Published' \| 'Archived'` | **Bridged** — `adaptProduct` via `PRODUCT_STATUS_LABELS` |
| Product category | `LIFE \| FAMILY \| CRITICAL_ILLNESS \| ...` | `'life' \| 'family' \| 'critical-illness' \| ...` | **Bridged** — `adaptProduct` via `CATEGORY_LABELS` |
| Document type | `BROCHURE \| RIPLAY \| TERMS \| OTHER` | `'Brosur' \| 'RIPLAY' \| 'Ketentuan Umum' \| 'Polis Contoh'` | **Bridged** — `adaptProduct` via `DOCUMENT_TYPE_LABELS` |
| Staff role | 6 `StaffRole` values | `StaffUser.role` (now widened to all 6 display labels) | **Bridged** — `adapters.ts`'s `roleLabel()`/`ROLE_LABELS` |
| Payment frequency | `MONTHLY \| QUARTERLY \| SEMI_ANNUAL \| ANNUAL` | `'Bulanan' \| 'Triwulanan' \| 'Semesteran' \| 'Tahunan'` (Indonesian) | **Bridged** — `adapters.ts`'s `FREQUENCY_TO_BACKEND` (frontend → backend direction, used when calling `POST /simulations`) |
| Preferred contact time | `MORNING \| AFTERNOON \| EVENING` | Free-form Indonesian strings, e.g. `'Pagi (09.00 - 12.00 WIB)'` | **Bridged** both directions — `CONTACT_TIME_LABELS` (backend → frontend, admin detail view) and `CONTACT_TIME_TO_BACKEND` (frontend → backend, `ApplyView` submission) |
| Simulation calculation | Correct: `SimulationEngine` reads the `ACTIVE` rule version's `formulaConfig` | `mockData.ts`'s `calculateSimulation()` is no longer called anywhere in the wired path | **Resolved** — `SimulatorView` now calls the real `POST /simulations` on every parameter change (debounced); the buggy local function still exists in `mockData.ts` but is dead code as of the phase-2 wiring, kept only because nothing currently requires deleting it |
| Application/product snapshot shape | `productSnapshot: { id, slug, name, categoryLabel }` | `ApplicationRecord.productSnapshot` uses the same shape | No drift — the backend adopted the frontend's existing shape here |
| Decimal-typed numeric fields | `minSumAssured`/`maxSumAssured`/`baseAnnualRatePerMillion` are Prisma `Decimal`, which **serialize as JSON strings** (confirmed live, e.g. `"100000000"`) | Plain `number` | **Bridged** — `adapters.ts`'s `toNumber()` coerces on every read |
