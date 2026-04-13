# TezTok

Mobile-first academic thesis browsing with a TikTok-style vertical feed. The project combines a React frontend, a dedicated YOKTez API, and a separate background-image service.

## Architecture

```text
+---------------------------+       +---------------------------+
| React / Vite frontend     |       | Optional OpenAI summary   |
|                           |       | generation                |
| - snap-scrolling feed     |       +-------------+-------------+
| - search + bookmarks      |                     |
| - abstract expansion      |                     |
+-------------+-------------+                     |
              | /api                               |
              v                                    |
+-------------+-------------+                      |
| YOKTez API gateway        |<---------------------+
|                           |
| - /feed                   |
| - /random-thesis          |
| - /search                 |
| - /thesis/:id             |
| - /thesis/:id/summary     |
+-------------+-------------+
              |
              v
+-------------+-------------+
| YOKTez adapter layer      |
|                           |
| - cache in memory / Redis |
| - maps scraper output     |
| - calls Playwright server |
+-------------+-------------+
              |
              v
+---------------------------+
| YOKTez website via        |
| Playwright scraper / MCP  |
+---------------------------+

+---------------------------+
| Background image service  |
|                           |
| - /background-image       |
| - Wikimedia cache         |
| - Unsplash fallback       |
+---------------------------+
```

## Features

- Vertical swipe-style thesis feed
- Multi-source support including OpenAlex, Crossref, and YOKTez
- Discipline/topic filtering
- Local likes/bookmarks
- PWA install and offline caching

## API design

- `GET /api/random-thesis`
- `GET /api/feed?cursor=0&limit=4`
- `GET /api/search?q=kuraklik`
- `GET /api/thesis/:id`
- `POST /api/thesis/:id/summary`

## Run locally

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

Local development uses two backend services:

1. `http://localhost:3001` for YOKTez feed, search, thesis detail, and summary APIs.
2. `http://localhost:3002` for Wikimedia/Unsplash background image caching.

## Standalone deploy

The frontend can talk to separately hosted services with:

```bash
VITE_YOKTEZ_API_BASE_URL=https://your-yoktez-api.example.com
VITE_BACKGROUND_API_BASE_URL=https://your-backgrounds.example.com
```

Without those env vars, local development uses the Vite `/api` and `/media-api` proxies.

## Notes

- YOKTez scraping should stay on a hosted backend or worker.
- AI summaries fall back to a local heuristic when `OPENAI_API_KEY` is missing.
- Previously opened content can still load from cache in the PWA.
