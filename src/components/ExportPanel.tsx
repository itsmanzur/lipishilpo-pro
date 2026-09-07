import { useEffect, useState } from 'react';
import { Download, Lock, ArrowRight, Maximize2, Sparkles, Sliders } from 'lucide-react';
import type { Project } from '../api';
import { fetchExportStatus } from '../api';
import { translations, type Language } from '../i18n';
import {
  type BookSettings,
  defaultBookSettings,
  normalizeSettings,
  PAGE_PRESETS,
  CALLOUT_THEMES,
  type PagePreset,
  type CalloutTheme,
} from '../lib/book-layout';
import { BookPreview } from './BookPreview';
import { BookStudioModal } from './BookStudioModal';

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
  project,
  isPro,
  lang = 'en',
  onTxt,
  onHtml,
}: {
  project: Project;
  isPro: boolean;
  lang?: Language;
  onTxt: () => void;
  onHtml?: () => void;
}) {
  const t = translations[lang];
  const [settings, setSettings] = useState<BookSettings>(loadSettings);
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);
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
    setBusy(format);
    setError('');
    setDone('');
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
      const name = `${base}.${format === 'cover' ? 'cover.pdf' : format}`;

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
          ? `${format === 'cover' ? 'প্রচ্ছদ' : format.toUpperCase()} সফলভাবে তৈরি হয়েছে।`
          : `${format === 'cover' ? 'Cover' : format.toUpperCase()} generated successfully.`,
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : lang === 'bn'
            ? 'ফাইল তৈরি হয়নি। আবার চেষ্টা করুন।'
            : 'Export failed. Please try again.',
      );
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="analysis export-panel">
      <div className="export-panel-header">
        <span className="preview-label connected">{t.bookFormatting}</span>
        <h3>{t.exportHeading}</h3>
        <p>{t.exportSubtitle}</p>
      </div>

      {!isPro && (
        <div className="pro-notice">
          <Lock size={16} />
          <span>{t.proExportNotice}</span>
          <a href="/wp-admin/admin.php?page=lipishilpo-settings">
            {t.proActivateLink} <ArrowRight size={14} />
          </a>
        </div>
      )}

      {/* Prominent Full Studio Launcher Banner */}
      <div className="studio-launcher-card">
        <div className="launcher-text">
          <strong>{lang === 'bn' ? '📖 বুক গেট-আপ ও লাইভ প্রিভিউ' : '📖 Live Book Get-up Studio'}</strong>
          <span>{lang === 'bn' ? '২-পাতার স্প্রেড, ফন্ট, মার্জিন ও কালার সাজান' : 'Full 2-page spread & layout studio'}</span>
        </div>
        <button
          type="button"
          className="open-studio-action-btn"
          onClick={() => setIsStudioModalOpen(true)}
        >
          <Maximize2 size={16} />
          <span>{lang === 'bn' ? 'স্টুডিও খুলুন' : 'Open Studio'}</span>
        </button>
      </div>

      {/* Compact Preview inside Sidebar */}
      <BookPreview
        project={project}
        settings={settings}
        lang={lang}
        onExpand={() => setIsStudioModalOpen(true)}
        isExpanded={false}
      />

      {/* Quick Formatting Settings in Sidebar */}
      <fieldset className="export-fieldset">
        <legend>{lang === 'bn' ? 'বইয়ের আকার ও ফন্ট' : 'Paper & Typography'}</legend>
        <label className="field-label">
          {t.pageSizeLabel}
          <select
            value={settings.pageSize}
            onChange={(e) => patch({ pageSize: e.target.value as PagePreset })}
          >
            {Object.entries(PAGE_PRESETS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
            <option value="custom">{t.customSizeLabel}</option>
          </select>
        </label>

        <label className="field-label">
          {lang === 'bn' ? 'বাংলা ফন্ট' : 'Bengali Font'}
          <select
            value={settings.fontFamily}
            onChange={(e) => patch({ fontFamily: e.target.value })}
          >
            <option value="Noto Serif Bengali">Noto Serif Bengali</option>
            <option value="SolaimanLipi">SolaimanLipi</option>
            <option value="Kalpurush">Kalpurush</option>
            <option value="Tiro Bangla">Tiro Bangla</option>
            <option value="Hind Siliguri">Hind Siliguri</option>
          </select>
        </label>

        <div className="settings-grid">
          <label className="field-label">
            {t.fontSizeLabel}
            <select
              value={settings.fontSize}
              onChange={(e) => patch({ fontSize: Number(e.target.value) })}
            >
              {[10, 11, 11.5, 12, 12.5, 13, 14, 16].map((n) => (
                <option key={n} value={n}>
                  {n} pt
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            {t.lineHeightLabel}
            <select
              value={settings.lineHeight}
              onChange={(e) => patch({ lineHeight: Number(e.target.value) })}
            >
              {[1.3, 1.4, 1.5, 1.6, 1.8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Chapter Heading Color */}
        <label className="field-label">
          {lang === 'bn' ? 'অধ্যায় শিরোনামের রং' : 'Chapter Heading Color'}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              value={settings.chapterHeadingColor}
              onChange={(e) => patch({ chapterHeadingColor: e.target.value })}
              style={{ width: '36px', height: '28px', padding: 0, cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <span style={{ fontSize: '12px', color: '#666' }}>{settings.chapterHeadingColor}</span>
          </div>
        </label>
      </fieldset>

      <fieldset className="export-fieldset">
        <legend>{t.imprintLegend}</legend>
        <label className="field-label">
          {t.authorLabel}
          <input
            value={settings.author}
            maxLength={200}
            onChange={(e) => patch({ author: e.target.value })}
            placeholder={t.authorPlaceholder}
          />
        </label>
        <label className="field-label">
          {t.publisherLabel}
          <input
            value={settings.publisher}
            maxLength={160}
            onChange={(e) => patch({ publisher: e.target.value })}
          />
        </label>
        <div className="settings-grid">
          <label className="field-label">
            {t.yearLabel}
            <input
              value={settings.year}
              maxLength={12}
              onChange={(e) => patch({ year: e.target.value })}
            />
          </label>
          <label className="field-label">
            {t.isbnLabel}
            <input
              value={settings.isbn}
              maxLength={24}
              onChange={(e) => patch({ isbn: e.target.value })}
            />
          </label>
        </div>
      </fieldset>

      {/* Export Action Buttons */}
      <div className="export-buttons">
        {([
          ['pdf', t.btnExportPdf],
          ['docx', t.btnExportDocx],
          ['epub', t.btnExportEpub],
          ['cover', t.btnExportCover],
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

      {busy && (
        <p className="privacy-note">
          {lang === 'bn'
            ? 'বড় বই তৈরিতে কিছু সময় লাগতে পারে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।'
            : 'Generating large manuscripts may take a few moments. Please wait.'}
        </p>
      )}
      {done && <output className="export-success">{done}</output>}
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {/* Modal Dialog Mount */}
      <BookStudioModal
        isOpen={isStudioModalOpen}
        onClose={() => setIsStudioModalOpen(false)}
        project={project}
        settings={settings}
        onSaveSettings={setSettings}
        isPro={isPro}
        lang={lang}
        onTxt={onTxt}
        onHtml={onHtml}
      />
    </div>
  );
}
