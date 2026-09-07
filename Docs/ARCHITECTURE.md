# Insurance Product Discovery & Application MVP — Architecture

**Document type:** System Architecture Document
**Version:** 1.0
**Status:** MVP / Concept-to-build
**Target market:** Indonesia
**Architecture style:** Modular monolith, API-first, Dockerized
**Primary stack:** Next.js (React) + NestJS + PostgreSQL
**Testing:** Playwright + unit/integration tests
**Prepared:** 2026-09-04

---

## 1. System overview

The system is a two-surface web platform:

```text
                    ┌─────────────────────────────┐
                    │        Public Website       │
                    │          Nuxt 3              │
                    │  Products / Detail / Sim     │
                    │       / Application         │
                    └──────────────┬──────────────┘
                                   │ HTTPS / JSON API
                                   ▼
                    ┌─────────────────────────────┐
                    │         NestJS API           │
                    │      Modular Monolith        │
                    │                              │
                    │ Auth / RBAC                  │
                    │ Products / CMS               │
                    │ Simulator                    │
                    │ Applications                 │
                    │ Workflow / Disposition       │
                    │ Users / Organization         │
                    │ Audit                         │
                    └──────────────┬──────────────┘
                                   │
                         Prisma ORM / SQL
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │         PostgreSQL           │
                    │ Products / Rates / Leads     │
                    │ Users / Roles / Hierarchy    │
                    │ Workflow / Audit             │
                    └─────────────────────────────┘

                    Internal Admin
                           │
                           ▼
                    ┌─────────────────────────────┐
                    │       Next.js Admin          │
                    │ Dashboard / Inbox / Review   │
                    │ Product CMS / Users / RBAC   │
                    └─────────────────────────────┘
```

### Recommended MVP deployment shape

Use a **single Next.js application** with separate public/admin route areas, or two Nuxt apps sharing a UI package if organizational separation is required.

For the first MVP, a single Next.js codebase is simpler:

```text
/web
  /app/(public)/*
  /app/admin/*
  /components/*
  /composables/*
  /middleware/*
```

NestJS remains a separate backend service.

---

# 2. Techstack breakdown & architecture principles

## 2.1 Frontend

### Next.js (React)

Use Next.js with TypeScript and the App Router.

Why:

- SSR/SEO support for public product pages;
- clean route structure;
- React hooks, server components, and route middleware;
- server/client rendering boundaries;
- good fit for content-heavy product pages and interactive application flows.

### Animation / scrolling

Use:

- GSAP
- Lenis
- ScrollTrigger

Recommended responsibilities:

- Lenis: smooth scrolling
- GSAP + ScrollTrigger: product-page section reveals, card transitions, sticky product storytelling, CTA transitions

Do not allow animation logic to control business logic or form submission state.

For accessibility, provide reduced-motion behavior using `prefers-reduced-motion` and avoid essential information being accessible only through animation.

### Styling

Recommended:

- Tailwind CSS for utility styling
- CSS variables / design tokens
- accessible component primitives

A reusable design system should include:

- buttons
- inputs
- selects
- cards
- badges
- tables
- status chips
- modals
- dialogs
- toasts
- pagination
- loading/skeleton states

---

## 2.2 Backend

### NestJS

Use a modular monolith with domain modules.

Suggested modules:

```text
src/
  auth/
  users/
  organization/
  roles/
  permissions/
  products/
  product-rates/
  simulator/
  applications/
  workflow/
  audit/
  files/
  health/
```

The backend is the authority for:

- authorization;
- simulator calculations;
- product visibility;
- application state changes;
- manager hierarchy validation;
- audit events.

---

## 2.3 Database

### PostgreSQL

Use PostgreSQL because the MVP needs:

- transactional workflow state changes;
- relational RBAC;
- manager hierarchy;
- audit history;
- product/rate version relationships;
- strong constraints.

### ORM

Use Prisma for standard CRUD/query work.

Use raw SQL migrations/queries when Prisma cannot express a required database constraint efficiently, especially for hierarchy/cycle protection or reporting queries.

---

## 2.4 Validation

Use shared DTO/schema validation between frontend and backend where practical.

Backend:

- NestJS DTOs
- `class-validator` or Zod-based validation

Recommended approach for MVP consistency:

