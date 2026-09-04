# Architecture

## Hexagonal boundaries

Keep domain code free of external API shapes and vendor types.

- **Domain** (`src/lib/<feature>/`): models, business rules, and **ports** (interfaces the domain depends on). Example: `LibraryPageSource` returns domain `Album` pages, not Spotify JSON.
- **Adapters** (`src/lib/<vendor>/`): HTTP clients, vendor types, mappers into domain models, and factory functions that implement domain ports.

Domain modules must not import adapter modules. Route handlers and other composition roots wire adapters into domain use cases.

When adding a new external integration, create a dedicated adapter module rather than extending domain files with vendor types.
