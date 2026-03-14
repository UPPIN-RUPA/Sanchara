from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routes_events import router as events_router
from app.api.v1.routes_event_updates import router as event_updates_router
from app.api.v1.routes_auth import router as auth_router
from app.api.v1.routes_health import router as health_router
from app.api.v1.routes_summary import router as summary_router
from app.api.v1.routes_tasks import router as tasks_router
from app.api.v1.routes_memories import router as memories_router
from app.core.config import settings
from app.db.mongo import mongo_manager
from app.repositories.events import MongoEventRepository
from app.repositories.event_updates import MongoEventUpdateRepository
from app.repositories.users import MongoUserRepository
from app.repositories.tasks import MongoTaskRepository
from app.repositories.memories import MongoMemoryRepository


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.app_env == "test":
        yield
        return

    mongo_manager.connect()
    app.state.events_repository = MongoEventRepository(mongo_manager.db)
    app.state.tasks_repository = MongoTaskRepository(mongo_manager.db)
    app.state.memories_repository = MongoMemoryRepository(mongo_manager.db)
    app.state.event_updates_repository = MongoEventUpdateRepository(mongo_manager.db)
    app.state.users_repository = MongoUserRepository(mongo_manager.db)
    await app.state.events_repository.ensure_indexes()
    await app.state.tasks_repository.ensure_indexes()
    await app.state.memories_repository.ensure_indexes()
    await app.state.event_updates_repository.ensure_indexes()
    await app.state.users_repository.ensure_indexes()
    yield
    mongo_manager.close()


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(events_router, prefix="/api/v1")
app.include_router(summary_router, prefix="/api/v1")
app.include_router(tasks_router, prefix="/api/v1")
app.include_router(memories_router, prefix="/api/v1")
app.include_router(event_updates_router, prefix="/api/v1")


@app.get("/", summary="Root")
async def root() -> dict[str, str]:
    return {"app": settings.app_name, "status": "running"}
