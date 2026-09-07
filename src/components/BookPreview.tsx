import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  BookOpen,
  FileText,
  Layers,
  Palette,
} from 'lucide-react';
import type { Project, Chapter } from '../api';
import {
  type BookSettings,
  CALLOUT_THEMES,
  sheetExtraMm,
  trimSizeMm,
} from '../lib/book-layout';
import { parseChapterContent, toBengaliNumerals, type BookBlock } from '../lib/book-parser';

export type PreviewMode = 'spread' | 'single' | 'continuous' | 'cover';

export function BookPreview({
  project,
  settings,
  lang = 'bn',
  onExpand,
  isExpanded = false,
}: {
  project: Project;
  settings: BookSettings;
  lang?: 'bn' | 'en';
  onExpand?: () => void;
  isExpanded?: boolean;
}) {
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('spread');
  const [zoomLevel, setZoomLevel] = useState<number>(isExpanded ? 1.0 : 0.65);

  const trim = trimSizeMm(settings);
  const extra = sheetExtraMm(settings);
  const baseScale = isExpanded ? 3.7 : 1.6;
  const currentScale = baseScale * zoomLevel;

  const pageW = (trim.w + extra * 2) * currentScale;
  const pageH = (trim.h + extra * 2) * currentScale;

  const padIn = settings.marginInnerMm * currentScale;
  const padOut = settings.marginOuterMm * currentScale;
  const padTop = settings.marginTopMm * currentScale;
  const padBot = settings.marginBottomMm * currentScale;

  const chapters: Chapter[] = project.chapters?.length
    ? project.chapters
    : [
        {
          id: 'demo',
          title: lang === 'bn' ? 'অধ্যায় ১: সাক্ষাৎকার ও প্রথম চাকরির প্রস্তুতি' : 'Chapter 1: The First Interview',
          text: `সাক্ষাৎকারের ঘরে ঢোকার আগের নিঃশ্বাসটাই সবচেয়ে ভারী।\n\nআব্দুল্লাহ প্রথমবারের মতো চাকরির সাক্ষাৎকারে বসতে যাচ্ছে। রাতভর সে ভেবেছে, কী প্রশ্ন করা হতে পারে, কী উত্তর দেবে, জামাটা ঠিক আছে কিনা। সকালে অফিসের গেটের সামনে দাঁড়িয়ে তার হাত কাঁপছিল। ভেতরে ঢোকার পর দেখল, আরও কয়েকজন প্রার্থী অপেক্ষা করছে — কেউ শান্ত, কেউ তারই মতো নার্ভাস।\n\nসাক্ষাৎকার শুরু হতেই আব্দুল্লাহ বুঝল, প্রশ্নগুলো তার প্রস্তুতির বাইরে ছিল না, কিন্তু নিজের অভিজ্ঞতা নিয়ে গুছিয়ে বলতে গিয়ে সে বারবার আটকে যাচ্ছিল। ইন্টারভিউ শেষে বের হয়ে তার মনে হলো, জ্ঞান বা যোগ্যতার অভাব ছিল না, ঘাটতি ছিল প্রস্তুতির ধরনে — সে বিষয় পড়েছিল, কিন্তু নিজের কথা গুছিয়ে বলার অনুশীলন করেনি।\n\nপরের সাক্ষাৎকারের আগে আব্দুল্লাহ ভিন্নভাবে প্রস্তুতি নিল। কোম্পানি সম্পর্কে আগে থেকে পড়ল, নিজের প্রতিটি অভিজ্ঞতাকে ছোট একটি গল্পের মতো সাজিয়ে রাখল — কী সমস্যা ছিল, সে কী করেছিল, ফলাফল কী হয়েছিল। আয়নার সামনে জোরে বলে অনুশীলন করল, যাতে ঘরে ঢুকে জিহ্বা না জড়ায়।\n\nএবার ফলাফল ভিন্ন হলো। প্রশ্নের উত্তরে আব্দুল্লাহ ঠিক ঘাবড়াল না এমন নয়, কিন্তু প্রস্তুতি তাকে আত্মবিশ্বাস দিল। ইন্টারভিউ শেষে বের হয়ে সে বুঝল, সাক্ষাৎকার আসলে পরীক্ষা নয়, একটি কথোপকথন — যেখানে উভয়পক্ষ বোঝার চেষ্টা করে, একসাথে কাজ করাটা মানানসই হবে কিনা।\n\nতথ্যসূত্র: Schmidt, F. L., & Hunter, J. E. (1998)। কর্মী নির্বাচন পদ্ধতির নির্ভরযোগ্যতা নিয়ে এই ব্যাপক মেটা-বিশ্লেষণে দেখা গেছে, কাঠামোগত সাক্ষাৎকার (নির্দিষ্ট প্রশ্ন ও মানদণ্ড অনুসরণ করে নেওয়া ইন্টারভিউ) অগোছালো সাক্ষাৎকারের চেয়ে ভবিষ্যৎ কর্মদক্ষতা অনুমানে অনেক বেশি নির্ভরযোগ্য।\n\n:::box[ইসলামের আলোকে]\nরিজিক অর্জনের জন্য চেষ্টা করা আর ফলাফল আল্লাহর ওপর ছেড়ে দেওয়া — এই দুইয়ের ভারসাম্যই তাওয়াক্কুলের প্রকৃত অর্থ। একজন সাহাবি রাসুলুল্লাহ (সা.)-কে জিজ্ঞেস করেছিলেন, তিনি কি তার উট বেঁধে রাখবেন, নাকি আল্লাহর ওপর ভরসা করে ছেড়ে দেবেন। রাসুলুল্লাহ (সা.) বলেছিলেন, 'আগে বেঁধে রাখো, তারপর ভরসা করো' (তিরমিজি)। সাক্ষাৎকারের প্রস্তুতিও তেমনই — যথাসাধ্য প্রস্তুতি নেওয়াটা তাওয়াক্কুলের বিপরীত নয়, বরং তারই অংশ।\n:::\n\n## করণীয় (ডু'স)\n* প্রতিষ্ঠান ও পদ সম্পর্কে আগে থেকে পড়াশোনা করুন\n* সাধারণ প্রশ্নগুলোর উত্তর পয়েন্ট আকারে সাজিয়ে রাখুন\n* স্পষ্ট ও আত্মবিশ্বাসী কণ্ঠে কথা বলার অভ্যাস করুন\n* নিজের ব্যর্থতাকেও ইতিবাচক শিক্ষার আলোকে উপস্থাপন করুন`,
        },
      ];

  const currentChapter = chapters[currentChapterIdx] || chapters[0];
  const blocks = parseChapterContent(currentChapter.text || '');

  const formatPageNum = (n: number) =>
    settings.numberFormat === 'bn' ? toBengaliNumerals(n) : String(n);

  const calloutStyle = CALLOUT_THEMES[settings.calloutTheme] || CALLOUT_THEMES.emerald;

  // Render a block inside page
  const renderBlock = (block: BookBlock, bIdx: number) => {
    switch (block.type) {
      case 'heading':
        return (
          <div
            key={bIdx}
            className="book-block-heading"
            style={{
              color: settings.subheadingColor,
              fontSize: `${Math.max(12, settings.fontSize * currentScale * (block.level === 1 ? 1.4 : block.level === 2 ? 1.2 : 1.1))}px`,
              fontWeight: 700,
              marginTop: `${12 * currentScale}px`,
              marginBottom: `${6 * currentScale}px`,
            }}
          >
            {block.text}
          </div>
        );
      case 'quote':
        return (
          <div
            key={bIdx}
            className="book-block-quote"
            style={{
              borderLeft: `${3 * currentScale}px solid ${settings.quoteBorderColor}`,
              paddingLeft: `${10 * currentScale}px`,
              marginTop: `${10 * currentScale}px`,
              marginBottom: `${12 * currentScale}px`,
              fontStyle: 'italic',
              color: '#334155',
              fontSize: `${Math.max(10, settings.fontSize * currentScale * 0.95)}px`,
              lineHeight: settings.lineHeight,
            }}
          >
            <p style={{ margin: 0 }}>{block.text}</p>
            {block.source && (
              <small
                style={{
                  display: 'block',
                  textAlign: 'right',
                  color: '#64748b',
                  marginTop: `${4 * currentScale}px`,
                }}
              >
                — {block.source}
              </small>
            )}
          </div>
        );
      case 'callout':
        return (
          <div
            key={bIdx}
            className="book-block-callout"
            style={{
              backgroundColor: calloutStyle.bg,
              border: `1px solid ${calloutStyle.border}`,
              borderRadius: `${4 * currentScale}px`,
              padding: `${10 * currentScale}px ${12 * currentScale}px`,
              marginTop: `${12 * currentScale}px`,
              marginBottom: `${14 * currentScale}px`,
            }}
          >
            <div
              style={{
                color: calloutStyle.title,
                fontWeight: 700,
                fontSize: `${Math.max(11, settings.fontSize * currentScale * 1.05)}px`,
                marginBottom: `${6 * currentScale}px`,
                borderBottom: `1px solid ${calloutStyle.border}`,
                paddingBottom: `${4 * currentScale}px`,
              }}
            >
              {block.title}
            </div>
            <div
              style={{
                color: '#1e293b',
                fontSize: `${Math.max(9.5, settings.fontSize * currentScale * 0.92)}px`,
                lineHeight: settings.lineHeight,
                textAlign: settings.textAlign,
                whiteSpace: 'pre-line',
              }}
            >
              {block.text}
            </div>
          </div>
        );
      case 'citation':
        return (
          <div
            key={bIdx}
            className="book-block-citation"
            style={{
              color: '#64748b',
              fontSize: `${Math.max(8.5, settings.fontSize * currentScale * 0.82)}px`,
              lineHeight: 1.4,
              fontStyle: 'italic',
              marginTop: `${12 * currentScale}px`,
              marginBottom: `${10 * currentScale}px`,
              paddingTop: `${6 * currentScale}px`,
              borderTop: '1px dashed #cbd5e1',
            }}
          >
            {block.text}
          </div>
        );
      case 'list':
        return (
          <ul
            key={bIdx}
            style={{
              paddingLeft: `${18 * currentScale}px`,
              marginTop: `${8 * currentScale}px`,
              marginBottom: `${10 * currentScale}px`,
              fontSize: `${Math.max(10, settings.fontSize * currentScale * 0.95)}px`,
              lineHeight: settings.lineHeight,
              color: '#1e293b',
            }}
          >
            {block.items.map((it, iIdx) => (
              <li key={iIdx} style={{ marginBottom: `${4 * currentScale}px` }}>
                {it}
              </li>
            ))}
          </ul>
        );
      case 'divider':
        return (
          <div
            key={bIdx}
            style={{
              textAlign: 'center',
              color: '#94a3b8',
              margin: `${12 * currentScale}px 0`,
              letterSpacing: '4px',
            }}
          >
            ❦ ❦ ❦
          </div>
        );
      case 'paragraph':
      default:
        return (
          <p
            key={bIdx}
            style={{
              textIndent: `${settings.firstLineIndentMm * currentScale}px`,
              textAlign: settings.textAlign,
              fontSize: `${Math.max(10, settings.fontSize * currentScale)}px`,
              lineHeight: settings.lineHeight,
              color: '#1e293b',
              marginTop: 0,
              marginBottom: `${6 * currentScale}px`,
            }}
          >
            {block.text}
          </p>
        );
    }
  };

  return (
    <div className={`book-preview-container ${isExpanded ? 'is-expanded' : 'is-sidebar'}`}>
      {/* Top Preview Controls Bar */}
      <div className="book-preview-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            className={`toolbar-btn ${previewMode === 'spread' ? 'active' : ''}`}
            onClick={() => setPreviewMode('spread')}
            title={lang === 'bn' ? 'দুই পাতার স্প্রেড ভিউ' : '2-Page Spread View'}
          >
            <BookOpen size={15} />
            <span>{lang === 'bn' ? 'স্প্রেড ভিউ' : 'Spread'}</span>
          </button>
          <button
            type="button"
            className={`toolbar-btn ${previewMode === 'single' ? 'active' : ''}`}
            onClick={() => setPreviewMode('single')}
            title={lang === 'bn' ? 'একক পাতা ভিউ' : 'Single Page View'}
          >
            <FileText size={15} />
            <span>{lang === 'bn' ? 'একক পাতা' : 'Single'}</span>
          </button>
          <button
            type="button"
            className={`toolbar-btn ${previewMode === 'cover' ? 'active' : ''}`}
            onClick={() => setPreviewMode('cover')}
            title={lang === 'bn' ? 'বইয়ের প্রচ্ছদ ভিউ' : 'Cover View'}
          >
            <Palette size={15} />
            <span>{lang === 'bn' ? 'প্রচ্ছদ' : 'Cover'}</span>
          </button>
        </div>

        {/* Chapter Switcher */}
        {previewMode !== 'cover' && chapters.length > 1 && (
          <div className="chapter-nav-group">
            <button
              type="button"
              className="icon-btn"
              disabled={currentChapterIdx === 0}
              onClick={() => setCurrentChapterIdx((c) => Math.max(0, c - 1))}
              title={lang === 'bn' ? 'পূর্ববর্তী অধ্যায়' : 'Previous Chapter'}
            >
              <ChevronLeft size={16} />
            </button>
            <select
              value={currentChapterIdx}
              onChange={(e) => setCurrentChapterIdx(Number(e.target.value))}
              className="chapter-select"
            >
              {chapters.map((c, idx) => (
                <option key={c.id || idx} value={idx}>
                  {c.title || `${lang === 'bn' ? 'অধ্যায়' : 'Chapter'} ${idx + 1}`}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="icon-btn"
              disabled={currentChapterIdx === chapters.length - 1}
              onClick={() => setCurrentChapterIdx((c) => Math.min(chapters.length - 1, c + 1))}
              title={lang === 'bn' ? 'পরবর্তী অধ্যায়' : 'Next Chapter'}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Zoom & Expand Controls */}
        <div className="toolbar-group right">
          {isExpanded && (
            <>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
                title={lang === 'bn' ? 'জুম আউট' : 'Zoom Out'}
              >
                <ZoomOut size={15} />
              </button>
              <span className="zoom-label">{Math.round(zoomLevel * 100)}%</span>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
                title={lang === 'bn' ? 'জুম ইন' : 'Zoom In'}
              >
                <ZoomIn size={15} />
              </button>
            </>
          )}

          {!isExpanded && onExpand && (
            <button
              type="button"
              className="expand-btn"
              onClick={onExpand}
              title={lang === 'bn' ? 'বুক গেট-আপ স্টুডিও ফুলস্ক্রিন ভিউ' : 'Open Fullscreen Book Studio'}
            >
              <Maximize2 size={14} />
              <span>{lang === 'bn' ? 'বুক স্টুডিও খুলুন' : 'Open Studio'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Preview Stage */}
      <div className="book-stage-viewport">
        {/* 1. COVER VIEW */}
        {previewMode === 'cover' && (
          <div className="book-cover-stage">
            <div
              className="book-cover-3d"
              style={{
                backgroundColor: settings.coverColor || '#1e3d32',
                width: `${pageW}px`,
                minHeight: `${pageH}px`,
                padding: `${padTop * 1.2}px ${padOut * 1.2}px`,
                fontFamily: settings.fontFamily,
              }}
            >
              <div className="cover-badge">{lang === 'bn' ? 'বইয়ের প্রচ্ছদ' : 'Book Cover'}</div>
              <div className="cover-center-content">
                <h1 className="cover-main-title">{project.title || (lang === 'bn' ? 'বইয়ের নাম' : 'Book Title')}</h1>
                {settings.coverSubtitle && <p className="cover-sub-title">{settings.coverSubtitle}</p>}
                {settings.showChapterDecor && <div className="cover-decor-line">❖ — ❖ — ❖</div>}
              </div>
              <div className="cover-bottom-author">
                <span className="cover-author-name">{settings.author || (lang === 'bn' ? 'লেখকের নাম' : 'Author Name')}</span>
                {settings.publisher && <span className="cover-publisher-name">{settings.publisher}</span>}
              </div>
            </div>
            <div className="cover-meta-caption">
              <span>
                {trim.w} × {trim.h} mm ({settings.pageSize})
              </span>
              {settings.bleedMm > 0 && <span> · ব্লিড: {settings.bleedMm} mm</span>}
            </div>
          </div>
        )}

        {/* 2. SPREAD VIEW (VERSO & RECTO - 2 PAGES) */}
        {previewMode === 'spread' && (
          <div className="book-spread-stage">
            <div className="book-spread-booklet" style={{ fontFamily: settings.fontFamily }}>
              {/* Verso Page (Left page - Even) */}
              <div
                className="book-page-sheet verso"
                style={{
                  width: `${pageW}px`,
                  minHeight: `${pageH}px`,
                  padding: `${padTop + extra * currentScale}px ${padIn}px ${padBot}px ${padOut}px`,
                }}
              >
                {/* Running Header */}
                <div className="book-running-header left">
                  <span>{settings.runningHeader === 'author' ? settings.author : project.title}</span>
                </div>

                {/* Verso Page Content (Front matter / Previous chapter summary / Imprint) */}
                <div className="page-body-content">
                  <div className="verso-imprint-card">
                    <h3 className="verso-title">{project.title}</h3>
                    {settings.author && <p className="verso-author">{settings.author}</p>}
                    <div className="verso-divider" />
                    <p className="verso-imprint-line">
                      {settings.copyrightNote || `© ${settings.year || new Date().getFullYear()} ${settings.author || project.title}`}
                    </p>
                    {settings.publisher && (
                      <p className="verso-imprint-line">
                        {lang === 'bn' ? 'প্রকাশক: ' : 'Publisher: '}
                        {settings.publisher}
                      </p>
                    )}
                    {settings.isbn && <p className="verso-imprint-line">ISBN {settings.isbn}</p>}
                    {settings.dedication && (
                      <div className="verso-dedication-box">
                        <em>"{settings.dedication}"</em>
                      </div>
                    )}
                  </div>
                </div>

                {/* Running Footer / Page number */}
                <div className="book-running-footer left">
                  <span>{formatPageNum(currentChapterIdx * 2 + 2)}</span>
                </div>
              </div>

              {/* Book Spine Crease Shadow */}
              <div className="book-spine-crease" />

              {/* Recto Page (Right page - Odd - Chapter Opening) */}
              <div
                className="book-page-sheet recto"
                style={{
                  width: `${pageW}px`,
                  minHeight: `${pageH}px`,
                  padding: `${padTop + extra * currentScale}px ${padOut}px ${padBot}px ${padIn}px`,
                }}
              >
                {/* Running Header */}
                <div className="book-running-header right">
                  <span>{currentChapter.title || (lang === 'bn' ? 'অধ্যায় ১' : 'Chapter 1')}</span>
                </div>

                {/* Chapter Title Banner (Styled as in user image) */}
                <div className="chapter-opening-banner">
                  <h2
                    className="chapter-main-heading"
                    style={{
                      color: settings.chapterHeadingColor,
                      fontSize: `${Math.max(15, settings.fontSize * currentScale * 1.55)}px`,
                      fontWeight: 800,
                      lineHeight: 1.35,
                      marginBottom: `${14 * currentScale}px`,
                      marginTop: `${10 * currentScale}px`,
                    }}
                  >
                    {currentChapter.title || (lang === 'bn' ? 'অধ্যায় ১: সাক্ষাৎকার ও প্রথম চাকরির প্রস্তুতি' : 'Chapter 1')}
                  </h2>
                </div>

                {/* Body Content Blocks */}
                <div className="page-body-content">
                  {blocks.slice(0, isExpanded ? 16 : 8).map((b, idx) => renderBlock(b, idx))}
                </div>

                {/* Running Footer / Page number */}
                <div className="book-running-footer right">
                  <span>{formatPageNum(currentChapterIdx * 2 + 3)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. SINGLE PAGE VIEW */}
        {previewMode === 'single' && (
          <div className="book-single-stage">
            <div
              className="book-page-sheet single"
              style={{
                width: `${pageW}px`,
                minHeight: `${pageH}px`,
                padding: `${padTop + extra * currentScale}px ${padOut}px ${padBot}px ${padIn}px`,
                fontFamily: settings.fontFamily,
              }}
            >
              {/* Running Header */}
              <div className="book-running-header center">
                <span>{currentChapter.title || project.title}</span>
              </div>

              {/* Chapter Title Banner */}
              <div className="chapter-opening-banner">
                <h2
                  className="chapter-main-heading"
                  style={{
                    color: settings.chapterHeadingColor,
                    fontSize: `${Math.max(15, settings.fontSize * currentScale * 1.5)}px`,
                    fontWeight: 800,
                    lineHeight: 1.35,
                    marginBottom: `${14 * currentScale}px`,
                    marginTop: `${8 * currentScale}px`,
                  }}
                >
                  {currentChapter.title || (lang === 'bn' ? 'অধ্যায় ১: সাক্ষাৎকার ও প্রথম চাকরির প্রস্তুতি' : 'Chapter 1')}
                </h2>
              </div>

              {/* Body Content Blocks */}
              <div className="page-body-content">
                {blocks.map((b, idx) => renderBlock(b, idx))}
              </div>

              {/* Running Footer */}
              <div className="book-running-footer center">
                <span>{formatPageNum(currentChapterIdx + 1)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info & Metadata */}
      <div className="book-preview-footer-meta">
        <span>
          📏 {trim.w} × {trim.h} mm ({settings.pageSize})
        </span>
        <span> · 🔤 {settings.fontFamily}</span>
        <span> · 🖋️ {settings.fontSize} pt</span>
        <span> · 🎨 {CALLOUT_THEMES[settings.calloutTheme]?.label || 'Emerald'}</span>
      </div>
    </div>
  );
}