- Zod schema package shared between FE and BE for input contracts where feasible.

Never rely on client validation only.

---

## 2.5 Authentication

MVP recommendation:

- email/username + password for internal users;
- short-lived access token;
- refresh-token strategy if session duration requires it;
- secure, HTTP-only cookies preferred for browser session handling.

Public applicants do not need accounts in the MVP.

---

# 3. Architecture principles

### Principle 1 — API is the source of truth

The frontend must never be trusted for pricing, authorization, workflow transitions or product publication status.

### Principle 2 — Structured content over hard-coded pages

Insurance products, benefits, eligibility and simulation rules should be database-backed.

### Principle 3 — Version financial logic

A product’s simulation rule must be versioned so an application always references the exact rule version used for its illustration.

### Principle 4 — Preserve historical context

Applications should contain snapshots of material input/result data. Editing the current product must not rewrite historical applications.

### Principle 5 — Every workflow mutation is auditable

Status changes, assignment changes, product publication, pricing-rule changes and user/role changes must create audit events.

### Principle 6 — Least privilege

RBAC starts from deny-by-default.

### Principle 7 — Hierarchy is acyclic

Manager relationships must be validated before persistence.

### Principle 8 — MVP simplicity

Prefer a modular monolith over microservices. Split services only when there is a demonstrated operational need.

---

# 4. Feature breakdown mapped to business cases

| Business case | Feature | FE | BE | DB |
|---|---|---|---|---|
| Browse products | Product catalogue | Product listing, filters | Product query API | `products`, categories |
| Understand product | Product detail | Benefits, eligibility, terms, docs | Product detail API | `products`, benefits, docs |
| Premium CTA | Simulator | Input form + result | Simulation engine | `simulation_rule_versions`, `simulation_runs` |
| Convert to lead | Application form | Prefill from simulation | Application API | `applications`, applicant data |
| Track registration | Admin inbox | Table/filter | Application query | `applications` |
| Review application | Application detail | Review UI | Workflow API | `application_events`, `status_history` |
| Disposition | Assignment | Assignee selector | Assignment service | `application_assignments` |
| Approval line | Manager escalation | Approval actions | Hierarchy/workflow service | `users`, `organization_nodes` |
| Product management | CMS | CRUD editor | Product service | `products`, content tables |
| Pricing maintenance | Simulation rule management | Rate/rule editor | Rule validation | `simulation_rule_versions` |
| Security | RBAC | Route guards | AuthGuard / RolesGuard | users/roles/permissions |
| Accountability | Audit | Audit viewer | Audit service | `audit_logs` |

---

# 5. Public frontend architecture

## Main routes

```text
/
/products
/products/:slug
/products/:slug/simulate
/apply
/application/success/:reference
```

## Home page sections

1. Hero / primary value proposition
2. Product categories / featured products
3. Why choose the insurer
4. How it works
5. Premium simulator CTA
6. FAQ / important information
7. Contact CTA
8. Regulatory / legal footer

## Product catalogue

Capabilities:

- searchable cards;
- category filtering;
- highlighted products;
- clear CTA;
- responsive layout.

## Product detail

Recommended information architecture:

```text
Hero
  ↓
Key benefits
  ↓
Who is it for?
  ↓
Coverage / benefits
  ↓
Eligibility
  ↓
Payment & term options
  ↓
Premium simulator
  ↓
Documents
  ↓
Terms / disclaimer
  ↓
Apply CTA
```

This mirrors the established pattern of combining concise positioning, benefit highlights, structured product detail and contact/conversion actions. [PRD references 1–4]

---

# 6. Premium simulator architecture

## Inputs

```ts
interface SimulationInput {
  productId: string;
  age: number;
  sumAssured: bigint;
  paymentTermYears: number;
}
```

## Result

```ts
interface SimulationResult {
  simulationId: string;
  productId: string;
  rateVersionId: string;
  input: SimulationInput;
  estimatedPremiumAnnual: bigint;
  estimatedPremiumPerPayment?: bigint;
  paymentFrequency: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
  currency: 'IDR';
  disclaimer: string;
  createdAt: string;
}
```

## Calculation model

Do **not** hard-code insurer-specific real-world rates in the UI.

Suggested generic MVP rate model:

