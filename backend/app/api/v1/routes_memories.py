from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.api.dependencies import get_current_user_id
from app.models.memory import Memory, MemoryCreate, MemoryListResponse, MemoryUpdate
from app.repositories.memories import MemoryRepository
from app.services.errors import ServiceValidationError
from app.services.memory_service import MemoryService

router = APIRouter(prefix="/events/{event_id}/memories", tags=["memories"])


def get_memory_repository(request: Request) -> MemoryRepository:
    return request.app.state.memories_repository


def get_memory_service(
    request: Request,
    memory_repository: MemoryRepository = Depends(get_memory_repository),
) -> MemoryService:
    return MemoryService(request.app.state.events_repository, memory_repository)


@router.get("", response_model=MemoryListResponse)
async def list_memories(
    event_id: str,
    user_id: str = Depends(get_current_user_id),
    service: MemoryService = Depends(get_memory_service),
) -> MemoryListResponse:
    try:
        items = await service.list_memories(event_id, user_id)
    except ServiceValidationError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return MemoryListResponse(items=items)


@router.post("", response_model=Memory, status_code=status.HTTP_201_CREATED)
async def create_memory(
    event_id: str,
    payload: MemoryCreate,
    user_id: str = Depends(get_current_user_id),
    service: MemoryService = Depends(get_memory_service),
) -> Memory:
    try:
        return await service.create_memory(event_id, user_id, payload)
    except ServiceValidationError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/{memory_id}", response_model=Memory)
async def update_memory(
    event_id: str,
    memory_id: str,
    payload: MemoryUpdate,
    user_id: str = Depends(get_current_user_id),
    service: MemoryService = Depends(get_memory_service),
) -> Memory:
    try:
        memory = await service.update_memory(event_id, user_id, memory_id, payload)
    except ServiceValidationError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    if memory is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Memory not found")
    return memory


@router.delete("/{memory_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_memory(
    event_id: str,
    memory_id: str,
    user_id: str = Depends(get_current_user_id),
    service: MemoryService = Depends(get_memory_service),
) -> None:
    try:
        deleted = await service.delete_memory(event_id, user_id, memory_id)
    except ServiceValidationError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Memory not found")
