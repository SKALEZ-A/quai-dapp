# Architecture Overview

- Frontend (Next.js) integrates Pelagus and `quais` with pathing enabled.
- Contracts are upgradeable (UUPS) with timelock governance.
- Bridge is abstracted via a provider interface; specific partners can be swapped.
- API provides GraphQL reads and REST writes; Postgres + Redis for persistence and caching.
- Indexer subscribes to `quais` RPC logs per zone.

Diagrams and details will evolve as we implement Tasks A/B/C.
