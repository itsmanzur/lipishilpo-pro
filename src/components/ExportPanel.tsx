import { useEffect, useState } from 'react';
import { Download, Lock, ArrowRight } from 'lucide-react';
import type { Project } from '../api';
import { fetchExportStatus } from '../api';
import { translations, type Language } from '../i18n';
import { type BookSettings, defaultBookSettings, normalizeSettings } from '../lib/book-layout';
import { BookPreview } from './BookPreview';

const SETTINGS_KEY = 'lipishilpo_book_settings';

function loadSettings(): BookSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? normalizeSettings(JSON.parse(raw)) : defaultBookSettings;
  } catch {
    return defaultBookSettings;
  }
}

export function ExportPanel({
  project, isPro, lang = 'en', onTxt, onHtml,
}: {
  project: Project; isPro: boolean; lang?: Language; onTxt: () => void; onHtml?: () => void;
}) {
  const t = translations[lang];
  const [settings, setSettings] = useState<BookSettings>(loadSettings);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  function patch(partial: Partial<BookSettings>) {
    setSettings((s) => ({ ...s, ...partial }));
  }

  async function exportFile(format: 'docx' | 'pdf' | 'epub' | 'cover') {
    setBusy(format); setError(''); setDone('');
    try {
      const status = await fetchExportStatus();
      if (!status.pro || (format !== 'cover' && !status[format]) || (format === 'cover' && !status.pdf)) {
        setError(
          lang === 'bn'
            ? 'রপ্তানি Pro সুবিধা। সেটিংসে লাইসেন্স যুক্ত করুন।'
            : 'Export is a Pro feature. Activate a valid license in Settings.',
        );
        return;
      }
      const { makeDocx, makeEpub, makePdf, makeCoverPdf, loadFonts, downloadBlob } = await import('../lib/book-export');
      const source = structuredClone(project);
      const s = { ...settings };
      const base = source.title || (lang === 'bn' ? 'পাণ্ডুলিপি' : 'Manuscript');
      let blob: Blob;
      let name = `${base}.${format === 'cover' ? 'cover.pdf' : format}`;

      if (format === 'docx') {
        const bytes = await makeDocx(source, s);
        blob = new Blob([new Uint8Array(bytes)], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
      } else {
        const fonts = await loadFonts();
        if (format === 'pdf') blob = await makePdf(source, s, fonts);
        else if (format === 'cover') blob = await makeCoverPdf(source, s, fonts);
        else blob = new Blob([new Uint8Array(makeEpub(source, s, fonts))], { type: 'application/epub+zip' });
      }

      downloadBlob(blob, name);
      setDone(
        lang === 'bn'
          ? `${format === 'cover' ? 'প্রচ্ছদ' : format.toUpperCase()} তৈরি হয়েছে।`
          : `${format === 'cover' ? 'Cover' : format.toUpperCase()} generated.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : (lang === 'bn' ? 'ফাইল তৈরি হয়নি। আবার চেষ্টা করুন।' : 'Export failed. Please try again.'));
    } finally { setBusy(''); }
  }

  return (
    <div className="analysis export-panel">
      <span className="preview-label connected">{t.bookFormatting}</span>
      <h3>{t.exportHeading}</h3>
      <p>{t.exportSubtitle}</p>

      {!isPro && (
        <div className="pro-notice">
          <Lock size={16} />
          <span>{t.proExportNotice}</span>
          <a href="/wp-admin/admin.php?page=lipishilpo-settings">
            {t.proActivateLink} <ArrowRight size={14} />
          </a>
        </div>
      )}

      <BookPreview project={project} settings={settings} lang={lang} />

      <fieldset className="export-fieldset">
        <legend>{t.imprintLegend}</legend>
        <label className="field-label">
          {t.authorLabel}
          <input value={settings.author} maxLength={200} onChange={(e) => patch({ author: e.target.value })} placeholder={t.authorPlaceholder} />
        </label>
        <label className="field-label">
          {t.publisherLabel}
          <input value={settings.publisher} maxLength={160} onChange={(e) => patch({ publisher: e.target.value })} />
        </label>
        <div className="settings-grid">
          <label className="field-label">
            {t.yearLabel}
            <input value={settings.year} maxLength={12} onChange={(e) => patch({ year: e.target.value })} />
          </label>
          <label className="field-label">
            {t.isbnLabel}
            <input value={settings.isbn} maxLength={24} onChange={(e) => patch({ isbn: e.target.value })} />
          </label>
        </div>
        <label className="field-label">
          {t.dedicationLabel}
          <input value={settings.dedication} maxLength={240} onChange={(e) => patch({ dedication: e.target.value })} />
        </label>
        <label className="field-label">
          {t.copyrightLabel}
          <input value={settings.copyrightNote} maxLength={240} onChange={(e) => patch({ copyrightNote: e.target.value })} />
        </label>
      </fieldset>

      <fieldset className="export-fieldset">
        <legend>{t.getupLegend}</legend>
        <label className="field-label">
          {t.pageSizeLabel}
          <select value={settings.pageSize} onChange={(e) => patch({ pageSize: e.target.value as BookSettings['pageSize'] })}>
            <option value="A5">A5 — 148×210</option>
            <option value="A4">A4 — 210×297</option>
            <option value="B5">B5 — 176×250</option>
            <option value="US_Trade">6×9 in</option>
            <option value="Digest">5.5×8.5 in</option>
            <option value="custom">{t.customSizeLabel}</option>
          </select>
        </label>
        {settings.pageSize === 'custom' && (
          <div className="settings-grid">
            <label className="field-label">
              {t.widthMmLabel}
              <input type="number" min={90} max={320} value={settings.customWidthMm} onChange={(e) => patch({ customWidthMm: Number(e.target.value) })} />
            </label>
            <label className="field-label">
              {t.heightMmLabel}
              <input type="number" min={120} max={420} value={settings.customHeightMm} onChange={(e) => patch({ customHeightMm: Number(e.target.value) })} />
            </label>
          </div>
        )}
        <div className="settings-grid">
          <label className="field-label">
            {t.fontSizeLabel}
            <select value={settings.fontSize} onChange={(e) => patch({ fontSize: Number(e.target.value) })}>
              {[10, 11, 12, 13, 14, 16].map((n) => <option key={n} value={n}>{n} pt</option>)}
            </select>
          </label>
          <label className="field-label">
            {t.lineHeightLabel}
            <select value={settings.lineHeight} onChange={(e) => patch({ lineHeight: Number(e.target.value) })}>
              {[1.3, 1.5, 1.8].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label className="field-label">
            {t.marginInnerLabel}
            <select value={settings.marginInnerMm} onChange={(e) => patch({ marginInnerMm: Number(e.target.value) })}>
              {[12, 15, 18, 20, 22, 25, 30].map((n) => <option key={n} value={n}>{n} mm</option>)}
            </select>
          </label>
          <label className="field-label">
            {t.marginOuterLabel}
            <select value={settings.marginOuterMm} onChange={(e) => patch({ marginOuterMm: Number(e.target.value) })}>
              {[12, 15, 16, 18, 22, 25, 30].map((n) => <option key={n} value={n}>{n} mm</option>)}
            </select>
          </label>
          <label className="field-label">
            {t.marginTopLabel}
            <select value={settings.marginTopMm} onChange={(e) => patch({ marginTopMm: Number(e.target.value) })}>
              {[12, 15, 18, 22, 25, 30].map((n) => <option key={n} value={n}>{n} mm</option>)}
            </select>
          </label>
          <label className="field-label">
            {t.marginBottomLabel}
            <select value={settings.marginBottomMm} onChange={(e) => patch({ marginBottomMm: Number(e.target.value) })}>
              {[12, 15, 18, 20, 22, 25, 30].map((n) => <option key={n} value={n}>{n} mm</option>)}
            </select>
          </label>
        </div>
        <label className="field-label">
          {t.indentLabel}
          <select value={settings.firstLineIndentMm} onChange={(e) => patch({ firstLineIndentMm: Number(e.target.value) })}>
            {[0, 4, 5, 6, 8, 10].map((n) => <option key={n} value={n}>{n} mm</option>)}
          </select>
        </label>
        <label className="field-label">
          {t.runningHeaderLabel}
          <select value={settings.runningHeader} onChange={(e) => patch({ runningHeader: e.target.value as BookSettings['runningHeader'] })}>
            <option value="none">{t.headerNone}</option>
            <option value="title">{t.headerTitle}</option>
            <option value="author">{t.headerAuthor}</option>
            <option value="split">{t.headerSplit}</option>
          </select>
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={settings.includeToc} onChange={(e) => patch({ includeToc: e.target.checked })} />
          {t.includeTocLabel}
        </label>
      </fieldset>

      <fieldset className="export-fieldset">
        <legend>{t.coverPrintLegend}</legend>
        <label className="field-label">
          {t.coverSubtitleLabel}
          <input value={settings.coverSubtitle} maxLength={160} onChange={(e) => patch({ coverSubtitle: e.target.value })} />
        </label>
        <label className="field-label">
          {t.coverColorLabel}
          <input type="color" value={settings.coverColor} onChange={(e) => patch({ coverColor: e.target.value })} />
        </label>
        <label className="field-label">
          {t.bleedLabel}
          <select value={settings.bleedMm} onChange={(e) => patch({ bleedMm: Number(e.target.value) })}>
            {[0, 3, 5].map((n) => <option key={n} value={n}>{n} mm</option>)}
          </select>
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={settings.includeCropMarks} onChange={(e) => patch({ includeCropMarks: e.target.checked })} />
          {t.cropMarksLabel}
        </label>
      </fieldset>

      <div className="export-buttons">
        {([
          ['docx', t.btnExportDocx],
          ['pdf', t.btnExportPdf],
          ['cover', t.btnExportCover],
          ['epub', t.btnExportEpub],
        ] as const).map(([f, label]) => (
          <button
            className={'primary full' + (!isPro ? ' pro-locked' : '')}
            key={f}
            disabled={!!busy}
            onClick={() => exportFile(f)}
          >
            {isPro ? <Download size={16} /> : <Lock size={16} />}
            {busy === f ? t.generatingFile : label}
          </button>
        ))}
        <button className="secondary full" disabled={!!busy} onClick={onTxt}>
          {t.btnExportTxt}
        </button>
        {onHtml && (
          <button className="secondary full" disabled={!!busy} onClick={onHtml}>
            {t.btnExportHtml}
          </button>
        )}
      </div>

      {busy && <p className="privacy-note">{lang === 'bn' ? 'বড় বই তৈরিতে কিছু সময় লাগতে পারে। এই পৃষ্ঠা খোলা রাখুন।' : 'Generating large manuscripts may take a few moments. Please keep this tab open.'}</p>}
      {done && <output className="export-success">{done}</output>}
      {error && <p className="error-message" role="alert">{error}</p>}

      <p className="prototype-note">{t.exportFontNote}</p>
      <a
        className="font-download"
        href={(document.getElementById('lipishilpo-root')?.dataset.fontsUrl || '/wp-content/plugins/lipishilpo/assets/fonts').replace(/\/$/, '') + '/NotoSerifBengali-Regular.ttf'}
        download
      >
        {t.btnDownloadFont}
      </a>
      <p className="prototype-note" style={{ marginTop: '10px' }}>{t.clientSideExportNote}</p>
    </div>
  );
}