```text
base premium
= sum assured × rate(age band, product, payment term)

estimated annual premium
= base premium × frequency/term adjustment
```

The exact formula is configurable per product through a simulation-rule version.

Example rule record concept:

```json
{
  "productId": "life-basic",
  "version": 3,
  "effectiveFrom": "2026-09-01",
  "ageBands": [
    { "min": 18, "max": 29, "rate": 0.0018 },
    { "min": 30, "max": 39, "rate": 0.0024 },
    { "min": 40, "max": 49, "rate": 0.0034 }
  ],
  "paymentTermMultipliers": {
    "5": 1.20,
    "10": 1.00,
    "15": 0.93
  }
}
```

These numbers are **example engineering fixtures only**, not insurance pricing.

## Simulator requirements

- Server-side calculation
- Decimal-safe monetary math
- Immutable simulation record
- Rate version attached to every result
- Product eligibility validation
- Clear error messages
- Illustration disclaimer
- Conversion CTA

Do not use JavaScript floating-point arithmetic for final currency computations without a safe decimal approach.

---

# 7. Admin architecture

## Admin routes

```text
/admin
/admin/login
/admin/dashboard
/admin/applications
/admin/applications/:id
/admin/products
/admin/products/new
/admin/products/:id
/admin/products/:id/simulation-rules
/admin/users
/admin/roles
/admin/organization
/admin/audit
```

## Dashboard

Widgets:

- Submitted today
- Under review
- Approved
- Rejected
- Assigned to current user
- Unassigned
- Recent applications
- Recent status transitions

## Application inbox

Server-side pagination and filtering should be used even in the MVP so architecture is not locked into loading the whole dataset in the browser.

## Application detail

Tabs/sections:

- Overview
- Applicant
- Simulation
- Product snapshot
- Workflow
- Notes
- Audit trail

---

# 8. Database schema / data models

## 8.1 Core ERD

```text
users ───────────────< user_roles >──────── roles
  │                                         │
  │ manager_id                               └──────< role_permissions >──── permissions
  ▼
users (self-reference)

products ───────< product_benefits
   │
   ├────────────< product_documents
   │
   └────────────< simulation_rule_versions
                       │
                       └──────< simulation_runs

applications ────< application_status_history
     │
     ├───────────< application_assignments
     │
     ├───────────< application_notes
     │
     └───────────< audit_logs
```

## 8.2 Tables

### users

