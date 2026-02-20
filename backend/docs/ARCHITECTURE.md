# Backend Architecture

Sanchara backend follows a layered structure:

`routes -> services -> repository -> MongoDB`

## Layer responsibilities

- **Routes (`app/api/v1`)**
  - HTTP concerns only: request parsing, status codes, API contracts.
  - Resolve user context (`X-User-Id`) and inject dependencies.
- **Services (`app/services`)**
  - Business orchestration and cross-field rules.
  - Shape typed responses before returning to routes.
- **Repository (`app/repositories`)**
  - Data access and query behavior (filters, sorting, pagination, aggregation).
  - Persistence-specific concerns (Mongo document conversion, indexes, soft delete filters).
- **Database (`app/db`)**
  - MongoDB connection lifecycle management.

## User scoping flow

1. `get_current_user_id` reads `X-User-Id` (defaults to `demo-user`).
2. Routes pass `user_id` into service methods.
3. Services pass `user_id` into repository operations.
4. Repository applies base query constraints (`user_id`, `deleted_at=None`).

## Why this split

- Keeps endpoints thin and easier to evolve.
- Prevents business rules from drifting into route or repository layers.
- Makes service logic testable independently of storage implementation.
