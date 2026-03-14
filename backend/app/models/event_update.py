from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, Field


class EventUpdateType(str, Enum):
    journal = "journal"
    progress = "progress"
    reflection = "reflection"
    decision = "decision"
    milestone_note = "milestone_note"


class EventUpdateBase(BaseModel):
    event_id: str
    user_id: str = Field(default="demo-user", min_length=1, max_length=120)
    title: str = Field(min_length=1, max_length=200)
    body: str = Field(min_length=1, max_length=5000)
    update_type: EventUpdateType = EventUpdateType.journal
    effective_date: datetime | None = None


class EventUpdateCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    body: str = Field(min_length=1, max_length=5000)
    update_type: EventUpdateType = EventUpdateType.journal
    effective_date: datetime | None = None


class EventUpdateUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    body: str | None = Field(default=None, min_length=1, max_length=5000)
    update_type: EventUpdateType | None = None
    effective_date: datetime | None = None


class EventUpdate(EventUpdateBase):
    id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    deleted_at: datetime | None = None


class EventUpdateListResponse(BaseModel):
    items: list[EventUpdate]
