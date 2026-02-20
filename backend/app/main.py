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


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.app_env == "test":
        app.state.events_repository = InMemoryEventRepository()
        yield
        return

    mongo_manager.connect()
    app.state.events_repository = MongoEventRepository(mongo_manager.db)
    await app.state.events_repository.ensure_indexes()
    yield
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
