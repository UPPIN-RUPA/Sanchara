from datetime import date, datetime, timezone
from uuid import uuid4

from app.models.event import Event, EventCreate, EventStatus, EventUpdate
from app.models.event_update import EventUpdate as EventJournalUpdate, EventUpdateCreate, EventUpdateUpdate
from app.models.memory import Memory, MemoryCreate, MemoryUpdate
from app.models.task import Task, TaskCreate, TaskStatus, TaskUpdate
from app.models.user import User, UserCreate
from app.repositories.events import SortBy, SortOrder

_PRIORITY_RANK = {"low": 1, "medium": 2, "high": 3, "critical": 4}


class InMemoryEventRepository:
    """Fallback repository for APP_ENV=test runtime (no Mongo required)."""

    def __init__(self) -> None:
        self.events: dict[str, Event] = {}
        self.tasks: dict[str, Task] = {}
        self.memories: dict[str, Memory] = {}

    async def ensure_indexes(self) -> None:
        return None

    async def create_event(self, payload: EventCreate) -> Event:
        now = datetime.now(timezone.utc)
        event = Event(
            id=str(uuid4()),
            created_at=now,
            updated_at=now,
            deleted_at=None,
            **payload.model_dump(),
        )
        self.events[event.id] = event
        return event

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
        values = [
            event
            for event in self.events.values()
            if event.deleted_at is None and event.user_id == user_id
        ]

        if status is not None:
            values = [event for event in values if event.status == status]
        if category is not None:
            values = [event for event in values if event.category == category]
        if year is not None:
            values = [event for event in values if event.start_date.year == year]

        reverse = sort_order == "desc"
        if sort_by == "priority":
            values.sort(
                key=lambda event: _PRIORITY_RANK[event.priority.value], reverse=reverse
            )
        else:
            values.sort(key=lambda event: getattr(event, sort_by), reverse=reverse)

        total = len(values)
        start = (page - 1) * page_size
        end = start + page_size
        return values[start:end], total

    async def get_event(self, user_id: str, event_id: str) -> Event | None:
        event = self.events.get(event_id)
        if event is None or event.deleted_at is not None or event.user_id != user_id:
            return None
        return event

    async def update_event(
        self, user_id: str, event_id: str, payload: EventUpdate
    ) -> Event | None:
        event = await self.get_event(user_id, event_id)
        if event is None:
            return None
        updated = event.model_copy(
            update={
                **payload.model_dump(exclude_unset=True),
                "updated_at": datetime.now(timezone.utc),
            }
        )
        self.events[event_id] = updated
        return updated

    async def delete_event(self, user_id: str, event_id: str) -> bool:
        event = await self.get_event(user_id, event_id)
        if event is None:
            return False
        self.events[event_id] = event.model_copy(
            update={
                "deleted_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
            }
        )
        return True

    async def get_overview_summary(self, user_id: str) -> dict:
        rows = [
            event
            for event in self.events.values()
            if event.deleted_at is None and event.user_id == user_id
        ]
        by_status: dict[str, int] = {}
        by_phase: dict[str, int] = {}
        for row in rows:
            by_status[row.status.value] = by_status.get(row.status.value, 0) + 1
            if row.timeline_phase:
                by_phase[row.timeline_phase] = by_phase.get(row.timeline_phase, 0) + 1
        return {
            "total_events": len(rows),
            "by_status": by_status,
            "by_timeline_phase": by_phase,
        }

    async def get_financial_summary(self, user_id: str, next_years: int = 5) -> dict:
        rows = [
            event
            for event in self.events.values()
            if event.deleted_at is None
            and event.user_id == user_id
            and event.is_financial
        ]

        total_savings_target = sum(float(event.savings_target or 0) for event in rows)
        total_amount_saved = sum(float(event.amount_saved or 0) for event in rows)
        fully_funded_events = sum(
            1
            for event in rows
            if (event.savings_target or 0) > 0
            and (event.amount_saved or 0) >= (event.savings_target or 0)
        )

        today = date.today()
        end = date(today.year + next_years, 1, 1)
        upcoming_financial_events = sum(
            1 for event in rows if event.start_date >= today and event.start_date < end
        )

        return {
            "total_savings_target": round(total_savings_target, 2),
            "total_amount_saved": round(total_amount_saved, 2),
            "fully_funded_events": fully_funded_events,
            "upcoming_financial_events": upcoming_financial_events,
            "next_years": next_years,
        }

    async def create_task(self, event_id: str, user_id: str, payload: TaskCreate) -> Task:
        now = datetime.now(timezone.utc)
        task = Task(
            id=str(uuid4()),
            event_id=event_id,
            user_id=user_id,
            status=TaskStatus.pending,
            created_at=now,
            updated_at=now,
            **payload.model_dump(),
        )
        self.tasks[task.id] = task
        return task

    async def list_tasks(self, event_id: str, user_id: str) -> list[Task]:
        tasks = [
            task
            for task in self.tasks.values()
            if task.event_id == event_id and task.user_id == user_id
        ]
        return sorted(
            tasks,
            key=lambda task: (task.status.value, task.due_date or date.max, task.created_at),
        )

    async def update_task(
        self, event_id: str, user_id: str, task_id: str, payload: TaskUpdate
    ) -> Task | None:
        task = self.tasks.get(task_id)
        if task is None or task.event_id != event_id or task.user_id != user_id:
            return None
        updated = task.model_copy(
            update={
                **payload.model_dump(exclude_unset=True),
                "updated_at": datetime.now(timezone.utc),
            }
        )
        self.tasks[task_id] = updated
        return updated

    async def delete_task(self, event_id: str, user_id: str, task_id: str) -> bool:
        task = self.tasks.get(task_id)
        if task is None or task.event_id != event_id or task.user_id != user_id:
            return False
        del self.tasks[task_id]
        return True

    async def create_memory(self, event_id: str, user_id: str, payload: MemoryCreate) -> Memory:
        now = datetime.now(timezone.utc)
        memory = Memory(
            id=str(uuid4()),
            event_id=event_id,
            user_id=user_id,
            created_at=now,
            updated_at=now,
            **payload.model_dump(),
        )
        self.memories[memory.id] = memory
        return memory

    async def list_memories(self, event_id: str, user_id: str) -> list[Memory]:
        memories = [
            memory
            for memory in self.memories.values()
            if memory.event_id == event_id and memory.user_id == user_id
        ]
        return sorted(
            memories,
            key=lambda memory: (memory.captured_on or date.min, memory.created_at),
            reverse=True,
        )

    async def update_memory(
        self, event_id: str, user_id: str, memory_id: str, payload: MemoryUpdate
    ) -> Memory | None:
        memory = self.memories.get(memory_id)
        if memory is None or memory.event_id != event_id or memory.user_id != user_id:
            return None
        updated = memory.model_copy(
            update={
                **payload.model_dump(exclude_unset=True),
                "updated_at": datetime.now(timezone.utc),
            }
        )
        self.memories[memory_id] = updated
        return updated

    async def delete_memory(self, event_id: str, user_id: str, memory_id: str) -> bool:
        memory = self.memories.get(memory_id)
        if memory is None or memory.event_id != event_id or memory.user_id != user_id:
            return False
        del self.memories[memory_id]
        return True


