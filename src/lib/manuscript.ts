/* oxlint-disable eslint/no-control-regex -- Strip XML 1.0 forbidden control characters. */
export type Chapter = { id: string; title: string; text: string };
export type Project = {
  id: string;
  title: string;
  genre: string;
  language: string;
  chapters: Chapter[];
};
export type Evidence = { chapterId: string; quote: string };
export type Finding = {
  category: string;
  title: string;
  explanation: string;
  recommendation: string;
  original: string;
  replacement: string;
  evidence: Evidence[];
};
export type Report = {
  summary: string;
  strengths: string[];
  findings: Finding[];
  caveats: string[];
  rejectedEvidence?: number;
};
export type Digest = {
  chapterId: string;
  part: number;
  summary: string;
  facts: { subject: string; category: string; detail: string; quote: string }[];
};
export const MAX_BOOK_CHARS = 500_000;
export const MAX_PART_CHARS = 12_000;
export function validateProject(value: unknown): Project {
  if (!value || typeof value !== 'object')
    throw new Error('পাণ্ডুলিপির তথ্য সঠিক নয়।');
  const p = value as Project;
  if (
    typeof p.id !== 'string' ||
    typeof p.title !== 'string' ||
    p.title.length > 200 ||
    typeof p.genre !== 'string' ||
    p.genre.length > 80 ||
    typeof p.language !== 'string' ||
    p.language.length > 40 ||
    !Array.isArray(p.chapters) ||
    !p.chapters.length ||
    p.chapters.length > 200
  )
    throw new Error('পাণ্ডুলিপির তথ্য বা অধ্যায়ের সংখ্যা সঠিক নয়।');
  const ids = new Set<string>();
  let size = 0;
  for (const c of p.chapters) {
    if (
      !c ||
      typeof c.id !== 'string' ||
      c.id.length > 100 ||
      typeof c.title !== 'string' ||
      c.title.length > 200 ||
      typeof c.text !== 'string' ||
      ids.has(c.id)
    )
      throw new Error('অধ্যায়ের তথ্য সঠিক নয়।');
    ids.add(c.id);
    size += c.text.length;
  }
  if (size > MAX_BOOK_CHARS)
    throw new Error('এই সংস্করণে একবারে সর্বোচ্চ ৫ লক্ষ অক্ষর ব্যবহার করুন।');
  return p;
}
export function splitChapter(
  chapter: Chapter,
): { chapter: Chapter; part: number; offset: number }[] {
  const parts: { chapter: Chapter; part: number; offset: number }[] = [];
  let offset = 0;
  while (offset < chapter.text.length) {
    let end = Math.min(offset + MAX_PART_CHARS, chapter.text.length);
    if (end < chapter.text.length) {
      const paragraph = chapter.text.lastIndexOf('\n', end);
      if (paragraph > offset + MAX_PART_CHARS / 2) end = paragraph + 1;
      if (/[\uD800-\uDBFF]/.test(chapter.text[end - 1])) end--;
    }
    parts.push({
      chapter: { ...chapter, text: chapter.text.slice(offset, end) },
      part: parts.length + 1,
      offset,
    });
    offset = end;
  }
  return parts;
}
export function groundReport(report: Report, chapters: Chapter[]): Report {
  if (
    !report ||
    typeof report.summary !== 'string' ||
    !Array.isArray(report.strengths) ||
    !report.strengths.every((x) => typeof x === 'string') ||
    !Array.isArray(report.caveats) ||
    !report.caveats.every((x) => typeof x === 'string') ||
    !Array.isArray(report.findings)
  )
    throw new Error('AI-এর উত্তরটি সম্পূর্ণ নয়। আবার চেষ্টা করুন।');
  let rejected = 0;
  const findings = report.findings.filter((f) => {
    const valid =
      f &&
      [
        f.category,
        f.title,
        f.explanation,
        f.recommendation,
        f.original,
        f.replacement,
      ].every((x) => typeof x === 'string') &&
      Array.isArray(f.evidence) &&
      f.evidence.length > 0 &&
      f.evidence.every(
        (e) =>
          e &&
          typeof e.quote === 'string' &&
          !!e.quote.trim() &&
          chapters.some(
            (c) => c.id === e.chapterId && c.text.includes(e.quote),
          ),
      );
    if (!valid) rejected++;
    return valid;
  });
  return { ...report, findings, rejectedEvidence: rejected };
}
export function snapshot(project: Project) {
  return JSON.stringify(project);
}
export function escapeXml(s: string) {
  return s
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
