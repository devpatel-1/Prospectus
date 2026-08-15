# Prospectus

**Turn any company website into a ready-to-share prospectus — for investors, customers, or candidates — in seconds.**

Prospectus reads a company's own website, picks out the pages that actually matter (About, Careers, Pricing, etc.), and drafts a short, factual brief in the tone you choose. Built as a full-stack business tool: a FastAPI backend that scrapes and generates via the OpenAI API, and a React frontend styled like an actual letterhead document, with live streaming generation and one-click PDF export.

---

## Why this exists

Manually researching a company and writing a clean one-pager takes time. Prospectus automates the first draft: point it at a URL, pick a tone, and get a structured document in under a minute — ready to review, tweak, and export as a PDF.

## Features

- 🔎 **Smart link selection** — an LLM call reads a page's raw links and picks out the ones actually worth including (About, Careers, Pricing), not privacy policies or login links
- ✍️ **Three tones** — Professional, Humorous, or Bold Startup, each with its own writing instructions
- ⚡ **Live streaming generation** — watch the document write itself, typewriter-style, via a real streamed API response
- 📄 **One-click PDF export** — download a letterhead-styled PDF of the finished document
- 🛡️ **Grounded, not hallucinated** — the prompt explicitly instructs the model to only use facts present in the scraped source material
- 🎨 **A UI that looks like a real product** — not a default component-library look

## Tech stack

| Layer | Tech |
|---|---|
| Backend | FastAPI, Python 3.13, OpenAI API, BeautifulSoup4 |
| PDF export | `markdown` + `xhtml2pdf` (pure Python, no system dependencies) |
| Frontend | React 18, Vite, Tailwind CSS, `react-markdown` |
| Fonts | Fraunces (display), Inter (body), JetBrains Mono (data/labels) |

## Architecture

Browser (React)
│ POST /api/prospectus/stream
▼
FastAPI backend
│
├── scraper.py → fetches landing page + links
├── brochure.py → asks OpenAI which links matter, then streams the draft
└── pdf_export.py → renders the final markdown to a letterhead-styled PDF
│
▼
OpenAI API (gpt-4o-mini)

## Getting started

### Prerequisites
- Python 3.11+
- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys)

### 1. Clone the repo
```bash
git clone https://github.com/devpatel-1/prospectus.git
cd prospectus
```

### 2. Backend setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then add your real OPENAI_API_KEY
python -m uvicorn app.main:app --reload
```
Backend runs at `http://localhost:8000`. Check `http://localhost:8000/api/health` returns `{"status": "ok"}`, or explore the full API at `http://localhost:8000/docs`.

### 3. Frontend setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

### 4. Try it
Open `http://localhost:5173`, enter a company name and URL, pick a tone, and hit **Generate Prospectus**.

## Project structure

prospectus/
├── backend/
│ └── app/
│ ├── main.py # FastAPI routes
│ ├── scraper.py # website fetching
│ ├── brochure.py # link selection + generation (OpenAI)
│ ├── pdf_export.py # markdown → PDF
│ ├── models.py # request/response schemas
│ └── config.py # settings
└── frontend/
└── src/
├── App.jsx
├── api.js
└── components/

## Roadmap

- [ ] Support for Anthropic Claude as an alternative model provider
- [ ] Editable draft before export (not just regenerate)
- [ ] Multi-page PDF templates
- [ ] Docker Compose for one-command local run
- [ ] Deployed live demo

## License

MIT — see [LICENSE](./LICENSE).

## Author

Built by **Dev Patel**.