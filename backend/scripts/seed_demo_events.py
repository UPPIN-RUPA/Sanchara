"""Seed demo events for local development.

Usage:
  python scripts/seed_demo_events.py
"""

import asyncio

from app.models.event import EventCreate
from app.repositories.events import MongoEventRepository
from app.db.mongo import mongo_manager


EVENTS = [
    EventCreate(
        title="Marriage",
        category="personal",
        start_date="2027-02-10",
        status="planned",
        priority="high",
        timeline_phase="marriage-phase",
        is_financial=True,
        savings_target=1500000,
        amount_saved=450000,
    ),
    EventCreate(
        title="Buy Land",
        category="finance",
        start_date="2028-11-01",
        status="planned",
        priority="critical",
        timeline_phase="farm-phase",
        is_financial=True,
        savings_target=3500000,
        amount_saved=700000,
    ),
    EventCreate(
        title="Start PhD",
        category="education",
        start_date="2030-09-01",
        status="planned",
        priority="high",
        timeline_phase="advanced-study",
        is_financial=False,
    ),
]


async def main() -> None:
    mongo_manager.connect()
    repo = MongoEventRepository(mongo_manager.db)
    await repo.ensure_indexes()

    for event in EVENTS:
        await repo.create_event(event)

    mongo_manager.close()
    print(f"Seeded {len(EVENTS)} demo events")


if __name__ == "__main__":
    asyncio.run(main())
