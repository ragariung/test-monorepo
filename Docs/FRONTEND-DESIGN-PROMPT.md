# Frontend Design Prompt — Insurance MVP

Use this as a brief for a designer, or paste directly into an AI design tool (Lovable, v0, Figma AI, etc.) to generate a visual direction for the public site and admin portal.

**Note on using this with Lovable:** Lovable will scaffold in React + Vite + Tailwind, not Next.js — that's fine, this pass is purely for visual direction ("get a vision"). Don't pull Lovable's generated code straight into `Frontends/`; once the design direction is validated, it gets rebuilt properly in Next.js against the real NestJS API per `ARCHITECTURE-ESSENTIAL.md`. If prompting Lovable directly (rather than uploading this whole file), start with just §1–3 (overview, brand, design system) plus one section at a time (e.g. §4.1–4.3 for the public site first) — Lovable tends to do better with focused prompts than one giant spec dropped in at once.

---

## 1. Project overview

Design a two-surface web platform for a digital insurance product discovery and lead/application MVP, targeting the Indonesian market.

- **Public website**: prospective customers browse insurance products, understand coverage/eligibility, run a premium illustration, and submit an application.
- **Admin portal**: internal staff review submitted applications, manage assignment through a manager hierarchy, and maintain product content.

This is explicitly an MVP — not a full purchasing/underwriting platform. It stops at "application submitted, trackable by internal staff." Design should feel trustworthy, credible, and calm — this is a financial-services product, not a consumer app. Benchmark tone against Allianz, AXA, and Prudential Indonesia's product pages: confident, structured, benefit-led, not flashy.

---

## 2. Brand personality

- **Trustworthy** — clear hierarchy, no dark patterns, no artificial urgency.
- **Clear over clever** — insurance terms (sum assured, premium, payment term) must read as approachable, not intimidating.
- **Calm confidence** — generous whitespace, restrained color use, no visual noise competing with the content.
- **Human** — this is about protecting people/family, not just a financial transaction. Warmth in imagery and copy tone, without becoming informal.

---

## 3. Design system foundations

- **Typeface**: Plus Jakarta Sans (free, Google Fonts) for everything — headings and body. Use its weight range (400/500/600/700/800) to build hierarchy instead of introducing a second typeface.
- **Color direction**: needs a primary brand color conveying trust/stability (deep blue, teal, or forest green are conventional in this category) plus a warm accent for CTAs. Neutral grayscale for text/surfaces. Must support light backgrounds primarily; keep contrast WCAG AA-compliant.
- **Component inventory needed**: buttons (primary/secondary/ghost), text inputs, selects, radio/checkbox, cards (product card, benefit card), badges/status chips (Draft/Published/Archived; Submitted/Under Review/Approved/Rejected), data tables, tabs, modals, toasts, pagination, skeleton/loading states, empty states.
- **Motion**: subtle only. Section reveals and CTA transitions are welcome (smooth scroll, gentle fade/slide), but information must never be accessible *only* through animation, and everything must respect `prefers-reduced-motion`. No gimmicky effects — this is a financial product.
  - This visual-direction pass doesn't need to implement motion with any specific library. For reference: the real Next.js build will use **GSAP + ScrollTrigger** for section reveals/card/CTA transitions and **Lenis** for smooth scrolling, per `ARCHITECTURE.md` — describe/mock the *feel* of the motion here, the rebuild wires up the actual libraries.

---

## 4. Public site — pages to design

### 4.1 Home (`/`)

Sections, in order:
1. Hero — primary value proposition + a CTA pair ("Explore Products" / "Calculate Premium")
2. Product categories / featured products
3. Why choose this insurer (trust signals)
4. How it works (3–4 step visual: discover → simulate → apply → get contacted)
5. Premium simulator CTA (standalone banner driving into the simulator)
6. FAQ / important information
7. Contact CTA
8. Regulatory/legal footer (insurer identity, disclosures)

### 4.2 Product catalogue (`/products`)

- Searchable/filterable grid of product cards (filter by category: life protection, family protection, savings/endowment, education, critical illness, investment-linked)
- Each card: product name, short value proposition, category tag, hero image, CTA
- Responsive grid (1 col mobile → 3–4 col desktop)

### 4.3 Product detail (`/products/:slug`)

Information architecture, top to bottom:
```
Hero (product name + positioning + hero image)
Key benefits
Who is it for?
Coverage / benefits detail
Eligibility (age range, entry conditions)
Payment & term options
Premium simulator (embedded or linked)
Documents (brochure / RIPLAY / terms — downloadable links)
Terms / disclaimer
Apply CTA
```

### 4.4 Premium simulator (`/products/:slug/simulate`)

- Inputs: age, sum assured, payment term (all validated against the product's configured rules)
- Clear inline validation/error state when a combination is invalid, with guidance on how to correct it
- Result state: estimated premium (per payment frequency + annual), selected sum assured, selected payment term, and a **prominent "this is an illustration, not a final quote" disclaimer**
- CTA to continue to application, carrying the simulation result forward

### 4.5 Application form (`/apply`)

- Pre-filled from simulation result (product, sum assured, payment term, simulated premium — shown as read-only context, not re-editable inline)
- Fields: full name, email, phone, age, city/domicile, preferred contact time, optional notes
- Explicit consent checkbox (data processing/contact) — required, cannot submit without it
- Clear multi-step or single-page form (designer's call), but validation errors must be obvious and field-associated

### 4.6 Submission confirmation (`/application/success/:reference`)

- Confirmation state with the application reference number prominently displayed
- Brief "what happens next" explanation
- No policy/purchase language — this is a lead/application receipt, not a purchase receipt

---

## 5. Admin portal — pages to design

Should feel like a focused internal tool — dense, efficient, table-driven — as opposed to the marketing tone of the public site. Same typography and base component system, but tighter spacing and a utilitarian layout (sidebar nav + content area).

- **Login** (`/admin/login`) — simple, no marketing content
- **Dashboard** (`/admin/dashboard`) — summary count widgets: Submitted, Under Review, Approved, Rejected, Assigned to me, Unassigned, Recent applications, Recent status transitions
- **Application inbox** (`/admin/applications`) — data table: Application ID, submitted date, applicant name, product, estimated premium, sum assured, owner, status (chip), last updated. Filters: status, product, assigned user, date range, search. Server-side pagination.
- **Application detail** (`/admin/applications/:id`) — tabbed or sectioned: Overview, Applicant, Simulation, Product snapshot, Workflow (status actions: start review / approve / reject, with reason capture on reject), Notes, Audit trail
- **Product CMS** (`/admin/products`, `/admin/products/:id`) — list + editor for all product-content fields (benefits, eligibility, payment terms, documents, status Draft/Published/Archived)
- **Simulation rules** (`/admin/products/:id/simulation-rules`) — versioned rate/rule editor (age bands, payment-term multipliers), showing active vs. draft vs. retired versions
- **Users / Roles / Organization** (`/admin/users`, `/admin/roles`, `/admin/organization`) — user list, role assignment, manager-hierarchy tree/picker
- **Audit log** (`/admin/audit`) — append-only event table

---

## 6. Responsive & accessibility requirements

- Fully responsive: mobile-first for the public site (this is where prospective customers will land from ads/social), desktop-first is acceptable for the admin portal (internal staff on desktops), but admin should still not break on a laptop-sized viewport.
- Keyboard navigable, visible focus states, form labels always present (not placeholder-only), error messages programmatically associated with their fields, meaningful page titles.
- Status/urgency must never be color-only (pair chips with icon or label text) for colorblind accessibility.

---

## 7. What to hand back

Ideally: a small design system (type scale, color tokens, core components) plus high-fidelity screens for at minimum — Home, Product catalogue, Product detail, Simulator (input + result state), Application form, Confirmation, Admin login, Admin dashboard, Application inbox, Application detail. Mobile + desktop for public pages; desktop for admin.
