const form = document.getElementById('audit-form');
const input = document.getElementById('url-input');
const statusEl = document.getElementById('status');
const reportEl = document.getElementById('report');


const clearBtn = document.getElementById('clear-btn');

input.addEventListener('input', () => {
  clearBtn.classList.toggle('visible', input.value.length > 0);
});

clearBtn.addEventListener('click', () => {
  input.value = '';
  clearBtn.classList.remove('visible');
  input.focus();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = input.value.trim();
  if (!url) return;

  reportEl.classList.add('hidden');
  reportEl.innerHTML = '';
  statusEl.textContent = 'Auditing…';
  statusEl.className = 'status loading';

  try {
    const res = await fetch(`/api/audit?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    if (!res.ok) {
      statusEl.textContent = data.error || 'Something went wrong.';
      statusEl.className = 'status error';
      return;
    }

    statusEl.textContent = '';
    statusEl.className = '';
    renderReport(data);
  } catch (err) {
    statusEl.textContent = 'Network error — could not reach the server.';
    statusEl.className = 'status error';
  }
});

function renderReport(data) {
  reportEl.classList.remove('hidden');
  reportEl.innerHTML = `
    <div class="report-row"><span>URL</span><strong>${escapeHtml(data.url)}</strong></div>
    <div class="report-row"><span>HTTP Status</span><strong>${data.httpStatus}</strong></div>
    <div class="report-row"><span>Response Time</span><strong>${data.responseTimeMs} ms</strong></div>
    <div class="report-row"><span>Title</span><strong>${escapeHtml(data.title || '—')}</strong></div>
    <div class="report-row"><span>Meta Description</span><strong>${escapeHtml(data.metaDescription || '—')}</strong></div>
    <div class="report-row"><span>H1 Count</span><strong>${data.h1Count}</strong></div>
    <div class="report-row"><span>Images Missing Alt</span><strong>${data.imagesMissingAlt} / ${data.totalImages}</strong></div>
    <div class="report-row"><span>Approx. Word Count</span><strong>${data.approximateWordCount}</strong></div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener('mousemove', (e) => {
  const xPercent = (e.clientX / window.innerWidth) * 100;
  const yPercent = (e.clientY / window.innerHeight) * 100;
  document.body.style.setProperty('--mouse-x', `${xPercent}%`);
  document.body.style.setProperty('--mouse-y', `${yPercent}%`);
});