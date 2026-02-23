from app.models.event import SummaryFinancialResponse, SummaryOverviewResponse
from app.repositories.events import EventRepository


class SummaryService:
    def __init__(self, repository: EventRepository) -> None:
        self.repository = repository

    async def overview(self, user_id: str) -> SummaryOverviewResponse:
        data = await self.repository.get_overview_summary(user_id=user_id)
        return SummaryOverviewResponse(**data)

    async def financial(
        self, user_id: str, next_years: int = 5
    ) -> SummaryFinancialResponse:
        data = await self.repository.get_financial_summary(
            user_id=user_id,
            next_years=next_years,
        )
        return SummaryFinancialResponse(**data)
