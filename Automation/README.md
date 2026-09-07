# Automation (n8n)

Self-hosted [n8n](https://n8n.io) instance, part of the [insurance-mvp](../README.md) project. Runs the **PRAXIS Assistant** workflow: a chatbot backend that answers prospect questions about PRAXIS insurance products (grounded only in real data from `Backends/`) and can capture interested prospects as draft leads for staff follow-up. `Frontends/`'s `ChatWidget` component (`Frontends/src/components/common/ChatWidget.tsx`, on every public page) calls into this — see `../Docs/FOLDER-STRUCTURE.md` for how this fits into the rest of the repo.

## Status

**Working end-to-end, verified live, including the frontend widget.** The "PRAXIS Assistant" workflow ([`workflows/praxis-assistant-001.json`](workflows/praxis-assistant-001.json)) answers on-topic product questions with real data, refuses off-topic questions with the exact configured message, remembers earlier turns in the same conversation, runs real premium simulations (`POST /simulations`) when a prospect wants a quote, and successfully captures a consenting prospect as a `DRAFT` application via `POST /leads` — with any earlier simulation from the same chat session attached automatically — confirmed by querying the database directly and by the resulting `LEAD_CAPTURED` audit log entry. Getting here required tracking down and fixing two real, non-obvious n8n bugs, plus a deliberate architecture choice around a real LLM reliability limit — see "Bugs found and fixed" below, since they matter again if this workflow is ever rebuilt from scratch or edited a certain way in the n8n UI.

Three things still need doing once, by hand, in the n8n UI on any machine this is deployed to (no way to script these — see below): create the instance's owner login, add a Gemini API key credential, and activate the workflow.

## Running it

From the repo root:

```
docker compose up -d n8n
```

Open `http://localhost:5678`. **First time only**, n8n shows a one-time setup screen to create an owner account (email + password) — this is n8n v2's actual login mechanism. (Earlier versions of n8n used `N8N_BASIC_AUTH_ACTIVE`/`N8N_BASIC_AUTH_USER`/`N8N_BASIC_AUTH_PASSWORD` env vars for this; those are deprecated and non-functional in v2 — verified live, confirmed via [n8n community discussion](https://community.n8n.io/t/hello-i-need-remove-auth-login/46487) — so don't set them expecting a login prompt.) The owner account is stored in the `n8n_data` volume, so you only see this screen once per volume — it survives container restarts, but a fresh/different machine (empty volume) will show it again.

First run only, import the committed workflow:

```
./Automation/scripts/import-workflows.sh
```

## One-time setup (do these three, in the n8n UI, after import)

