"""
Application configuration, loaded from environment variables.
"""
import os
from dotenv import load_dotenv

load_dotenv(override=True)


class Settings:
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    LINK_MODEL: str = os.getenv("LINK_MODEL", "gpt-4o-mini")
    BROCHURE_MODEL: str = os.getenv("BROCHURE_MODEL", "gpt-4o-mini")
    ALLOWED_ORIGINS: list[str] = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    MAX_CONTENT_CHARS: int = 2_000
    MAX_PROMPT_CHARS: int = 8_000
    REQUEST_TIMEOUT: int = 15


settings = Settings()