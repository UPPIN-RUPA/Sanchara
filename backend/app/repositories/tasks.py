from datetime import datetime, timezone
from typing import Protocol

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING

from app.core.config import settings
from app.models.task import Task, TaskCreate, TaskUpdate


class TaskRepository(Protocol):
    async def ensure_indexes(self) -> None: ...

    async def create_task(self, event_id: str, user_id: str, payload: TaskCreate) -> Task: ...

    async def list_tasks(self, event_id: str, user_id: str) -> list[Task]: ...

    async def update_task(
        self, event_id: str, user_id: str, task_id: str, payload: TaskUpdate
    ) -> Task | None: ...

    async def delete_task(self, event_id: str, user_id: str, task_id: str) -> bool: ...


class MongoTaskRepository:
    def __init__(self, db: AsyncIOMotorDatabase, collection_name: str | None = None) -> None:
        self.collection = db[collection_name or settings.mongo_collection_tasks]

    async def ensure_indexes(self) -> None:
        await self.collection.create_index([("user_id", ASCENDING)])
        await self.collection.create_index([("event_id", ASCENDING)])
        await self.collection.create_index([("status", ASCENDING)])
        await self.collection.create_index([("due_date", ASCENDING)])

    @staticmethod
    def _doc_to_task(doc: dict) -> Task:
        doc["id"] = str(doc.pop("_id"))
        return Task(**doc)

    async def create_task(self, event_id: str, user_id: str, payload: TaskCreate) -> Task:
        now = datetime.now(timezone.utc).isoformat()
        data = payload.model_dump(mode="json")
        data["event_id"] = event_id
        data["user_id"] = user_id
        data["status"] = "pending"
        data["created_at"] = now
        data["updated_at"] = now
        result = await self.collection.insert_one(data)
        created = await self.collection.find_one({"_id": result.inserted_id})
        if not created:
            raise RuntimeError("Failed to create task")
        return self._doc_to_task(created)

    async def list_tasks(self, event_id: str, user_id: str) -> list[Task]:
        docs = await (
            self.collection.find({"event_id": event_id, "user_id": user_id})
            .sort([("status", ASCENDING), ("due_date", ASCENDING), ("created_at", DESCENDING)])
            .to_list(length=500)
        )
        return [self._doc_to_task(doc) for doc in docs]

    async def update_task(
        self, event_id: str, user_id: str, task_id: str, payload: TaskUpdate
    ) -> Task | None:
        if not ObjectId.is_valid(task_id):
            return None
        updates = payload.model_dump(mode="json", exclude_unset=True)
        if not updates:
            doc = await self.collection.find_one({"_id": ObjectId(task_id), "event_id": event_id, "user_id": user_id})
            return self._doc_to_task(doc) if doc else None
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        result = await self.collection.update_one(
            {"_id": ObjectId(task_id), "event_id": event_id, "user_id": user_id},
            {"$set": updates},
        )
        if result.matched_count == 0:
            return None
        doc = await self.collection.find_one({"_id": ObjectId(task_id), "event_id": event_id, "user_id": user_id})
        return self._doc_to_task(doc) if doc else None

    async def delete_task(self, event_id: str, user_id: str, task_id: str) -> bool:
        if not ObjectId.is_valid(task_id):
            return False
        result = await self.collection.delete_one({"_id": ObjectId(task_id), "event_id": event_id, "user_id": user_id})
        return result.deleted_count > 0
