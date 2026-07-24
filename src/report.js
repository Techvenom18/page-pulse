import * as cheerio from 'cheerio';

/**
 * Takes raw HTML + metadata from the fetch (status, responseTime)
 * and returns the structured report.
 * Pure function: no network calls, no I/O — easy to unit test.
 */
export function generateReport(html, meta) {
  const $ = cheerio.load(html);

  const title = $('title').first().text().trim() || null;

  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() || null;

  const h1Count = $('h1').length;

  const images = $('img');
  let missingAltCount = 0;
  images.each((_, el) => {
    const alt = $(el).attr('alt');
    if (alt === undefined || alt.trim() === '') missingAltCount++;
  });

  // Approximate word count from visible text only (skip script/style contents)
  $('script, style').remove();
  const bodyText = $('body').text();
  const wordCount = bodyText
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return {
    url: meta.url,
    httpStatus: meta.httpStatus,
    responseTimeMs: meta.responseTimeMs,
    title,
    metaDescription,
    h1Count,
    imagesMissingAlt: missingAltCount,
    totalImages: images.length,
    approximateWordCount: wordCount,
  };
}