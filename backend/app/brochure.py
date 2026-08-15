"""
Core generation pipeline:

1. select_relevant_links   -> asks the model to pick the useful links off a page
2. build_source_material   -> fetches landing page + those links into one prompt
3. stream_prospectus       -> streams the finished prospectus back token by token
"""
import json
from collections.abc import AsyncGenerator
from typing import Literal

from openai import AsyncOpenAI

from .config import settings
from .models import Tone
from .scraper import ScrapeError, fetch_website_contents, fetch_website_links

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

LINK_SELECTION_SYSTEM_PROMPT = """
You are given a list of links found on a company's webpage.
Decide which ones would be worth including in a company prospectus/brochure —
things like an About page, Company page, Product/Pricing page, or Careers page.

Ignore Terms of Service, Privacy Policy, cookie banners, login/signup links, and
social share links unless they are the company's own official social profiles.

Respond ONLY with JSON in this exact shape, nothing else:
{
    "links": [
        {"type": "about page", "url": "https://full.url/goes/here/about"},
        {"type": "careers page", "url": "https://another.full.url/careers"}
    ]
}
""".strip()

TONE_INSTRUCTIONS: dict[Tone, str] = {
    Tone.PROFESSIONAL: (
        "Write in a polished, confident, professional tone suitable for investors, "
        "enterprise customers, and prospective hires. No jokes, no slang."
    ),
    Tone.HUMOROUS: (
        "Write with warmth and wit — genuinely funny and entertaining, while still "
        "clearly conveying what the company actually does."
    ),
    Tone.BOLD_STARTUP: (
        "Write with high-energy, bold, startup-pitch-deck confidence. Punchy short "
        "sentences, strong claims backed by whatever facts are available."
    ),
}

BROCHURE_SYSTEM_PROMPT_TEMPLATE = """
You are a business analyst who writes company prospectus documents from raw website
content. You will be given scraped text from a company's landing page and a handful
of its other relevant pages.

{tone_instruction}

Structure the prospectus in markdown (no code fences) with these sections, using
only information you can actually support from the source material — never invent
facts, figures, or claims that are not present in the source text:

# {{Company Name}}
A one-line tagline.

## Overview
What the company does, in 3-5 sentences.

## What They Offer
Key products, services, or areas of focus.

## Culture & Values
Only include this section if the source material actually supports it.

## Careers
Only include this section if the source material mentions hiring or careers.

## Connect
Any official links you were given (site, socials).

Keep the whole document under 500 words. If the source material is thin, write a
shorter, honest document rather than padding it with generic claims.
""".strip()


async def select_relevant_links(url: str) -> list[dict]:
    links = fetch_website_links(url)
    if not links:
        return []

    user_prompt = (
        f"Here is the list of links found on {url}. Some may be relative URLs.\n\n"
        + "\n".join(links)
    )

    response = await client.chat.completions.create(
        model=settings.LINK_MODEL,
        messages=[
            {"role": "system", "content": LINK_SELECTION_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
    )

    try:
        parsed = json.loads(response.choices[0].message.content)
        return parsed.get("links", [])
    except (json.JSONDecodeError, AttributeError):
        return []


def build_source_material(url: str, relevant_links: list[dict]) -> str:
    sections = [f"## Landing Page\n\n{fetch_website_contents(url)}"]

    for link in relevant_links:
        link_type = link.get("type", "page")
        link_url = link.get("url")
        if not link_url:
            continue
        try:
            content = fetch_website_contents(link_url)
        except ScrapeError:
            continue
        sections.append(f"## {link_type.title()}\n\n{content}")

    material = "\n\n".join(sections)
    return material[: settings.MAX_PROMPT_CHARS]


async def stream_prospectus(
    company_name: str, url: str, tone: Tone
) -> AsyncGenerator[str, None]:
    relevant_links = await select_relevant_links(url)
    source_material = build_source_material(url, relevant_links)

    system_prompt = BROCHURE_SYSTEM_PROMPT_TEMPLATE.format(
        tone_instruction=TONE_INSTRUCTIONS[tone]
    )
    user_prompt = (
        f"Company name: {company_name}\nSource URL: {url}\n\n"
        f"Source material:\n\n{source_material}"
    )

    stream = await client.chat.completions.create(
        model=settings.BROCHURE_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        stream=True,
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta