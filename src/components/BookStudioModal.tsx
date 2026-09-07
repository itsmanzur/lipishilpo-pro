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
  Sparkles,
  User,
} from 'lucide-react';
import type { Project } from '../api';
import { fetchExportStatus } from '../api';
import {
  type BookSettings,
  type BookThemePreset,
  BOOK_THEMES,
  CALLOUT_THEMES,
  PAGE_PRESETS,
  type PagePreset,
  type CalloutTheme,
  calculateSpineMm,
  estimatePageCount,
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
  const [activeTab, setActiveTab] = useState<'themes' | 'layout' | 'imprint' | 'preface' | 'author' | 'cover'>('themes');
  const [busy, setBusy] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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
        <div className="modal-top-bar">
          <div className="modal-title-area">
            <span className="modal-badge-pro">PRO STUDIO</span>
            <h2>{lang === 'bn' ? 'বুক গেট-আপ ও পাবলিকেশন স্টুডিও' : 'Book Get-up & Publication Studio'}</h2>
            <span className="project-tag">{project.title || (lang === 'bn' ? 'নতুন বই' : 'Untitled Book')}</span>
          </div>

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
            {/* Section Tabs */}
            <div className="control-tabs-nav">
              <button
                type="button"
                className={`control-tab-btn ${activeTab === 'themes' ? 'active' : ''}`}
                onClick={() => setActiveTab('themes')}
              >
                <Sparkles size={15} />
                <span>{lang === 'bn' ? '১-ক্লিক থিম' : 'Themes'}</span>
              </button>

              <button
                type="button"
                className={`control-tab-btn ${activeTab === 'layout' ? 'active' : ''}`}
                onClick={() => setActiveTab('layout')}
              >
                <Sliders size={15} />
                <span>{lang === 'bn' ? 'সাইজ ও স্পাইন' : 'Size & Spine'}</span>
              </button>

              <button
                type="button"
                className={`control-tab-btn ${activeTab === 'imprint' ? 'active' : ''}`}
                onClick={() => setActiveTab('imprint')}
              >
                <Bookmark size={15} />
                <span>{lang === 'bn' ? 'ইমপ্রিন্ট ও স্বত্ব' : 'Imprint & Rights'}</span>
              </button>

              <button
                type="button"
                className={`control-tab-btn ${activeTab === 'preface' ? 'active' : ''}`}
                onClick={() => setActiveTab('preface')}
              >
                <FileText size={15} />
                <span>{lang === 'bn' ? 'ভূমিকা / নিবেদন' : 'Preface'}</span>
              </button>

              <button
                type="button"
                className={`control-tab-btn ${activeTab === 'author' ? 'active' : ''}`}
                onClick={() => setActiveTab('author')}
              >
                <User size={15} />
                <span>{lang === 'bn' ? 'লেখক পরিচিতি' : 'Author Bio'}</span>
              </button>

              <button
                type="button"
                className={`control-tab-btn ${activeTab === 'cover' ? 'active' : ''}`}
                onClick={() => setActiveTab('cover')}
              >
                <Palette size={15} />
                <span>{lang === 'bn' ? 'প্রচ্ছদ সেটিংস' : 'Cover'}</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="control-scroll-container">
              {/* 1. 1-CLICK THEMES & STYLES */}
              {activeTab === 'themes' && (
                <div className="control-section-panel">
                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'জনপ্রিয় জনরা থিম প্রিসেট' : '1-Click Genre Presets'}</span>
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

                  <div className="form-checkbox">
                    <input
                      type="checkbox"
                      id="dropCapCheck"
                      checked={settings.dropCap}
                      onChange={(e) => patch({ dropCap: e.target.checked })}
                    />
                    <label htmlFor="dropCapCheck">
                      {lang === 'bn'
                        ? 'অধ্যায়ের প্রথম অক্ষরে ড্রপ ক্যাপ (Drop Cap) দিন'
                        : 'Enable Chapter First-Letter Drop Cap'}
                    </label>
                  </div>

                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'উপাদান ও রঙের ফাইন-টিউনিং' : 'Colors & Elements'}</span>
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

              {/* 2. LAYOUT, TRIM SIZE & SPINE */}
              {activeTab === 'layout' && (
                <div className="control-section-panel">
                  {/* Spine & Pages Live Calculator Card */}
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
                      <label>{lang === 'bn' ? 'নতুন অধ্যায় শুরুর পাতা' : 'Chapter Start'}</label>
                      <select
                        value={settings.chapterStartSide || 'recto'}
                        onChange={(e) => patch({ chapterStartSide: e.target.value as 'recto' | 'any' })}
                      >
                        <option value="recto">ডান পাতা (Recto - প্রিমিয়াম পাবলিকেশন)</option>
                        <option value="any">যেকোনো পাতা (পৃষ্ঠা বাঁচাতে)</option>
                      </select>
                    </div>
                  </div>

                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'মার্জিন ও বাইন্ডিং ফাঁকা (Margins mm)' : 'Margins & Spacing'}</span>
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
                      <label>{lang === 'bn' ? 'বাইরের মার্জিন (Outer Margin)' : 'Outer Margin'}</label>
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
                      <label>{lang === 'bn' ? 'প্যারাগ্রাফ শুরুর ইনডেন্ট' : 'Paragraph Indent'}</label>
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

              {/* 3. IMPRINT, RIGHTS & CIP */}
              {activeTab === 'imprint' && (
                <div className="control-section-panel">
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
                      <label>{lang === 'bn' ? 'প্রকাশকাল / সংস্করণ' : 'Edition / Year'}</label>
                      <input
                        type="text"
                        value={settings.year}
                        onChange={(e) => patch({ year: e.target.value })}
                        placeholder="ফেব্রুয়ারি ২০২৬"
                      />
                    </div>
                    <div className="form-group">
                      <label>{lang === 'bn' ? 'ISBN নম্বর' : 'ISBN'}</label>
                      <input
                        type="text"
                        value={settings.isbn}
                        onChange={(e) => patch({ isbn: e.target.value })}
                        placeholder="978-984-..."
                      />
                    </div>
                  </div>

                  <div className="grid-2-col">
                    <div className="form-group">
                      <label>{lang === 'bn' ? 'নির্ধারিত মূল্য (টাকা)' : 'Price'}</label>
                      <input
                        type="text"
                        value={settings.price || ''}
                        onChange={(e) => patch({ price: e.target.value })}
                        placeholder="৩৫০ টাকা"
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
                        placeholder="আল-মদিনা প্রেস, ঢাকা"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'উৎসর্গ বাণী (Dedication)' : 'Dedication'}</label>
                    <textarea
                      rows={2}
                      value={settings.dedication}
                      onChange={(e) => patch({ dedication: e.target.value })}
                      placeholder={lang === 'bn' ? 'যাদের দোয়ায় এই বইটির জন্ম...' : 'Dedicated to...'}
                    />
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'কপিরাইট ও স্বত্ব বিবরণ' : 'Copyright Note'}</label>
                    <input
                      type="text"
                      value={settings.copyrightNote}
                      onChange={(e) => patch({ copyrightNote: e.target.value })}
                      placeholder="সর্বস্বত্ব সংরক্ষিত © ২০২৬"
                    />
                  </div>

                  <div className="form-checkbox">
                    <input
                      type="checkbox"
                      id="incToc"
                      checked={settings.includeToc}
                      onChange={(e) => patch({ includeToc: e.target.checked })}
                    />
                    <label htmlFor="incToc">
                      {lang === 'bn' ? 'বইয়ের শুরুতে স্বয়ংক্রিয় সূচিপত্র যোগ করুন (TOC)' : 'Include Automated Table of Contents'}
                    </label>
                  </div>
                </div>
              )}

              {/* 4. PREFACE & FOREWORD */}
              {activeTab === 'preface' && (
                <div className="control-section-panel">
                  <div className="form-group">
                    <label>{lang === 'bn' ? 'ভূমিকার শিরোনাম (Preface Heading)' : 'Preface Heading'}</label>
                    <input
                      type="text"
                      value={settings.prefaceTitle || (lang === 'bn' ? 'লেখকের কথা' : "Author's Note")}
                      onChange={(e) => patch({ prefaceTitle: e.target.value })}
                      placeholder="লেখকের কথা / ভূমিকা"
                    />
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'ভূমিকা বা নিবেদনের বিবরণ' : 'Preface Text'}</label>
                    <textarea
                      rows={12}
                      value={settings.prefaceText || ''}
                      onChange={(e) => patch({ prefaceText: e.target.value })}
                      placeholder={
                        lang === 'bn'
                          ? 'বইটি রচনার পটভূমি, উদ্দেশ্য ও কৃতজ্ঞতা স্বীকার লিখুন...'
                          : 'Write the preface, rationale, and acknowledgments...'
                      }
                    />
                  </div>
                </div>
              )}

              {/* 5. AUTHOR BIO & OTHER BOOKS */}
              {activeTab === 'author' && (
                <div className="control-section-panel">
                  <div className="form-group">
                    <label>{lang === 'bn' ? 'লেখকের নাম' : 'Author Name'}</label>
                    <input
                      type="text"
                      value={settings.author}
                      onChange={(e) => patch({ author: e.target.value })}
                      placeholder="লেখকের পুরো নাম"
                    />
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'লেখক পরিচিতি ও কর্মজীবন (Author Biography)' : 'Author Biography'}</label>
                    <textarea
                      rows={8}
                      value={settings.authorBio || ''}
                      onChange={(e) => patch({ authorBio: e.target.value })}
                      placeholder={
                        lang === 'bn'
                          ? 'লেখকের শিক্ষাজীবন, পেশা, সাহিত্যচর্চা ও অন্যান্য পরিচিতি...'
                          : 'Short biography of the author, education, and career...'
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'লেখকের অন্যান্য প্রকাশিত বই (Other Works)' : 'Other Published Books'}</label>
                    <textarea
                      rows={5}
                      value={settings.otherBooks || ''}
                      onChange={(e) => patch({ otherBooks: e.target.value })}
                      placeholder={
                        lang === 'bn'
                          ? '১. প্রথম বই (২০২৩)\n২. দ্বিতীয় বই (২০২৪)'
                          : '1. Book One (2023)\n2. Book Two (2024)'
                      }
                    />
                  </div>
                </div>
              )}

              {/* 6. COVER & 3D MOCKUP */}
              {activeTab === 'cover' && (
                <div className="control-section-panel">
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

                  <div className="form-checkbox">
                    <input
                      type="checkbox"
                      id="decorLine"
                      checked={settings.showChapterDecor}
                      onChange={(e) => patch({ showChapterDecor: e.target.checked })}
                    />
                    <label htmlFor="decorLine">
                      {lang === 'bn' ? 'প্রচ্ছদে অলঙ্করণ ও ডিভাইডার সিম্বল দেখান' : 'Show Cover Motif / Ornament'}
                    </label>
                  </div>
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