class InMemoryEventUpdateRepository:
    def __init__(self) -> None:
        self.updates: dict[str, EventJournalUpdate] = {}

    async def ensure_indexes(self) -> None:
        return None

    async def create_update(
        self, event_id: str, user_id: str, payload: EventUpdateCreate
    ) -> EventJournalUpdate:
        now = datetime.now(timezone.utc)
        update = EventJournalUpdate(
            id=str(uuid4()),
            event_id=event_id,
            user_id=user_id,
            created_at=now,
            updated_at=now,
            deleted_at=None,
            **payload.model_dump(),
        )
        self.updates[update.id] = update
        return update

    async def list_updates(self, event_id: str, user_id: str) -> list[EventJournalUpdate]:
        items = [
            update
            for update in self.updates.values()
            if update.event_id == event_id and update.user_id == user_id and update.deleted_at is None
        ]
        return sorted(
            items,
            key=lambda update: (update.effective_date or update.created_at, update.created_at),
            reverse=True,
        )

    async def update_update(
        self, event_id: str, user_id: str, update_id: str, payload: EventUpdateUpdate
    ) -> EventJournalUpdate | None:
        update = self.updates.get(update_id)
        if update is None or update.event_id != event_id or update.user_id != user_id or update.deleted_at is not None:
            return None
        updated = update.model_copy(
            update={
                **payload.model_dump(exclude_unset=True),
                "updated_at": datetime.now(timezone.utc),
            }
        )
        self.updates[update_id] = updated
        return updated

    async def delete_update(self, event_id: str, user_id: str, update_id: str) -> bool:
        update = self.updates.get(update_id)
        if update is None or update.event_id != event_id or update.user_id != user_id or update.deleted_at is not None:
            return False
        self.updates[update_id] = update.model_copy(
            update={"deleted_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)}
        )
        return True


class InMemoryUserRepository:
    def __init__(self) -> None:
        self.users: dict[str, User] = {}

    async def ensure_indexes(self) -> None:
        return None

    async def create_user(self, payload: UserCreate) -> User:
        now = datetime.now(timezone.utc)
        user = User(
            id=str(uuid4()),
            created_at=now,
            updated_at=now,
            **payload.model_dump(),
        )
        self.users[user.id] = user
        return user

    async def get_user_by_email(self, email: str) -> User | None:
        normalized = email.lower()
        for user in self.users.values():
            if user.email == normalized:
                return user
        return None

    async def get_user_by_id(self, user_id: str) -> User | None:
        return self.users.get(user_id)
