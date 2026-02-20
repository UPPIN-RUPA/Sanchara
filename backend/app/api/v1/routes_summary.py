from fastapi import APIRouter, Depends, Query, Request

from app.api.dependencies import get_current_user_id
from app.models.event import SummaryFinancialResponse, SummaryOverviewResponse
from app.repositories.events import EventRepository
from app.services.summary_service import SummaryService

router = APIRouter(prefix="/summary", tags=["summary"])


def get_event_repository(request: Request) -> EventRepository:
    return request.app.state.events_repository


def get_summary_service(
    repository: EventRepository = Depends(get_event_repository),
) -> SummaryService:
    return SummaryService(repository)


@router.get("/overview", response_model=SummaryOverviewResponse)
async def summary_overview(
    user_id: str = Depends(get_current_user_id),
    service: SummaryService = Depends(get_summary_service),
) -> SummaryOverviewResponse:
    return await service.overview(user_id=user_id)


@router.get("/financial", response_model=SummaryFinancialResponse)
async def summary_financial(
    next_years: int = Query(default=5, ge=1, le=40),
    user_id: str = Depends(get_current_user_id),
    service: SummaryService = Depends(get_summary_service),
) -> SummaryFinancialResponse:
    return await service.financial(user_id=user_id, next_years=next_years)
