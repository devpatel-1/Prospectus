from enum import Enum

from pydantic import BaseModel, Field, field_validator

from .scraper import is_valid_url


class Tone(str, Enum):
    PROFESSIONAL = "professional"
    HUMOROUS = "humorous"
    BOLD_STARTUP = "bold_startup"


class BrochureRequest(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=120)
    url: str = Field(..., min_length=4, max_length=500)
    tone: Tone = Tone.PROFESSIONAL

    @field_validator("url")
    @classmethod
    def validate_url(cls, value: str) -> str:
        if not is_valid_url(value):
            raise ValueError("Enter a full URL, including https://")
        return value


class PdfRequest(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=120)
    markdown: str = Field(..., min_length=1)


class RelevantLink(BaseModel):
    type: str
    url: str


class LinksResponse(BaseModel):
    company_name: str
    source_url: str
    relevant_links: list[RelevantLink]