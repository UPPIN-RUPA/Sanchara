from app.models.event_update import EventUpdate, EventUpdateCreate, EventUpdateUpdate
from app.repositories.event_updates import EventUpdateRepository
from app.repositories.events import EventRepository
from app.services.errors import ServiceValidationError


class EventUpdateService:
    def __init__(
        self,
        event_repository: EventRepository,
        update_repository: EventUpdateRepository,
    ) -> None:
        self.event_repository = event_repository
        self.update_repository = update_repository

    async def _ensure_event_exists(self, user_id: str, event_id: str) -> None:
        event = await self.event_repository.get_event(user_id, event_id)
        if event is None:
            raise ServiceValidationError("Event not found")

    async def create_update(
        self, event_id: str, user_id: str, payload: EventUpdateCreate
    ) -> EventUpdate:
        await self._ensure_event_exists(user_id, event_id)
        return await self.update_repository.create_update(event_id, user_id, payload)

    async def list_updates(self, event_id: str, user_id: str) -> list[EventUpdate]:
        await self._ensure_event_exists(user_id, event_id)
        return await self.update_repository.list_updates(event_id, user_id)

    async def update_update(
        self, event_id: str, user_id: str, update_id: str, payload: EventUpdateUpdate
    ) -> EventUpdate | None:
        await self._ensure_event_exists(user_id, event_id)
        return await self.update_repository.update_update(event_id, user_id, update_id, payload)

    async def delete_update(self, event_id: str, user_id: str, update_id: str) -> bool:
        await self._ensure_event_exists(user_id, event_id)
        return await self.update_repository.delete_update(event_id, user_id, update_id)