1. **Owner account** — the setup screen described above, if you haven't already.
2. **Gemini API key.** The PRAXIS Assistant uses **Google Gemini** (free tier — no credit card, 1.5M tokens/day on Gemini Flash) as its LLM. This key is a secret and is **not** committed to git or put in `docker-compose.yml` — it's stored as an encrypted n8n credential instead:
   - Get a free key at [aistudio.google.com](https://aistudio.google.com/) (Google account required).
   - In the n8n UI: **Credentials → New → Google Gemini(PaLM) Api** → paste the key → save.
   - Open the `PRAXIS Assistant` workflow → the **Google Gemini Chat Model** node → select that credential. (The node also has a model dropdown defaulted to `models/gemini-3.5-flash-lite` in the committed JSON — `gemini-2.5-flash-lite` was the original default but is deprecated as of this writing; once your credential is attached, n8n loads your account's actual available models live, so reselect from that list if Google has moved on again by the time you're reading this.)
3. **Activate the workflow.** There are two ways: toggle **Active** in the n8n UI (top right of the workflow), or from the CLI — `docker compose exec n8n n8n publish:workflow --id=praxis-assistant-001` followed by `docker compose restart n8n` (n8n only picks up a CLI-published version on restart if the instance was already running).

Once all three are done, the webhook is live at `http://localhost:5678/webhook/<this workflow's webhookId>/chat` (`POST`, body `{"chatInput": "...", "sessionId": "..."}`, per the Chat Trigger node — see "Bugs found and fixed" below for why this isn't a plain Webhook node). Find the exact URL either in the n8n UI (open the Chat Trigger node, copy the "Production URL") or by reading the `webhookId` field on the `Chat Trigger` node in `workflows/praxis-assistant-001.json`.

## Why n8n's "push to Git" button isn't used

n8n's native Git-based Source Control feature requires a paid Business/Enterprise license — not available in the free, self-hosted Community Edition this project runs. Instead, this project uses n8n's built-in **CLI export/import**, which writes/reads plain workflow JSON files — free, and just as git-friendly:

| Step | Command |
|---|---|
| After editing a workflow in the UI, export it | `./Automation/scripts/export-workflows.sh` |
| Review + commit the change | `git add Automation/workflows/*.json && git commit && git push` (ordinary git — this repo is a monorepo, see root README) |
| On a different/fresh machine | `git clone` this repo → `docker compose up -d n8n` → create the owner account at the one-time setup screen → `./Automation/scripts/import-workflows.sh` |

**Caveat:** `N8N_ENCRYPTION_KEY` (in `docker-compose.yml`) encrypts saved credential values (like the Gemini key above). It must be a fixed value and identical across every machine you import onto — workflow *logic* imports fine regardless, but credential *secrets* won't decrypt with a different key and would need re-entering.

**Gotcha, discovered the hard way:** `n8n export:workflow --separate` names each output file after the workflow's own top-level `"id"` field, not the source filename it was originally imported from. If a workflow JSON's committed filename doesn't exactly match `<its id>.json`, every export creates a *new* file instead of updating the existing one, and duplicate workflow records pile up on re-import (verified live). **Rule for any workflow you add here: give it an explicit top-level `"id"` in the JSON, and name the committed file exactly `<that id>.json`** — that's why this one is `praxis-assistant-001.json` with `"id": "praxis-assistant-001"`, not the more natural `praxis-assistant.json`. With matching id+filename, re-importing the same file updates the same record in place (confirmed: imported twice in a row, still exactly one workflow) and exporting overwrites the same file in place (confirmed across a full fresh-volume → import → export cycle) — no accumulation.

## Database

SQLite, in its own named volume (`n8n_data`) — fully isolated from the app's Postgres database. This is n8n's zero-config default; fine for local/dev use. n8n's own docs recommend Postgres only for internet-exposed instances under heavy concurrent webhook traffic, which doesn't apply here.

## The PRAXIS Assistant workflow

Built as an **AI Agent with tools** (`@n8n/n8n-nodes-langchain.agent`, the current idiomatic n8n pattern for "answer questions, optionally take an action"), not a hand-rolled if/else branch — the agent itself decides when to call which tool, driven by its system prompt:

```
Chat Trigger (POST /webhook/<webhookId>/chat, body: { "chatInput": "...", "sessionId": "..." })
        │  (public, mode: webhook, no auth — production URL, not the UI test panel;
        │   this is exactly the {chatInput, sessionId} shape Frontends/'s ChatWidget sends)
        ▼
    AI Agent ── ai_languageModel ── Google Gemini Chat Model
    (responseMode:                  (needs your credential - see setup above)
     lastNode — the Agent's
     own { output } becomes         ai_memory ── Chat Memory
     the webhook response,          in-RAM buffer (last 10 turns), keyed by the
     no separate "Respond to        Chat Trigger's own sessionId field - lets the
     Webhook" node needed)          agent remember earlier turns (e.g. name/product
        │                          given two messages ago) within the same session
        │
        ├── ai_tool ── Get PRAXIS Products
        │              GET Backends/ /api/v1/products - the agent calls this
        │              whenever it needs real product data to answer; system
        │              prompt forbids answering from anything else, and
        │              defines the exact refusal message for off-topic questions
        │
        ├── ai_tool ── Simulate Premium
        │              POST Backends/ /api/v1/simulations - the agent calls this when
        │              the prospect wants a price estimate, after collecting age, sum
        │              assured (Uang Pertanggungan), payment term (Masa Pembayaran),
        │              and payment frequency (Frekuensi Bayar). Also silently sends the
        │              chat's own sessionId (a real n8n expression reading the Chat
        │              Trigger node, NOT a model-supplied argument - see "Bugs found
        │              and fixed" below for why)
        │
        └── ai_tool ── Capture Lead
                       POST Backends/ /api/v1/leads - the agent calls this ONLY
                       after explicitly asking the prospect for consent to be
                       contacted and getting a clear yes + name + contact info
                       (system prompt enforces this ordering). Also silently sends
                       the same sessionId, so Backends/ can auto-attach the most
                       recent simulation from this session - see below
```

See `../Docs/API-LIST-V0.md` for the `POST /api/v1/leads` and `POST /api/v1/simulations` contracts these tools call, and `workflows/praxis-assistant-001.json` for the exact system prompt text and tool descriptions.

**Memory is in-RAM only** (n8n's `Simple Memory` / `memoryBufferWindow` node) — lost on an n8n restart, and explicitly not shared across multiple n8n workers (not relevant here, this is a single instance). Fine for this MVP's scope; if this ever needs to survive restarts or scale to multiple workers, swap it for one of n8n's persistent memory node types (Redis/Postgres) — a one-node change, not a rework.

**Replies are plain text, not markdown.** By default Gemini writes `**bold**`, `### headers`, bullet lists, and emoji — verified live, every reply came back full of literal `**`/`###` characters. Since `Frontends/`'s `ChatWidget` renders replies as plain text (no markdown parser - a chat bubble isn't a document), that would show the raw asterisks/hashes to the prospect instead of formatting anything. The system prompt now explicitly forbids all markdown and asks for short, conversational, human-sounding sentences instead - verified live across several message types (product question, off-topic small talk, a premium quote) with zero markdown artifacts in any of them.

## Bugs found and fixed (matters if you rebuild or re-edit this workflow)

Getting a working AI Agent + tools workflow out of this specific n8n build (`2.37.10`, the latest stable at the time of writing) required finding and working around two real engine bugs — not workflow-authoring mistakes. Both were root-caused by reading n8n's own installed source and cross-checking against the raw execution data in its SQLite database, not by guesswork. Recorded here so nobody re-discovers them the hard way:

1. **AI Agent `typeVersion: 3.1` ("Tools Agent V3") cannot actually call a native-`supplyData` tool node (like `toolHttpRequest`) in a real/production execution — only in the n8n UI's manual test panel.** Every attempt to invoke a tool threw `The node "@n8n/n8n-nodes-langchain.toolHttpRequest" has a "supplyData" method but no "execute" method` from deep inside n8n-core's `WorkflowExecute.runNode`. This reproduced identically regardless of trigger type (plain Webhook vs. Chat Trigger) and response mode, and the raw execution log (pulled directly from `database.sqlite`) proved the tool node was being dispatched by the Agent itself as an ordinary queued node — not a JSON/connections mistake on this workflow's part. V3 uses a newer internal "engine request" tool-dispatch mechanism (`ToolsAgent/V3/helpers/createEngineRequests.js`) that appears to only be wired up for n8n's *partial* execution path (the UI's per-node test/re-run feature), not the full/production run path a real trigger uses. **Fix: use `typeVersion: 2.3`** (the older "Tools Agent V2" implementation, `ToolsAgent/V2/execute.js`) on the `@n8n/n8n-nodes-langchain.agent` node — it calls tools inline via the standard `supplyData` closure and works correctly in production. This is what's committed. If you ever see this error again after editing the Agent node in the UI (which may reset it to the newest version), re-check its `typeVersion`.
2. **`toolHttpRequest`'s JSON-body mode does not support `$fromAI()` expressions — despite that being the commonly-documented pattern elsewhere in n8n.** The `Capture Lead` node originally used `"jsonBody": "{ \"productId\": \"{{ $fromAI('productId', ...) }}\", ... }"`. This silently failed: the agent's real arguments were discarded and the tool was invoked with an empty object every time (visible in the execution log as `"query": {}`), which then failed the backend's DTO validation. Reading `ToolHttpRequest/utils.js` directly showed why: this node's parameter-extraction regex only recognizes literal `{name}`-style tokens in the body text, paired with a separate "Placeholder Definitions" list (name/description/type per placeholder) — `$fromAI()` isn't parsed here at all. **Fix:** the committed `jsonBody` uses `{productId}`, `{fullName}`, `{email}`, `{phone}`, `{notes}` placeholders, each declared in `placeholderDefinitions`. If you add more fields to this tool later, follow the same pattern — not `$fromAI()`.
3. **The LLM (`gemini-3.5-flash-lite`) cannot reliably carry an opaque id (a UUID) across separate tool calls, even a couple of turns apart with full conversation memory intact.** The first version of Simulate Premium/Capture Lead relied on the model reading `simulationRunId` out of a prior tool result and passing it back verbatim as a `Capture Lead` argument, so a quote given earlier in the chat would be saved with the lead. This failed silently in every real test (3 separate attempts, including strengthened prompt instructions telling it to "copy the id verbatim") — the model would summarize the simulation into the free-text `notes` field instead and pass an empty `simulationRunId`, and `Capture Lead`'s tool call would "succeed" with no error, so nothing looked wrong from the chat transcript. **Fix: stopped asking the model for it entirely.** `SimulationRun` and the lead-capture request now both carry the chat's own `sessionId` - injected via a real n8n expression, `{{ $('Chat Trigger').item.json.sessionId }}`, directly in each tool's `jsonBody`, which n8n evaluates itself before the model ever sees the request (this is standard `=`-prefixed n8n expression evaluation, unrelated to the model-facing `{name}` placeholder mechanism in bug #2 above - the two coexist in the same `jsonBody` string). `Backends/`'s `POST /leads` then looks up the most recent valid `SimulationRun` for that `(sessionId, productId)` pair itself (`ApplicationsService.createLead()`) - fully deterministic, no LLM step in the id-passing path at all. `POST /leads` still accepts an explicit `simulationRunId` too, for any future non-chat caller that already knows exactly which simulation it means.

## Known limitation

Draft leads created here don't yet show up distinctly in the admin `ApplicationsInboxView` (its status filter only lists Submitted/Under Review/Approved/Rejected) — staff can query them directly in the database for now. A proper "Leads" admin view is natural follow-up work, not required for this to function.
