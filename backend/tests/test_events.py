import os
from collections.abc import Generator
from datetime import date, datetime, timezone
from uuid import uuid4

os.environ.setdefault("APP_ENV", "test")

import pytest
from fastapi.testclient import TestClient

from app.api.v1.routes_events import get_event_repository as get_events_repository
from app.api.v1.routes_summary import get_event_repository as get_summary_repository
from app.main import app
from app.models.event import Event, EventCreate, EventStatus, EventUpdate


class InMemoryEventRepository:
    def __init__(self) -> None:
        self.events: dict[str, Event] = {}

    async def ensure_indexes(self) -> None:
        return None

    async def create_event(self, payload: EventCreate) -> Event:
        now = datetime.now(timezone.utc)
        event = Event(
            id=str(uuid4()),
            created_at=now,
            updated_at=now,
            deleted_at=None,
            **payload.model_dump(),
        )
        self.events[event.id] = event
        return event

    async def list_events(
        self,
        user_id: str,
        status: EventStatus | None = None,
        category: str | None = None,
        year: int | None = None,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "start_date",
        sort_order: str = "asc",
    ) -> tuple[list[Event], int]:
        values = [
            event
            for event in self.events.values()
            if event.deleted_at is None and event.user_id == user_id
        ]

        if status is not None:
            values = [event for event in values if event.status == status]
        if category is not None:
            values = [event for event in values if event.category == category]
        if year is not None:
            values = [event for event in values if event.start_date.year == year]

        reverse = sort_order == "desc"
        if sort_by == "priority":
            rank = {"low": 1, "medium": 2, "high": 3, "critical": 4}
            values.sort(key=lambda event: rank[event.priority.value], reverse=reverse)
        else:
            values.sort(key=lambda event: getattr(event, sort_by), reverse=reverse)

        total = len(values)
        start = (page - 1) * page_size
        end = start + page_size
        return values[start:end], total

    async def get_event(self, user_id: str, event_id: str) -> Event | None:
        event = self.events.get(event_id)
        if event is None or event.deleted_at is not None or event.user_id != user_id:
            return None
        return event

    async def update_event(
        self, user_id: str, event_id: str, payload: EventUpdate
    ) -> Event | None:
        event = self.events.get(event_id)
        if event is None or event.deleted_at is not None or event.user_id != user_id:
            return None
        updated = event.model_copy(
            update={
                **payload.model_dump(exclude_unset=True),
                "updated_at": datetime.now(timezone.utc),
            }
        )
        self.events[event_id] = updated
        return updated

    async def delete_event(self, user_id: str, event_id: str) -> bool:
        event = self.events.get(event_id)
        if event is None or event.deleted_at is not None or event.user_id != user_id:
            return False
        self.events[event_id] = event.model_copy(
            update={"deleted_at": datetime.now(timezone.utc)}
        )
        return True

    async def get_overview_summary(self, user_id: str) -> dict:
        rows = [
            event
            for event in self.events.values()
            if event.deleted_at is None and event.user_id == user_id
        ]
        by_status: dict[str, int] = {}
        by_phase: dict[str, int] = {}
        for row in rows:
            by_status[row.status.value] = by_status.get(row.status.value, 0) + 1
            if row.timeline_phase:
                by_phase[row.timeline_phase] = by_phase.get(row.timeline_phase, 0) + 1
        return {
            "total_events": len(rows),
            "by_status": by_status,
            "by_timeline_phase": by_phase,
        }

    async def get_financial_summary(self, user_id: str, next_years: int = 5) -> dict:
        rows = [
            event
            for event in self.events.values()
            if event.deleted_at is None
            and event.user_id == user_id
            and event.is_financial
        ]
        target = sum(float(event.savings_target or 0) for event in rows)
        saved = sum(float(event.amount_saved or 0) for event in rows)
        funded = sum(
            1
            for event in rows
            if (event.savings_target or 0) > 0
            and (event.amount_saved or 0) >= (event.savings_target or 0)
        )
        return {
            "total_savings_target": round(target, 2),
            "total_amount_saved": round(saved, 2),
            "fully_funded_events": funded,
            "upcoming_financial_events": len(rows),
            "next_years": next_years,
        }


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    repository = InMemoryEventRepository()
    app.state.events_repository = repository
    app.dependency_overrides[get_events_repository] = lambda: repository
    app.dependency_overrides[get_summary_repository] = lambda: repository

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    if hasattr(app.state, "events_repository"):
        delattr(app.state, "events_repository")


def _event_payload(title: str, start_date: str, amount_saved: float) -> dict:
    return {
        "title": title,
        "category": "education",
        "start_date": start_date,
        "status": "planned",
        "priority": "high",
        "timeline_phase": "early-career",
        "is_financial": True,
        "estimated_cost": 50000,
        "savings_target": 45000,
        "actual_cost": 0,
        "amount_saved": amount_saved,
        "linked_event_ids": [],
    }