```text
id UUID PK
email VARCHAR UNIQUE
password_hash TEXT
full_name VARCHAR
manager_id UUID NULL FK users.id
is_active BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

`manager_id` represents the direct manager.

### roles

```text
id UUID PK
name VARCHAR UNIQUE
description TEXT
```

### permissions

```text
id UUID PK
key VARCHAR UNIQUE
resource VARCHAR
action VARCHAR
```

Examples:

```text
products:read
products:create
products:update
products:publish
simulation_rules:read
simulation_rules:update
applications:read
applications:assign
applications:review
applications:approve
applications:reject
users:manage
roles:manage
organization:manage
audit:read
```

### user_roles

```text
user_id UUID FK
role_id UUID FK
PRIMARY KEY (user_id, role_id)
```

### products

```text
id UUID PK
slug VARCHAR UNIQUE
name VARCHAR
category VARCHAR
short_description TEXT
long_description TEXT
hero_image_url TEXT
currency VARCHAR
status ENUM(DRAFT, PUBLISHED, ARCHIVED)
published_at TIMESTAMP NULL
created_at TIMESTAMP
updated_at TIMESTAMP
```

### product_benefits

```text
id UUID PK
product_id UUID FK
label VARCHAR
description TEXT
sort_order INT
```

### product_documents

```text
id UUID PK
product_id UUID FK
name VARCHAR
url TEXT
document_type ENUM(BROCHURE, RIPLAY, TERMS, OTHER)
created_at TIMESTAMP
```

### product_eligibility

```text
id UUID PK
product_id UUID FK
min_age INT
max_age INT
min_sum_assured NUMERIC
max_sum_assured NUMERIC
allowed_payment_terms JSONB
allowed_payment_frequencies JSONB
```

### simulation_rule_versions

```text
id UUID PK
product_id UUID FK
version INT
status ENUM(DRAFT, ACTIVE, RETIRED)
formula_type VARCHAR
formula_config JSONB
effective_from TIMESTAMP
effective_to TIMESTAMP NULL
created_by UUID FK users.id
created_at TIMESTAMP
```

Unique constraint:

```text
(product_id, version)
```

Application can reference the exact `simulation_rule_versions.id` used.

### simulation_runs

```text
id UUID PK
product_id UUID FK
rule_version_id UUID FK
age INT
sum_assured NUMERIC
payment_term_years INT
payment_frequency VARCHAR
estimated_premium NUMERIC
currency VARCHAR
created_at TIMESTAMP
```

### applications

```text
id UUID PK
reference_no VARCHAR UNIQUE
product_id UUID FK
simulation_id UUID NULL FK
status ENUM(DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED)
applicant_name VARCHAR
email VARCHAR
phone VARCHAR
domicile VARCHAR
age INT
sum_assured NUMERIC
payment_term_years INT
simulated_premium NUMERIC
product_snapshot JSONB
simulation_snapshot JSONB
consent_at TIMESTAMP
submitted_at TIMESTAMP NULL
approved_at TIMESTAMP NULL
rejected_at TIMESTAMP NULL
created_at TIMESTAMP
updated_at TIMESTAMP
```

### application_assignments

```text
id UUID PK
application_id UUID FK
assigned_to UUID FK users.id
assigned_by UUID FK users.id
assigned_at TIMESTAMP
unassigned_at TIMESTAMP NULL
reason TEXT NULL
```

### application_status_history

```text
id UUID PK
application_id UUID FK
from_status VARCHAR NULL
to_status VARCHAR
changed_by UUID FK users.id
comment TEXT NULL
created_at TIMESTAMP
```

### application_notes

```text
id UUID PK
application_id UUID FK
author_id UUID FK users.id
note TEXT
is_internal BOOLEAN
created_at TIMESTAMP
```

### audit_logs

```text
id UUID PK
actor_user_id UUID NULL FK users.id
action VARCHAR
entity_type VARCHAR
entity_id UUID
before_data JSONB NULL
after_data JSONB NULL
ip_address INET NULL
user_agent TEXT NULL
created_at TIMESTAMP
```

---

# 9. RBAC and approval hierarchy

## 9.1 Role-based authorization

Use a combined model:

`Role → Permissions`

and

`User → Organization hierarchy`

A permission answers **what** a user may do.

The hierarchy answers **which records** the user may act on.

Example:

```text
Permission:
applications:approve

Scope:
- own assigned applications
- or direct/indirect reports when manager role allows it
```

This prevents the system from assuming that “Manager” automatically means “can see everything.”

## 9.2 Manager relationship

MVP stores a direct manager on the user:

```text
user.manager_id → users.id
```

Example:

```text
Alice → Budi → Citra
```

Alice's manager is Budi.
Budi's manager is Citra.
Citra has no manager.

### Cycle prevention

Before changing `manager_id`, the service must walk upward from the proposed manager.

Pseudo-code:

```ts
function assertNoManagerCycle(userId: string, proposedManagerId: string) {
  let current = proposedManagerId;

  while (current) {
    if (current === userId) {
      throw new BadRequestException('Manager relationship would create a cycle');
    }

    current = getManagerId(current);
  }
}
```

Also implement a database-level protection strategy for defense in depth. PostgreSQL recursive CTE validation can be used in a trigger/function, or the organization can move to a closure-table model if hierarchy queries become more complex.

For MVP, application-level validation + transaction + database constraints is acceptable, but the API must be the only pathway for hierarchy mutations.

## 9.3 Approval routing

Example:

```text
Application
    │
    ▼
Assigned Reviewer
    │
    ├── can approve → APPROVED
    │
    ├── can reject  → REJECTED
    │
    └── needs escalation
             │
             ▼
        Direct Manager
             │
             ├── APPROVED
             └── REJECTED
```

Future extensions can add:

- monetary thresholds;
- product-specific approvers;
- compliance reviewer;
- multi-signature approval;
- separation-of-duties rules.

---

# 10. Workflow state machine

## Required states

```text
DRAFT
  │
  ▼
SUBMITTED
  │
  ▼
