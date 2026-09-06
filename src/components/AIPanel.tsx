import { useEffect, useRef, useState } from 'react';
import { Sparkles, X, Check, ArrowRight, Lock } from 'lucide-react';
import { type Project, type Chapter, fetchAnalyzeStatus, analyzeChapter } from '../api';
import { translations, type Language } from '../i18n';

type Mode = 'proofread' | 'chapter' | 'book';

interface Evidence { chapterId: string; quote: string; }
interface Finding {
  category: string; title: string; explanation: string;
  recommendation: string; original: string; replacement: string;
  evidence: Evidence[];
}
interface Report {
  summary: string; strengths: string[]; findings: Finding[];
  caveats: string[]; rejectedEvidence?: number;
}
interface Result { report: Report; source: string; model: string; parts: number; mode: Mode; }

const categoryLabels: Record<Language, Record<string, string>> = {
  en: {
    spelling: 'Spelling', grammar: 'Grammar', style: 'Style & Phrasing',
    structure: 'Structure', character: 'Character', timeline: 'Timeline',
    reader: 'Reader Reaction', logic: 'Logical Flow',
  },
  bn: {
    spelling: 'বানান', grammar: 'ব্যাকরণ', style: 'লেখার ধরন',
    structure: 'কাঠামো', character: 'চরিত্র', timeline: 'ঘটনাক্রম',
    reader: 'পাঠক প্রতিক্রিয়া', logic: 'যুক্তির প্রবাহ',
  },
};

const MAX_PART_CHARS = 12000;

function splitChapter(chapter: Chapter): { chapter: Chapter; part: number }[] {
  const parts: { chapter: Chapter; part: number }[] = [];
  let offset = 0;
  while (offset < chapter.text.length) {
    let end = Math.min(offset + MAX_PART_CHARS, chapter.text.length);
    if (end < chapter.text.length) {
      const para = chapter.text.lastIndexOf('\n', end);
      if (para > offset + MAX_PART_CHARS / 2) end = para + 1;
    }
    parts.push({ chapter: { ...chapter, text: chapter.text.slice(offset, end) }, part: parts.length + 1 });
    offset = end;
  }
  return parts;
}

function snapshot(project: Project) { return JSON.stringify(project); }

function relevant(p: Project, chapter: Chapter, m: Mode): Project {
  return m === 'book' ? p : { ...p, chapters: p.chapters.filter((c) => c.id === chapter.id) };
}