def test_create_list_get_update_delete_event(client: TestClient) -> None:
    create_response = client.post(
        "/api/v1/events",
        headers={"X-User-Id": "rupa"},
        json=_event_payload("Start MSc", "2028-09-01", 10000),
    )
    assert create_response.status_code == 201

    created = create_response.json()
    event_id = created["id"]
    assert created["title"] == "Start MSc"
    assert created["user_id"] == "rupa"
    assert created["created_at"] is not None
    assert created["updated_at"] is not None
    assert created["deleted_at"] is None
    assert created["savings_progress_pct"] == 22.22
    assert created["is_fully_funded"] is False

    list_response = client.get("/api/v1/events", headers={"X-User-Id": "rupa"})
    assert list_response.status_code == 200
    list_body = list_response.json()
    assert any(item["id"] == event_id for item in list_body["items"])
    assert list_body["total"] == 1

    get_response = client.get(
        f"/api/v1/events/{event_id}", headers={"X-User-Id": "rupa"}
    )
    assert get_response.status_code == 200
    assert get_response.json()["category"] == "education"

    update_response = client.patch(
        f"/api/v1/events/{event_id}",
        headers={"X-User-Id": "rupa"},
        json={"status": "in-progress", "notes": "Accepted offer"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["status"] == "in-progress"
    assert update_response.json()["notes"] == "Accepted offer"

    delete_response = client.delete(
        f"/api/v1/events/{event_id}", headers={"X-User-Id": "rupa"}
    )
    assert delete_response.status_code == 204

    missing_response = client.get(
        f"/api/v1/events/{event_id}", headers={"X-User-Id": "rupa"}
    )
    assert missing_response.status_code == 404


def test_user_scope_and_summary_endpoints(client: TestClient) -> None:
    client.post(
        "/api/v1/events",
        headers={"X-User-Id": "rupa"},
        json=_event_payload("Rupa Event", "2028-01-01", 2000),
    )
    client.post(
        "/api/v1/events",
        headers={"X-User-Id": "alex"},
        json=_event_payload("Alex Event", "2028-02-01", 3000),
    )

    rupa_events = client.get("/api/v1/events", headers={"X-User-Id": "rupa"})
    alex_events = client.get("/api/v1/events", headers={"X-User-Id": "alex"})
    assert rupa_events.status_code == 200
    assert alex_events.status_code == 200
    assert rupa_events.json()["total"] == 1
    assert alex_events.json()["total"] == 1

    overview = client.get("/api/v1/summary/overview", headers={"X-User-Id": "rupa"})
    assert overview.status_code == 200
    assert overview.json()["total_events"] == 1

    financial = client.get(
        "/api/v1/summary/financial?next_years=5", headers={"X-User-Id": "rupa"}
    )
    assert financial.status_code == 200
    assert financial.json()["total_savings_target"] == 45000.0
    assert financial.json()["total_amount_saved"] == 2000.0


def test_filter_pagination_and_sorting(client: TestClient) -> None:
    client.post("/api/v1/events", json=_event_payload("B Event", "2028-10-01", 1000))
    client.post("/api/v1/events", json=_event_payload("A Event", "2028-01-01", 2000))
    client.post("/api/v1/events", json=_event_payload("C Event", "2029-01-01", 46000))

    filtered_status = client.get("/api/v1/events?status=planned")
    assert filtered_status.status_code == 200
    assert filtered_status.json()["total"] == 3

    filtered_year = client.get("/api/v1/events?year=2028")
    assert filtered_year.status_code == 200
    assert filtered_year.json()["total"] == 2

    paged = client.get(
        "/api/v1/events?page=1&page_size=2&sort_by=start_date&sort_order=asc"
    )
    assert paged.status_code == 200
    body = paged.json()
    assert body["page"] == 1
    assert body["page_size"] == 2
    assert body["total"] == 3
    assert len(body["items"]) == 2
    assert body["items"][0]["title"] == "A Event"


def test_event_date_validation_and_financial_computed_fields(
    client: TestClient,
) -> None:
    response = client.post(
        "/api/v1/events",
        json={
            "title": "Invalid Event",
            "category": "finance",
            "start_date": date(2028, 1, 10).isoformat(),
            "end_date": date(2028, 1, 1).isoformat(),
        },
    )
    assert response.status_code == 422

    funded = client.post(
        "/api/v1/events", json=_event_payload("Funded", "2030-01-01", 50000)
    )
    assert funded.status_code == 201
    assert funded.json()["is_fully_funded"] is True
    assert funded.json()["savings_progress_pct"] == 100.0

    non_financial = client.post(
        "/api/v1/events",
        json={
            "title": "Health milestone",
            "category": "health",
            "start_date": "2031-02-02",
            "is_financial": False,
        },
    )
    assert non_financial.status_code == 201
    assert non_financial.json()["savings_progress_pct"] is None
    assert non_financial.json()["is_fully_funded"] is None


def test_financial_event_requires_savings_target(client: TestClient) -> None:
    response = client.post(
        "/api/v1/events",
        json={
            "title": "Invest in business",
            "category": "finance",
            "start_date": "2028-05-01",
            "is_financial": True,
        },
    )

    assert response.status_code == 422
    assert response.json()["detail"] == "financial events must include savings_target"


def test_completed_event_cannot_have_future_date(client: TestClient) -> None:
    response = client.post(
        "/api/v1/events",
        json={
            "title": "Future completion",
            "category": "career",
            "start_date": "2999-01-01",
            "status": "completed",
        },
    )

    assert response.status_code == 422
    assert (
        response.json()["detail"]
        == "completed events cannot have a future start/end date"
    )
