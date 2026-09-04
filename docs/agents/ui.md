# UI components

## shadcn/ui

This project uses [shadcn/ui](https://ui.shadcn.com/) (`src/components/ui/`). Installed components are listed in that directory.

### Default rule

**Prefer shadcn components whenever one fits the UI need.** Do not hand-roll bordered boxes, buttons, form controls, alerts, or other primitives that shadcn already provides.

Before building UI with raw HTML + Tailwind:

1. Check `src/components/ui/` for an existing component.
2. If none exists, add the matching shadcn component (`bunx shadcn@latest add <name>`) rather than inventing a one-off.
3. Compose shadcn primitives (`Card`, `CardHeader`, `Button`, `Switch`, etc.) instead of duplicating their styles with utility classes.

### When plain HTML is fine

- Semantic structure that shadcn does not wrap (`fieldset`, `legend`, `nav`, headings).
- Layout wrappers that are not design-system surfaces (flex/grid containers with gap only).
- Cases where no shadcn component exists and adding one would be disproportionate for a one-line element.

### Conventions

- Import from `@/components/ui/*`, not copy-paste styles from shadcn docs into feature components.
- Match existing compound patterns (e.g. `Card` + `CardHeader` + `CardFooter`, not a single `div` with manual border/radius).
- Keep `components.json` registry in sync: new shadcn adds belong in the repo, committed with the feature that uses them.
