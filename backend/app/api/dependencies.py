from datetime import datetime, timezone

from fastapi import Depends, Header, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings
from app.core.security import verify_access_token
from app.models.user import User
from app.repositories.users import UserRepository
from app.services.auth_service import AuthService

bearer_scheme = HTTPBearer(auto_error=False)


def get_user_repository(request: Request) -> UserRepository:
    return request.app.state.users_repository


def get_auth_service(repository: UserRepository = Depends(get_user_repository)) -> AuthService:
    return AuthService(repository)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    x_user_id: str | None = Header(default=None, alias="X-User-Id"),
    repository: UserRepository = Depends(get_user_repository),
) -> User:
    if credentials and credentials.scheme.lower() == "bearer":
        user_id = verify_access_token(credentials.credentials)
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token.",
            )
        user = await repository.get_user_by_id(user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authenticated user was not found.",
            )
        return user

    if settings.app_env in {"local", "test"} and x_user_id:
        fallback_user_id = x_user_id
        now = datetime.now(timezone.utc)
        return User(
            id=fallback_user_id,
            name=fallback_user_id,
            email=f"{fallback_user_id}@local.test",
            password_hash="dev-fallback",
            created_at=now,
            updated_at=now,
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required.",
    )


async def get_current_user_id(current_user: User = Depends(get_current_user)) -> str:
    return current_user.id
