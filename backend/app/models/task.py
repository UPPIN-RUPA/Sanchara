from datetime import date, datetime, timezone
from enum import Enum

from pydantic import BaseModel, Field


class TaskStatus(str, Enum):
    pending = "pending"
    completed = "completed"


class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class TaskBase(BaseModel):
    event_id: str
    user_id: str = Field(default="demo-user", min_length=1, max_length=120)
    title: str = Field(min_length=1, max_length=200)
    notes: str | None = Field(default=None, max_length=2000)
    due_date: date | None = None
    status: TaskStatus = TaskStatus.pending
    priority: TaskPriority = TaskPriority.medium


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    notes: str | None = Field(default=None, max_length=2000)
    due_date: date | None = None
    priority: TaskPriority = TaskPriority.medium


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    notes: str | None = Field(default=None, max_length=2000)
    due_date: date | None = None
    status: TaskStatus | None = None
    priority: TaskPriority | None = None


class Task(TaskBase):
    id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TaskListResponse(BaseModel):
    items: list[Task]
