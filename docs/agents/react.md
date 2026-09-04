# React components and hooks

## Custom hooks

Move non-trivial state, data fetching, and event handlers out of components into custom hooks. Components should mostly render UI from hook return values.

Colocate feature hooks next to the component that uses them (e.g. `use-random-album-idle-form.ts` beside `idle-form.tsx`). Extract shared hooks to `src/hooks/` only when reused across features.

## File layout

In component and hook files, put the **main export at the top** and **private helpers at the bottom**:

1. Imports
2. Exported component or hook
3. Non-exported helpers, subcomponents, and constants

Do not place helpers above the main export.
