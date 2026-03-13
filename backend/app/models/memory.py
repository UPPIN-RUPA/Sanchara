from datetime import date, datetime, timezone
from enum import Enum

from pydantic import BaseModel, Field


class MemoryType(str, Enum):
    reflection = "reflection"
    photo = "photo"
    video = "video"
    document = "document"


class MemoryBase(BaseModel):
    event_id: str
    user_id: str = Field(default="demo-user", min_length=1, max_length=120)
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    memory_type: MemoryType = MemoryType.reflection
    asset_url: str | None = Field(default=None, max_length=1000)
    captured_on: date | None = None


class MemoryCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    memory_type: MemoryType = MemoryType.reflection
    asset_url: str | None = Field(default=None, max_length=1000)
    captured_on: date | None = None


class MemoryUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    memory_type: MemoryType | None = None
    asset_url: str | None = Field(default=None, max_length=1000)
    captured_on: date | None = None


class Memory(MemoryBase):
    id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class MemoryListResponse(BaseModel):
    items: list[Memory]
