# Sanchara

Sanchara is a life-planning and memory-timeline product designed for people who think in years, not just days.

It is built around a simple idea:

**plan the future, track the journey, preserve the memories**

Unlike task-heavy productivity tools, Sanchara focuses on meaningful life goals such as building a career foundation, planning a marriage, saving for land or a home, shaping a family future, or preserving the memories connected to those milestones.

## Why Sanchara Exists

Most planning products are optimized for work execution, team tickets, and short-term productivity. Sanchara is different.

It is designed to help users:

- map long-term life goals clearly
- visualize milestones over time
- connect plans with savings progress
- preserve important memories alongside those plans
- see personal progress as a journey instead of a checklist

Sanchara treats life planning as something emotional, visual, and long-range.

## What The Product Does

Sanchara combines planning, timeline visualization, financial intent, and memory capture into one system.

The product currently includes:

- a public landing experience
- authentication entry pages
- an authenticated application shell
- a dashboard for high-level direction
- a timeline workspace for long-range plans
- a year view for focused time-based exploration
- plan and event management foundations
- savings-oriented goal tracking
- memories attached to life events
- archive and settings surfaces

## How Sanchara Helps

Sanchara helps users move from vague aspirations to visible life direction.

It helps by:

- giving structure to long-term dreams
- turning future goals into milestones that feel concrete
- allowing financial goals to live near life goals instead of in a separate tool
- keeping important memories connected to the events they belong to
- making personal planning feel calmer and more reflective than a standard productivity dashboard

This makes it useful for people planning life chapters, not just work items.

## Current Product Experience

### Public Experience

The public-facing side introduces the product clearly and establishes its identity before login.

It includes:

- landing page
- login page
- signup page

This separation matters because Sanchara is positioned as a real product, not just an internal application screen.

### Authenticated Experience

After sign-in, the app opens into a structured workspace with multiple product areas.

Current pages include:

- Dashboard
- Timeline
- Plans
- Savings
- Memories
- Search
- Archive
- Settings
- Year View

These pages form the beginning of a full personal-planning platform rather than a single-feature prototype.

## Signature Product Areas

### Dashboard

The dashboard acts as a command center for personal direction.

It helps users:

- understand current focus areas
- track active goals
- view important time-based signals
- move quickly into deeper planning spaces

### Timeline

The timeline is one of Sanchara’s defining surfaces.

It is built as a real visual planning workspace with:

- a timeline header
- filters
- a horizontal canvas
- year markers
- event lanes
- milestone nodes
- preview detail areas
- zoom and navigation controls

This makes the product feel closer to a life map than a list of entries.

### Savings

Savings is intended to support dream-linked financial planning.

Instead of treating money tracking as separate from life planning, Sanchara ties financial progress to real goals such as:

- home plans
- land purchase
- travel
- wedding planning
- retirement preparation

### Memories

Memories are part of the product identity, not an afterthought.

They allow meaningful life events to retain context and emotional value, helping the platform serve not just as a planner, but also as a record of lived experience.

## Architecture Overview

Sanchara is structured as a full-stack application.

### Frontend

The frontend is built with:

- React
- TypeScript
- Vite
- a repo-local CSS design system

The frontend structure is organized around reusable product surfaces instead of one large file.

```text
frontend/src/
  components/
    auth/
    dashboard/
    landing/
    layout/
    shared/
    timeline/
    year/
  data/
  lib/
  pages/
  types/
```

Important frontend architecture already in place:

- shared app shell
- dedicated auth layout
- timeline-specific components
- year-view components
- shared product primitives
- page-based composition

### Backend

The backend is built with:

- Python 3.11+
- FastAPI
- MongoDB
- Motor
- pytest

The backend is layered around:

- routes
- services
- repositories
- models

Current backend domains include:

- events
- tasks
- memories
- summaries

## Built Features

### Backend Features

- event CRUD
- task CRUD nested under events
- memory CRUD nested under events
- summary endpoints
- financial progress calculations
- service-layer validation
- user-scoped behavior through request headers
- test coverage for key API behavior

Important validation already enforced:

- financial events require savings targets
- completed events cannot be placed in the future
- invalid date-range updates are rejected

### Frontend Features

- public entry flow
- structured authenticated shell
- dashboard experience
- timeline workspace
- year view
- plans workspace
- savings page
- memories page
- archive page
- settings page

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Build the frontend:

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

Run backend tests:

```bash
cd backend
APP_ENV=test python3.11 -m pytest
```

## Verified Status

At the current state of the project:

- frontend production build passes
- backend tests pass

## What Makes Sanchara Different

Sanchara is not trying to become a corporate planning tool.

Its identity is rooted in:

- future planning
- long-term life goals
- emotional milestones
- savings for meaningful dreams
- memory preservation
- time-based storytelling through a timeline

That makes it useful as both a product concept and a strong full-stack portfolio project with a clear point of view.

## Product Direction

The next strong phase for Sanchara is deepening the plan lifecycle.

High-value next steps include:

- richer create-event and event-detail flows
- stronger savings workflows
- deeper memory capture and display
- refined search and archive behavior
- persistence and routing maturity on the frontend
- continued product polish around the timeline

## Summary

Sanchara is a full-stack personal life-planning product that helps users imagine the future, organize long-term milestones, track savings progress, and preserve memories in one calm and intentional workspace.
