# Page Pulse

A small tool that audits any URL and returns HTTP status, response time, title, meta description, H1 count, missing alt-text count, and approximate word count.

## Setup

```powershell
npm install
npm start
```
Then open http://localhost:3000 in a browser.

## Running tests

```powershell
npm test
```

## API Contract

`GET /api/audit?url=<encoded-url>`

**Success (200):**
```json
{
  "url": "https://example.com/",
  "httpStatus": 200,
  "responseTimeMs": 169,
  "title": "Example Domain",
  "metaDescription": "...",
  "h1Count": 1,
  "imagesMissingAlt": 0,
  "totalImages": 0,
  "approximateWordCount": 120
}
```

**Error responses:**
| Status | Meaning |
|---|---|
| 400 | Missing or malformed URL |
| 422 | URL responded but content-type isn't HTML |
| 502 | Could not reach the URL (DNS failure, connection refused, etc.) |
| 504 | Request timed out (8 second limit) |

## Design decisions

**1. GET instead of POST.**
Auditing a URL is a read operation with no side effects, so it maps to GET rather than POST. This also makes requests bookmarkable, curl-able, and cacheable by intermediaries if needed later.

**2. Parsing logic is a pure function, separate from the route.**
`generateReport()` in `report.js` takes HTML + metadata and returns the report, with no network calls inside it. This is what makes the Task B tests possible without spinning up a server or mocking fetch — I pass in fixture HTML strings directly.

**3. Content-Type is validated before the body is read as text.**
Some URLs return PDFs, images, or JSON. Checking `content-type` before parsing avoids wasted work and gives a specific 422 error instead of a confusing parse failure or crash.

## What I'd change with another day

- Pick one you find interesting to talk through in your Loom — e.g., caching repeated requests to the same URL for N minutes, handling redirects more explicitly in the report output, or adding a rate limiter per IP.

## AI usage disclosure

[I used Claude to help me structure the project and explain concepts like AbortController timeouts and Cheerio parsing, since I hadn't used them before. I wrote every file myself by typing the code, ran and debugged it, fixed a Jest/ESM config error on my own machine, and made my own call on treating alt="" as "missing" for stricter accessibility flagging.]