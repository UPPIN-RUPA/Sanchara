from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.api.dependencies import get_current_user_id
from app.api.v1.routes_events import get_event_repository
from app.models.task import Task, TaskCreate, TaskListResponse, TaskUpdate
from app.repositories.tasks import TaskRepository
from app.services.errors import ServiceValidationError
from app.services.task_service import TaskService

router = APIRouter(prefix="/events/{event_id}/tasks", tags=["tasks"])


def get_task_repository(request: Request) -> TaskRepository:
    return request.app.state.tasks_repository


def get_task_service(
    request: Request,
    task_repository: TaskRepository = Depends(get_task_repository),
) -> TaskService:
    return TaskService(request.app.state.events_repository, task_repository)


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    event_id: str,
    user_id: str = Depends(get_current_user_id),
    service: TaskService = Depends(get_task_service),
) -> TaskListResponse:
    try:
        items = await service.list_tasks(event_id, user_id)
    except ServiceValidationError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return TaskListResponse(items=items)


@router.post("", response_model=Task, status_code=status.HTTP_201_CREATED)
async def create_task(
    event_id: str,
    payload: TaskCreate,
    user_id: str = Depends(get_current_user_id),
    service: TaskService = Depends(get_task_service),
) -> Task:
    try:
        return await service.create_task(event_id, user_id, payload)
    except ServiceValidationError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/{task_id}", response_model=Task)
async def update_task(
    event_id: str,
    task_id: str,
    payload: TaskUpdate,
    user_id: str = Depends(get_current_user_id),
    service: TaskService = Depends(get_task_service),
) -> Task:
    try:
        task = await service.update_task(event_id, user_id, task_id, payload)
    except ServiceValidationError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    event_id: str,
    task_id: str,
    user_id: str = Depends(get_current_user_id),
    service: TaskService = Depends(get_task_service),
) -> None:
    try:
        deleted = await service.delete_task(event_id, user_id, task_id)
    except ServiceValidationError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
