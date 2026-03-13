from datetime import datetime, timezone
from typing import Protocol

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING

from app.core.config import settings
from app.models.memory import Memory, MemoryCreate, MemoryUpdate


class MemoryRepository(Protocol):
    async def ensure_indexes(self) -> None: ...

    async def create_memory(self, event_id: str, user_id: str, payload: MemoryCreate) -> Memory: ...

    async def list_memories(self, event_id: str, user_id: str) -> list[Memory]: ...

    async def update_memory(
        self, event_id: str, user_id: str, memory_id: str, payload: MemoryUpdate
    ) -> Memory | None: ...

    async def delete_memory(self, event_id: str, user_id: str, memory_id: str) -> bool: ...


class MongoMemoryRepository:
    def __init__(self, db: AsyncIOMotorDatabase, collection_name: str | None = None) -> None:
        self.collection = db[collection_name or settings.mongo_collection_memories]

    async def ensure_indexes(self) -> None:
        await self.collection.create_index([("user_id", ASCENDING)])
        await self.collection.create_index([("event_id", ASCENDING)])
        await self.collection.create_index([("memory_type", ASCENDING)])
        await self.collection.create_index([("captured_on", DESCENDING)])

    @staticmethod
    def _doc_to_memory(doc: dict) -> Memory:
        doc["id"] = str(doc.pop("_id"))
        return Memory(**doc)

    async def create_memory(self, event_id: str, user_id: str, payload: MemoryCreate) -> Memory:
        now = datetime.now(timezone.utc).isoformat()
        data = payload.model_dump(mode="json")
        data["event_id"] = event_id
        data["user_id"] = user_id
        data["created_at"] = now
        data["updated_at"] = now
        result = await self.collection.insert_one(data)
        created = await self.collection.find_one({"_id": result.inserted_id})
        if not created:
            raise RuntimeError("Failed to create memory")
        return self._doc_to_memory(created)

    async def list_memories(self, event_id: str, user_id: str) -> list[Memory]:
        docs = await (
            self.collection.find({"event_id": event_id, "user_id": user_id})
            .sort([("captured_on", DESCENDING), ("created_at", DESCENDING)])
            .to_list(length=500)
        )
        return [self._doc_to_memory(doc) for doc in docs]

    async def update_memory(
        self, event_id: str, user_id: str, memory_id: str, payload: MemoryUpdate
    ) -> Memory | None:
        if not ObjectId.is_valid(memory_id):
            return None
        updates = payload.model_dump(mode="json", exclude_unset=True)
        if not updates:
            doc = await self.collection.find_one({"_id": ObjectId(memory_id), "event_id": event_id, "user_id": user_id})
            return self._doc_to_memory(doc) if doc else None
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        result = await self.collection.update_one(
            {"_id": ObjectId(memory_id), "event_id": event_id, "user_id": user_id},
            {"$set": updates},
        )
        if result.matched_count == 0:
            return None
        doc = await self.collection.find_one({"_id": ObjectId(memory_id), "event_id": event_id, "user_id": user_id})
        return self._doc_to_memory(doc) if doc else None

    async def delete_memory(self, event_id: str, user_id: str, memory_id: str) -> bool:
        if not ObjectId.is_valid(memory_id):
            return False
        result = await self.collection.delete_one({"_id": ObjectId(memory_id), "event_id": event_id, "user_id": user_id})
        return result.deleted_count > 0
