import { useEffect, useState } from 'react';
import { Download, Lock, ArrowRight, Maximize2, BookOpen } from 'lucide-react';
import type { Project } from '../api';
import { fetchExportStatus } from '../api';
import { translations, type Language } from '../i18n';
import {
  type BookSettings,
  defaultBookSettings,
  normalizeSettings,
} from '../lib/book-layout';
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
    } catch {
      try {
        const slim = { ...settings, coverFrontImage: '', coverBackImage: '' };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(slim));
      } catch {}
    }
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
        const fonts = await loadFonts(s.fontFamily);
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
        <div className="export-header-top">
          <span className="preview-label connected">{t.bookFormatting}</span>
          <span className="pro-pill-tag">PRO</span>
        </div>
        <h3>{lang === 'bn' ? 'বুক গেট-আপ ও প্রকাশনা' : 'Book Formatting & Export'}</h3>
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

      {/* Main Studio Launcher Card */}
      <div className="studio-hero-card">
        <div className="hero-card-header">
          <BookOpen size={20} className="hero-icon" />
          <div>
            <h4>{lang === 'bn' ? 'বুক গেট-আপ স্টুডিও' : 'Book Get-up Studio'}</h4>
            <span className="hero-subtext">{lang === 'bn' ? '২-পাতার লাইভ স্প্রেড ও প্রচ্ছদ' : '2-Page Spread & Cover'}</span>
          </div>
        </div>
        <p className="hero-card-desc">
          {isPro
            ? (lang === 'bn'
              ? '১-ক্লিক থিম, ফন্ট সাইজ, মার্জিন, কভার ছবি, ড্রপ ক্যাপ এবং পূর্ণাঙ্গ বই সাজাতে স্টুডিও ওপেন করুন।'
              : 'Configure themes, fonts, margins, cover art, drop caps, and front/back matter.')
            : (lang === 'bn'
              ? 'লাইসেন্স ছাড়া স্টুডিও খোলা যায় (ডেমো)। ফন্ট, কভার ছবি ও লেআউট দেখুন — PDF/DOCX/EPUB ডাউনলোড লাইসেন্সে।'
              : 'Open as a demo without a license. Preview fonts, cover art, and layout — PDF/DOCX/EPUB download needs Pro.')}
        </p>
        <button
          type="button"
          className="hero-launch-btn"
          onClick={() => setIsStudioModalOpen(true)}
        >
          <Maximize2 size={15} />
          <span>{lang === 'bn' ? 'ফুলস্ক্রিন স্টুডিও খুলুন' : 'Open Fullscreen Studio'}</span>
        </button>
      </div>

      {/* Quick Downloads Divider */}
      <div className="quick-export-title-divider">
        <span>{lang === 'bn' ? 'সরাসরি ফাইল ডাউনলোড' : 'Quick Downloads'}</span>
      </div>

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
            disabled={!!busy || !isPro}
            onClick={() => exportFile(f)}
          >
            {isPro ? <Download size={15} /> : <Lock size={15} />}
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
