# TezTok

Mobile-first academic thesis browsing with a TikTok-style vertical feed. The project is intentionally lightweight: a React frontend, a small Express API, and adapter points for a Playwright-based YOKTez scraper.

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
| Express API gateway       |<---------------------+
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
| YOKTez adapter layer       |
|                            |
| - cache in memory / Redis  |
| - maps scraper output      |
| - calls Playwright server  |
+-------------+-------------+
              |
              v
+---------------------------+
| YOKTez website via        |
| Playwright scraper / MCP  |
+---------------------------+
```

## API design

### `GET /api/random-thesis`

Returns one thesis object for the cold-start experience.

### `GET /api/feed?cursor=0&limit=4`

Returns a paginated feed:

```json
{
  "items": [{ "id": "tez-001", "title": "..." }],
  "nextCursor": 4
}
```

### `GET /api/search?q=kuraklik`

Returns search results shaped for the same feed card UI:

```json
{
  "query": "kuraklik",
  "count": 1,
  "items": [{ "id": "tez-003", "title": "..." }]
}
```

### `GET /api/thesis/:id`

Returns a normalized thesis detail record.

### `POST /api/thesis/:id/summary`

Generates a short mobile-friendly AI summary. Falls back to a local heuristic if no `OPENAI_API_KEY` is configured.

## Frontend component structure

```text
App
|- FloatingHeader
|  |- SearchForm
|- Feed
|  |- SnapScreen[]
|     |- ThesisCard
|        |- AbstractPanel
|        |- KeywordChips
|        |- SummaryPanel
|        |- ActionBar
```

## Caching strategy

1. Cache normalized thesis records by thesis id to avoid repeat scraping.
2. Cache feed pages and search results for 10 to 30 minutes.
3. Persist hot queries in Redis if traffic grows or the scraper runs remotely.
4. Pre-warm `random-thesis` and common search terms with a cron job.
5. Save AI summaries separately because they are deterministic enough to reuse.

## Legal and ethical notes

1. Review YOKTez terms of service, robots directives, and PDF access restrictions before scraping.
2. Rate-limit scraper traffic aggressively and identify your service honestly if possible.
3. Avoid exposing private or restricted theses; only surface metadata or documents that YOKTez already permits publicly.
4. Make AI summaries clearly labeled as machine-generated and keep links to the original thesis.
5. Provide a takedown or contact path in case content owners object to reuse.

## Step-by-step implementation plan

1. Replace the stub in `server/yoktezClient.js` with real calls to your Playwright scraper service.
2. Normalize scraper output into the shared thesis shape used by the frontend.
3. Add Redis or SQLite caching once real scrape latency is known.
4. Swap sample data for live feed generation and add better cursoring.
5. Add authentication only if you later want synced bookmarks.

## Run locally

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies API calls to the Express server on `http://localhost:3001`.
