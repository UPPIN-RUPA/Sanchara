from datetime import datetime, timezone
from typing import Protocol

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING

from app.core.config import settings
from app.models.event_update import EventUpdate, EventUpdateCreate, EventUpdateUpdate


class EventUpdateRepository(Protocol):
    async def ensure_indexes(self) -> None: ...

    async def create_update(
        self, event_id: str, user_id: str, payload: EventUpdateCreate
    ) -> EventUpdate: ...

    async def list_updates(self, event_id: str, user_id: str) -> list[EventUpdate]: ...

    async def update_update(
        self, event_id: str, user_id: str, update_id: str, payload: EventUpdateUpdate
    ) -> EventUpdate | None: ...

    async def delete_update(self, event_id: str, user_id: str, update_id: str) -> bool: ...


class MongoEventUpdateRepository:
    def __init__(self, db: AsyncIOMotorDatabase, collection_name: str | None = None) -> None:
        self.collection = db[collection_name or settings.mongo_collection_event_updates]

    async def ensure_indexes(self) -> None:
        await self.collection.create_index([("user_id", ASCENDING)])
        await self.collection.create_index([("event_id", ASCENDING)])
        await self.collection.create_index([("deleted_at", ASCENDING)])
        await self.collection.create_index([("effective_date", DESCENDING)])
        await self.collection.create_index([("created_at", DESCENDING)])

    @staticmethod
    def _doc_to_update(doc: dict) -> EventUpdate:
        doc["id"] = str(doc.pop("_id"))
        return EventUpdate(**doc)

    @staticmethod
    def _base_query(event_id: str, user_id: str) -> dict:
        return {"event_id": event_id, "user_id": user_id, "deleted_at": None}

    async def create_update(
        self, event_id: str, user_id: str, payload: EventUpdateCreate
    ) -> EventUpdate:
        now = datetime.now(timezone.utc).isoformat()
        data = payload.model_dump(mode="json")
        data["event_id"] = event_id
        data["user_id"] = user_id
        data["created_at"] = now
        data["updated_at"] = now
        data["deleted_at"] = None
        result = await self.collection.insert_one(data)
        created = await self.collection.find_one({"_id": result.inserted_id, "deleted_at": None})
        if not created:
            raise RuntimeError("Failed to create event update")
        return self._doc_to_update(created)

    async def list_updates(self, event_id: str, user_id: str) -> list[EventUpdate]:
        docs = await (
            self.collection.find(self._base_query(event_id, user_id))
            .sort([("effective_date", DESCENDING), ("created_at", DESCENDING)])
            .to_list(length=500)
        )
        return [self._doc_to_update(doc) for doc in docs]

    async def update_update(
        self, event_id: str, user_id: str, update_id: str, payload: EventUpdateUpdate
    ) -> EventUpdate | None:
        if not ObjectId.is_valid(update_id):
            return None
        updates = payload.model_dump(mode="json", exclude_unset=True)
        if not updates:
            doc = await self.collection.find_one(
                {"_id": ObjectId(update_id), **self._base_query(event_id, user_id)}
            )
            return self._doc_to_update(doc) if doc else None
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        result = await self.collection.update_one(
            {"_id": ObjectId(update_id), **self._base_query(event_id, user_id)},
            {"$set": updates},
        )
        if result.matched_count == 0:
            return None
        doc = await self.collection.find_one(
            {"_id": ObjectId(update_id), **self._base_query(event_id, user_id)}
        )
        return self._doc_to_update(doc) if doc else None

    async def delete_update(self, event_id: str, user_id: str, update_id: str) -> bool:
        if not ObjectId.is_valid(update_id):
            return False
        now = datetime.now(timezone.utc).isoformat()
        result = await self.collection.update_one(
            {"_id": ObjectId(update_id), **self._base_query(event_id, user_id)},
            {"$set": {"deleted_at": now, "updated_at": now}},
        )
        return result.modified_count > 0
