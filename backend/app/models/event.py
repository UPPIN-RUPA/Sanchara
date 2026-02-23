from datetime import date, datetime, timezone
from enum import Enum

from pydantic import BaseModel, Field, computed_field, model_validator


class EventStatus(str, Enum):
    planned = "planned"
    in_progress = "in-progress"
    completed = "completed"


class EventPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class EventBase(BaseModel):
    user_id: str = Field(default="demo-user", min_length=1, max_length=120)
    title: str = Field(min_length=1, max_length=200)
    category: str = Field(min_length=1, max_length=100)
    start_date: date
    end_date: date | None = None
    description: str | None = Field(default=None, max_length=2000)
    notes: str | None = Field(default=None, max_length=4000)
    status: EventStatus = EventStatus.planned
    priority: EventPriority = EventPriority.medium
    timeline_phase: str | None = Field(default=None, max_length=120)
    is_financial: bool = False
    estimated_cost: float | None = Field(default=None, ge=0)
    savings_target: float | None = Field(default=None, ge=0)
    actual_cost: float | None = Field(default=None, ge=0)
    amount_saved: float | None = Field(default=None, ge=0)
    linked_event_ids: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_dates(self) -> "EventBase":
        if self.end_date is not None and self.end_date < self.start_date:
            raise ValueError("end_date cannot be earlier than start_date")
        return self


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    category: str | None = Field(default=None, min_length=1, max_length=100)
    start_date: date | None = None
    end_date: date | None = None
    description: str | None = Field(default=None, max_length=2000)
    notes: str | None = Field(default=None, max_length=4000)
    status: EventStatus | None = None
    priority: EventPriority | None = None
    timeline_phase: str | None = Field(default=None, max_length=120)
    is_financial: bool | None = None
    estimated_cost: float | None = Field(default=None, ge=0)
    savings_target: float | None = Field(default=None, ge=0)
    actual_cost: float | None = Field(default=None, ge=0)
    amount_saved: float | None = Field(default=None, ge=0)
    linked_event_ids: list[str] | None = None


class Event(EventBase):
    id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    deleted_at: datetime | None = None

    @computed_field
    @property
    def savings_progress_pct(self) -> float | None:
        if not self.is_financial or not self.savings_target or self.savings_target <= 0:
            return None
        amount_saved = self.amount_saved or 0
        return min(100.0, round((amount_saved / self.savings_target) * 100, 2))

    @computed_field
    @property
    def is_fully_funded(self) -> bool | None:
        if not self.is_financial or not self.savings_target or self.savings_target <= 0:
            return None
        amount_saved = self.amount_saved or 0
        return amount_saved >= self.savings_target


class EventListResponse(BaseModel):
    items: list[Event]
    page: int
    page_size: int
    total: int


class SummaryOverviewResponse(BaseModel):
    total_events: int
    by_status: dict[str, int]
    by_timeline_phase: dict[str, int]


class SummaryFinancialResponse(BaseModel):
    total_savings_target: float
    total_amount_saved: float
    fully_funded_events: int
    upcoming_financial_events: int
    next_years: int
