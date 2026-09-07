import React, { useState } from 'react';
import {
  X,
  Download,
  Lock,
  BookOpen,
  Sliders,
  Palette,
  FileText,
  Bookmark,
  CheckCircle,
  AlertTriangle,
  Info,
  Sparkles,
  User,
  Hash,
  ListOrdered,
  Layers,
  ShieldCheck,
  QrCode,
  Feather,
} from 'lucide-react';
import type { Project } from '../api';
import { fetchExportStatus } from '../api';
import {
  type BookSettings,
  type BookThemePreset,
  BOOK_THEMES,
  CALLOUT_THEMES,
  PAGE_PRESETS,
  PAGE_NUMBER_POSITIONS,
  PAGE_NUMBER_STYLES,
  TOC_PRESETS,
  CHAPTER_HEADER_STYLES,
  SCENE_BREAK_MOTIFS,
  LEAD_IN_STYLES,
  type PagePreset,
  type CalloutTheme,
  type PageNumberPosition,
  type PageNumberStyle,
  type TocPreset,
  type ChapterHeaderStyle,
  type SceneBreakMotif,
  type LeadInStyle,
  calculateSpineMm,
  estimatePageCount,
  runPreflightInspection,
  generateEan13Svg,
} from '../lib/book-layout';
import { BookPreview } from './BookPreview';

