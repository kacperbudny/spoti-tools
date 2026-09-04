# Architecture

## External APIs

Keep each external HTTP API in its own module under `src/lib/<vendor>/`: the client, vendor types, and mapping into app types. Feature code (`src/lib/<feature>/`) imports that module when it needs the vendor.

Call the vendor module directly. Extra interfaces and wiring earn their keep only when a second implementation exists.
