# Tests (Bun)

Run the suite with `bun test` (see `package.json`). Preloads: `happydom.ts`, `src/test/next-link.ts` (`bunfig.toml`).

## Module mocks are process-global

`bun test` runs files in **one process** unless you split invocations. `mock.module()` replaces a module in the **global module map for the entire run**.

- **`mock.restore()` does not undo `mock.module()`** ([Bun mocks](https://bun.sh/docs/test/mocks)). `afterAll` / `afterEach` cleanup fixes `spyOn` and `mock()`; it does **not** reliably reset module overrides for other files.
- **Static imports bind at file load time.** If file A mocks `@/lib/foo` and file B is evaluated later, B’s `import { x } from "@/lib/foo"` may see the mock forever in that run. **File discovery order can make CI flaky** — do not depend on order.
- **Top level vs `describe`:** both register a global override; `describe` only changes *when* it runs, not *scope*.

## Where to mock

| Mock target | Use when |
|-------------|----------|
| **Component hook or UI boundary** (`useInstallAffordance`, etc.) | Component tests need controlled behavior without touching shared lib modules. |
| **`@/lib/...` in unit tests** | Prefer real implementations; use `spyOn` on instances when you must stub I/O. |
| **`mock.module("@/lib/...")` from component tests** | **Avoid** — leaks into other files’ imports of the same path. |

Example: `src/test/mock-install-affordance.ts` mocks `@/components/app/use-install-affordance` so Install UI tests stay visible without mocking `@/lib/install/install-action`.

Shared Next.js shims belong in preload (e.g. `src/test/next-link.ts`), not duplicated per file.

## Stronger isolation (optional)

If a test must override a module other suites import, run it in a **separate process**, e.g. `bun test src/lib && bun test src/components`, instead of relying on teardown hooks.
