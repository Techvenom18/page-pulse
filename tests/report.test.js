import { generateReport } from '../src/report.js';

describe('generateReport', () => {
  test('happy path: extracts title, meta, h1s, alt text, word count', () => {
    const html = `
      <html>
        <head>
          <title>Test Page</title>
          <meta name="description" content="A test description." />
        </head>
        <body>
          <h1>Main Heading</h1>
          <h1>Second Heading</h1>
          <img src="a.jpg" alt="A photo" />
          <img src="b.jpg" alt="" />
          <img src="c.jpg" />
          <p>This is some sample body text with several words in it.</p>
        </body>
      </html>
    `;
    const meta = { url: 'https://example.com', httpStatus: 200, responseTimeMs: 120 };

    const report = generateReport(html, meta);

    expect(report.title).toBe('Test Page');
    expect(report.metaDescription).toBe('A test description.');
    expect(report.h1Count).toBe(2);
    expect(report.totalImages).toBe(3);
    expect(report.imagesMissingAlt).toBe(2); // empty alt + missing alt
    expect(report.approximateWordCount).toBeGreaterThan(0);
    expect(report.httpStatus).toBe(200);
    expect(report.responseTimeMs).toBe(120);
  });

  test('failure case: missing title and meta description return null, not crash', () => {
    const html = `<html><body><p>No head tags here.</p></body></html>`;
    const meta = { url: 'https://example.com', httpStatus: 200, responseTimeMs: 50 };

    const report = generateReport(html, meta);

    expect(report.title).toBeNull();
    expect(report.metaDescription).toBeNull();
    expect(report.h1Count).toBe(0);
  });

  test('failure case: script and style content excluded from word count', () => {
    const html = `
      <html>
        <body>
          <script>var thisShouldNotBeCounted = "lots of extra words here";</script>
          <style>.class { color: red; padding: 10px; }</style>
          <p>Only these four words.</p>
        </body>
      </html>
    `;
    const meta = { url: 'https://example.com', httpStatus: 200, responseTimeMs: 80 };

    const report = generateReport(html, meta);

    expect(report.approximateWordCount).toBe(4);
  });
});