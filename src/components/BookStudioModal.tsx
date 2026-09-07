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
} from 'lucide-react';
import type { Project } from '../api';
import { fetchExportStatus } from '../api';
import {
  type BookSettings,
  CALLOUT_THEMES,
  PAGE_PRESETS,
  type PagePreset,
  type CalloutTheme,
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
  const [activeTab, setActiveTab] = useState<'layout' | 'typography' | 'imprint' | 'cover'>('layout');
  const [busy, setBusy] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  function patch(partial: Partial<BookSettings>) {
    const updated = { ...settings, ...partial };
    onSaveSettings(updated);
  }

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
                className={`control-tab-btn ${activeTab === 'layout' ? 'active' : ''}`}
                onClick={() => setActiveTab('layout')}
              >
                <Sliders size={15} />
                <span>{lang === 'bn' ? 'সাইজ ও মার্জিন' : 'Size & Margins'}</span>
              </button>

              <button
                type="button"
                className={`control-tab-btn ${activeTab === 'typography' ? 'active' : ''}`}
                onClick={() => setActiveTab('typography')}
              >
                <Palette size={15} />
                <span>{lang === 'bn' ? 'টাইপোগ্রাফি ও রঙ' : 'Typography'}</span>
              </button>

              <button
                type="button"
                className={`control-tab-btn ${activeTab === 'imprint' ? 'active' : ''}`}
                onClick={() => setActiveTab('imprint')}
              >
                <Bookmark size={15} />
                <span>{lang === 'bn' ? 'প্রকাশনা তথ্য' : 'Imprint'}</span>
              </button>

              <button
                type="button"
                className={`control-tab-btn ${activeTab === 'cover' ? 'active' : ''}`}
                onClick={() => setActiveTab('cover')}
              >
                <FileText size={15} />
                <span>{lang === 'bn' ? 'প্রচ্ছদ সেটিংস' : 'Cover'}</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="control-scroll-container">
              {/* 1. LAYOUT & MARGINS */}
              {activeTab === 'layout' && (
                <div className="control-section-panel">
                  <div className="form-group">
                    <label>{lang === 'bn' ? 'বইয়ের সাইজ (Trim Size)' : 'Book Trim Size'}</label>
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

                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'মার্জিন ও বাইন্ডিং ফাঁকা (Margins)' : 'Margins & Spacing'}</span>
                  </div>

                  <div className="grid-2-col">
                    <div className="form-group">
                      <label>{lang === 'bn' ? 'বাইন্ডিং মার্জিন (Inner Gutter)' : 'Inner / Gutter'}</label>
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
                      <label>{lang === 'bn' ? 'প্যারাগ্রাফের শুরুর ইনডেন্ট' : 'Paragraph Indent'}</label>
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
                      <label>{lang === 'bn' ? 'প্রিন্ট ব্লিড (Bleed mm)' : 'Print Bleed'}</label>
                      <select
                        value={settings.bleedMm}
                        onChange={(e) => patch({ bleedMm: Number(e.target.value) })}
                      >
                        {[0, 3, 5].map((n) => (
                          <option key={n} value={n}>
                            {n === 0 ? (lang === 'bn' ? 'ব্লিড নেই (০)' : '0 mm') : `${n} mm`}
                          </option>
                        ))}
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

              {/* 2. TYPOGRAPHY & COLORS */}
              {activeTab === 'typography' && (
                <div className="control-section-panel">
                  <div className="form-group">
                    <label>{lang === 'bn' ? 'বাংলা বইয়ের ফন্ট' : 'Bengali Font'}</label>
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
                      <label>{lang === 'bn' ? 'ফন্ট সাইজ (Font Size)' : 'Body Font Size'}</label>
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
                    </div>

                    <div className="form-group">
                      <label>{lang === 'bn' ? 'লাইনের দূরত্ব (Line Height)' : 'Line Height'}</label>
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
                    </div>
                  </div>

                  <div className="grid-2-col">
                    <div className="form-group">
                      <label>{lang === 'bn' ? 'পৃষ্ঠা নম্বর স্টাইল' : 'Page Numbering'}</label>
                      <select
                        value={settings.numberFormat}
                        onChange={(e) => patch({ numberFormat: e.target.value as 'bn' | 'en' })}
                      >
                        <option value="bn">বাংলা সংখ্যা (১, ২, ৩...)</option>
                        <option value="en">English Digits (1, 2, 3...)</option>
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

                  <div className="section-divider-title">
                    <span>{lang === 'bn' ? 'বইয়ের উপাদান ও রঙের বিন্যাস' : 'Book Elements Styling'}</span>
                  </div>

                  {/* Chapter Heading Color Picker */}
                  <div className="form-group">
                    <label>{lang === 'bn' ? 'অধ্যায় শিরোনামের রং (Chapter Heading Color)' : 'Chapter Heading Color'}</label>
                    <div className="color-picker-row">
                      <input
                        type="color"
                        value={settings.chapterHeadingColor}
                        onChange={(e) => patch({ chapterHeadingColor: e.target.value })}
                        className="color-input"
                      />
                      <div className="color-preset-chips">
                        {[
                          { color: '#1a56db', label: 'নীল' },
                          { color: '#166534', label: 'সবুজ' },
                          { color: '#1e3a8a', label: 'নেভি' },
                          { color: '#991b1b', label: 'মেরুন' },
                          { color: '#111827', label: 'কালো' },
                        ].map((c) => (
                          <button
                            type="button"
                            key={c.color}
                            className={`color-chip ${settings.chapterHeadingColor === c.color ? 'active' : ''}`}
                            style={{ backgroundColor: c.color }}
                            onClick={() => patch({ chapterHeadingColor: c.color })}
                            title={c.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Subheading Color */}
                  <div className="form-group">
                    <label>{lang === 'bn' ? 'উপ-শিরোনামের রং (করণীয় / সেকশন)' : 'Subheading Color'}</label>
                    <div className="color-picker-row">
                      <input
                        type="color"
                        value={settings.subheadingColor}
                        onChange={(e) => patch({ subheadingColor: e.target.value })}
                        className="color-input"
                      />
                      <div className="color-preset-chips">
                        {[
                          { color: '#166534', label: 'গাঢ় সবুজ' },
                          { color: '#0f766e', label: 'টিল' },
                          { color: '#1e40af', label: 'ব্লু' },
                          { color: '#78350f', label: 'চকলেট' },
                        ].map((c) => (
                          <button
                            type="button"
                            key={c.color}
                            className={`color-chip ${settings.subheadingColor === c.color ? 'active' : ''}`}
                            style={{ backgroundColor: c.color }}
                            onClick={() => patch({ subheadingColor: c.color })}
                            title={c.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Callout / Feature Box Theme */}
                  <div className="form-group">
                    <label>{lang === 'bn' ? 'কলআউট / তথ্য বক্সের রূপ (যেমন: ইসলামের আলোকে)' : 'Callout Box Theme'}</label>
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

                  {/* Quote Border Color */}
                  <div className="form-group">
                    <label>{lang === 'bn' ? 'উদ্ধৃতি ব্লকের বাম বর্ডার কালার' : 'Quote Left Border Color'}</label>
                    <input
                      type="color"
                      value={settings.quoteBorderColor}
                      onChange={(e) => patch({ quoteBorderColor: e.target.value })}
                      className="color-input"
                    />
                  </div>
                </div>
              )}

              {/* 3. IMPRINT & METADATA */}
              {activeTab === 'imprint' && (
                <div className="control-section-panel">
                  <div className="form-group">
                    <label>{lang === 'bn' ? 'লেখকের নাম' : 'Author Name'}</label>
                    <input
                      type="text"
                      value={settings.author}
                      onChange={(e) => patch({ author: e.target.value })}
                      placeholder={lang === 'bn' ? 'যেমন: আব্দুল্লাহ মাহমুদ' : 'e.g. Abdullah Mahmud'}
                    />
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'প্রকাশনীর নাম' : 'Publisher'}</label>
                    <input
                      type="text"
                      value={settings.publisher}
                      onChange={(e) => patch({ publisher: e.target.value })}
                      placeholder={lang === 'bn' ? 'যেমন: সমকালীন প্রকাশন' : 'e.g. Samakal Prokashon'}
                    />
                  </div>

                  <div className="grid-2-col">
                    <div className="form-group">
                      <label>{lang === 'bn' ? 'প্রকাশকাল / বছর' : 'Year / Edition'}</label>
                      <input
                        type="text"
                        value={settings.year}
                        onChange={(e) => patch({ year: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>{lang === 'bn' ? 'ISBN নম্বর' : 'ISBN'}</label>
                      <input
                        type="text"
                        value={settings.isbn}
                        onChange={(e) => patch({ isbn: e.target.value })}
                        placeholder="978-..."
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'উৎসর্গ বাণী (Dedication)' : 'Dedication'}</label>
                    <textarea
                      rows={2}
                      value={settings.dedication}
                      onChange={(e) => patch({ dedication: e.target.value })}
                      placeholder={lang === 'bn' ? 'যাদের দোয়ায় এই বইয়ের জন্ম...' : 'Dedicated to...'}
                    />
                  </div>

                  <div className="form-group">
                    <label>{lang === 'bn' ? 'কপিরাইট ও স্বত্ব বিবরণ' : 'Copyright Line'}</label>
                    <input
                      type="text"
                      value={settings.copyrightNote}
                      onChange={(e) => patch({ copyrightNote: e.target.value })}
                      placeholder={lang === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত © ২০২৬' : 'All rights reserved'}
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
                      {lang === 'bn' ? 'বইয়ের শুরুতে স্বয়ংক্রিয় সূচিপত্র যোগ করুন (Table of Contents)' : 'Include Automated Table of Contents'}
                    </label>
                  </div>
                </div>
              )}

              {/* 4. COVER SETTINGS */}
              {activeTab === 'cover' && (
                <div className="control-section-panel">
                  <div className="form-group">
                    <label>{lang === 'bn' ? 'প্রচ্ছদের সাবটাইটেল' : 'Cover Subtitle'}</label>
                    <input
                      type="text"
                      value={settings.coverSubtitle}
                      onChange={(e) => patch({ coverSubtitle: e.target.value })}
                      placeholder={lang === 'bn' ? 'একটি অনুপ্রেরণাদায়ক কর্মজীবন নির্দেশিকা' : 'A Practical Guide'}
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
                        {[
                          { color: '#1e3d32', label: 'ডিপ গ্রিন' },
                          { color: '#1e293b', label: 'স্লেট' },
                          { color: '#311042', label: 'রয়েল পার্পল' },
                          { color: '#451a03', label: 'উড চকলেট' },
                          { color: '#172554', label: 'মিডনাইট ব্লু' },
                        ].map((c) => (
                          <button
                            type="button"
                            key={c.color}
                            className={`color-chip ${settings.coverColor === c.color ? 'active' : ''}`}
                            style={{ backgroundColor: c.color }}
                            onClick={() => patch({ coverColor: c.color })}
                            title={c.label}
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
                      {lang === 'bn' ? 'প্রচ্ছদে অলঙ্করণ বা ডিভাইডার সিম্বল দেখান' : 'Show Cover Motif / Ornament'}
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
