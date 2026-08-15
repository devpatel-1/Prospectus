"""
Prospectus API — FastAPI entrypoint.

Routes:
  GET  /api/health              liveness check
  POST /api/prospectus/stream   streams the generated prospectus as plain text chunks
  POST /api/prospectus/pdf      renders a given markdown prospectus to a downloadable PDF
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from openai import APIError, AuthenticationError

from .brochure import stream_prospectus
from .config import settings
from .models import BrochureRequest, PdfRequest
from .pdf_export import markdown_to_pdf
from .scraper import ScrapeError

app = FastAPI(
    title="Prospectus API",
    description="Turns a company website into an investor/customer/recruit-ready prospectus.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/api/prospectus/stream")
async def generate_prospectus(payload: BrochureRequest):
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Server is missing an OPENAI_API_KEY. Set it in backend/.env.",
        )

    async def event_stream():
        try:
            async for chunk in stream_prospectus(
                payload.company_name, payload.url, payload.tone
            ):
                yield chunk
        except ScrapeError as exc:
            yield f"\n\n[error] Could not read that website: {exc}"
        except AuthenticationError:
            yield "\n\n[error] The server's OpenAI API key was rejected."
        except APIError as exc:
            yield f"\n\n[error] The AI provider returned an error: {exc}"

    return StreamingResponse(event_stream(), media_type="text/plain")


@app.post("/api/prospectus/pdf")
async def download_pdf(payload: PdfRequest):
    try:
        pdf_bytes = markdown_to_pdf(payload.company_name, payload.markdown)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    filename = f"{payload.company_name.strip().replace(' ', '-').lower()}-prospectus.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )