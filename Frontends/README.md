# Insurance MVP — Frontend ("PRAXIS Insurance")

Public insurance product site + internal admin portal. Part of the [insurance-mvp](../README.md) project — see the root README and `../Docs/` for full product/architecture context.

## Status

Scaffolded and adopted as the permanent frontend (originated as a design-direction pass, kept as-is rather than rebuilt). All views exist for both surfaces, currently wired to mock data in `src/data/mockData.ts` — not yet talking to a real backend, because `../insurance-backend-mvp/` doesn't exist yet.

## Stack

- React 19 + Vite 6 + TypeScript
- Tailwind CSS v4
- Framer Motion (`motion` package) for animation/transitions
- lucide-react for icons
- jsPDF for the client-side application-receipt PDF (no server round-trip)
- Plus Jakarta Sans (wired via CSS variable in `src/index.css`)
- No router library — a lightweight custom path matcher in `src/App.tsx` decides which view to render off `currentPath` (from `src/context/AppContext.tsx`)
- Talks to the NestJS backend directly over CORS once it exists (no proxy/rewrite) — see `../Docs/ARCHITECTURE-ESSENTIAL.md`

## Structure

```
src/
├── App.tsx                 route matching (public + admin)
├── context/AppContext.tsx  app-wide state, current path, toasts
├── data/mockData.ts        placeholder data — replace with real API calls
├── components/
│   ├── common/              Navbar, Footer, Button, Modal, StatusChip, ToastContainer
│   └── admin/                AdminLayout
└── views/
    ├── public/   HomeView, CatalogueView, ProductDetailView, SimulatorView, ApplyView, SuccessView
    └── admin/    AdminLoginView, AdminDashboardView, ApplicationsInboxView, ApplicationDetailView,
                  ProductCmsView, SimulationRulesView, OrganizationView, AuditLogView
```

## Known cleanup items

This was exported from an AI Studio/Lovable-style build tool and carries platform scaffolding unrelated to this project — remove before this ships:
- `@google/genai` dependency (Gemini API client) — not part of this app's scope
- `express` / `dotenv` / the `server.js` build target — not needed for a static Vite app talking to NestJS
- `.env.example`'s `GEMINI_API_KEY` / `APP_URL` — not applicable here

## Running it

```
npm install
npm run dev     # vite dev server on :3000
```

## Reference docs

- [`../Docs/PRD.md`](../Docs/PRD.md) — product requirements
- [`../Docs/ARCHITECTURE-ESSENTIAL.md`](../Docs/ARCHITECTURE-ESSENTIAL.md) — stack decisions, principles, conventions to follow when building this out
- [`../Docs/FRONTEND-DESIGN-PROMPT.md`](../Docs/FRONTEND-DESIGN-PROMPT.md) — design brief used to generate this app's visual direction
