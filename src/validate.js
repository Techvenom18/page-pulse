/**
 * Validates a URL string is well-formed and uses http/https.
 * Returns { valid: true } or { valid: false, error: string }
 */
export function validateUrl(input) {
  if (!input || typeof input !== 'string' || input.trim() === '') {
    return { valid: false, error: 'URL is required.' };
  }

  let parsed;
  try {
    parsed = new URL(input.trim());
  } catch {
    return { valid: false, error: 'Invalid URL format.' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, error: 'Only http and https URLs are supported.' };
  }

  return { valid: true, url: parsed.toString() };
}

/**
 * Checks whether a Content-Type header indicates HTML.
 * Some servers omit charset, some send "text/html; charset=utf-8" — 
 * so we check with startsWith rather than exact match.
 */
export function isHtmlContentType(contentType) {
  if (!contentType) return false;
  return contentType.toLowerCase().startsWith('text/html');
}