# Agent Mandate

Rules any agentic AI (or human contributor acting like one) must follow when working in this repository, specifically regarding the `Docs/` files and how they're kept honest. This is not project background reading — it's operating instructions.

---

## Revision history

| Date | Change | Notes |
|---|---|---|
| 2026-09-06 | Initial version | Created alongside `DATA-STRUCTURE.md`, `FOLDER-STRUCTURE.md`, `API-LIST-V0.md` as the Docs governance set. |

---

## 1. Read before you build

Before any non-trivial change (new feature, schema change, new endpoint, folder restructuring), read in this order:

1. `PRD.md` — is this even in scope? (check §6 In scope / Out of scope)
2. `ARCHITECTURE.md` — what does the full design say about this area?
3. `ARCHITECTURE-ESSENTIAL.md` — what's the current, authoritative, distilled version?
4. `DATA-STRUCTURE.md` and `FOLDER-STRUCTURE.md` — what does the codebase actually look like *right now*, as last documented?

**`ARCHITECTURE-ESSENTIAL.md` wins on conflict with `ARCHITECTURE.md`.** It exists precisely because this project has already diverged from the original architecture doc once (Next.js → the adopted Vite/React frontend, GSAP+Lenis → Framer Motion) and will likely diverge again. `ARCHITECTURE.md` is historical rationale; `ARCHITECTURE-ESSENTIAL.md` is current truth. When you make a decision that supersedes something in `ARCHITECTURE.md`, update `ARCHITECTURE-ESSENTIAL.md` to say so explicitly (as already done for the frontend stack) — don't just quietly contradict it.

## 2. Update obligations — no silent drift

These docs describe the project as it actually is. An agent that changes the thing a doc describes, without updating the doc in the same piece of work, has left the documentation wrong. Specifically:

| If you change... | You must update... |
|---|---|
| Database schema, Prisma models, or frontend data types (`Frontends/src/types.ts`) | `DATA-STRUCTURE.md` |
| Any folder's existence, name, location, or top-level contents | `FOLDER-STRUCTURE.md` |
| Any backend endpoint (add, change signature/auth/status, remove, deprecate) | `API-LIST-V0.md` |
| A stack, scope, or architectural decision that supersedes `ARCHITECTURE.md` | `ARCHITECTURE-ESSENTIAL.md` (add or amend a note saying so) |

`DATA-STRUCTURE.md`, `FOLDER-STRUCTURE.md`, and `API-LIST-V0.md` each carry a **revision history table at the top**. Every substantive edit to one of these files gets a new row: date, one-line change, short note on why. Never edit the content below the revision history without adding a row above it. Never backdate or edit past rows.

## 3. Scope discipline

This is an MVP (`PRD.md` §6). Before adding a feature, abstraction, or piece of infrastructure, check whether it's explicitly in scope. If it isn't — or if it's a generalization beyond what a specific, current requirement needs — flag that to the user instead of building it. Concrete examples already identified in this project's own review: don't build a generic pluggable formula engine for simulation rules when one concrete formula shape is all that's needed; don't build full N-level hierarchy scope resolution before there's a real org depth to resolve; don't wire GSAP/Lenis/animation polish before the core funnel works.

## 4. Don't guess on ambiguity — ask

When a requirement is genuinely ambiguous, or a decision materially affects architecture/scope/folder structure and could reasonably go more than one way, ask the user rather than picking silently. This project's history already has several of these decisions on record (frontend framework, CORS vs. proxy, file storage location, folder naming) — check `ARCHITECTURE-ESSENTIAL.md` and this file's revision-history-bearing siblings before re-asking something already settled.

## 5. Mock data is not the API contract

`Frontends/src/data/mockData.ts` and `Frontends/src/types.ts` were generated independently during the design pass and are known to drift from the canonical schema (tracked in `DATA-STRUCTURE.md` §3). Never treat the mock frontend shapes as authoritative just because they exist in code — the canonical schema in `ARCHITECTURE.md`/`ARCHITECTURE-ESSENTIAL.md` is the source of truth until a deliberate, documented decision changes it.

## 6. Core invariants (do not violate silently)

Carried from `ARCHITECTURE-ESSENTIAL.md` — repeated here because violating any of these is the kind of mistake that's expensive to unwind later:

- The backend API is the source of truth for pricing, authorization, and workflow state — never trust the frontend for these.
- Applications snapshot product/simulation data at submission time; editing a product later must never rewrite a past application's history.
- Simulation rules are versioned; every simulation result records which version priced it.
- Every workflow mutation (status change, assignment, product publish, rate change, user/role change) produces an audit log entry.
- RBAC is deny-by-default and enforced server-side; UI hiding is never treated as security.
- Manager-hierarchy changes must be validated as acyclic before persisting.
- No arbitrary status field mutation (`PATCH status=...`) — workflow transitions are explicit command endpoints.