export function AIPanel({
  project, chapter, defaultMode, isPro, lang = 'en', onLocate, onApply,
}: {
  project: Project; chapter: Chapter; defaultMode: Mode; isPro: boolean; lang?: Language;
  onLocate: (id: string, quote: string) => void;
  onApply: (id: string, before: string, after: string) => boolean;
}) {
  const t = translations[lang];
  const labels = categoryLabels[lang];

  const [mode, setMode] = useState<Mode>(defaultMode);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [accepted, setAccepted] = useState(false);
  const controller = useRef<AbortController | null>(null);

  const digestCache = useRef(new Map<string, unknown>());

  useEffect(() => {
    if (!isPro) return;
    const c = new AbortController();
    fetchAnalyzeStatus()
      .then((d) => setConfigured(d.configured))
      .catch(() => setConfigured(false));
    return () => { c.abort(); controller.current?.abort(); };
  }, [isPro]);

  const src = relevant(project, chapter, mode);
  const stale = !!result && result.source !== snapshot(relevant(project, chapter, result.mode));

  async function run() {
    controller.current?.abort();
    const c = new AbortController();
    controller.current = c;
    setBusy(true); setError(''); setProgress(t.analysisProgress); setAccepted(false);
    try {
      const parts = src.chapters.filter((c) => c.text.trim()).flatMap(splitChapter);
      if (!parts.length) {
        throw new Error(lang === 'bn' ? 'আগে কিছু লেখা যোগ করুন।' : 'Please add some text first.');
      }

      const status = await fetchAnalyzeStatus();
      setConfigured(status.configured);
      if (!status.configured) {
        throw new Error(
          lang === 'bn'
            ? 'AI সংযোগ এখনো সক্রিয় নয়। সেটিংসে API key যোগ করুন।'
            : 'AI connection is not active yet. Please add your OpenAI API key in settings.'
        );
      }

      const reports: Report[] = [];
      const digests: unknown[] = [];
      let model = status.model;

      for (let i = 0; i < parts.length; i++) {
        if (c.signal.aborted) throw new DOMException('Aborted', 'AbortError');
        const part = parts[i];
        const partStr = lang === 'bn'
          ? `${(i + 1).toLocaleString('bn-BD')} / ${parts.length.toLocaleString('bn-BD')} অংশ: ${part.chapter.title}`
          : `Part ${i + 1} of ${parts.length}: ${part.chapter.title}`;
        setProgress(partStr);

        const cacheKey = JSON.stringify([status.model, src.genre, src.language, part.chapter, part.part]);
        if (mode === 'book' && digestCache.current.has(cacheKey)) {
          digests.push(digestCache.current.get(cacheKey)!);
          continue;
        }

        const resp = await analyzeChapter({
          mode: mode === 'book' ? 'digest' : mode,
          project: { ...src, chapters: [part.chapter] },
          part: part.part,
        }, c.signal) as { report?: Report; digest?: unknown; model?: string };

        model = resp.model || model;
        if (mode === 'book') {
          digests.push(resp.digest);
          digestCache.current.set(cacheKey, resp.digest);
          if (digestCache.current.size > 250) digestCache.current.delete(digestCache.current.keys().next().value!);
        } else if (resp.report) {
          reports.push(resp.report);
        }
      }

      let report: Report;
      if (mode === 'book') {
        setProgress(
          lang === 'bn'
            ? 'সব অধ্যায়ের চরিত্র, ঘটনা ও সূত্র মিলিয়ে দেখা হচ্ছে…'
            : 'Comparing characters, timeline, and plot continuity across all chapters…'
        );
        const d = await analyzeChapter({ mode: 'book', title: src.title, genre: src.genre, language: src.language, digests }, c.signal) as { report: Report; model?: string };
        model = d.model || model;
        report = d.report;
      } else {
        report = {
          summary: reports.map((r, i) => reports.length > 1 ? `${lang === 'bn' ? 'অংশ' : 'Part'} ${i + 1}: ${r.summary}` : r.summary).join('\n\n'),
          strengths: reports.flatMap((r) => r.strengths),
          findings: reports.flatMap((r) => r.findings),
          caveats: [...new Set(reports.flatMap((r) => r.caveats))],
        };
      }

      if (c.signal.aborted) return;
      setResult({ report, source: snapshot(src), model, parts: parts.length, mode });
      setDismissed([]);
      setProgress(t.analysisComplete);
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        setError(lang === 'bn' ? 'বিশ্লেষণ বন্ধ করা হয়েছে।' : 'Analysis cancelled.');
      } else {
        setError(e instanceof Error ? e.message : (lang === 'bn' ? 'বিশ্লেষণ সম্পন্ন হয়নি।' : 'Analysis failed.'));
      }
    } finally { setBusy(false); }
  }

  function apply(f: Finding) {
    if (!result || stale) return;
    const evidence = f.evidence[0];
    if (onApply(evidence.chapterId, f.original, f.replacement)) setAccepted(true);
    else {
      setError(
        lang === 'bn'
          ? 'মূল লেখা বদলেছে অথবা একই অংশ একাধিকবার আছে।'
          : 'Original text has changed or occurs multiple times in this chapter.'
      );
    }
  }

  // Pro gate
  if (!isPro) {
    return (
      <div className="analysis ai-panel pro-gate">
        <Lock size={36} />
        <h3>{t.proGateTitle}</h3>
        <p>{defaultMode === 'proofread' ? t.proGateDescProof : t.proGateDescDeep}</p>

        <ul className="pro-feature-list">
          <li>{t.proGateFeature1}</li>
          <li>{t.proGateFeature2}</li>
          <li>{t.proGateFeature3}</li>
          <li>{t.proGateFeature4}</li>
        </ul>

        <a href="/wp-admin/admin.php?page=lipishilpo-settings" className="button primary full">
          {t.btnActivatePro} <ArrowRight size={16} />
        </a>
        <p className="prototype-note" style={{ marginTop: '12px' }}>
          {t.freeAlwaysAvailable}
        </p>
      </div>
    );
  }

  return (
    <div className="analysis ai-panel">
      <span className={'preview-label ' + (configured ? 'connected' : '')}>
        {configured ? t.aiConnected : configured === null ? t.aiChecking : t.aiDisconnected}
      </span>
      <h3>{defaultMode === 'proofread' ? t.aiHeadingProof : t.aiHeadingDeep}</h3>

      <label className="field-label">
        {t.aiModeLabel}
        <select value={mode} disabled={busy} onChange={(e) => setMode(e.target.value as Mode)}>
          <option value="proofread">{t.aiModeProofread}</option>
          <option value="chapter">{t.aiModeChapter}</option>
          <option value="book">{t.aiModeBook}</option>
        </select>
      </label>

      <p className="privacy-note">{t.aiPrivacyNote}</p>

      <button
        className="primary full"
        disabled={busy || !project.chapters.some((c) => c.text.trim())}
        onClick={run}
      >
        <Sparkles size={17} />
        {result ? t.btnReanalyze : t.btnStartAnalysis}
        <ArrowRight size={16} />
      </button>

      {busy && (
        <div className="analysis-progress">
          <progress aria-label={t.analysisProgress} />
          <output>{progress}</output>
          <button className="secondary" onClick={() => controller.current?.abort()}>
            <X size={15} /> {t.btnStopAnalysis}
          </button>
        </div>
      )}

      {error && <p className="error-message" role="alert">{error}</p>}

      {!configured && !busy && (
        <p className="prototype-note">
          {lang === 'bn' ? 'সংযোগ সক্রিয় হলে এখান থেকেই আসল রিপোর্ট পাওয়া যাবে। ' : 'Once connected, AI reports will appear here. '}
          <a href="/wp-admin/admin.php?page=lipishilpo-settings">
            {lang === 'bn' ? 'সেটিংসে যান →' : 'Go to settings →'}
          </a>
        </p>
      )}

      {result && (
        <>
          <div className="report-meta">
            {result.model} · {lang === 'bn' ? `${result.parts.toLocaleString('bn-BD')} অংশ` : `${result.parts} part(s)`}
          </div>
          {stale && (
            <p className="stale-warning">
              {t.analysisStale}
            </p>
          )}
          <h4>{t.summaryHeading}</h4>
          <p className="report-summary">{result.report.summary}</p>

          {result.report.strengths.length > 0 && (
            <details>
              <summary>{t.strengthsHeading}</summary>
              <ul>{result.report.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </details>
          )}

          <h4 className="findings-heading">{t.findingsHeading(result.report.findings.length)}</h4>

          {!result.report.findings.length && (
            <p>{t.noFindings}</p>
          )}

          {result.report.findings.map((f, i) => dismissed.includes(i) ? null : (
            <article className="analysis-card" key={i}>
              <span className="finding-category">{labels[f.category] || f.category}</span>
              <h4>{f.title}</h4>
              <p>{f.explanation}</p>
              <p className="recommendation">{f.recommendation}</p>
              {f.evidence.map((e, j) => (
                <button key={j} className="evidence-link" disabled={stale} onClick={() => onLocate(e.chapterId, e.quote)}>
                  <small>{project.chapters.find((c) => c.id === e.chapterId)?.title || e.chapterId}</small>
                  <blockquote>{e.quote}</blockquote>
                  <span>{t.viewInText} <ArrowRight size={13} /></span>
                </button>
              ))}
              {f.original && f.replacement && f.original !== f.replacement && (
                <>
                  <div className="replacement ai-replacement">
                    <del>{f.original}</del> <ArrowRight size={14} /> <strong>{f.replacement}</strong>
                  </div>
                  <button className="secondary" disabled={stale} onClick={() => apply(f)}>
                    <Check size={15} /> {t.btnAccept}
                  </button>
                </>
              )}
              <button className="dismiss-finding" onClick={() => setDismissed((a) => [...a, i])}>
                {t.btnIgnore}
              </button>
            </article>
          ))}

          {result.report.caveats.length > 0 && (
            <details open>
              <summary>{t.caveatsHeading}</summary>
              <ul>{result.report.caveats.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </details>
          )}

          {!!result.report.rejectedEvidence && (
            <p className="prototype-note">
              {t.rejectedEvidenceNote(result.report.rejectedEvidence)}
            </p>
          )}

          <button className="secondary" onClick={() => {
            const blob = new Blob([JSON.stringify(result.report, null, 2)], { type: 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'lipishilpo-analysis.json'; a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}>{t.btnDownloadReport}</button>
        </>
      )}
    </div>
  );
}
