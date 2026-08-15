"""
Lightweight website scraper used to pull landing-page copy and outbound
links so the brochure generator has real source material to work from.
"""
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

from .config import settings

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
}

SKIP_LINK_PREFIXES = ("mailto:", "tel:", "javascript:", "#")


class ScrapeError(Exception):
    """Raised when a target site can't be fetched or parsed."""


def _get(url: str) -> requests.Response:
    try:
        response = requests.get(url, headers=HEADERS, timeout=settings.REQUEST_TIMEOUT)
        response.raise_for_status()
        return response
    except requests.exceptions.RequestException as exc:
        raise ScrapeError(f"Could not fetch {url}: {exc}") from exc


def fetch_website_contents(url: str) -> str:
    """Return the title + visible body text of a page, trimmed to a sensible length."""
    response = _get(url)
    soup = BeautifulSoup(response.content, "html.parser")

    title = soup.title.string.strip() if soup.title and soup.title.string else "No title found"

    if soup.body:
        for irrelevant in soup.body(["script", "style", "img", "input", "svg", "noscript"]):
            irrelevant.decompose()
        text = soup.body.get_text(separator="\n", strip=True)
    else:
        text = ""

    return f"{title}\n\n{text}"[: settings.MAX_CONTENT_CHARS]


def fetch_website_links(url: str) -> list[str]:
    """Return absolute, deduplicated links found on the page (skipping mailto/anchors)."""
    response = _get(url)
    soup = BeautifulSoup(response.content, "html.parser")

    links: list[str] = []
    seen: set[str] = set()
    for tag in soup.find_all("a"):
        href = tag.get("href")
        if not href or href.startswith(SKIP_LINK_PREFIXES):
            continue
        absolute = urljoin(url, href)
        if absolute not in seen:
            seen.add(absolute)
            links.append(absolute)
    return links


def is_valid_url(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.scheme in ("http", "https") and bool(parsed.netloc)