UNDER_REVIEW
  ├──────────► APPROVED
  └──────────► REJECTED
```

### Allowed transitions

| From | To | Who |
|---|---|---|
| DRAFT | SUBMITTED | Public applicant / system |
| SUBMITTED | UNDER_REVIEW | Authorized reviewer/manager |
| UNDER_REVIEW | APPROVED | Authorized approver |
| UNDER_REVIEW | REJECTED | Authorized approver/reviewer |

Do not allow arbitrary status updates such as `PATCH status = APPROVED`.

Instead expose command-like endpoints:

```text
POST /applications/:id/submit
POST /applications/:id/start-review
POST /applications/:id/approve
POST /applications/:id/reject
POST /applications/:id/assign
```

Every command verifies:

1. current state;
2. actor permission;
3. actor scope;
4. hierarchy/approval authority;
5. required input such as rejection reason;
6. audit event.

---

# 11. System workflows & data flows

## 11.1 Product browsing flow

```text
Browser
  │
  ▼
Next.js SSR
  │
  ▼
GET /products
  │
  ▼
NestJS ProductService
  │
  ▼
PostgreSQL
  │
  ▼
Published products only
```

## 11.2 Simulation flow

```text
User enters inputs
      │
      ▼
Next.js client/server validation
      │
      ▼
POST /simulations
      │
      ▼
NestJS SimulatorService
      │
      ├── validate product
      ├── validate eligibility
      ├── select ACTIVE rule version
      ├── calculate decimal-safe premium
      ├── persist simulation
      │
      ▼
SimulationResult
```

## 11.3 Application flow

```text
Simulation result
      │
      ▼
Apply CTA
      │
      ▼
Application form prefilled
      │
      ▼
POST /applications
      │
      ▼
NestJS validates + creates DRAFT
      │
      ▼
POST /applications/:id/submit
      │
      ├── validate consent
      ├── create reference number
      ├── status = SUBMITTED
      ├── create history record
      └── create audit log
```

## 11.4 Review flow

```text
Admin inbox
   │
   ▼
Open application
   │
   ▼
Start review
   │
   ▼
UNDER_REVIEW
   │
   ├── Approve → APPROVED
   │
   ├── Reject  → REJECTED
   │
   └── Escalate → direct manager
```

## 11.5 Product update flow

```text
Product Admin
   │
   ▼
Edit draft
   │
   ▼
Validate required content
   │
   ▼
Publish
   │
   ├── status = PUBLISHED
   └── audit log
```

Product publication must not retroactively change historical application snapshots.

---

# 12. API surface

## Public APIs

```text
GET  /api/products
GET  /api/products/:slug
POST /api/simulations
POST /api/applications
POST /api/applications/:id/submit
```

Public APIs should expose only the minimum information required.

## Admin APIs

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/me

GET  /api/admin/applications
GET  /api/admin/applications/:id
POST /api/admin/applications/:id/start-review
POST /api/admin/applications/:id/assign
POST /api/admin/applications/:id/approve
POST /api/admin/applications/:id/reject

GET  /api/admin/products
POST /api/admin/products
PATCH /api/admin/products/:id
POST /api/admin/products/:id/publish
POST /api/admin/products/:id/archive

GET  /api/admin/products/:id/simulation-rules
POST /api/admin/products/:id/simulation-rules
PATCH /api/admin/simulation-rules/:id/activate

GET  /api/admin/users
POST /api/admin/users
PATCH /api/admin/users/:id
PATCH /api/admin/users/:id/manager

GET /api/admin/audit
```

Use versioned API routing from the start, e.g. `/api/v1/...`.

---

# 13. Security & RBAC

## 13.1 Authentication controls

- Passwords hashed using Argon2id or bcrypt with suitable cost.
- HTTP-only, Secure cookies for browser refresh/session tokens.
- CSRF protection when cookie-authenticated endpoints are used.
- Rate limiting on login and public application endpoints.
- Generic login error messages to reduce account enumeration.
- Session revocation on logout/password reset.
- No credentials in frontend source code.

## 13.2 Authorization

Every protected NestJS controller uses authorization guards.

Conceptual guard order:

```text
Request
  ↓
AuthenticationGuard
  ↓
Roles/PermissionGuard
  ↓
ResourceScopeGuard
  ↓
Controller
  ↓
Service
```

