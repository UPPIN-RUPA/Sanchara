from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    app_name: str = "Sanchara"
    app_env: str = "local"
    app_debug: bool = True

    backend_host: str = "0.0.0.0"
    backend_port: int = 8000

    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db_name: str = "sanchara"
    mongo_collection_events: str = "events"
    mongo_collection_tasks: str = "tasks"
    mongo_collection_memories: str = "memories"
    mongo_collection_event_updates: str = "event_updates"
    mongo_collection_users: str = "users"

    auth_secret_key: str = "change-me-in-production"
    auth_access_token_ttl_minutes: int = 60 * 24 * 7
    cors_allowed_origins: list[str] = Field(
        default_factory=lambda: [
            "http://127.0.0.1:5173",
            "http://localhost:5173",
        ]
    )

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
