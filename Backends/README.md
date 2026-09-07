# PRAXIS Insurance - Backend (MVP)

NestJS + Prisma + PostgreSQL backend for the PRAXIS Insurance MVP. Serves both
the public site (product catalog, premium simulator, lead application form)
and the internal admin portal (auth, dashboard, application review workflow,
product CMS, simulation rule versioning, org/users, audit log) under a single
`/api/v1` prefix.

## Requirements

- Node.js 20+
- A running PostgreSQL instance (e.g. via the project's `docker-compose.yml`,
  or any local/remote Postgres you point `DATABASE_URL` at)

## Getting started

```bash
npm install
cp .env.example .env
# edit .env if your DATABASE_URL / ports differ from the defaults

npm run prisma:migrate   # requires a running Postgres - applies prisma/migrations
npm run prisma:seed      # requires a running Postgres - loads demo data

npm run dev              # starts the API on http://localhost:3001 (watch mode)
```

`npm run prisma:migrate` and `npm run prisma:seed` both need a live Postgres
connection (`DATABASE_URL` in `.env`); there is no in-memory fallback. The
code itself compiles and the Prisma client generates fine without a database
(`npm run build`, `npx prisma generate`), which is enough to verify the
project is wired correctly even before Postgres is available.

### Other scripts

| Script                  | What it does                                      |
| ------------------------ | -------------------------------------------------- |
| `npm run build`          | Compiles to `dist/` via `nest build`               |
| `npm run start`          | Runs the compiled build (`node dist/main`)          |
| `npm run prisma:generate`| Regenerates the Prisma client from `schema.prisma` |

### Docker

A dev-mode `Dockerfile` is included (`npm install` + `prisma generate` +
`npm run dev`, not a production multi-stage build - this is an MVP). Point it
at a Postgres container/service via `DATABASE_URL`.

## Environment variables

See `.env.example`:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - secret used to sign session JWTs
- `JWT_EXPIRES_IN` - JWT/session lifetime (e.g. `8h`)
- `CORS_ORIGIN` - allowed origin for the frontend (defaults to `http://localhost:3000`)
- `PORT` - API port (defaults to `3001`)

## Module list

- `auth` - login/logout, `GET /me`, `JwtAuthGuard` (reads the `praxis_session`
  httpOnly cookie), a static `ROLE_PERMISSIONS` map + `@RequirePermission()` +
  `PermissionsGuard`
- `users` - admin: list/create staff users, change manager (with reporting-cycle detection)
- `products` - public catalog (published products only) + admin CMS (create/update/publish/archive)
- `simulation-rules` - admin: versioned premium calculation rules per product (draft/activate)
- `simulator` - public premium simulator endpoint, backed by the injectable `SimulationEngine`
- `applications` - public lead submission + admin review workflow (start-review/approve/reject/assign/notes/dashboard)
- `audit` - injectable `AuditService` used by other modules to record actions, + admin audit log view
- `health` - `GET /health`, `GET /ready` (Postgres connectivity check)
- `prisma` - global `PrismaService`/`PrismaModule`

## Demo login credentials

All seeded users share the password `praxis123`:

| Email                              | Role                  |
| ----------------------------------- | --------------------- |
| `bambang.soedirman@praxis.co.id`    | Underwriter Manager   |
| `sarah.wijaya@praxis.co.id`         | Senior Underwriter    |
| `bobby.pratama@praxis.co.id`        | Senior Underwriter    |
| `dewi.anggraeni@praxis.co.id`       | Tele-Consultant       |
| `rangga.pradipta@praxis.co.id`      | Underwriter           |
| `admin@praxis.co.id`                | Admin                 |
| `citra.aditama@praxis.co.id`        | Auditor (read-only)   |

## Notes / MVP simplifications (see inline code comments for details)

- Permissions are a static role -> permission-list map in code, not a
  database-backed roles/permissions schema, and there is no per-record
  ownership/hierarchy scoping in v0 (any user holding a permission can act on
  any record of that type).
- Application creation goes straight from "simulate" to "submit" in one step
  (no separate DRAFT-then-submit flow), matching how the real frontend form works.
- The admin audit log endpoint is capped at the 200 most recent rows (no
  pagination yet).
- The premium calculation engine (`src/simulator/simulation.engine.ts`) is
  driven entirely by the active `SimulationRuleVersion.formulaConfig` for a
  product - this is intentionally different from (and fixes a bug in) the
  frontend's mock `calculateSimulation`, which hardcodes its factors inline
  and never actually reads its own mock rule-version data.
