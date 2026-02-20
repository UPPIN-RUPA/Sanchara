# Sanchara

Sanchara is a personal life-planning and timeline app. It helps you map major life events (career, education, finances, relationships, health, etc.), attach savings goals and notes to each one, and zoom into any period to see what you’ve planned and what you’ve accomplished.

## Tech Stack

### Backend

- Language: **Python 3.11+**
- Framework: **FastAPI**
- ASGI Server: **Uvicorn**
- Database: **MongoDB** (via `motor` – async MongoDB driver)
- Testing: **pytest**
- Linting & Formatting: **Ruff** (lint) + **Black** (format)
- Env management: `python -m venv` (or `uv` / `pip`)

### Runtime & Tooling Requirements

- Python **3.11+**
- MongoDB **6.x+** (local or remote cluster)
- `pip` (or `uv`) for installing dependencies
- `git` for version control

## Project Structure

```text
sanchara/
├─ backend/
│  ├─ app/
│  │  ├─ __init__.py
│  │  ├─ core/
│  │  │  ├─ config.py
│  │  ├─ api/
│  │  │  ├─ __init__.py
│  │  │  ├─ v1/
│  │  │  │  ├─ __init__.py
│  │  │  │  ├─ routes_health.py
│  │  ├─ models/
│  │  │  ├─ __init__.py
│  │  ├─ main.py
│  ├─ tests/
│  │  ├─ __init__.py
│  │  ├─ test_health.py
│  ├─ pyproject.toml
│  ├─ README.md
├─ .gitignore
├─ .env.example
├─ README.md
```

## Problem Statement

Most planning tools focus on short-term to-do lists or isolated goals. It’s hard to:

- See your *whole life* timeline in one place.
- Connect big events (like moving countries, marriage, buying land, or starting a PhD) with the savings and preparation they require.
- Store both **plans** (future events) and **memories** (past events) in a single, structured view.

Sanchara aims to be a single place where you can plan, track, and reflect on your life journey.

## MVP Scope

For the first version, Sanchara will provide:

- **User timelines**: Create a timeline for a user (single-user focused at first).
- **Events**:
  - Title, date (or date range), category (e.g., career, finance, personal).
  - Basic description / notes.
  - Simple status: `planned`, `in-progress`, `completed`.
  - Priority, timeline phase, and linked-event references for future dependency mapping.
- **Savings / budget link**:
  - Optional estimated cost, savings target, actual cost, and amount saved for an event.
- **API access**:
  - REST endpoints to create, list, fetch, update, and delete events (`/api/v1/events`).
  - A **health/status endpoint** to verify the service is running (`/api/v1/health`).
- **Simple web client (later)**:
  - A basic UI to list events on a timeline view (can be a separate repo or a `frontend/` folder added later).

The initial focus of this repo is the **backend API**, with room to grow into a full stack application.


## Current Backend Progress

- Persistent event storage is implemented using MongoDB (`motor`).
- Events API supports query filtering by status, category, and year.


## Backend API Enhancements

- Events are persisted in MongoDB and soft-deleted (with audit timestamps).
- `GET /api/v1/events` supports filtering (`status`, `category`, `year`), pagination (`page`, `page_size`), and sorting (`sort_by`, `sort_order`).
- Event responses include computed savings insights (`savings_progress_pct`, `is_fully_funded`) for financial milestones.

## Local Infrastructure

Run backend + MongoDB with Docker Compose:

```bash
docker-compose up --build
```


- Added summary endpoints for overview and financial rollups.
- Added user-scoped events via `X-User-Id` (defaults to `demo-user`).
- Added seed script (`backend/scripts/seed_demo_events.py`) and CI workflow (`.github/workflows/backend-ci.yml`).
