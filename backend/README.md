# Sanchara Backend

The Sanchara backend is a FastAPI service that powers the life-planning, timeline, savings, and memory workflows in the Sanchara product.

It provides the core API layer for creating events, attaching tasks and memories, validating plan data, and producing summary views that support the frontend experience.

## What This Backend Does

The backend is responsible for:

- storing user-scoped life events
- managing nested tasks under events
- managing nested memories under events
- validating planning and financial rules
- exposing summary endpoints for dashboard-style views
- supporting a timeline-oriented product with clean API structure

This makes it the main source of truth behind Sanchara’s long-term planning model.

## Why It Matters

Sanchara is not just a UI concept. The backend makes the product reliable by enforcing business rules around dates, status, savings targets, and user isolation.

It helps the application by:

- protecting data integrity
- preventing invalid planning states
- keeping event, memory, and task behavior consistent
- making future frontend expansion easier through stable API design

## Tech Stack

- Python 3.11+
- FastAPI
- Uvicorn
- MongoDB
- Motor
- pytest

## Architecture

The service is organized around clear backend layers:

- API routes
- service layer
- repositories
- models

Primary domains already implemented:

- events
- tasks
- memories
- summaries

## Current Features

- event create, read, update, and soft-delete
- task CRUD nested under events
- memory CRUD nested under events
- overview summary endpoint
- financial summary endpoint
- user-scoped behavior through `X-User-Id`
- async MongoDB persistence
- backend test coverage for major flows

## Validation and Business Rules

Important rules already enforced:

- financial events require a `savings_target`
- completed events cannot be set in the future
- invalid date ranges are rejected
- updates cannot silently create inconsistent planning states

These rules are important because Sanchara is intended for meaningful life planning, where bad data creates a confusing user experience quickly.

## API Overview

### Health

- `GET /api/v1/health`

### Events

- `POST /api/v1/events`
- `GET /api/v1/events`
- `GET /api/v1/events/{event_id}`
- `PATCH /api/v1/events/{event_id}`
- `DELETE /api/v1/events/{event_id}`

List endpoint controls for `GET /api/v1/events`:

- filters: `status`, `category`, `year`
- pagination: `page`, `page_size`
- sorting: `sort_by`, `sort_order`

### Summaries

- `GET /api/v1/summary/overview`
- `GET /api/v1/summary/financial?next_years=5`

## Persistence

Events are stored in MongoDB using the async `motor` driver.

Environment variables:

- `MONGO_URI`
- `MONGO_DB_NAME`
- `MONGO_COLLECTION_EVENTS`

## Run Locally

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python3.11 -m pip install -e '.[dev]'
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Then open:

- API root: `http://localhost:8000/`
- health endpoint: `http://localhost:8000/api/v1/health`

## Run Tests

```bash
APP_ENV=test python3.11 -m pytest
```

## Docker

From the repository root:

```bash
docker-compose up --build
```

## User Scope

Requests can optionally include the `X-User-Id` header.

If omitted, the backend falls back to `demo-user`, which is useful for local development.

## Seed Demo Data

From `backend/`:

```bash
python scripts/seed_demo_events.py
```

## How This Backend Supports The Product

This API supports Sanchara by making life-planning data structured and dependable.

It gives the frontend a foundation for:

- timeline rendering
- dashboard summaries
- long-term plan management
- financial progress tracking
- memory capture around important events

## Summary

The Sanchara backend is the planning engine behind the product. It turns Sanchara from a concept into a usable full-stack system by enforcing clean event logic, persistent storage, and product-ready API behavior.
