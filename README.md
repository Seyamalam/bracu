# Clinic Copilot BD

Bangla-first clinic operations with local or cloud AI, realtime case workflow,
and MCP-ready external-agent tools.

Clinic Copilot BD is not a diagnosis or prescription engine. It is a clinic
workflow copilot for low-resource Bangladesh clinics: reception captures messy
Bangla/English intake, AI turns it into draft support, clinicians review safety,
families receive plain instructions, and staff own follow-up.

## What It Supports

- Local AI with LM Studio through the AI SDK OpenAI-compatible provider.
- Cloud AI with Google Gemini through `@ai-sdk/google`.
- No-key deterministic fallback output so demos and tests keep working without
  any model provider.
- Stdio MCP server for LM Studio, Claude, Codex, Cursor, and similar local MCP
  clients.
- HTTP JSON-RPC MCP demo endpoint at `/api/mcp` for curl, public docs, and the
  in-app MCP Explorer.
- Convex-backed clinic workspace with realtime queue, cases, audit logs, and
  role-aware workflow.

## Public Demo Surface

- `/` landing page with model-provider and MCP positioning.
- `/features` complete workflow and feature catalog.
- `/docs` setup docs for AI providers, MCP clients, QA, and deployment.
- `/judge` three-minute judging route.
- `/mission` safety and care principles.
- `/pitch` product pitch, screenshots, differentiators, and demo runbook.
- `/login` demo authentication.

## Clinic Workspace

- `/clinic/queue` queue board, role selection, red-flag lane, follow-up due
  panel, and guided demo start.
- `/clinic/case` case review, intake AI, SOAP support, safety review, staff
  handoff, risk explanation, referral, medicine safety, approval readiness, and
  visit closeout.
- `/clinic/copilot` Codex-style Copilot workspace with threads, tool runs, run
  receipts, approvals inbox, agent timeline, and memory surfaces.
- `/clinic/operations` model controls, accessibility controls, readiness
  scorecard, live queue, trends, clinic briefing, and audit log.
- `/clinic/builder` Agentic Workflow Studio with canvas, Safety Governor,
  patient journey, protocols, shift copilot, simulation lab, and templates.
- `/clinic/admin` MCP Explorer, admin tools, and external-agent proof points.

## AI And Agent Features

- Mixed Bangla/English intake cleanup.
- Clinical draft generation with chief complaint, severity, missing questions,
  red flags, SOAP support, checklist, handout, and follow-up.
- Natural-language Command Copilot.
- Named agent command aliases.
- Current-case Q&A assistant.
- Draft edit support.
- Medicine safety clarity checker.
- Document extraction for prescription, lab, and OCR text.
- Follow-up composer and scheduler.
- Patient question answer assistant.
- Reply triage for incoming patient messages.
- Referral and visit summary composer.
- Staff handoff generator.
- Risk explanation.
- Next-step navigator.
- Approval readiness guard.
- Visit closeout packet.
- AI Run Receipts and Approvals Inbox.
- Browser QA path that exercises real AI fallback UI actions.

## Safety Principles

- AI output is draft support only.
- The product avoids diagnosis and prescription claims.
- Clinicians remain responsible for medical decisions.
- Patient-facing output requires human review.
- Red flags, missing vitals, allergy gaps, pregnancy/child/chest-pain patterns,
  and urgent symptoms are escalated instead of hidden.
- MCP tool outputs include safety envelopes and human-review boundaries.
- Demo data is synthetic.

## Model Providers

### Local LM Studio

Start LM Studio's local server on `http://127.0.0.1:1234`, then run:

```bash
AI_PROVIDER=lmstudio LMSTUDIO_MODEL='google/gemma-4-12b' bun run dev
```

Optional local settings:

```bash
LMSTUDIO_BASE_URL=http://127.0.0.1:1234/v1
LMSTUDIO_MODEL=google/gemma-4-12b
LMSTUDIO_TIMEOUT_MS=45000
LMSTUDIO_MAX_OUTPUT_TOKENS=4096
AI_DEBUG_ERRORS=1
```

LM Studio models may not support system messages, so the app folds system
instructions into the user prompt for local-model calls. Some local models can
still return invalid structured JSON; every route has a controlled fallback.

### Cloud Google Gemini

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
GOOGLE_GENERATIVE_AI_MODEL=gemini-2.5-flash
```

Gemini is used through the same AI SDK route layer. The app keeps provider
failure fallback behavior even when a cloud key is present.

### No Provider

With no provider configured, all AI routes return safe deterministic demo
responses. This keeps public demos, browser QA, and route tests usable.

## MCP Support

This project exposes MCP in two ways:

- `scripts/mcp-stdio.ts`: real stdio MCP server for local MCP clients.
- `/api/mcp`: HTTP JSON-RPC demo endpoint for curl and the in-app MCP Explorer.

The MCP tool catalog includes:

- `clinic.demo_manifest`
- `clinic.list_demo_scenarios`
- `clinic.workflow_brief`
- `clinic.tools.list`
- `clinic.tools.describe`
- `clinic.queue.snapshot`
- `clinic.safety.get_blockers`
- `clinic.print.prepare_packet`
- `clinic.literacy.prepare`
- `clinic.sync.preview_queue`
- `clinic.approval.request`
- `clinic.demo.score_scenario`

MCP resources:

- `clinic://demo/scenarios`
- `clinic://demo/capabilities`
- `clinic://agents/tool-registry`
- `clinic://safety/gates`

