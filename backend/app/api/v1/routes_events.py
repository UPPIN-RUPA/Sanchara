from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from app.api.dependencies import get_current_user_id
from app.models.event import Event, EventCreate, EventListResponse, EventStatus, EventUpdate
from app.repositories.events import EventRepository, SortBy, SortOrder

router = APIRouter(prefix="/events", tags=["events"])


def get_event_repository(request: Request) -> EventRepository:
    return request.app.state.events_repository


@router.post("", response_model=Event, status_code=status.HTTP_201_CREATED)
async def create_event(
    payload: EventCreate,
    user_id: str = Depends(get_current_user_id),
    repository: EventRepository = Depends(get_event_repository),
) -> Event:
    payload = payload.model_copy(update={"user_id": user_id})
    return await repository.create_event(payload)


@router.get("", response_model=EventListResponse)
async def list_events(
    status: EventStatus | None = Query(default=None),
    category: str | None = Query(default=None),
    year: int | None = Query(default=None, ge=1900, le=3000),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    sort_by: SortBy = Query(default="start_date"),
    sort_order: SortOrder = Query(default="asc"),
    user_id: str = Depends(get_current_user_id),
    repository: EventRepository = Depends(get_event_repository),
) -> EventListResponse:
    items, total = await repository.list_events(
        user_id=user_id,
        status=status,
        category=category,
        year=year,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return EventListResponse(items=items, page=page, page_size=page_size, total=total)


@router.get("/{event_id}", response_model=Event)
async def get_event(
    event_id: str,
    user_id: str = Depends(get_current_user_id),
    repository: EventRepository = Depends(get_event_repository),
) -> Event:
    event = await repository.get_event(user_id, event_id)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return event


@router.patch("/{event_id}", response_model=Event)
async def update_event(
    event_id: str,
    payload: EventUpdate,
    user_id: str = Depends(get_current_user_id),
    repository: EventRepository = Depends(get_event_repository),
) -> Event:
    event = await repository.update_event(user_id, event_id, payload)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: str,
    user_id: str = Depends(get_current_user_id),
    repository: EventRepository = Depends(get_event_repository),
) -> None:
    deleted = await repository.delete_event(user_id, event_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
