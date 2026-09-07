# Dummy Access — Local Demo Environment

Access URLs, seeded demo accounts, and exactly what each role can and can't do. Local `docker-compose` stack only — nothing here is a production credential.

**Important caveat:** the frontend's admin login screen (`Frontends/src/views/admin/AdminLoginView.tsx`) does **not** call the real backend yet — it still logs you in against local mock data with no real password check (see `DATA-STRUCTURE.md` §1). The accounts below are real, working accounts in the backend's database, testable directly against the API (`curl`, Postman, etc.) right now. They will work through the actual frontend login form once `Frontends/` is wired to `Backends/`.

---

## Access URLs (local `docker compose up`)

| Surface | URL |
|---|---|
| Public site (frontend) | http://localhost:3000/ |
| Admin portal (frontend — see caveat above) | http://localhost:3000/admin/login |
| Backend API base | http://localhost:3001/api/v1 |
| Health check | http://localhost:3001/api/v1/health |
| Readiness check (DB connectivity) | http://localhost:3001/api/v1/ready |
| PostgreSQL (for a DB client, not a browser) | `localhost:5432`, db `insurance`, user `app`, password `app` |
| n8n ("PRAXIS Assistant" chat workflow) | `localhost:5678` — first visit creates your own owner login (no shared demo credential; see `Automation/README.md`) |

Example login against the real API:

```bash
curl -i -c cookies.txt -X POST http://localhost:3001/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"sarah.wijaya@praxis.co.id","password":"praxis123"}'

curl -b cookies.txt http://localhost:3001/api/v1/admin/applications
```

---

## Seeded users

All passwords: **`praxis123`**

| Name | Email | Role | Reports to |
|---|---|---|---|
| PRAXIS Admin | `admin@praxis.co.id` | Admin | — |
| Bambang Soedirman | `bambang.soedirman@praxis.co.id` | Underwriter Manager | — |
| Sarah Wijaya | `sarah.wijaya@praxis.co.id` | Senior Underwriter | Bambang Soedirman |
| Bobby Pratama | `bobby.pratama@praxis.co.id` | Senior Underwriter | Bambang Soedirman |
| Rangga Pradipta | `rangga.pradipta@praxis.co.id` | Underwriter | Sarah Wijaya |
| Dewi Anggraeni | `dewi.anggraeni@praxis.co.id` | Tele-Consultant | Bambang Soedirman |
| Citra Aditama | `citra.aditama@praxis.co.id` | Auditor (read-only) | — (independent compliance function) |

Manager chain demonstrated: **Rangga Pradipta → Sarah Wijaya → Bambang Soedirman** (3 levels, for testing the hierarchy/escalation behavior described in `PRD.md` §4.3).

---

## What each role can and can't do

Source of truth: `Backends/src/auth/role-permissions.ts`. "Can" below means an API call actually succeeds (200/201); "Can't" means it returns 403.

### Admin
**Can:** everything — every endpoint in `API-LIST-V0.md` (`*` permission).
**Can't:** nothing.

### Underwriter Manager
**Can:** view the application inbox/detail/dashboard; start review, approve, reject (with reason), assign/reassign applications; add internal notes; edit/convert/decline `DRAFT` leads (`applications:manage_lead` — see below); create/edit/publish/archive products; create and activate simulation-rule versions; manage users and change reporting-manager relationships (cycle-checked); view the audit log.
**Can't:** nothing among currently implemented endpoints — functionally equal to Admin today. (Difference from Admin: this role's permissions are an explicit list, not a wildcard, so a *future* endpoint with a new permission string would need to be added to this role explicitly — Admin would get it automatically.)

### Senior Underwriter
**Can:** view inbox/detail/dashboard; start review, approve, reject, assign; add internal notes; edit/convert/decline `DRAFT` leads; view the audit log.
**Can't:** create/edit/publish/archive products; create or activate simulation-rule versions; manage users or reporting-manager relationships.

### Underwriter
**Can:** view inbox/detail/dashboard; start review (`SUBMITTED → UNDER_REVIEW`); add internal notes; edit/convert/decline `DRAFT` leads; view the audit log.
**Can't:** approve or reject applications; assign/reassign applications; touch products, simulation rules, users, or organization.

### Tele-Consultant
**Can:** view inbox/detail/dashboard; add internal notes; edit/convert/decline `DRAFT` leads — a `DRAFT` lead is exactly the "call the prospect, confirm details, submit" work this role is for (see `applications:manage_lead` in `role-permissions.ts`).
**Can't:** start review, approve, reject, or assign a formally `SUBMITTED`/`UNDER_REVIEW` application; view the audit log; touch products, simulation rules, users, or organization.

### Auditor (read-only)
**Can:** view inbox/detail/dashboard; view all products (admin list); view simulation-rule versions; view the audit log.
**Can't:** add notes; start review, approve, reject, or assign applications; create/edit/publish/archive products; create or activate simulation-rule versions; manage users or organization. Deliberately zero mutation permissions — see `DATA-STRUCTURE.md` §2.0 for why this role exists (PRD.md §5's "Read-only / Auditor" requirement).

### Anyone, unauthenticated (public)
**Can:** browse published products, run the premium simulator, submit a lead application.
**Can't:** anything under `/admin/*`, or `GET /me`.
