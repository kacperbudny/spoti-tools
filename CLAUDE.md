@AGENTS.md

## Agent skills

### Issue tracker

Issues live in Linear, project SpotiTools, team kacperbudny. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

External APIs: keep vendor HTTP in `src/lib/<vendor>/`. Prefer simplicity. See `docs/agents/architecture.md`.

### UI components

Prefer shadcn/ui primitives from `src/components/ui/` whenever one fits. See `docs/agents/ui.md`.

### React components and hooks

Extract non-trivial logic into custom hooks; keep components UI-focused. Main export at the top, helpers at the bottom. See `docs/agents/react.md`.

### HTTP

Use ky via `@/lib/http/ky` instead of native `fetch`. See `docs/agents/http.md`.
