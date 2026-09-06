export type Chapter = { id: string; title: string; text: string; notes?: string };
export type Project = {
  id: string;
  title: string;
  genre: string;
  language: string;
  chapters: Chapter[];
};

function restUrl(path: string) {
  const el = document.getElementById('lipishilpo-root');
  const base = (el?.dataset.restUrl ?? '/wp-json/lipishilpo/v1').replace(/\/$/, '');
  return base + '/' + path.replace(/^\//, '');
}

function nonce() {
  return document.getElementById('lipishilpo-root')?.dataset.nonce ?? '';
}

async function wpFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    'X-WP-Nonce': nonce(),
    ...(options.headers as Record<string, string>),
  };
  if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
    headers['Content-Type'] = 'application/json';
  }
  return fetch(restUrl(path), { ...options, headers });
}

export async function fetchAnalyzeStatus() {
  const r = await wpFetch('analyze');
  if (!r.ok) return { configured: false, pro: false, model: '', maxPartChars: 12000 };
  return r.json();
}

export async function analyzeChapter(body: unknown, signal?: AbortSignal): Promise<unknown> {
  const r = await wpFetch('analyze', {
    method: 'POST',
    body: JSON.stringify(body),
    signal,
  } as RequestInit);
  const data = await r.json();
  if (!r.ok) throw new Error(data.message || data.error || 'বিশ্লেষণ করা যায়নি।');
  return data;
}

export async function fetchExportStatus() {
  const r = await wpFetch('export/status');
  if (!r.ok) return { pro: false, docx: false, pdf: false, epub: false, txt: true };
  return r.json();
}
