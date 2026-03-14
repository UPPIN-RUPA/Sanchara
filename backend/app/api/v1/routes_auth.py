from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_auth_service, get_current_user
from app.models.user import AuthTokenResponse, UserLogin, UserPublic, UserSignup
from app.services.errors import AuthenticationError, ConflictError

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserSignup, service=Depends(get_auth_service)) -> AuthTokenResponse:
    try:
        return await service.signup(payload)
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.post("/login", response_model=AuthTokenResponse)
async def login(payload: UserLogin, service=Depends(get_auth_service)) -> AuthTokenResponse:
    try:
        return await service.login(payload)
    except AuthenticationError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc


@router.get("/me", response_model=UserPublic)
async def current_user(user=Depends(get_current_user)) -> UserPublic:
    return UserPublic.from_user(user)
