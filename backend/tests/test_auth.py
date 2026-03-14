import os

os.environ.setdefault("APP_ENV", "test")

from fastapi.testclient import TestClient

from app.api.dependencies import get_user_repository
from app.main import app
from app.repositories.in_memory import InMemoryUserRepository


def _signup_payload() -> dict:
    return {
        "name": "Rupa Uppin",
        "email": "rupa@example.com",
        "password": "strong-pass-123",
    }


def _auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def make_client() -> TestClient:
    repository = InMemoryUserRepository()
    app.dependency_overrides[get_user_repository] = lambda: repository
    app.state.users_repository = repository
    return TestClient(app)


def test_signup_login_and_me() -> None:
    test_client = make_client()
    try:
        signup_response = test_client.post("/api/v1/auth/signup", json=_signup_payload())
        assert signup_response.status_code == 201
        signup_body = signup_response.json()
        assert signup_body["token_type"] == "bearer"
        assert signup_body["user"]["email"] == "rupa@example.com"
        assert signup_body["user"]["name"] == "Rupa Uppin"

        me_response = test_client.get(
            "/api/v1/auth/me",
            headers=_auth_headers(signup_body["access_token"]),
        )
        assert me_response.status_code == 200
        assert me_response.json()["email"] == "rupa@example.com"

        login_response = test_client.post(
            "/api/v1/auth/login",
            json={"email": "rupa@example.com", "password": "strong-pass-123"},
        )
        assert login_response.status_code == 200
        assert login_response.json()["user"]["id"] == signup_body["user"]["id"]
    finally:
        test_client.close()
        app.dependency_overrides.clear()


def test_signup_rejects_duplicate_email() -> None:
    test_client = make_client()
    try:
        test_client.post("/api/v1/auth/signup", json=_signup_payload())
        duplicate_response = test_client.post("/api/v1/auth/signup", json=_signup_payload())
        assert duplicate_response.status_code == 409
        assert duplicate_response.json()["detail"] == "An account already exists for this email."
    finally:
        test_client.close()
        app.dependency_overrides.clear()


def test_login_rejects_invalid_password() -> None:
    test_client = make_client()
    try:
        test_client.post("/api/v1/auth/signup", json=_signup_payload())
        login_response = test_client.post(
            "/api/v1/auth/login",
            json={"email": "rupa@example.com", "password": "wrong-pass"},
        )
        assert login_response.status_code == 401
        assert login_response.json()["detail"] == "Invalid email or password."
    finally:
        test_client.close()
        app.dependency_overrides.clear()
