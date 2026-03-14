from datetime import datetime, timezone
from typing import Protocol

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING

from app.core.config import settings
from app.models.user import User, UserCreate


class UserRepository(Protocol):
    async def ensure_indexes(self) -> None: ...

    async def create_user(self, payload: UserCreate) -> User: ...

    async def get_user_by_email(self, email: str) -> User | None: ...

    async def get_user_by_id(self, user_id: str) -> User | None: ...


class MongoUserRepository:
    def __init__(self, db: AsyncIOMotorDatabase, collection_name: str | None = None) -> None:
        self.collection = db[collection_name or settings.mongo_collection_users]

    async def ensure_indexes(self) -> None:
        await self.collection.create_index([("email", ASCENDING)], unique=True)

    @staticmethod
    def _doc_to_user(doc: dict) -> User:
        doc["id"] = str(doc.pop("_id"))
        return User(**doc)

    async def create_user(self, payload: UserCreate) -> User:
        now = datetime.now(timezone.utc).isoformat()
        data = payload.model_dump(mode="json")
        data["created_at"] = now
        data["updated_at"] = now
        result = await self.collection.insert_one(data)
        created = await self.collection.find_one({"_id": result.inserted_id})
        if not created:
            raise RuntimeError("Failed to create user")
        return self._doc_to_user(created)

    async def get_user_by_email(self, email: str) -> User | None:
        doc = await self.collection.find_one({"email": email.lower()})
        return self._doc_to_user(doc) if doc else None

    async def get_user_by_id(self, user_id: str) -> User | None:
        if not ObjectId.is_valid(user_id):
            return None
        doc = await self.collection.find_one({"_id": ObjectId(user_id)})
        return self._doc_to_user(doc) if doc else None
