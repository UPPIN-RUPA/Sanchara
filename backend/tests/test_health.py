import os

os.environ.setdefault("APP_ENV", "test")

from fastapi.testclient import TestClient

from app.core.config import settings
from app.db.mongo import mongo_manager
from app.main import app
from app.repositories.in_memory import InMemoryEventRepository


client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_lifespan_falls_back_to_in_memory_if_mongo_unavailable(monkeypatch) -> None:
    monkeypatch.setattr(settings, "app_env", "local")
    monkeypatch.setattr(settings, "allow_in_memory_fallback", True)

    def _fail_connect() -> None:
        raise RuntimeError("mongo unavailable")

    monkeypatch.setattr(mongo_manager, "connect", _fail_connect)

    with TestClient(app) as fallback_client:
        response = fallback_client.get("/api/v1/health")
        assert response.status_code == 200
        assert isinstance(app.state.events_repository, InMemoryEventRepository)
