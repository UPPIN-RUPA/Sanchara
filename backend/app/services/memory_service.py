from app.models.memory import Memory, MemoryCreate, MemoryUpdate
from app.repositories.events import EventRepository
from app.repositories.memories import MemoryRepository
from app.services.errors import ServiceValidationError


class MemoryService:
    def __init__(self, event_repository: EventRepository, memory_repository: MemoryRepository) -> None:
        self.event_repository = event_repository
        self.memory_repository = memory_repository

    async def _ensure_event_exists(self, user_id: str, event_id: str) -> None:
        event = await self.event_repository.get_event(user_id, event_id)
        if event is None:
            raise ServiceValidationError("Event not found")

    async def create_memory(self, event_id: str, user_id: str, payload: MemoryCreate) -> Memory:
        await self._ensure_event_exists(user_id, event_id)
        return await self.memory_repository.create_memory(event_id, user_id, payload)

    async def list_memories(self, event_id: str, user_id: str) -> list[Memory]:
        await self._ensure_event_exists(user_id, event_id)
        return await self.memory_repository.list_memories(event_id, user_id)

    async def update_memory(
        self, event_id: str, user_id: str, memory_id: str, payload: MemoryUpdate
    ) -> Memory | None:
        await self._ensure_event_exists(user_id, event_id)
        return await self.memory_repository.update_memory(event_id, user_id, memory_id, payload)

    async def delete_memory(self, event_id: str, user_id: str, memory_id: str) -> bool:
        await self._ensure_event_exists(user_id, event_id)
        return await self.memory_repository.delete_memory(event_id, user_id, memory_id)
