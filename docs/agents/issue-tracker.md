# Issue tracker: Linear

Issues and specs for this repo live in Linear. Use the Linear MCP (`plugin-linear-linear`). Do not use GitHub Issues, `gh issue`, or local markdown under `.scratch/` for this repo's work.

## Scope

- **Workspace / team:** `kacperbudny`
- **Project:** `SpotiTools` — only issues in this project are in scope for this repository. Ignore other Linear work.
- New issues are usually created by the maintainer as unrefined ideas. Treat unlabeled SpotiTools issues as incoming triage, not as ready work.
- This is a one-person team. **Never set or change assignees.**
- **PRs as a request surface: no.** GitHub pull requests are not triaged as requests.

## Conventions

All Linear MCP calls that list or create work must be scoped to team `kacperbudny` and project `SpotiTools`.

- **Create an issue:** `save_issue` with `team: "kacperbudny"`, `project: "SpotiTools"`, `title`, and `description` (markdown). Do not set `assignee`. New issues should not be treated as specified; leave triage labels off unless a skill is applying a role.
- **Read an issue:** `get_issue` with the identifier (e.g. `KAC-123`), then `list_comments` with `issueId` for the thread.
- **List issues:** `list_issues` with `team: "kacperbudny"`, `project: "SpotiTools"`, plus `label` / `state` filters as needed. Request `fields` including `title`, `description`, `labels`, `status`, `url`, `createdAt`, `updatedAt`.
- **Comment:** `save_comment` with `issueId` and `body` (markdown).
- **Apply / remove labels:** `save_issue` with `id` and `labels`. The `labels` array **replaces the full set** — read current labels first, then send the complete list (keep unrelated labels).
- **Close (wontfix only, when a skill requires it):** `save_issue` with `id` and `state` set to a canceled/completed cancelled-type state (prefer the team's Canceled state). Always comment first.

Triage state is **labels**, not Linear workflow status. Do not move Todo / In Progress / Done to encode `needs-triage` or `ready-for-agent`. `ready-for-agent` is the "ready to pick up" signal.

If a triage/category label is missing in Linear, create it with `create_issue_label` (workspace label is fine) before applying it.

A bare identifier like `KAC-123` is a Linear issue. GitHub `#n` is not this tracker.

## When a skill says "publish to the issue tracker"

Create a Linear issue on team `kacperbudny` in project `SpotiTools`.

## When a skill says "fetch the relevant ticket"

`get_issue` plus `list_comments` for that identifier.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a parent Linear issue; **child** issues are tickets.

- **Map:** one issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. Create it in SpotiTools.
- **Child ticket:** a Linear sub-issue (`parentId` = the map). Labels: `wayfinder:<type>` (`research` / `prototype` / `grilling` / `task`). Do not assign.
- **Blocking:** Linear relations via `save_issue` `blockedBy` / `blocks`. A ticket is unblocked when every blocker is completed or canceled.
- **Frontier query:** list the map's open children (`list_issues` with `parentId` and an incomplete state), drop any with an open blocker; first in map order wins.
- **Claim:** do not assign. Record claim in a comment on the ticket instead (session's first write).
- **Resolve:** `save_comment` with the answer, then complete the issue, then append a context pointer to the map's Decisions-so-far.
