from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Sanchara"
    app_env: str = "local"
    app_debug: bool = True

    backend_host: str = "0.0.0.0"
    backend_port: int = 8000

    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db_name: str = "sanchara"
    mongo_collection_events: str = "events"

    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
