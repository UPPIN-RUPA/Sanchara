from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import AuthTokenResponse, User, UserCreate, UserLogin, UserPublic, UserSignup
from app.repositories.users import UserRepository
from app.services.errors import AuthenticationError, ConflictError


class AuthService:
    def __init__(self, repository: UserRepository) -> None:
        self.repository = repository

    async def signup(self, payload: UserSignup) -> AuthTokenResponse:
        existing_user = await self.repository.get_user_by_email(payload.email)
        if existing_user is not None:
            raise ConflictError("An account already exists for this email.")

        user = await self.repository.create_user(
            UserCreate(
                name=payload.name.strip(),
                email=payload.email,
                password_hash=hash_password(payload.password),
            )
        )
        return AuthTokenResponse(
            access_token=create_access_token(user.id),
            user=UserPublic.from_user(user),
        )

    async def login(self, payload: UserLogin) -> AuthTokenResponse:
        user = await self.repository.get_user_by_email(payload.email)
        if user is None or not verify_password(payload.password, user.password_hash):
            raise AuthenticationError("Invalid email or password.")

        return AuthTokenResponse(
            access_token=create_access_token(user.id),
            user=UserPublic.from_user(user),
        )

    async def get_user(self, user_id: str) -> User | None:
        return await self.repository.get_user_by_id(user_id)
