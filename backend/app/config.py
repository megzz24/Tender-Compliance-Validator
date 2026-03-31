"""
Pydantic-settings class that reads all environment variables
rom .env. Exports a single `settings` instance used everywhere.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    # Vertex AI
    GOOGLE_CLOUD_PROJECT: str = ""
    GOOGLE_CLOUD_LOCATION: str = "us-central1"
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""

    # App
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_MB: int = 50


settings = Settings()