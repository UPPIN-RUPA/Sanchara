from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.api.dependencies import get_current_user_id
from app.models.event_update import (
    EventUpdate,
    EventUpdateCreate,
    EventUpdateListResponse,
    EventUpdateUpdate,
)
from app.repositories.event_updates import EventUpdateRepository
from app.services.errors import ServiceValidationError
from app.services.event_update_service import EventUpdateService

router = APIRouter(prefix="/events/{event_id}/updates", tags=["event-updates"])


def get_event_update_repository(request: Request) -> EventUpdateRepository:
    return request.app.state.event_updates_repository


def get_event_update_service(
    request: Request,
    update_repository: EventUpdateRepository = Depends(get_event_update_repository),
) -> EventUpdateService:
    return EventUpdateService(request.app.state.events_repository, update_repository)


@router.get("", response_model=EventUpdateListResponse)
async def list_event_updates(
    event_id: str,
    user_id: str = Depends(get_current_user_id),
    service: EventUpdateService = Depends(get_event_update_service),
) -> EventUpdateListResponse:
    try:
        items = await service.list_updates(event_id, user_id)
    except ServiceValidationError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return EventUpdateListResponse(items=items)


@router.post("", response_model=EventUpdate, status_code=status.HTTP_201_CREATED)
async def create_event_update(
    event_id: str,
    payload: EventUpdateCreate,
    user_id: str = Depends(get_current_user_id),
    service: EventUpdateService = Depends(get_event_update_service),
) -> EventUpdate:
    try:
        return await service.create_update(event_id, user_id, payload)
    except ServiceValidationError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/{update_id}", response_model=EventUpdate)
async def update_event_update(
    event_id: str,
    update_id: str,
    payload: EventUpdateUpdate,
    user_id: str = Depends(get_current_user_id),
    service: EventUpdateService = Depends(get_event_update_service),
) -> EventUpdate:
    try:
        update = await service.update_update(event_id, user_id, update_id, payload)
    except ServiceValidationError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    if update is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event update not found")
    return update


@router.delete("/{update_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event_update(
    event_id: str,
    update_id: str,
    user_id: str = Depends(get_current_user_id),
    service: EventUpdateService = Depends(get_event_update_service),
) -> None:
    try:
        deleted = await service.delete_update(event_id, user_id, update_id)
    except ServiceValidationError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event update not found")