The ResourceScopeGuard decides whether the user can act on the particular application/product/user.

## 13.3 Data protection

Minimize sensitive personal data in the discovery funnel.

Store only fields required by the MVP business flow.

Sensitive data should be:

- encrypted in transit;
- encrypted at rest where infrastructure supports it;
- excluded from logs;
- masked in admin lists where full values are unnecessary;
- retained only according to an explicit business/retention policy.

## 13.4 Audit security

Audit logs should be append-oriented. Normal admins should not be able to rewrite history.

Record:

- actor
- action
- entity
- entity ID
- timestamp
- before/after for material changes
- IP/user agent when appropriate

---

# 14. Docker Compose orchestration & topology

Recommended MVP topology:

```text
┌──────────────────────────────────────────────────────────┐
│                     docker-compose                       │
│                                                          │
│  ┌──────────────┐       ┌──────────────┐                │
│  │   frontend   │       │    backend   │                │
│  │   Nuxt 3     │──────▶│   NestJS     │                │
│  │   :3000      │       │   :3001      │                │
│  └──────────────┘       └──────┬───────┘                │
│                                │                        │
│                                ▼                        │
│                       ┌────────────────┐                │
│                       │   PostgreSQL   │                │
│                       │     :5432      │                │
│                       └────────────────┘                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

Optional:

- Adminer for local DB inspection only
- Mailpit for local email testing

Do not include production infrastructure assumptions in the MVP compose file.

### Example services

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://app:app@postgres:5432/insurance
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: insurance
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

For real deployment, secrets must come from the runtime secret manager rather than committed Compose values.

---

# 15. Automated testing

## 15.1 Testing pyramid

```text
          ┌───────────────┐
          │   Playwright  │  E2E / critical journeys
          └───────┬───────┘
                  │
       ┌──────────┴──────────┐
       │ Integration tests   │  API + DB workflow
       └──────────┬──────────┘
                  │
          ┌───────┴───────┐
          │  Unit tests   │  services / rules
          └───────────────┘
```

## 15.2 Unit tests

Test:

- premium formulas;
- age-band selection;
- eligibility validation;
- payment-term validation;
- status transition rules;
- permission evaluation;
- manager-cycle detection;
- application reference generation.

### High-priority simulator test cases

- minimum age
- maximum age
- invalid age
- minimum sum assured
- maximum sum assured
- invalid sum assured
- valid payment term
- invalid payment term
- multiple active rule versions prevention
- correct rate-version selection
- decimal/currency rounding

## 15.3 Integration tests

Use a test PostgreSQL instance/container.

Test:

- creating applications;
- submitting applications;
- workflow transitions;
- role enforcement;
- assignment scope;
- manager hierarchy changes;
- cycle rejection;
- product publication;
- simulation persistence;
- audit log creation.

## 15.4 Playwright E2E

Critical journeys:

### Journey A — browse

```text
open homepage
→ open product catalogue
→ open product detail
```

### Journey B — simulate

```text
open product
→ enter age
→ enter sum assured
→ choose payment term
→ see illustration
```

### Journey C — convert

```text
simulate
→ click Apply
→ submit registration
→ see application reference
```

### Journey D — admin review

```text
login
→ see Submitted application
→ start review
→ approve/reject
→ verify status history
```

### Journey E — hierarchy security

```text
admin changes B's manager to A
→ allowed if no cycle

