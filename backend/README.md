# Sanchara Backend

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Run tests

```bash
APP_ENV=test pytest
```

- Architecture notes: `docs/ARCHITECTURE.md`

## API endpoints

- `GET /api/v1/health`
- `POST /api/v1/events`
- `GET /api/v1/events` supports filters and list controls:
  - filters: `status`, `category`, `year`
  - pagination: `page`, `page_size`
  - sorting: `sort_by` (`start_date`, `priority`, `created_at`), `sort_order` (`asc`, `desc`)
- `GET /api/v1/events/{event_id}`
- `PATCH /api/v1/events/{event_id}`
- `DELETE /api/v1/events/{event_id}` (soft-delete)

## Persistence

Events are stored in MongoDB using the async `motor` driver.

Env configuration:

- `MONGO_URI`
- `MONGO_DB_NAME`
- `MONGO_COLLECTION_EVENTS`

## Docker

From repository root:

```bash
docker-compose up --build
```

Then open:

- API root: `http://localhost:8000/`
- Health: `http://localhost:8000/api/v1/health`


## Architecture

Request flow follows: `routes -> services -> repository -> MongoDB`.

- Routes handle HTTP concerns and status codes.
- Services handle orchestration and response shaping.
- Repository handles all persistence/query behavior.

## User scope

Requests can optionally pass `X-User-Id` header. If omitted, backend uses `demo-user`.

## Summary endpoints

- `GET /api/v1/summary/overview`
- `GET /api/v1/summary/financial?next_years=5`

## Seed demo data

From `backend/`:

```bash
python scripts/seed_demo_events.py
```


## CORS

Local frontend access is enabled for:

- `http://localhost:5173`
- `http://127.0.0.1:5173`


Frontend uses `VITE_API_BASE_URL` (see `frontend/.env.example`) to target backend APIs.
