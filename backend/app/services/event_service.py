from datetime import date

from app.models.event import (
    Event,
    EventCreate,
    EventListResponse,
    EventStatus,
    EventUpdate,
)
from app.repositories.events import EventRepository, SortBy, SortOrder
from app.services.errors import ServiceValidationError


class EventService:
    def __init__(self, repository: EventRepository) -> None:
        self.repository = repository

    @staticmethod
    def _validate_financial_requirements(
        *, is_financial: bool, savings_target: float | None
    ) -> None:
        if is_financial and savings_target is None:
            raise ServiceValidationError("financial events must include savings_target")

    @staticmethod
    def _validate_completion_timing(
        *, status: EventStatus | None, start_date: date | None, end_date: date | None
    ) -> None:
        if status != EventStatus.completed:
            return

        effective_date = end_date or start_date
        if effective_date is not None and effective_date > date.today():
            raise ServiceValidationError(
                "completed events cannot have a future start/end date"
            )

    async def create_event(self, user_id: str, payload: EventCreate) -> Event:
        self._validate_financial_requirements(
            is_financial=payload.is_financial,
            savings_target=payload.savings_target,
        )
        self._validate_completion_timing(
            status=payload.status,
            start_date=payload.start_date,
            end_date=payload.end_date,
        )

        payload = payload.model_copy(update={"user_id": user_id})
        return await self.repository.create_event(payload)

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
    ) -> EventListResponse:
        items, total = await self.repository.list_events(
            user_id=user_id,
            status=status,
            category=category,
            year=year,
            page=page,
            page_size=page_size,
            sort_by=sort_by,
            sort_order=sort_order,
        )
        return EventListResponse(
            items=items, page=page, page_size=page_size, total=total
        )

    async def get_event(self, user_id: str, event_id: str) -> Event | None:
        return await self.repository.get_event(user_id, event_id)

    async def update_event(
        self, user_id: str, event_id: str, payload: EventUpdate
    ) -> Event | None:
        existing = await self.repository.get_event(user_id, event_id)
        if existing is None:
            return None

        next_is_financial = (
            payload.is_financial
            if payload.is_financial is not None
            else existing.is_financial
        )
        next_savings_target = (
            payload.savings_target
            if payload.savings_target is not None
            else existing.savings_target
        )
        self._validate_financial_requirements(
            is_financial=next_is_financial,
            savings_target=next_savings_target,
        )

        next_status = payload.status if payload.status is not None else existing.status
        next_start_date = (
            payload.start_date
            if payload.start_date is not None
            else existing.start_date
        )
        next_end_date = (
            payload.end_date if payload.end_date is not None else existing.end_date
        )
        self._validate_completion_timing(
            status=next_status,
            start_date=next_start_date,
            end_date=next_end_date,
        )

        return await self.repository.update_event(user_id, event_id, payload)

    async def delete_event(self, user_id: str, event_id: str) -> bool:
        return await self.repository.delete_event(user_id, event_id)
