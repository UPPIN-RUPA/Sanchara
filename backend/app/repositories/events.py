from datetime import date, datetime, timezone
from typing import Literal, Protocol

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING

from app.core.config import settings
from app.models.event import Event, EventCreate, EventStatus, EventUpdate

SortBy = Literal["start_date", "priority", "created_at"]
SortOrder = Literal["asc", "desc"]

_PRIORITY_RANK = {
    "low": 1,
    "medium": 2,
    "high": 3,
    "critical": 4,
}


class EventRepository(Protocol):
    async def ensure_indexes(self) -> None: ...

    async def create_event(self, payload: EventCreate) -> Event: ...

    async def list_events(
        self,
        user_id: str,
        status: EventStatus | None = None,
        category: str | None = None,
        year: int | None = None,
        page: int = 1,
        page_size: int = 20,
        sort_by: SortBy = "start_date",
        sort_order: SortOrder = "asc",
    ) -> tuple[list[Event], int]: ...

    async def get_event(self, user_id: str, event_id: str) -> Event | None: ...

    async def update_event(self, user_id: str, event_id: str, payload: EventUpdate) -> Event | None: ...

    async def delete_event(self, user_id: str, event_id: str) -> bool: ...

    async def get_overview_summary(self, user_id: str) -> dict: ...

    async def get_financial_summary(self, user_id: str, next_years: int = 5) -> dict: ...


class MongoEventRepository:
    def __init__(self, db: AsyncIOMotorDatabase, collection_name: str | None = None) -> None:
        self.collection = db[collection_name or settings.mongo_collection_events]

    async def ensure_indexes(self) -> None:
        await self.collection.create_index([("user_id", ASCENDING)])
        await self.collection.create_index([("status", ASCENDING)])
        await self.collection.create_index([("category", ASCENDING)])
        await self.collection.create_index([("start_date", ASCENDING)])
        await self.collection.create_index([("timeline_phase", ASCENDING)])
        await self.collection.create_index([("deleted_at", ASCENDING)])

    @staticmethod
    def _doc_to_event(doc: dict) -> Event:
        doc["id"] = str(doc.pop("_id"))
        doc.pop("priority_rank", None)
        return Event(**doc)

    @staticmethod
    def _base_query(user_id: str) -> dict:
        return {"deleted_at": None, "user_id": user_id}

    async def create_event(self, payload: EventCreate) -> Event:
        now = datetime.now(timezone.utc)
        data = payload.model_dump(mode="json")
        data["created_at"] = now.isoformat()
        data["updated_at"] = now.isoformat()
        data["deleted_at"] = None
        data["priority_rank"] = _PRIORITY_RANK.get(data.get("priority", "medium"), 2)

        result = await self.collection.insert_one(data)
        created = await self.collection.find_one({"_id": result.inserted_id, "deleted_at": None})
        if not created:
            raise RuntimeError("Failed to create event")
        return self._doc_to_event(created)

    async def list_events(
        self,
        user_id: str,
        status: EventStatus | None = None,
        category: str | None = None,
        year: int | None = None,
        page: int = 1,
        page_size: int = 20,
        sort_by: SortBy = "start_date",
        sort_order: SortOrder = "asc",
    ) -> tuple[list[Event], int]:
        query: dict = self._base_query(user_id)
        if status is not None:
            query["status"] = status.value
        if category is not None:
            query["category"] = category
        if year is not None:
            query["start_date"] = {
                "$gte": date(year, 1, 1).isoformat(),
                "$lt": date(year + 1, 1, 1).isoformat(),
            }

        total = await self.collection.count_documents(query)
        skip = (page - 1) * page_size

        if sort_by == "priority":
            direction = 1 if sort_order == "asc" else -1
            docs = await (
                self.collection.aggregate(
                    [
                        {"$match": query},
                        {"$sort": {"priority_rank": direction, "start_date": 1}},
                        {"$skip": skip},
                        {"$limit": page_size},
                    ]
                )
            ).to_list(length=page_size)
        else:
            direction = ASCENDING if sort_order == "asc" else DESCENDING
            docs = await (
                self.collection.find(query)
                .sort(sort_by, direction)
                .skip(skip)
                .limit(page_size)
                .to_list(length=page_size)
            )

        return [self._doc_to_event(doc) for doc in docs], total

    async def get_event(self, user_id: str, event_id: str) -> Event | None:
        if not ObjectId.is_valid(event_id):
            return None
        doc = await self.collection.find_one({"_id": ObjectId(event_id), **self._base_query(user_id)})
        if doc is None:
            return None
        return self._doc_to_event(doc)

    async def update_event(self, user_id: str, event_id: str, payload: EventUpdate) -> Event | None:
        if not ObjectId.is_valid(event_id):
            return None

        updates = payload.model_dump(mode="json", exclude_unset=True)
        if not updates:
            return await self.get_event(user_id, event_id)

        if "priority" in updates:
            updates["priority_rank"] = _PRIORITY_RANK.get(updates["priority"], 2)

        updates["updated_at"] = datetime.now(timezone.utc).isoformat()

        result = await self.collection.update_one(
            {"_id": ObjectId(event_id), **self._base_query(user_id)},
            {"$set": updates},
        )
        if result.matched_count == 0:
            return None
        return await self.get_event(user_id, event_id)

    async def delete_event(self, user_id: str, event_id: str) -> bool:
        if not ObjectId.is_valid(event_id):
            return False
        now = datetime.now(timezone.utc).isoformat()
        result = await self.collection.update_one(
            {"_id": ObjectId(event_id), **self._base_query(user_id)},
            {"$set": {"deleted_at": now, "updated_at": now}},
        )
        return result.modified_count > 0

    async def get_overview_summary(self, user_id: str) -> dict:
        query = self._base_query(user_id)
        total_events = await self.collection.count_documents(query)

        status_rows = await self.collection.aggregate(
            [{"$match": query}, {"$group": {"_id": "$status", "count": {"$sum": 1}}}]
        ).to_list(length=20)
        phase_rows = await self.collection.aggregate(
            [{"$match": query}, {"$group": {"_id": "$timeline_phase", "count": {"$sum": 1}}}]
        ).to_list(length=50)

        by_status = {row["_id"]: row["count"] for row in status_rows if row.get("_id")}
        by_timeline_phase = {row["_id"]: row["count"] for row in phase_rows if row.get("_id")}

        return {
            "total_events": total_events,
            "by_status": by_status,
            "by_timeline_phase": by_timeline_phase,
        }

    async def get_financial_summary(self, user_id: str, next_years: int = 5) -> dict:
        query = {**self._base_query(user_id), "is_financial": True}
        docs = await self.collection.find(query).to_list(length=2000)

        total_savings_target = 0.0
        total_amount_saved = 0.0
        fully_funded_count = 0

        for doc in docs:
            target = float(doc.get("savings_target") or 0)
            saved = float(doc.get("amount_saved") or 0)
            total_savings_target += target
            total_amount_saved += saved
            if target > 0 and saved >= target:
                fully_funded_count += 1

        today = date.today()
        end = date(today.year + next_years, 1, 1)
        upcoming_query = {
            **query,
            "start_date": {
                "$gte": today.isoformat(),
                "$lt": end.isoformat(),
            },
        }
        upcoming_financial_events = await self.collection.count_documents(upcoming_query)

        return {
            "total_savings_target": round(total_savings_target, 2),
            "total_amount_saved": round(total_amount_saved, 2),
            "fully_funded_events": fully_funded_count,
            "upcoming_financial_events": upcoming_financial_events,
            "next_years": next_years,
        }
