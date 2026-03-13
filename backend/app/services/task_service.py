from app.models.task import Task, TaskCreate, TaskUpdate
from app.repositories.events import EventRepository
from app.repositories.tasks import TaskRepository
from app.services.errors import ServiceValidationError


class TaskService:
    def __init__(self, event_repository: EventRepository, task_repository: TaskRepository) -> None:
        self.event_repository = event_repository
        self.task_repository = task_repository

    async def _ensure_event_exists(self, user_id: str, event_id: str) -> None:
        event = await self.event_repository.get_event(user_id, event_id)
        if event is None:
            raise ServiceValidationError("Event not found")

    async def create_task(self, event_id: str, user_id: str, payload: TaskCreate) -> Task:
        await self._ensure_event_exists(user_id, event_id)
        return await self.task_repository.create_task(event_id, user_id, payload)

    async def list_tasks(self, event_id: str, user_id: str) -> list[Task]:
        await self._ensure_event_exists(user_id, event_id)
        return await self.task_repository.list_tasks(event_id, user_id)

    async def update_task(
        self, event_id: str, user_id: str, task_id: str, payload: TaskUpdate
    ) -> Task | None:
        await self._ensure_event_exists(user_id, event_id)
        return await self.task_repository.update_task(event_id, user_id, task_id, payload)

    async def delete_task(self, event_id: str, user_id: str, task_id: str) -> bool:
        await self._ensure_event_exists(user_id, event_id)
        return await self.task_repository.delete_task(event_id, user_id, task_id)