### Fast MCP Demo

```bash
bun run mcp:smoke
```

This spawns the stdio MCP server, lists 12 tools, calls
`clinic.safety.get_blockers`, and lists 4 resources.

### LM Studio MCP

Paste `mcp.json` into LM Studio's MCP config, enable **Allow calling servers from
mcp.json** in LM Studio Server Settings, then call:

```bash
curl -s http://127.0.0.1:1234/api/v1/chat \
  -H 'content-type: application/json' \
  -d '{
    "model": "google/gemma-4-12b",
    "input": "Use the clinic-copilot-bd MCP server to call clinic.tools.list and return the first five tool names.",
    "integrations": ["mcp/clinic-copilot-bd"],
    "temperature": 0,
    "context_length": 8000,
    "max_output_tokens": 1024
  }'
```

If LM Studio returns `Permission denied to use plugin`, the MCP server is not
allowed in LM Studio Server Settings yet.

### Claude, Codex, Cursor, And Similar Clients

Use the `mcp.json` server entry:

```json
{
  "mcpServers": {
    "clinic-copilot-bd": {
      "command": "/Users/seyam/.bun/bin/bun",
      "args": ["/Users/seyam/Work/bracu/scripts/mcp-stdio.ts"],
      "env": {
        "AI_PROVIDER": "lmstudio",
        "LMSTUDIO_MODEL": "google/gemma-4-12b"
      }
    }
  }
}
```

### HTTP MCP Demo Endpoint

Start the app:

```bash
AI_PROVIDER=lmstudio LMSTUDIO_MODEL='google/gemma-4-12b' bun run dev
```

List tools:

```bash
curl -s http://localhost:3000/api/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Call safety blockers:

```bash
curl -s http://localhost:3000/api/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"clinic.safety.get_blockers","arguments":{"intake":"Patient has chest tightness and sweating","allergiesKnown":false}}}'
```

On this machine, use `localhost` for the app endpoint. Another listener can
intercept `127.0.0.1:3000`.

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Convex backend
- Vercel AI SDK 6
- `@ai-sdk/google`
- `@ai-sdk/openai-compatible`
- `@modelcontextprotocol/sdk`
- Zod schemas
- Biome
- Bun

## Development

```bash
bun install
bun run dev
```

Run Convex when changing backend functions:

```bash
npx convex dev
```

Seed demo data:

```bash
bunx convex run seed:demo
```

Default seeded login:

```txt
doctor@demo.clinic / demo1234
```

The seed flow creates fake Bangladesh-native cases for fever, cardiac risk,
child dehydration, dengue watch, pregnancy fever, and diabetic wound follow-up.

## Quality Checks

```bash
bun run lint
bun run test
bun run build
bun run validate
bun run qa:browser
bun run mcp:smoke
```

Run the gated LM Studio integration suite when LM Studio is running:

```bash
RUN_LMSTUDIO_TESTS=1 \
AI_PROVIDER=lmstudio \
LMSTUDIO_MODEL='google/gemma-4-12b' \
GOOGLE_GENERATIVE_AI_API_KEY='' \
bun test tests/api-ai-lmstudio.test.ts
```

`bun run qa:browser` builds the app, starts `next start`, drives the public site
and authenticated workspaces through `agent-browser`, checks the MCP Explorer,
and keeps screenshots opt-in with `QA_SCREENSHOTS=1`.

## Demo Checklist

1. Open `/judge` for the three-minute script.
2. Sign in with `doctor@demo.clinic / demo1234`.
3. Start in Queue and pick a case.
4. Generate the clinical draft.
5. Review red flags, missing questions, medicine safety, and approval readiness.
6. Open Copilot for tool runs, receipts, approvals, memory, and agent timeline.
7. Open Builder and show Canvas, Governor, Journey, Protocols, Shift,
   Simulation, and Marketplace.
8. Print or inspect handout, referral, medicine slip, doctor summary, and
   follow-up call sheet outputs.
9. Open Admin and run MCP Explorer.
10. Run `bun run mcp:smoke` or connect LM Studio through `mcp.json`.

## Deployment Checklist

- Set `NEXT_PUBLIC_CONVEX_URL`.
- Set `GOOGLE_GENERATIVE_AI_API_KEY` for cloud AI if desired.
- Keep LM Studio local settings out of production unless intentionally running a
  local model gateway.
- Run `bunx convex deploy` for production Convex functions.
- Optionally run `bunx convex run seed:demo` before judging.
- Run `bun run validate` and `bun run mcp:smoke`.
- Replace temporary password auth before any real-world pilot.
