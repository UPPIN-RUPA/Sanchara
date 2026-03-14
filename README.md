# Sanchara

Sanchara is a life planning and memory timeline application.

It is built around one core idea:

**Plan the future, track the journey, preserve the memories.**

Sanchara is not a work dashboard, not a Jira-like tracker, and not a corporate productivity tool. It is a calmer personal system for long-term milestones, life chapters, savings goals, and meaningful moments.

## What Sanchara Is

Sanchara is meant to feel like:

- a personal future map
- a digital life journal
- a goal and milestone planner
- a savings tracker for long-term dreams
- a memory archive for meaningful life events

Examples of plans Sanchara is designed for:

- career foundation
- marriage planning
- buying land
- building a house
- starting a farm ecosystem
- travel dreams
- retirement vision

## Current Product State

This repository is now a real full-stack product foundation.

### Public entry layer

The frontend now has a separate public experience:

- Landing page
- Login page
- Signup page

These pages are visually separate from the authenticated app shell and establish Sanchara as a premium life-planning product, not just an internal tool screen.

### Authenticated application

The authenticated experience now has:

- Dashboard
- Timeline
- Plans
- Savings
- Memories
- Search
- Archive
- Settings
- Year View

The dashboard, timeline, and year view now form the beginning of the real core planning flow.

## Built Features

### Backend

The backend is implemented with FastAPI and MongoDB-oriented repositories.

Currently built:

- event CRUD
- summary endpoints
- task CRUD nested under events
- memory CRUD nested under events
- service-layer validation for business rules
- financial progress calculations
- user-scoped behavior through `X-User-Id`
- backend tests passing with `pytest`

Important backend validation already enforced:

- financial events require `savings_target`
- completed events cannot be in the future
- updates cannot create invalid date ranges

### Frontend

The frontend now includes:

- public landing, login, and signup flow
- authenticated app shell with shared sidebar and header
- dashboard command center
- signature timeline workspace
- year view page
- plans workspace
- savings page
- memories page
- archive page
- settings page

### Timeline experience

The timeline is now structured as a real product surface, not just a list:

- timeline header
- filter panel
- horizontal canvas
- year ruler
- stacked event lanes
- milestone nodes
- preview panel
- zoom/navigation strip
- year handoff into a year-focused view

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- CSS-based design system in the repo

### Backend

- Python 3.11+
- FastAPI
- Uvicorn
- MongoDB / Motor
- pytest

## Current Frontend Architecture

The frontend is now structured around shared layout primitives and page/domain components.

```text
frontend/src/
├── components/
│   ├── auth/
│   ├── dashboard/
│   ├── landing/
│   ├── layout/
│   ├── shared/
│   ├── timeline/
│   └── year/
├── data/
├── pages/
├── types/
└── lib/
```

Important structure already in place:

- `AppShell`
- `Sidebar`
- `HeaderBar`
- `ContentContainer`
- `AuthLayout`
- dedicated page components
- dedicated dashboard components
- dedicated timeline components
- shared frontend types
- shared mock data

This matters because Sanchara has crossed the line from a prototype blob into a structured frontend.

## Current Backend Architecture

The backend is layered around:

- API routes
- services
- repositories
- models

Important domains already present:

- events
- tasks
- memories
- summaries

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Production build:

```bash
cd frontend
npm run build
```

### Backend

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
python3.11 -m pip install -e '.[dev]'
uvicorn app.main:app --reload
```

Run tests:

```bash
cd backend
APP_ENV=test python3.11 -m pytest
```

## Verified Status

At the current state of this repository:

- frontend production build passes
- backend tests pass

## Product Direction From Here

The next major phase is the core plan lifecycle:

- `CreateEventPage`
- `EventDetailPage`

After that, the product should continue into:

- richer savings UI
- richer memories UI
- search refinement
- archive refinement
- settings depth
- later real routing and persistence refinement on the frontend

## Current Build Sequence Already Completed

The product has progressed in this order:

1. backend event, task, and memory foundation
2. frontend MVP screens
3. full app shell
4. public entry layer
5. dashboard and timeline restructuring
6. timeline componentization
7. year view

That sequence matters because the architecture is now stable enough to keep building without collapsing back into one oversized `App.tsx`.

## Philosophy

Sanchara should always remain grounded in this product identity:

- future planning
- long-term goals
- timeline visualization
- savings for dreams
- emotional memory archive

That is the product contract this repository now follows.
