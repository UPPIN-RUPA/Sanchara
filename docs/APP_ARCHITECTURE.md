# Sanchara V1 Architecture

Sanchara is organized as a product-oriented monorepo with a layered FastAPI backend and a section-based React frontend.

## Product areas

- Dashboard: high-level counts, savings rollups, and recent momentum
- Timeline: event planning and exploration grouped across years/phases
- Event Workspace: overview, tasks, savings, notes, and memories for one selected event
- Memories: cross-event reflection and artifact archive
- Savings: financial milestones and funding progress

## Backend architecture

`routes -> services -> repositories -> MongoDB`

### Domain modules

- Events: lifecycle, planning metadata, notes, financial fields
- Tasks: event-scoped execution items
- Memories: event-scoped records for reflections and media links
- Summary: cross-event aggregations for dashboard and savings views

### API layout

- `/api/v1/events`
- `/api/v1/events/{event_id}/tasks`
- `/api/v1/events/{event_id}/memories`
- `/api/v1/summary/*`

### Persistence model

- `events`
- `tasks`
- `memories`

Each collection is user-scoped via `user_id`. Event child records are additionally scoped by `event_id`.

## Frontend architecture

The frontend is a single React app with an internal application shell instead of a one-page form.

### UI sections

- App shell with sidebar navigation
- Dashboard section for summaries and quick metrics
- Timeline section for event browsing and selection
- Savings section for financial milestones
- Memories section for cross-event archive
- Event details workspace rendered beside the timeline when an event is selected

### Component responsibilities

- `App.tsx`: app shell, view switching, shared fetch orchestration
- `TimelineBoard`: grouped event exploration and selection
- `EventDetailsPanel`: selected event workspace tabs
- `DashboardCards` + dashboard summaries: high-level overview
- `MemoryBoard`: aggregated reflection/media list
- `SavingsBoard`: funding progress and milestone cards

## Backend/Frontend contract

- frontend reads user context from the same `X-User-Id` concept exposed by the backend
- selected event drives nested task/memory requests
- event notes and overview edits are persisted via event update endpoints
- dashboard, memories, and savings sections are built from shared event data plus nested records

## Current V1 scope

Implemented or targeted in this architecture:

- event CRUD
- task CRUD
- memory CRUD
- summary endpoints
- editable event notes/description workspace
- dashboard/timeline/savings/memories frontend sections

Deferred beyond V1:

- authentication and multi-user identity management
- binary media upload/storage pipeline
- reminders/notifications
- collaboration/family access
- AI planning assistance
