# Zod at system boundaries

Parse data at every system boundary with a Zod schema. Infer TypeScript types from that schema (`z.infer`). The schema is the contract; types are derived from it.

A **system boundary** is where data enters or leaves this process as untyped or serialized input:

- HTTP JSON from vendor APIs
- HTTP JSON / NDJSON from our own API routes (the client parses the wire format)
- Search params, path params, and request bodies
- Environment variables (`src/env.ts`)

In-process TypeScript (function arguments, React props) is not a boundary. SQL rows are parsed by the Drizzle schema, not a second Zod parse. Typed SDK returns (better-auth) are trusted once that library has parsed them.

## How to parse

Call `.parse()` (or `.json()` then `.parse()`) on `unknown`. Do not assert a type onto JSON (`as Foo`, `.json<Foo>()`).

```ts
const body: unknown = await http.get(url).json();
return savedAlbumsPageSchema.parse(body);
```

On parse failure, map to that boundary's domain error (e.g. `SpotifyUnavailableError`, `LibraryLoadError`). Do not surface `ZodError` in the UI.

Keep the schema next to the boundary it protects: vendor HTTP under `src/lib/<vendor>/`, app HTTP contracts next to the feature that owns the route.
