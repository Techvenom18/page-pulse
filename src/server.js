import express from 'express';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import path from 'path';
import { validateUrl, isHtmlContentType } from './validate.js';
import { generateReport } from './report.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const FETCH_TIMEOUT_MS = 8000;

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

app.get('/api/audit', async (req, res) => {
  const { url } = req.query;

  const validation = validateUrl(url);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  const startTime = Date.now();

  try {
    const response = await fetch(validation.url, {
      signal: controller.signal,
      redirect: 'follow',
    });
    const responseTimeMs = Date.now() - startTime;

    const contentType = response.headers.get('content-type');
    if (!isHtmlContentType(contentType)) {
      return res.status(422).json({
        error: `Expected an HTML page, but got content-type: ${contentType || 'unknown'}.`,
      });
    }

    const html = await response.text();

    const report = generateReport(html, {
      url: validation.url,
      httpStatus: response.status,
      responseTimeMs,
    });

    return res.json(report);
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Request timed out after 8 seconds.' });
    }
    return res.status(502).json({
      error: `Could not reach the URL: ${err.message}`,
    });
  } finally {
    clearTimeout(timeoutId);
  }
});

app.listen(PORT, () => {
  console.log(`Page Pulse running at http://localhost:${PORT}`);
});