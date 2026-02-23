import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routes_events import router as events_router
from app.api.v1.routes_health import router as health_router
from app.api.v1.routes_summary import router as summary_router
from app.core.config import settings
from app.db.mongo import mongo_manager
from app.repositories.events import MongoEventRepository
from app.repositories.in_memory import InMemoryEventRepository

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.app_env == "test":
        app.state.events_repository = InMemoryEventRepository()
        yield
        return

    using_mongo = False
    try:
        mongo_manager.connect()
        app.state.events_repository = MongoEventRepository(mongo_manager.db)
        await asyncio.wait_for(
            app.state.events_repository.ensure_indexes(),
            timeout=settings.mongo_startup_timeout_seconds,
        )
        using_mongo = True
    except Exception as exc:  # pragma: no cover - startup fallback path
        if not settings.allow_in_memory_fallback:
            raise
        logger.warning(
            "Mongo startup failed, falling back to in-memory repository: %s", exc
        )
        app.state.events_repository = InMemoryEventRepository()

    yield

    if using_mongo:
        mongo_manager.close()


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health_router, prefix="/api/v1")
app.include_router(events_router, prefix="/api/v1")
app.include_router(summary_router, prefix="/api/v1")


@app.get("/", summary="Root")
async def root() -> dict[str, str]:
    return {"app": settings.app_name, "status": "running"}