export function BookStudioModal({
  isOpen,
  onClose,
  project,
  settings,
  onSaveSettings,
  isPro,
  lang = 'bn',
  onTxt,
  onHtml,
}: {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  settings: BookSettings;
  onSaveSettings: (s: BookSettings) => void;
  isPro: boolean;
  lang?: 'bn' | 'en';
  onTxt?: () => void;
  onHtml?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'layout' | 'styling' | 'meta' | 'cover'>('layout');
  const [busy, setBusy] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showPreflight, setShowPreflight] = useState<boolean>(false);

  if (!isOpen) return null;

  function patch(partial: Partial<BookSettings>) {
    const updated = { ...settings, ...partial };
    onSaveSettings(updated);
  }

  function applyTheme(themeKey: BookThemePreset) {
    const theme = BOOK_THEMES[themeKey];
    if (!theme) return;
    patch({
      themePreset: themeKey,
      ...theme.settings,
    });
  }

  const totalChars = project.chapters?.reduce((sum, c) => sum + (c.text?.length || 0), 0) || 5000;
  const estimatedPages = estimatePageCount(totalChars, settings);
  const calculatedSpine = calculateSpineMm(estimatedPages, settings.paperGsm);
  const chapterCount = project.chapters?.length || 1;
  const preflight = runPreflightInspection(settings, totalChars, chapterCount);

  async function exportFile(format: 'docx' | 'pdf' | 'epub' | 'cover') {
    setBusy(format);
    setStatusMsg(null);
    try {
      const status = await fetchExportStatus();
      if (!status.pro || (format !== 'cover' && !status[format]) || (format === 'cover' && !status.pdf)) {
        setStatusMsg({
          text: lang === 'bn' ? 'রপ্তানি Pro সুবিধা। সেটিংসে লাইসেন্স যুক্ত করুন।' : 'Export is a Pro feature. Activate your license.',
          type: 'error',
        });
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
      setStatusMsg({
        text: lang === 'bn' ? `✅ ${format.toUpperCase()} ফাইল সফলভাবে তৈরি হয়েছে!` : `✅ ${format.toUpperCase()} generated successfully!`,
        type: 'success',
      });
    } catch (e) {
      setStatusMsg({
        text: e instanceof Error ? e.message : (lang === 'bn' ? 'ফাইল তৈরি করা সম্ভব হয়নি।' : 'Export failed.'),
        type: 'error',
      });
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="lipishilpo-studio-modal-overlay">
      <div className="lipishilpo-studio-modal">
        {/* Top Navigation Bar */}
        <div className="modal-top-bar" style={{ position: 'relative' }}>
          <div className="modal-title-area">
            <span className="modal-badge-pro">PRO STUDIO</span>
            <h2>{lang === 'bn' ? 'বুক গেট-আপ ও পাবলিকেশন স্টুডিও' : 'Book Get-up & Publication Studio'}</h2>
            <span className="project-tag">{project.title || (lang === 'bn' ? 'নতুন বই' : 'Untitled Book')}</span>

            {/* Preflight Health Pill */}
            <button
              type="button"
              className={`preflight-pill-btn ${preflight.isPressReady ? 'pass' : 'warning'}`}
              onClick={() => setShowPreflight(!showPreflight)}
              title={lang === 'bn' ? 'প্রেস-রেডি ইন্সপেকশন বিস্তারিত দেখুন' : 'View Pre-flight Press Inspection'}
            >
              <ShieldCheck size={14} />
              <span>
                {preflight.isPressReady
                  ? lang === 'bn'
                    ? `প্রেস-রেডি ১০০%`
                    : `Press Ready 100%`
                  : lang === 'bn'
                    ? `ইন্সপেকশন ${preflight.score}%`
                    : `Inspection ${preflight.score}%`}
              </span>
            </button>
          </div>

          {/* Pre-flight Inspector Dropdown Drawer */}
          {showPreflight && (
            <div className="preflight-inspector-overlay">
              <div className="preflight-inspector-header">
                <h4>
                  <ShieldCheck size={16} />
                  {lang === 'bn' ? 'প্রি-ফ্লাইট প্রেস ইন্সপেকশন রিপোর্ট' : 'Pre-flight Press Inspection Report'}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`preflight-score-badge ${preflight.isPressReady ? 'pass' : 'warning'}`}>
                    {preflight.score}/100
                  </span>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    onClick={() => setShowPreflight(false)}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="preflight-issue-list">
                {preflight.issues.map((issue) => (
                  <div key={issue.id} className={`preflight-issue-card ${issue.type}`}>
                    <div className="issue-header">
                      <span className="issue-title">
                        {issue.type === 'pass' && <CheckCircle size={14} color="#16a34a" />}
                        {issue.type === 'warning' && <AlertTriangle size={14} color="#d97706" />}
                        {issue.type === 'info' && <Info size={14} color="#0284c7" />}
                        {issue.title}
                      </span>
                    </div>
                    <p className="issue-message">{issue.message}</p>
                    {issue.id === 'gutter_narrow_heavy' && (
                      <button
                        type="button"
                        className="issue-fix-btn"
                        onClick={() => patch({ marginInnerMm: 22 })}
                      >
                        ⚡ ভেতরের মার্জিন ২২ মিমি করুন (Auto Fix)
                      </button>
                    )}
                    {issue.id === 'gutter_narrow_mid' && (
                      <button
                        type="button"
                        className="issue-fix-btn"
                        onClick={() => patch({ marginInnerMm: 20 })}
                      >
                        ⚡ ভেতরের মার্জিন ২০ মিমি করুন (Auto Fix)
                      </button>
                    )}
                    {issue.id === 'line_height_tight' && (
                      <button
                        type="button"
                        className="issue-fix-btn"
                        onClick={() => patch({ lineHeight: 1.55 })}
                      >
                        ⚡ লাইন হাইট ১.৫৫ করুন (Auto Fix)
                      </button>
                    )}
                    {issue.id === 'toc_missing' && (
                      <button
                        type="button"
                        className="issue-fix-btn"
                        onClick={() => patch({ includeToc: true })}
                      >
                        ⚡ স্বয়ংক্রিয় সূচিপত্র যুক্ত করুন (Auto Fix)
                      </button>
                    )}
                    {issue.id === 'crop_marks_off' && (
                      <button
                        type="button"
                        className="issue-fix-btn"
                        onClick={() => patch({ includeCropMarks: true })}
                      >
                        ⚡ কাটিং মার্ক সক্রিয় করুন (Auto Fix)
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="modal-actions-area">
            {/* Quick Export Actions */}
            <div className="export-action-pills">
              <button
                type="button"
                className="export-pill-btn pdf"
                disabled={!!busy}
                onClick={() => exportFile('pdf')}
                title={lang === 'bn' ? 'প্রিন্ট-রেডি PDF তৈরি করুন' : 'Export Print PDF'}
              >
                <Download size={14} />
                <span>{busy === 'pdf' ? 'PDF তৈরি হচ্ছে...' : 'প্রিন্ট PDF'}</span>
              </button>

              <button
                type="button"
                className="export-pill-btn docx"
                disabled={!!busy}
                onClick={() => exportFile('docx')}
                title={lang === 'bn' ? 'সম্পাদনাযোগ্য Word (.docx) ফাইল' : 'Export Word .docx'}
              >
                <Download size={14} />
                <span>{busy === 'docx' ? 'DOCX তৈরি হচ্ছে...' : 'MS Word'}</span>
              </button>

              <button
                type="button"
                className="export-pill-btn epub"
                disabled={!!busy}
                onClick={() => exportFile('epub')}
                title={lang === 'bn' ? 'ই-বুক (.epub) ফাইল তৈরি করুন' : 'Export EPUB'}
              >
                <Download size={14} />
                <span>{busy === 'epub' ? 'EPUB তৈরি হচ্ছে...' : 'EPUB'}</span>
              </button>

              <button
                type="button"
                className="export-pill-btn cover"
                disabled={!!busy}
                onClick={() => exportFile('cover')}
                title={lang === 'bn' ? 'বইয়ের প্রচ্ছদ ও স্পাইন PDF' : 'Export Cover PDF'}
              >
                <Download size={14} />
                <span>{busy === 'cover' ? 'কভার হচ্ছে...' : 'কভার PDF'}</span>
              </button>
            </div>

            <button type="button" className="close-modal-btn" onClick={onClose} title="বন্ধ করুন">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Status Toast Message */}
        {statusMsg && (
          <div className={`modal-status-toast ${statusMsg.type}`}>
            {statusMsg.text}
          </div>
        )}

        {/* Main Dual-Pane Body */}
        <div className="modal-dual-pane-body">
          {/* Left Controls Pane */}
          <div className="modal-left-controls">
            {/* Section Tabs - 4 Clean, Spacious Primary Tabs */}
            <div className="control-tabs-nav">
              <button
                type="button"
                className={`control-tab-btn ${activeTab === 'layout' ? 'active' : ''}`}
                onClick={() => setActiveTab('layout')}
              >
                <Sliders size={14} />
                <span>{lang === 'bn' ? 'লেআউট ও সাইজ' : 'Layout & Size'}</span>
              </button>

              <button
                type="button"
                className={`control-tab-btn ${activeTab === 'styling' ? 'active' : ''}`}
                onClick={() => setActiveTab('styling')}
              >
                <Sparkles size={14} />
                <span>{lang === 'bn' ? 'পৃষ্ঠা ও সূচিপত্র' : 'Pages & Styles'}</span>
              </button>

              <button
                type="button"
                className={`control-tab-btn ${activeTab === 'meta' ? 'active' : ''}`}
                onClick={() => setActiveTab('meta')}
              >
                <Bookmark size={14} />
                <span>{lang === 'bn' ? 'তথ্য ও ভূমিকা' : 'Imprint & Meta'}</span>
              </button>

              <button
                type="button"
                className={`control-tab-btn ${activeTab === 'cover' ? 'active' : ''}`}
                onClick={() => setActiveTab('cover')}
              >
                <Palette size={14} />
                <span>{lang === 'bn' ? 'প্রচ্ছদ' : 'Cover'}</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="control-scroll-container">
              {/* TAB 1: LAYOUT, SIZE, SPINE & TYPOGRAPHY */}
              {activeTab === 'layout' && (
                <div className="control-section-panel">
                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'জনপ্রিয় ১-ক্লিক থিম প্রিসেট' : '1-Click Theme Presets'}</span>
                  </div>

                  <div className="theme-card-grid">
                    {(Object.entries(BOOK_THEMES) as [BookThemePreset, typeof BOOK_THEMES[BookThemePreset]][]).map(
                      ([key, t]) => {
                        const isSelected = settings.themePreset === key;
                        return (
                          <div
                            key={key}
                            className={`theme-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => applyTheme(key)}
                          >
                            <div className="theme-card-header">
                              <span className="theme-card-title">{t.name}</span>
                              {isSelected && <CheckCircle size={15} className="selected-icon" />}
                            </div>
                            <p className="theme-card-desc">{t.description}</p>
                            <div className="theme-card-meta">
                              <span className="meta-badge">{t.settings.fontFamily?.split(' ')[0]}</span>
                              <span
                                className="meta-color-dot"
                                style={{ backgroundColor: t.settings.chapterHeadingColor }}
                              />
                              <span
                                className="meta-color-dot"
                                style={{ backgroundColor: t.settings.coverColor }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* Spine & Pages Live Calculator Card */}
                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'বইয়ের সাইজ ও স্পাইন ক্যালকুলেটর' : 'Book Size & Spine'}</span>
                  </div>

                  <div className="spine-calculator-card">
                    <div className="spine-calc-item">
                      <span className="calc-label">{lang === 'bn' ? 'আনুমানিক পৃষ্ঠা' : 'Est. Pages'}</span>
                      <span className="calc-value">{estimatedPages}</span>
                    </div>
                    <div className="spine-calc-item highlight">
                      <span className="calc-label">{lang === 'bn' ? 'স্পাইন থিকনেস' : 'Spine Width'}</span>
                      <span className="calc-value">{calculatedSpine} mm</span>
                    </div>
                    <div className="spine-calc-item">
                      <span className="calc-label">{lang === 'bn' ? 'কাগজের ঘনত্ব' : 'Paper GSM'}</span>
                      <span className="calc-value">{settings.paperGsm || 80} GSM</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'বইয়ের সাইজ (Standard Trim Size)' : 'Book Trim Size'}</label>
                    <select
                      value={settings.pageSize}
                      onChange={(e) => patch({ pageSize: e.target.value as PagePreset })}
                    >
                      {Object.entries(PAGE_PRESETS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                      <option value="custom">{lang === 'bn' ? 'কাস্টম সাইজ (Custom mm)' : 'Custom Size (mm)'}</option>
                    </select>
                  </div>

                  {settings.pageSize === 'custom' && (
                    <div className="grid-2-col">
                      <div className="form-group">
                        <label>{lang === 'bn' ? 'প্রস্থ (Width mm)' : 'Width (mm)'}</label>
                        <input
                          type="number"
                          min={90}
                          max={320}
                          value={settings.customWidthMm}
                          onChange={(e) => patch({ customWidthMm: Number(e.target.value) })}
                        />
                      </div>
                      <div className="form-group">
                        <label>{lang === 'bn' ? 'উচ্চতা (Height mm)' : 'Height (mm)'}</label>
                        <input
                          type="number"
                          min={120}
                          max={420}
                          value={settings.customHeightMm}
                          onChange={(e) => patch({ customHeightMm: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid-2-col">
                    <div className="form-group">
                      <label>{lang === 'bn' ? 'কাগজের টাইপ ও GSM' : 'Paper Type & GSM'}</label>
                      <select
                        value={settings.paperGsm || 80}
                        onChange={(e) => patch({ paperGsm: Number(e.target.value) as 70 | 80 | 100 })}
                      >
                        <option value={70}>৭০ GSM নিউজপ্রিন্ট/হোয়াইট (হালকা)</option>
                        <option value={80}>৮০ GSM অফসেট পেপার (স্ট্যান্ডার্ড)</option>
                        <option value={100}>১০০ GSM প্রিমিয়াম আর্ট/অফসেট</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>{lang === 'bn' ? 'অধ্যায় শুরুর পাতা' : 'Chapter Start'}</label>
                      <select
                        value={settings.chapterStartSide || 'recto'}
                        onChange={(e) => patch({ chapterStartSide: e.target.value as 'recto' | 'any' })}
                      >
                        <option value="recto">ডান পাতা (Recto - প্রিমিয়াম)</option>
                        <option value="any">যেকোনো পাতা (পৃষ্ঠা বাঁচাতে)</option>
                      </select>
                    </div>
                  </div>

                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'টাইপোগ্রাফি ও ফন্ট' : 'Typography & Font'}</span>
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'বাংলা বইয়ের মূল ফন্ট' : 'Body Bengali Font'}</label>
                    <select
                      value={settings.fontFamily}
                      onChange={(e) => patch({ fontFamily: e.target.value })}
                    >
                      <option value="Noto Serif Bengali">Noto Serif Bengali (সর্বাধিক জনপ্রিয় সাহিত্যিক ফন্ট)</option>
                      <option value="SolaimanLipi">SolaimanLipi (সোলায়মানলিপি - ঐতিহ্যবাহী)</option>
                      <option value="Kalpurush">Kalpurush (কালপুরুষ - স্পষ্ট ও পরিচ্ছন্ন)</option>
                      <option value="Tiro Bangla">Tiro Bangla (তিরো বাংলা - ক্লাসিক পাবলিকেশন)</option>
                      <option value="Hind Siliguri">Hind Siliguri (হিন্দ শিলিগুড়ি - আধুনিক সান্স)</option>
                    </select>
                  </div>

                  <div className="grid-2-col">
                    <div className="form-group">
                      <label>{lang === 'bn' ? 'ফন্ট সাইজ (Font Size)' : 'Font Size'}</label>
                      <select
                        value={settings.fontSize}
                        onChange={(e) => patch({ fontSize: Number(e.target.value) })}
                      >
                        {[10, 10.5, 11, 11.5, 12, 12.5, 13, 14].map((n) => (
                          <option key={n} value={n}>
                            {n} pt
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>{lang === 'bn' ? 'লাইনের দূরত্ব (Line Height)' : 'Line Height'}</label>
                      <select
                        value={settings.lineHeight}
                        onChange={(e) => patch({ lineHeight: Number(e.target.value) })}
                      >
                        {[1.3, 1.4, 1.5, 1.6, 1.7, 1.8].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'মার্জিন ও বাইন্ডিং স্পেসিং (Margins mm)' : 'Margins & Spacing'}</span>
                  </div>

                  <div className="grid-2-col">
                    <div className="form-group">
                      <label>{lang === 'bn' ? 'ভেতরের মার্জিন (Inner Gutter)' : 'Inner / Gutter'}</label>
                      <select
                        value={settings.marginInnerMm}
                        onChange={(e) => patch({ marginInnerMm: Number(e.target.value) })}
                      >
                        {[15, 18, 20, 22, 25, 28, 30].map((n) => (
                          <option key={n} value={n}>
                            {n} mm
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>{lang === 'bn' ? 'বাইরের মার্জিন (Outer)' : 'Outer Margin'}</label>
                      <select
                        value={settings.marginOuterMm}
                        onChange={(e) => patch({ marginOuterMm: Number(e.target.value) })}
                      >
                        {[12, 14, 16, 18, 20, 22, 25].map((n) => (
                          <option key={n} value={n}>
                            {n} mm
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>{lang === 'bn' ? 'উপরের মার্জিন (Top)' : 'Top Margin'}</label>
                      <select
                        value={settings.marginTopMm}
                        onChange={(e) => patch({ marginTopMm: Number(e.target.value) })}
                      >
                        {[14, 16, 18, 20, 22, 25, 28].map((n) => (
                          <option key={n} value={n}>
                            {n} mm
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>{lang === 'bn' ? 'নিচের মার্জিন (Bottom)' : 'Bottom Margin'}</label>
                      <select
                        value={settings.marginBottomMm}
                        onChange={(e) => patch({ marginBottomMm: Number(e.target.value) })}
                      >
                        {[15, 18, 20, 22, 25, 28, 30].map((n) => (
                          <option key={n} value={n}>
                            {n} mm
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid-2-col">
                    <div className="form-group">
                      <label>{lang === 'bn' ? 'প্যারাগ্রাফ ইনডেন্ট' : 'Paragraph Indent'}</label>
                      <select
                        value={settings.firstLineIndentMm}
                        onChange={(e) => patch({ firstLineIndentMm: Number(e.target.value) })}
                      >
                        {[0, 3, 4, 5, 6, 8, 10].map((n) => (
                          <option key={n} value={n}>
                            {n === 0 ? (lang === 'bn' ? 'কোনোটি নয়' : 'None') : `${n} mm`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>{lang === 'bn' ? 'টেক্সট অ্যালাইনমেন্ট' : 'Text Alignment'}</label>
                      <select
                        value={settings.textAlign || 'justify'}
                        onChange={(e) => patch({ textAlign: e.target.value as 'justify' | 'left' })}
                      >
                        <option value="justify">জাস্টিফাইড (উভয় পাশ সমান)</option>
                        <option value="left">বাম দিকে সারিবদ্ধ (Left-aligned)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-checkbox">
                    <input
                      type="checkbox"
                      id="cropMarks"
                      checked={settings.includeCropMarks}
                      onChange={(e) => patch({ includeCropMarks: e.target.checked })}
                    />
                    <label htmlFor="cropMarks">
                      {lang === 'bn' ? 'প্রিন্ট কাটিং মার্ক যোগ করুন (Crop Marks)' : 'Include Print Crop Marks'}
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: PAGE NUMBERING, TOC PRESETS & CHAPTER STYLING */}
              {activeTab === 'styling' && (
                <div className="control-section-panel">
                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'পৃষ্ঠা নম্বর অবস্থান ও বিন্যাস' : 'Page Numbering Placement'}</span>
                  </div>

                  <div className="preset-card-grid">
                    {(Object.entries(PAGE_NUMBER_POSITIONS) as [PageNumberPosition, typeof PAGE_NUMBER_POSITIONS[PageNumberPosition]][]).map(
                      ([key, opt]) => {
                        const isSelected = (settings.pageNumberPosition || 'bottom-outside') === key;
                        return (
                          <div
                            key={key}
                            className={`option-choice-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => patch({ pageNumberPosition: key })}
                          >
                            <div className="choice-card-header">
                              <span className="choice-title">{opt.label}</span>
                              {isSelected && <CheckCircle size={14} className="selected-icon" />}
                            </div>
                            <span className="choice-desc">{opt.description}</span>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'পৃষ্ঠা নম্বরের স্টাইল ও অলঙ্করণ' : 'Page Number Style'}</span>
                  </div>

                  <div className="preset-card-grid">
                    {(Object.entries(PAGE_NUMBER_STYLES) as [PageNumberStyle, typeof PAGE_NUMBER_STYLES[PageNumberStyle]][]).map(
                      ([key, opt]) => {
                        const isSelected = (settings.pageNumberStyle || 'plain') === key;
                        return (
                          <div
                            key={key}
                            className={`option-choice-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => patch({ pageNumberStyle: key })}
                          >
                            <div className="choice-card-header">
                              <span className="choice-sample-tag">{opt.sample}</span>
                              {isSelected && <CheckCircle size={14} className="selected-icon" />}
                            </div>
                            <span className="choice-title" style={{ marginTop: '4px' }}>{opt.label}</span>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'সংখ্যার ভাষা (Numeral Script)' : 'Numeral Script'}</label>
                    <select
                      value={settings.numberFormat || 'bn'}
                      onChange={(e) => patch({ numberFormat: e.target.value as 'bn' | 'en' })}
                    >
                      <option value="bn">বাংলা সংখ্যা (১, ২, ৩...)</option>
                      <option value="en">English Numerals (1, 2, 3...)</option>
                    </select>
                  </div>

                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? '৫টি সূচিপত্র ডিজাইন প্রিসেট (TOC Styles)' : '5 Unique TOC Presets'}</span>
                  </div>

                  <div className="preset-card-grid">
                    {(Object.entries(TOC_PRESETS) as [TocPreset, typeof TOC_PRESETS[TocPreset]][]).map(
                      ([key, opt]) => {
                        const isSelected = (settings.tocPreset || 'classic-dots') === key;
                        return (
                          <div
                            key={key}
                            className={`option-choice-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => patch({ tocPreset: key })}
                          >
                            <div className="choice-card-header">
                              <span className="choice-title">{opt.label}</span>
                              {isSelected && <CheckCircle size={14} className="selected-icon" />}
                            </div>
                            <span className="choice-desc">{opt.description}</span>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div className="form-checkbox">
                    <input
                      type="checkbox"
                      id="incTocTab"
                      checked={settings.includeToc}
                      onChange={(e) => patch({ includeToc: e.target.checked })}
                    />
                    <label htmlFor="incTocTab">
                      {lang === 'bn' ? 'বইয়ের শুরুতে স্বয়ংক্রিয় সূচিপত্র যোগ করুন (Include TOC)' : 'Include Table of Contents in Book'}
                    </label>
                  </div>

                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'অধ্যায় শুরুর হেডার ডিজাইন (Chapter Opener)' : 'Chapter Opener Styles'}</span>
                  </div>

                  <div className="preset-card-grid">
                    {(Object.entries(CHAPTER_HEADER_STYLES) as [ChapterHeaderStyle, typeof CHAPTER_HEADER_STYLES[ChapterHeaderStyle]][]).map(
                      ([key, opt]) => {
                        const isSelected = (settings.chapterHeaderStyle || 'classic') === key;
                        return (
                          <div
                            key={key}
                            className={`option-choice-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => patch({ chapterHeaderStyle: key })}
                          >
                            <div className="choice-card-header">
                              <span className="choice-title">{opt.label}</span>
                              {isSelected && <CheckCircle size={14} className="selected-icon" />}
                            </div>
                            <span className="choice-desc">{opt.description}</span>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? '১০+ অলঙ্কৃত সিন ব্রেক মোটিফ (Scene Break Motifs)' : '10+ Scene Break Motifs'}</span>
                  </div>

                  <div className="preset-card-grid">
                    {(Object.entries(SCENE_BREAK_MOTIFS) as [SceneBreakMotif, typeof SCENE_BREAK_MOTIFS[SceneBreakMotif]][]).map(
                      ([key, opt]) => {
                        const isSelected = (settings.sceneBreakMotif || 'motifClassic') === key;
                        return (
                          <div
                            key={key}
                            className={`option-choice-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => patch({ sceneBreakMotif: key })}
                          >
                            <div className="choice-card-header">
                              <span className="choice-sample-tag" style={{ fontSize: '13px' }}>{opt.symbol}</span>
                              {isSelected && <CheckCircle size={14} className="selected-icon" />}
                            </div>
                            <span className="choice-title" style={{ marginTop: '4px' }}>{opt.label}</span>
                            <span className="choice-desc">{opt.desc}</span>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'অনুচ্ছেদের সূচনা স্টাইল (Lead-in Style)' : 'First Paragraph Lead-in Style'}</span>
                  </div>

                  <div className="preset-card-grid">
                    {(Object.entries(LEAD_IN_STYLES) as [LeadInStyle, typeof LEAD_IN_STYLES[LeadInStyle]][]).map(
                      ([key, opt]) => {
                        const isSelected = (settings.leadInStyle || 'drop_cap') === key;
                        return (
                          <div
                            key={key}
                            className={`option-choice-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => patch({ leadInStyle: key, dropCap: key === 'drop_cap' })}
                          >
                            <div className="choice-card-header">
                              <span className="choice-title">{opt.label}</span>
                              {isSelected && <CheckCircle size={14} className="selected-icon" />}
                            </div>
                            <span className="choice-desc">{opt.desc}</span>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'অলঙ্করণ, রানিং হেডার ও রং' : 'Decorations & Colors'}</span>
                  </div>

                  <div className="grid-2-col">
                    <div className="form-checkbox">
                      <input
                        type="checkbox"
                        id="decorMotif"
                        checked={settings.showChapterDecor}
                        onChange={(e) => patch({ showChapterDecor: e.target.checked })}
                      />
                      <label htmlFor="decorMotif">
                        {lang === 'bn' ? 'অধ্যায় মোটিফ ডিভাইডার দেখান' : 'Show Chapter Motif'}
                      </label>
                    </div>

                    <div className="form-checkbox">
                      <input
                        type="checkbox"
                        id="dropCapStyle"
                        checked={settings.dropCap}
                        onChange={(e) => patch({ dropCap: e.target.checked, leadInStyle: e.target.checked ? 'drop_cap' : 'clean' })}
                      />
                      <label htmlFor="dropCapStyle">
                        {lang === 'bn' ? 'ড্রপ ক্যাপ (Drop Cap)' : 'Drop Cap'}
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'রানিং হেডার' : 'Running Header'}</label>
                    <select
                      value={settings.runningHeader}
                      onChange={(e) => patch({ runningHeader: e.target.value as BookSettings['runningHeader'] })}
                    >
                      <option value="split">{lang === 'bn' ? 'বই ও অধ্যায় শিরোনাম (Split)' : 'Split (Title/Chapter)'}</option>
                      <option value="title">{lang === 'bn' ? 'কেবল বইয়ের নাম' : 'Book Title Only'}</option>
                      <option value="author">{lang === 'bn' ? 'লেখকের নাম' : 'Author Only'}</option>
                      <option value="none">{lang === 'bn' ? 'হেডার নেই' : 'None'}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'অধ্যায় শিরোনামের রং' : 'Chapter Title Color'}</label>
                    <div className="color-picker-row">
                      <input
                        type="color"
                        value={settings.chapterHeadingColor}
                        onChange={(e) => patch({ chapterHeadingColor: e.target.value })}
                        className="color-input"
                      />
                      <div className="color-preset-chips">
                        {['#1a56db', '#166534', '#1e3a8a', '#991b1b', '#111827', '#6b21a8'].map((c) => (
                          <button
                            type="button"
                            key={c}
                            className={`color-chip ${settings.chapterHeadingColor === c ? 'active' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => patch({ chapterHeadingColor: c })}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'উপশিরোনামের (H2/H3) রং' : 'Subheading Color'}</label>
                    <div className="color-picker-row">
                      <input
                        type="color"
                        value={settings.subheadingColor}
                        onChange={(e) => patch({ subheadingColor: e.target.value })}
                        className="color-input"
                      />
                      <div className="color-preset-chips">
                        {['#166534', '#1e3a8a', '#991b1b', '#475569', '#0f766e', '#7c2d12'].map((c) => (
                          <button
                            type="button"
                            key={c}
                            className={`color-chip ${settings.subheadingColor === c ? 'active' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => patch({ subheadingColor: c })}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'তথ্য/কলআউট বক্সের থিম' : 'Callout Box Theme'}</label>
                    <select
                      value={settings.calloutTheme}
                      onChange={(e) => patch({ calloutTheme: e.target.value as CalloutTheme })}
                    >
                      {Object.entries(CALLOUT_THEMES).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 3: IMPRINT, PREFACE & AUTHOR DETAILS */}
              {activeTab === 'meta' && (
                <div className="control-section-panel">
                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'হাফ-টাইটেল ও প্রারম্ভিক পাতা' : 'Half-Title & Epigraph'}</span>
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'হাফ-টাইটেল (Half-Title)' : 'Half-Title'}</label>
                    <input
                      type="text"
                      value={settings.halfTitle || ''}
                      onChange={(e) => patch({ halfTitle: e.target.value })}
                      placeholder={project.title || (lang === 'bn' ? 'বইয়ের সংক্ষিপ্ত নাম' : 'Book Short Title')}
                    />
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'উৎসর্গ বাণী (Dedication)' : 'Dedication'}</label>
                    <textarea
                      rows={2}
                      value={settings.dedication}
                      onChange={(e) => patch({ dedication: e.target.value })}
                      placeholder={lang === 'bn' ? 'যাদের আত্মত্যাগে ও অনুপ্রেরণায় এই বই...' : 'Dedicated to...'}
                    />
                  </div>

                  <div className="grid-2-col">
                    <div className="form-group">
                      <label>{lang === 'bn' ? 'এপিগ্রাফ / মূল উদ্ধৃতি (Epigraph)' : 'Epigraph Quote'}</label>
                      <input
                        type="text"
                        value={settings.epigraphText || ''}
                        onChange={(e) => patch({ epigraphText: e.target.value })}
                        placeholder={lang === 'bn' ? 'জ্ঞানই শক্তি, প্রজ্ঞাই আলো...' : 'Knowledge is power...'}
                      />
                    </div>
                    <div className="form-group">
                      <label>{lang === 'bn' ? 'উদ্ধৃতি সূত্র (Source)' : 'Epigraph Source'}</label>
                      <input
                        type="text"
                        value={settings.epigraphSource || ''}
                        onChange={(e) => patch({ epigraphSource: e.target.value })}
                        placeholder={lang === 'bn' ? '— ইমাম গাজ্জালী' : '— Author Name'}
                      />
                    </div>
                  </div>

                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'ইমপ্রিন্ট ও প্রকাশনা স্বত্ব (CIP)' : 'Imprint & Rights'}</span>
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'প্রকাশনীর নাম' : 'Publisher Name'}</label>
                    <input
                      type="text"
                      value={settings.publisher}
                      onChange={(e) => patch({ publisher: e.target.value })}
                      placeholder={lang === 'bn' ? 'যেমন: সমকালীন প্রকাশন' : 'e.g. Samakal Prokashon'}
                    />
                  </div>

                  <div className="grid-2-col">
                    <div className="form-group">
                      <label>{lang === 'bn' ? 'সংস্করণ ও প্রকাশকাল' : 'Edition / Year'}</label>
                      <input
                        type="text"
                        value={settings.edition || settings.year}
                        onChange={(e) => patch({ edition: e.target.value, year: e.target.value })}
                        placeholder="প্রথম প্রকাশ: অমর একুশে বইমেলা ২০২৬"
                      />
                    </div>
                    <div className="form-group">
                      <label>{lang === 'bn' ? 'ISBN নম্বর' : 'ISBN'}</label>
                      <input
                        type="text"
                        value={settings.isbn}
                        onChange={(e) => patch({ isbn: e.target.value, barcodeNumber: e.target.value || settings.barcodeNumber })}
                        placeholder="978-984-91234-5-6"
                      />
                    </div>
                  </div>

                  <div className="grid-2-col">
                    <div className="form-group">
                      <label>{lang === 'bn' ? 'নির্ধারিত মূল্য (টাকা)' : 'Price'}</label>
                      <input
                        type="text"
                        value={settings.price || ''}
                        onChange={(e) => patch({ price: e.target.value, coverPrice: e.target.value || settings.coverPrice })}
                        placeholder="৳ ৩৫০"
                      />
                    </div>
                    <div className="form-group">
                      <label>{lang === 'bn' ? 'প্রচ্ছদ শিল্পী (Cover Designer)' : 'Cover Designer'}</label>
                      <input
                        type="text"
                        value={settings.coverDesigner || ''}
                        onChange={(e) => patch({ coverDesigner: e.target.value })}
                        placeholder="ধ্রুব এষ"
                      />
                    </div>
                  </div>

                  <div className="grid-2-col">
                    <div className="form-group">
                      <label>{lang === 'bn' ? 'অক্ষরবিন্যাস ও মেকআপ' : 'Compositor / Typeset'}</label>
                      <input
                        type="text"
                        value={settings.compositor || ''}
                        onChange={(e) => patch({ compositor: e.target.value })}
                        placeholder="লিপিশিল্প স্টুডিও"
                      />
                    </div>
                    <div className="form-group">
                      <label>{lang === 'bn' ? 'মুদ্রণকারী প্রেস' : 'Printer Press'}</label>
                      <input
                        type="text"
                        value={settings.printer || ''}
                        onChange={(e) => patch({ printer: e.target.value })}
                        placeholder="আল-মদিনা প্রেস, বাংলাবাজার, ঢাকা"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'CIP বিষয় শ্রেণিভুক্তকরণ (জাতীয় গ্রন্থকেন্দ্র)' : 'CIP Subject'}</label>
                    <input
                      type="text"
                      value={settings.cipSubject || ''}
                      onChange={(e) => patch({ cipSubject: e.target.value })}
                      placeholder="বাংলা সাহিত্য — প্রবন্ধ ও গবেষণা"
                    />
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'কপিরাইট ও স্বত্ব বিবরণ' : 'Copyright Note'}</label>
                    <input
                      type="text"
                      value={settings.copyrightNote}
                      onChange={(e) => patch({ copyrightNote: e.target.value })}
                      placeholder="সর্বস্বত্ব সংরক্ষিত © ২০২৬ লেখক ও প্রকাশক"
                    />
                  </div>

                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'ভূমিকা বা নিবেদন (Preface)' : 'Author Preface'}</span>
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'ভূমিকার শিরোনাম (Heading)' : 'Heading'}</label>
                    <input
                      type="text"
                      value={settings.prefaceTitle || (lang === 'bn' ? 'লেখকের কথা' : "Author's Note")}
                      onChange={(e) => patch({ prefaceTitle: e.target.value })}
                      placeholder="লেখকের কথা / ভূমিকা"
                    />
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'ভূমিকার মূলপাঠ' : 'Preface Text'}</label>
                    <textarea
                      rows={5}
                      value={settings.prefaceText || ''}
                      onChange={(e) => patch({ prefaceText: e.target.value })}
                      placeholder={
                        lang === 'bn'
                          ? 'বইটি রচনার পটভূমি, উদ্দেশ্য ও কৃতজ্ঞতা স্বীকার লিখুন...'
                          : 'Write the preface, rationale, and acknowledgments...'
                      }
                    />
                  </div>

                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'লেখক পরিচিতি ও সাহিত্যকর্ম' : 'Author Biography'}</span>
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'লেখকের পুরো নাম' : 'Author Name'}</label>
                    <input
                      type="text"
                      value={settings.author}
                      onChange={(e) => patch({ author: e.target.value })}
                      placeholder="লেখকের পুরো নাম"
                    />
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'সংক্ষিপ্ত আত্মজীবনী ও পেশা' : 'Biography'}</label>
                    <textarea
                      rows={4}
                      value={settings.authorBio || ''}
                      onChange={(e) => patch({ authorBio: e.target.value })}
                      placeholder={
                        lang === 'bn'
                          ? 'লেখকের শিক্ষাজীবন, পেশা, সাহিত্যচর্চা ও অন্যান্য বিবরণ...'
                          : 'Short biography of the author...'
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'লেখকের অন্যান্য প্রকাশিত বই' : 'Other Published Books'}</label>
                    <textarea
                      rows={3}
                      value={settings.otherBooks || ''}
                      onChange={(e) => patch({ otherBooks: e.target.value })}
                      placeholder={
                        lang === 'bn'
                          ? '১. প্রথম বই (২০২৩)\n২. দ্বিতীয় বই (২০২৪)'
                          : '1. Book One (2023)\n2. Book Two (2024)'
                      }
                    />
                  </div>

                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'কৃতজ্ঞতা স্বীকার ও শব্দকোষ (Back Matter)' : 'Acknowledgements & Glossary'}</span>
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'কৃতজ্ঞতা স্বীকার (Acknowledgement)' : 'Acknowledgement'}</label>
                    <textarea
                      rows={3}
                      value={settings.acknowledgement || ''}
                      onChange={(e) => patch({ acknowledgement: e.target.value })}
                      placeholder={lang === 'bn' ? 'যাদের প্রত্যক্ষ ও পরোক্ষ সহযোগিতায়...' : 'Acknowledgements...'}
                    />
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'শব্দকোষ ও টীকা (Glossary / Notes)' : 'Glossary / Notes'}</label>
                    <textarea
                      rows={3}
                      value={settings.glossary || ''}
                      onChange={(e) => patch({ glossary: e.target.value })}
                      placeholder={lang === 'bn' ? 'কঠিন শব্দ ও পারিভাষিক ব্যাখ্যা...' : 'Glossary and term definitions...'}
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: FULL COVER WRAP, SPINE & EAN-13 BARCODE */}
              {activeTab === 'cover' && (
                <div className="control-section-panel">
                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'সামনের প্রচ্ছদ (Front Cover)' : 'Front Cover'}</span>
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'প্রচ্ছদের সাবটাইটেল' : 'Cover Subtitle'}</label>
                    <input
                      type="text"
                      value={settings.coverSubtitle}
                      onChange={(e) => patch({ coverSubtitle: e.target.value })}
                      placeholder={lang === 'bn' ? 'একটি অনুপ্রেরণাদায়ক নির্দেশিকা' : 'A Practical Guide'}
                    />
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'প্রচ্ছদের মূল রঙ (Cover Theme Color)' : 'Cover Color'}</label>
                    <div className="color-picker-row">
                      <input
                        type="color"
                        value={settings.coverColor}
                        onChange={(e) => patch({ coverColor: e.target.value })}
                        className="color-input"
                      />
                      <div className="color-preset-chips">
                        {['#1e3d32', '#1e293b', '#311042', '#451a03', '#172554', '#831843'].map((c) => (
                          <button
                            type="button"
                            key={c}
                            className={`color-chip ${settings.coverColor === c ? 'active' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => patch({ coverColor: c })}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid-2-col">
                    <div className="form-group">
                      <label>{lang === 'bn' ? 'প্রচ্ছদের ফিনিশিং (Lamination)' : 'Lamination Finish'}</label>
                      <select
                        value={settings.coverFinish || 'matte'}
                        onChange={(e) => patch({ coverFinish: e.target.value as 'matte' | 'glossy' })}
                      >
                        <option value="matte">ম্যাট লেমিনেশন (Matte — অভিজাত)</option>
                        <option value="glossy">গ্লসি লেমিনেশন (Glossy — উজ্জ্বল)</option>
                      </select>
                    </div>

                    <div className="form-checkbox" style={{ marginTop: '24px' }}>
                      <input
                        type="checkbox"
                        id="decorLine"
                        checked={settings.showChapterDecor}
                        onChange={(e) => patch({ showChapterDecor: e.target.checked })}
                      />
                      <label htmlFor="decorLine">
                        {lang === 'bn' ? 'অলঙ্করণ ও মোটিফ দেখান' : 'Show Motif'}
                      </label>
                    </div>
                  </div>

                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'বইয়ের স্পাইন (Spine Width)' : 'Spine Settings'}</span>
                  </div>

                  <div className="spine-calculator-card" style={{ marginBottom: '10px' }}>
                    <div className="spine-calc-item">
                      <span className="calc-label">{lang === 'bn' ? 'মোট পাতা' : 'Total Pages'}</span>
                      <span className="calc-value">{estimatedPages}</span>
                    </div>
                    <div className="spine-calc-item highlight">
                      <span className="calc-label">{lang === 'bn' ? 'হিসাবকৃত স্পাইন' : 'Calculated Spine'}</span>
                      <span className="calc-value">{calculatedSpine} mm</span>
                    </div>
                    <div className="spine-calc-item">
                      <span className="calc-label">{lang === 'bn' ? 'কাগজ' : 'Paper'}</span>
                      <span className="calc-value">{settings.paperGsm || 80} GSM</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'স্পাইনের টেক্সট (ঐচ্ছিক)' : 'Spine Custom Text'}</label>
                    <input
                      type="text"
                      value={settings.spineText || ''}
                      onChange={(e) => patch({ spineText: e.target.value })}
                      placeholder={project.title || (lang === 'bn' ? 'বইয়ের নাম ও লেখকের নাম' : 'Book Title & Author')}
                    />
                  </div>

                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'পেছনের প্রচ্ছদ ও ব্লার্ব (Back Cover)' : 'Back Cover & Blurb'}</span>
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'পেছনের প্রচ্ছদের মূল ব্লার্ব / সারাংশ' : 'Back Cover Blurb'}</label>
                    <textarea
                      rows={4}
                      value={settings.backCoverBlurb || ''}
                      onChange={(e) => patch({ backCoverBlurb: e.target.value })}
                      placeholder={
                        lang === 'bn'
                          ? 'বইটির আকর্ষণীয় সংক্ষিপ্ত ফ্ল্যাপ বক্তব্য যা পাঠককে আকৃষ্ট করবে...'
                          : 'Catchy book blurb and summary for the back cover...'
                      }
                    />
                  </div>

                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'EAN-13 ভেক্টর বারকোড জেনারেটর' : 'Vector EAN-13 Barcode'}</span>
                  </div>

                  <div className="form-checkbox">
                    <input
                      type="checkbox"
                      id="showBarcodeCheck"
                      checked={settings.showBarcode}
                      onChange={(e) => patch({ showBarcode: e.target.checked })}
                    />
                    <label htmlFor="showBarcodeCheck">
                      {lang === 'bn' ? 'পেছনের প্রচ্ছদে অটোমেটিক EAN-13 বারকোড বসান' : 'Show EAN-13 Barcode on Back Cover'}
                    </label>
                  </div>

                  {settings.showBarcode && (
                    <>
                      <div className="grid-2-col">
                        <div className="form-group">
                          <label>{lang === 'bn' ? 'ISBN / বারকোড ডিজিট (১৩ সংখ্যা)' : 'ISBN/Barcode Digits'}</label>
                          <input
                            type="text"
                            value={settings.barcodeNumber || settings.isbn || '9789849123456'}
                            onChange={(e) => patch({ barcodeNumber: e.target.value })}
                            placeholder="9789849123456"
                          />
                        </div>
                        <div className="form-group">
                          <label>{lang === 'bn' ? 'বারকোড মূল্য ট্যাগ' : 'Barcode Price'}</label>
                          <input
                            type="text"
                            value={settings.coverPrice || settings.price || '৳ ৩৫০'}
                            onChange={(e) => patch({ coverPrice: e.target.value })}
                            placeholder="৳ ৩৫০"
                          />
                        </div>
                      </div>

                      {/* Live SVG Barcode Preview in sidebar */}
                      <div style={{ marginTop: '8px', textAlign: 'center' }}>
                        <img
                          alt="EAN-13"
                          src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(
                            generateEan13Svg(
                              settings.barcodeNumber || settings.isbn || '9789849123456',
                              settings.coverPrice || settings.price || '৳ ৩৫০',
                            ),
                          )}`}
                        />
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                          ✓ প্রেসে সরাসরি স্ক্যানযোগ্য হাই-রেজোলিউশন ভেক্টর EAN-13 বারকোড
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Live Preview Stage */}
          <div className="modal-right-preview">
            <BookPreview
              project={project}
              settings={settings}
              lang={lang}
              isExpanded={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