admin changes A's manager to a descendant
→ rejected because cycle would occur
```

## 15.5 Accessibility checks

Playwright should cover:

- keyboard navigation;
- form labels;
- focus visibility;
- meaningful page titles;
- reduced motion behavior;
- error message association;
- basic WCAG-oriented assertions.

---

# 16. Observability and operational basics

MVP logging should include:

- request ID
- route
- status code
- latency
- authenticated user ID when present
- application/product ID when relevant

Never log:

- passwords
- session tokens
- full consent payloads
- unnecessary personal information
- secrets

Add:

```text
GET /health
GET /ready
```

`/ready` should verify required dependencies such as PostgreSQL connectivity.

---

# 17. Suggested repository structure

```text
insurance-platform/
├── frontend/
│   ├── app.vue
│   ├── pages/
│   │   ├── index.vue
│   │   ├── products/
│   │   └── admin/
│   ├── components/
│   ├── composables/
│   ├── middleware/
│   ├── plugins/
│   │   ├── gsap.client.ts
│   │   └── lenis.client.ts
│   ├── assets/
│   └── tests/
│       └── e2e/
│
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── organization/
│   │   ├── roles/
│   │   ├── products/
│   │   ├── product-rates/
│   │   ├── simulator/
│   │   ├── applications/
│   │   ├── workflow/
│   │   └── audit/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── test/
│
├── packages/
│   └── contracts/
│
├── docker-compose.yml
└── README.md
```

---

# 18. Implementation sequence

### Phase 1 — Foundation

- Monorepo/repository setup
- Docker Compose
- PostgreSQL
- NestJS bootstrap
- Nuxt bootstrap
- Prisma migrations
- Shared TypeScript types/contracts

### Phase 2 — Product discovery

- Product schema
- Product admin CRUD
- Public product API
- Catalogue
- Detail page
- SEO metadata

### Phase 3 — Simulator

- Eligibility schema
- Rate-rule schema
- Simulator service
- Simulator UI
- Rule-versioning
- Test matrix

### Phase 4 — Application funnel

- Application form
- Consent
- Submission
- Reference numbers
- Confirmation page

### Phase 5 — Admin workflow

- Authentication
- RBAC
- Application inbox
- Application detail
- Status machine
- Assignment
- Audit trail

### Phase 6 — Hierarchy

- Manager relationships
- Cycle prevention
- Scope-aware application access
- Escalation / approval line

### Phase 7 — QA hardening

- Integration tests
- Playwright journeys
- Accessibility tests
- Security tests
- Seed data
- Demo environment

---

# 19. Architectural risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Simulator is mistaken for a final quote | High | Strong illustration disclaimer; server-side rules; future rating-engine integration point |
| Hard-coded rates become stale | High | Versioned, admin-managed simulation rules |
| Product edits change historical meaning | High | Application product/simulation snapshots |
| Manager graph becomes cyclic | High | Service validation + transaction + database defense |
| UI hides permission but API allows it | High | Server-side RBAC and resource scope checks |
| Sensitive customer data leaks in logs | High | Structured log redaction and logging policy |
| Public form abuse/spam | Medium | Rate limiting, bot protection later, basic request throttling |
| Overengineering too early | Medium | Modular monolith; defer microservices |
| GSAP/Lenis hurts accessibility/performance | Medium | Reduced-motion support and progressive enhancement |

---

# 20. Definition of done for MVP

The MVP is complete when:

1. An admin can create and publish an insurance product.
2. A public user can browse only published products.
3. A public user can open a product detail page and see structured benefits/eligibility/payment information.
4. A public user can input age, sum assured and payment term and receive an illustrative premium.
5. A public user can submit an application using the simulation context.
6. The application appears in the admin inbox as `SUBMITTED`.
7. An authorized reviewer can move it to `UNDER_REVIEW`.
8. An authorized approver can approve or reject it.
9. Every transition is recorded in status history and audit logs.
10. Manager hierarchy permissions restrict access appropriately.
11. A manager cycle cannot be created.
12. Playwright covers the public conversion funnel and admin review funnel.
13. The whole stack can be started locally through Docker Compose.

---

# 21. Future production evolution

This architecture intentionally leaves extension points for:

```text
MVP
  │
  ├── external rating/underwriting engine
  ├── KYC / identity verification
  ├── e-signature
  ├── payment gateway
  ├── policy administration system
  ├── CRM / lead management integration
  ├── agent portal
  ├── customer portal
  ├── notifications (email/SMS/WhatsApp)
  ├── document storage/object storage
  ├── advanced analytics
  └── regulatory reporting
```

The MVP should integrate with these through service boundaries/interfaces rather than building production versions of them prematurely.

---

# 22. Architecture references

The product/content assumptions in this document were benchmarked against:

- Allianz Indonesia individual life insurance product pages
- AXA Indonesia personal life insurance and AXA Term Protector pages
- Prudential Indonesia PRUMapan product page
- OJK POJK 8/2024 on insurance products and marketing channels

See `insurance_mvp_prd.md` for the detailed business-case and source notes.
