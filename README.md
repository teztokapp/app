# TezTok  
**A mobile-first interface for academic research discovery**

TezTok is an experimental application that rethinks how academic content is discovered. Instead of relying on traditional search-based interfaces, it presents theses and papers through a vertical, swipe-based feed inspired by short-form interaction patterns.

The goal is to lower the cognitive barrier to engaging with academic research, particularly outside a user’s primary field.

---

## Motivation

Access to academic content is a problem, so is discovery.

Most platforms (e.g., Google Scholar, PubMed, JSTOR) are optimized for targeted search, requiring users to know what they are looking for in advance. This limits exposure to unfamiliar topics and reduces opportunities for cross-disciplinary exploration.

TezTok explores an alternative approach:

> Can familiar, low-friction interaction patterns (such as vertical scrolling and progressive disclosure) increase engagement with academic content?

---

## Features

- **Vertical Swipe Feed**  
  Browse academic papers and theses one at a time using a full-screen, snap-scrolling interface.

- **Multi-Source Aggregation**  
  Integrates multiple open-access academic APIs into a unified feed:
  - OpenAlex  
  - Crossref  
  - YÖKTez (via scraper backend)
  - ...more to come.

- **Topic Filtering**  
  Browse content by discipline (e.g., Engineering, Social Sciences, Medicine).

- **Save & Revisit**  
  Save papers to a local “Likes” library for later access.

- **PWA Support**  
  Installable on any device with offline access to previously loaded content.

---

### Data Flow
1. Frontend requests papers from selected source  
2. Backend proxies or fetches data (handles CORS and scraping)  
3. Results normalized into a unified format  
4. Feed renders items with lazy loading

---

## API Sources

TezTok relies on open-access academic APIs:

- OpenAlex  
- Crossref  
- YÖKTez (requires self-hosted scraper server)

### Notes
- YÖKTez requires a self-hosted scraping server  

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/lexicalnerd/teztok.git
cd teztok
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Create a `.env` file:

```env
YOKTEZ_SERVER_URL=http://localhost:XXXX
```

### 4. Run backend and frontend
```bash
npm run dev
```

---

## Limitations

- Dependent on third-party APIs and rate limits  
- Scraping-based sources (YÖKTez) may be unstable  
- No personalization or recommendation system (soon:tm:?)  
- Evaluation is preliminary and limited in scope  

---

## Future Work

- Recommendation system based on user interaction  
- Improved summarization (LLM-assisted)  
- Larger-scale user study  
- Cross-device sync for saved items  
- Better semantic filtering and clustering  

---

## Disclaimer

- Content is sourced from publicly available academic APIs  
- Always verify information using the original paper  

---

## Feedback

This is an experimental project exploring interaction design in academic contexts.

Feedback, critiques, and ideas are welcome, send an issue through GitHub.
