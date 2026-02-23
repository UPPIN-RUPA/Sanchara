from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings


class MongoManager:
    def __init__(self) -> None:
        self._client: AsyncIOMotorClient | None = None

    def connect(self) -> None:
        self._client = AsyncIOMotorClient(
            settings.mongo_uri,
            serverSelectionTimeoutMS=settings.mongo_server_selection_timeout_ms,
        )

    def close(self) -> None:
        if self._client is not None:
            self._client.close()
            self._client = None

    @property
    def db(self) -> AsyncIOMotorDatabase:
        if self._client is None:
            raise RuntimeError("Mongo client is not connected")
        return self._client[settings.mongo_db_name]


mongo_manager = MongoManager()
