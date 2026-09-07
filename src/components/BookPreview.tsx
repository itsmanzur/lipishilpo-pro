import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  BookOpen,
  FileText,
  Palette,
  Bookmark,
  User,
  Info,
  ShieldCheck,
  Eye,
  Smartphone,
  Tablet,
  Monitor,
  Box,
  Layers,
} from 'lucide-react';
import type { Project, Chapter } from '../api';
import {
  type BookSettings,
  CALLOUT_THEMES,
  SCENE_BREAK_MOTIFS,
  LEAD_IN_STYLES,
  calculateSpineMm,
  estimatePageCount,
  formatStyledPageNumber,
  generateEan13Svg,
  sheetExtraMm,
  trimSizeMm,
} from '../lib/book-layout';
import { parseChapterContent, toBengaliNumerals, type BookBlock } from '../lib/book-parser';

export type PreviewMode = 'spread' | 'single' | 'cover' | 'wrap' | '3d';
export type DeviceMode = 'print' | 'kindle' | 'tablet' | 'mobile';
export type PreviewSection = 'front' | 'toc' | 'chapter' | 'back';

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
  const [currentSection, setCurrentSection] = useState<PreviewSection>('chapter');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('spread');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('print');
  const [showSafeZone, setShowSafeZone] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(isExpanded ? 1.0 : 0.65);

  const trim = trimSizeMm(settings);
  const extra = sheetExtraMm(settings);
  const baseScale = isExpanded ? 3.6 : 1.5;
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

  const totalChars = project.chapters?.reduce((sum, c) => sum + (c.text?.length || 0), 0) || 5000;
  const estimatedPages = estimatePageCount(totalChars, settings);
  const calculatedSpine = calculateSpineMm(estimatedPages, settings.paperGsm);

  const formatPageNum = (n: number) =>
    formatStyledPageNumber(n, settings.pageNumberStyle || 'plain', settings.numberFormat || 'bn');

  const calloutStyle = CALLOUT_THEMES[settings.calloutTheme] || CALLOUT_THEMES.emerald;

  // Helper to convert typography pt to scaled screen pixels (1 pt = 0.3528 mm)
  const ptToPx = (pt: number, minPx = 8.5) => Math.max(minPx, pt * 0.3528 * currentScale);

  // Helper for chapter header opener style
  const renderChapterHeader = (title: string, chapterNum = currentChapterIdx + 1) => {
    const headerStyle = settings.chapterHeaderStyle || 'classic';
    const numStr = settings.numberFormat === 'bn' ? toBengaliNumerals(chapterNum) : String(chapterNum);
    const paddedNum = numStr.length === 1 ? (settings.numberFormat === 'bn' ? `০${numStr}` : `0${numStr}`) : numStr;

    switch (headerStyle) {
      case 'modern-minimal':
        return (
          <div className="chapter-opening-banner chapter-header-modern" style={{ marginBottom: `${16 * currentScale}px`, marginTop: `${6 * currentScale}px` }}>
            <div style={{ fontSize: `${ptToPx(settings.fontSize * 0.8, 8.5)}px`, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
              {lang === 'bn' ? `অধ্যায় — ${numStr}` : `CHAPTER — ${numStr}`}
            </div>
            <h2
              className="chapter-main-heading"
              style={{
                color: settings.chapterHeadingColor,
                fontSize: `${ptToPx(settings.fontSize * 1.5, 14)}px`,
                fontWeight: 800,
                lineHeight: 1.3,
                margin: `${4 * currentScale}px 0 0`,
                paddingBottom: `${6 * currentScale}px`,
                borderBottom: `2.5px solid ${settings.chapterHeadingColor}`,
              }}
            >
              {title}
            </h2>
          </div>
        );

      case 'ornament-frame':
        return (
          <div
            className="chapter-opening-banner chapter-header-frame"
            style={{
              marginBottom: `${16 * currentScale}px`,
              marginTop: `${8 * currentScale}px`,
              border: `1.5px double ${settings.chapterHeadingColor}`,
              padding: `${10 * currentScale}px ${12 * currentScale}px`,
              textAlign: 'center',
              borderRadius: `${2 * currentScale}px`,
              backgroundColor: '#fcfcfc',
            }}
          >
            <div style={{ fontSize: `${ptToPx(settings.fontSize * 0.8, 8.5)}px`, color: settings.chapterHeadingColor, letterSpacing: '2px', marginBottom: `${2 * currentScale}px` }}>
              ❖ {lang === 'bn' ? `অধ্যায় ${numStr}` : `Chapter ${numStr}`} ❖
            </div>
            <h2
              className="chapter-main-heading"
              style={{
                color: settings.chapterHeadingColor,
                fontSize: `${ptToPx(settings.fontSize * 1.45, 13.5)}px`,
                fontWeight: 800,
                lineHeight: 1.35,
                margin: 0,
              }}
            >
              {title}
            </h2>
          </div>
        );

      case 'drop-num':
        return (
          <div
            className="chapter-opening-banner chapter-header-dropnum"
            style={{
              marginBottom: `${14 * currentScale}px`,
              marginTop: `${6 * currentScale}px`,
              display: 'flex',
              alignItems: 'baseline',
              gap: `${10 * currentScale}px`,
            }}
          >
            <div
              style={{
                fontSize: `${ptToPx(settings.fontSize * 3.4, 26)}px`,
                fontWeight: 900,
                lineHeight: 0.9,
                color: settings.chapterHeadingColor,
                opacity: 0.85,
                fontFamily: settings.fontFamily,
              }}
            >
              {paddedNum}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: `${ptToPx(settings.fontSize * 0.75, 8)}px`, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                {lang === 'bn' ? 'অধ্যায়' : 'Chapter'}
              </div>
              <h2
                className="chapter-main-heading"
                style={{
                  color: '#1e293b',
                  fontSize: `${ptToPx(settings.fontSize * 1.35, 13)}px`,
                  fontWeight: 800,
                  lineHeight: 1.3,
                  margin: 0,
                }}
              >
                {title}
              </h2>
            </div>
          </div>
        );

      case 'classic':
      default:
        return (
          <div className="chapter-opening-banner chapter-header-classic" style={{ marginBottom: `${14 * currentScale}px`, marginTop: `${6 * currentScale}px` }}>
            <h2
              className="chapter-main-heading"
              style={{
                color: settings.chapterHeadingColor,
                fontSize: `${ptToPx(settings.fontSize * 1.5, 14)}px`,
                fontWeight: 800,
                lineHeight: 1.35,
                marginBottom: `${6 * currentScale}px`,
                marginTop: 0,
              }}
            >
              {title}
            </h2>
            {settings.showChapterDecor && (
              <div style={{ color: '#94a3b8', fontSize: `${ptToPx(settings.fontSize * 0.8, 8)}px`, letterSpacing: '4px', marginBottom: `${6 * currentScale}px` }}>
                ❖ — ❖ — ❖
              </div>
            )}
          </div>
        );
    }
  };

  // Helper to render Table of Contents depending on selected preset
  const renderTableOfContents = () => {
    const preset = settings.tocPreset || 'classic-dots';
    const sampleChapters = chapters.length > 1 ? chapters : [
      { id: '1', title: 'অধ্যায় ১: সাক্ষাৎকার ও প্রথম চাকরির প্রস্তুতি' },
      { id: '2', title: 'অধ্যায় ২: আত্মউন্নয়ন ও দক্ষতা বৃদ্ধির পথ' },
      { id: '3', title: 'অধ্যায় ৩: কর্মক্ষেত্রে যোগাযোগ ও টিমওয়ার্ক' },
      { id: '4', title: 'অধ্যায় ৪: সময় ব্যবস্থাপনা ও মানসিক দৃঢ়তা' },
      { id: '5', title: 'অধ্যায় ৫: সফলতার নীতি ও নৈতিকতা' },
    ];

    return (
      <div className="toc-preview-container" style={{ padding: `${4 * currentScale}px 0` }}>
        <h2
          style={{
            textAlign: 'center',
            color: settings.chapterHeadingColor,
            fontSize: `${ptToPx(settings.fontSize * 1.45, 13)}px`,
            fontWeight: 800,
            marginBottom: `${14 * currentScale}px`,
            borderBottom: preset === 'modern-big' ? `2px solid ${settings.chapterHeadingColor}` : 'none',
            paddingBottom: preset === 'modern-big' ? `${6 * currentScale}px` : 0,
          }}
        >
          {lang === 'bn' ? 'সূচিপত্র' : 'Table of Contents'}
        </h2>

        {preset === 'classic-dots' && (
          <div className="toc-list-classic" style={{ display: 'flex', flexDirection: 'column', gap: `${8 * currentScale}px` }}>
            {sampleChapters.map((ch, idx) => (
              <div key={ch.id || idx} style={{ display: 'flex', alignItems: 'baseline', fontSize: `${ptToPx(settings.fontSize * 0.95, 9)}px` }}>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{ch.title}</span>
                <span style={{ flex: 1, borderBottom: '1px dotted #94a3b8', margin: `0 ${6 * currentScale}px`, minWidth: '15px' }} />
                <span style={{ fontWeight: 700, color: '#475569' }}>
                  {formatPageNum(idx * 8 + 5)}
                </span>
              </div>
            ))}
          </div>
        )}

        {preset === 'modern-big' && (
          <div className="toc-list-modern" style={{ display: 'flex', flexDirection: 'column', gap: `${10 * currentScale}px` }}>
            {sampleChapters.map((ch, idx) => {
              const num = idx + 1;
              const numStr = settings.numberFormat === 'bn' ? toBengaliNumerals(num) : String(num);
              const padded = numStr.length === 1 ? (settings.numberFormat === 'bn' ? `০${numStr}` : `0${numStr}`) : numStr;
              return (
                <div
                  key={ch.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${5 * currentScale}px ${8 * currentScale}px`,
                    background: '#f8fafc',
                    borderRadius: `${4 * currentScale}px`,
                    borderLeft: `3px solid ${settings.chapterHeadingColor}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: `${8 * currentScale}px` }}>
                    <span style={{ fontSize: `${ptToPx(settings.fontSize * 1.1, 10.5)}px`, fontWeight: 800, color: settings.chapterHeadingColor }}>
                      {padded}
                    </span>
                    <span style={{ fontSize: `${ptToPx(settings.fontSize * 0.92, 9)}px`, fontWeight: 600, color: '#1e293b' }}>
                      {ch.title}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: `${ptToPx(settings.fontSize * 0.82, 8)}px`,
                      fontWeight: 700,
                      background: '#ffffff',
                      padding: `2px ${6 * currentScale}px`,
                      borderRadius: '4px',
                      color: '#475569',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    {formatPageNum(idx * 8 + 5)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {preset === 'ornamented' && (
          <div className="toc-list-ornamented" style={{ display: 'flex', flexDirection: 'column', gap: `${10 * currentScale}px`, textAlign: 'center' }}>
            {sampleChapters.map((ch, idx) => (
              <div key={ch.id || idx} style={{ borderBottom: '1px dashed #e2e8f0', paddingBottom: `${6 * currentScale}px` }}>
                <div style={{ fontSize: `${ptToPx(settings.fontSize * 0.95, 9)}px`, fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>
                  ❖ {ch.title} ❖
                </div>
                <div style={{ fontSize: `${ptToPx(settings.fontSize * 0.8, 8)}px`, color: '#64748b' }}>
                  {lang === 'bn' ? 'পৃষ্ঠা' : 'Page'} — {formatPageNum(idx * 8 + 5)}
                </div>
              </div>
            ))}
          </div>
        )}

        {preset === 'summary' && (
          <div className="toc-list-summary" style={{ display: 'flex', flexDirection: 'column', gap: `${10 * currentScale}px` }}>
            {sampleChapters.map((ch, idx) => (
              <div key={ch.id || idx} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: `${5 * currentScale}px` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: `${ptToPx(settings.fontSize * 0.95, 9)}px`, fontWeight: 700, color: '#1e293b' }}>
                    {ch.title}
                  </span>
                  <span style={{ fontSize: `${ptToPx(settings.fontSize * 0.85, 8.5)}px`, fontWeight: 700, color: settings.chapterHeadingColor }}>
                    {formatPageNum(idx * 8 + 5)}
                  </span>
                </div>
                <div style={{ fontSize: `${ptToPx(settings.fontSize * 0.78, 7.5)}px`, color: '#64748b', marginTop: '2px', fontStyle: 'italic' }}>
                  {lang === 'bn' ? 'মূল বিষয়বস্তু, বাস্তবিক অভিজ্ঞতা ও নির্দেশনাবলী।' : 'Key insights, practices, and guidelines.'}
                </div>
              </div>
            ))}
          </div>
        )}

        {preset === 'minimal' && (
          <div className="toc-list-minimal" style={{ display: 'flex', flexDirection: 'column', gap: `${8 * currentScale}px` }}>
            {sampleChapters.map((ch, idx) => (
              <div key={ch.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: `${ptToPx(settings.fontSize * 0.92, 9)}px`, color: '#1e293b', fontWeight: 500 }}>
                  {ch.title}
                </span>
                <span style={{ fontSize: `${ptToPx(settings.fontSize * 0.88, 8.5)}px`, color: '#334155', fontWeight: 600 }}>
                  {formatPageNum(idx * 8 + 5)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render parsed block inside page
  const renderBlock = (block: BookBlock, bIdx: number) => {
    switch (block.type) {
      case 'heading':
        return (
          <div
            key={bIdx}
            className="book-block-heading"
            style={{
              color: settings.subheadingColor,
              fontSize: `${ptToPx(settings.fontSize * (block.level === 1 ? 1.45 : block.level === 2 ? 1.25 : 1.12), 11)}px`,
              fontWeight: 700,
              marginTop: `${10 * currentScale}px`,
              marginBottom: `${5 * currentScale}px`,
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
              fontSize: `${ptToPx(settings.fontSize * 0.95, 9)}px`,
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
                  fontSize: `${ptToPx(settings.fontSize * 0.8, 8)}px`,
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
              padding: `${8 * currentScale}px ${10 * currentScale}px`,
              marginTop: `${10 * currentScale}px`,
              marginBottom: `${12 * currentScale}px`,
            }}
          >
            <div
              style={{
                color: calloutStyle.title,
                fontWeight: 700,
                fontSize: `${ptToPx(settings.fontSize * 1.05, 9.5)}px`,
                marginBottom: `${4 * currentScale}px`,
                borderBottom: `1px solid ${calloutStyle.border}`,
                paddingBottom: `${3 * currentScale}px`,
              }}
            >
              {block.title}
            </div>
            <div
              style={{
                color: '#1e293b',
                fontSize: `${ptToPx(settings.fontSize * 0.92, 8.5)}px`,
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
              fontSize: `${ptToPx(settings.fontSize * 0.82, 8)}px`,
              lineHeight: 1.4,
              fontStyle: 'italic',
              marginTop: `${10 * currentScale}px`,
              marginBottom: `${8 * currentScale}px`,
              paddingTop: `${5 * currentScale}px`,
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
              marginTop: `${6 * currentScale}px`,
              marginBottom: `${8 * currentScale}px`,
              fontSize: `${ptToPx(settings.fontSize * 0.95, 8.5)}px`,
              lineHeight: settings.lineHeight,
              color: '#1e293b',
            }}
          >
            {block.items.map((it, iIdx) => (
              <li key={iIdx} style={{ marginBottom: `${3 * currentScale}px` }}>
                {it}
              </li>
            ))}
          </ul>
        );
      case 'divider': {
        const motif = SCENE_BREAK_MOTIFS[settings.sceneBreakMotif || 'motifClassic']?.symbol || '❖ — ❖ — ❖';
        return (
          <div
            key={bIdx}
            style={{
              textAlign: 'center',
              color: '#94a3b8',
              margin: `${12 * currentScale}px 0`,
              letterSpacing: '3px',
              fontSize: `${ptToPx(settings.fontSize * 0.95, 9.5)}px`,
            }}
          >
            {motif}
          </div>
        );
      }
      case 'paragraph':
      default: {
        const isFirst = bIdx === 0;
        const leadStyle = settings.leadInStyle || (settings.dropCap ? 'drop_cap' : 'clean');

        if (isFirst && leadStyle === 'drop_cap' && block.text.length > 2) {
          const firstChar = block.text.slice(0, 1);
          const restText = block.text.slice(1);
          return (
            <p
              key={bIdx}
              style={{
                textAlign: settings.textAlign,
                fontSize: `${ptToPx(settings.fontSize)}px`,
                lineHeight: settings.lineHeight,
                color: '#1e293b',
                marginTop: 0,
                marginBottom: `${6 * currentScale}px`,
              }}
            >
              <span
                style={{
                  float: 'left',
                  fontSize: `${ptToPx(settings.fontSize * 3.1, 24)}px`,
                  lineHeight: '0.85',
                  paddingTop: '2px',
                  paddingRight: `${6 * currentScale}px`,
                  paddingBottom: '2px',
                  fontFamily: settings.fontFamily,
                  color: settings.chapterHeadingColor,
                  fontWeight: 800,
                }}
              >
                {firstChar}
              </span>
              {restText}
            </p>
          );
        }

        if (isFirst && leadStyle === 'bold_lead' && block.text.length > 10) {
          const words = block.text.split(' ');
          const leadWords = words.slice(0, 3).join(' ');
          const restWords = words.slice(3).join(' ');
          return (
            <p
              key={bIdx}
              style={{
                textIndent: `${settings.firstLineIndentMm * currentScale}px`,
                textAlign: settings.textAlign,
                fontSize: `${ptToPx(settings.fontSize)}px`,
                lineHeight: settings.lineHeight,
                color: '#1e293b',
                marginTop: 0,
                marginBottom: `${6 * currentScale}px`,
              }}
            >
              <strong style={{ color: settings.chapterHeadingColor, fontWeight: 800 }}>
                {leadWords}{' '}
              </strong>
              {restWords}
            </p>
          );
        }

        if (isFirst && leadStyle === 'small_caps' && block.text.length > 6) {
          const words = block.text.split(' ');
          const leadWord = words[0];
          const restWords = words.slice(1).join(' ');
          return (
            <p
              key={bIdx}
              style={{
                textIndent: `${settings.firstLineIndentMm * currentScale}px`,
                textAlign: settings.textAlign,
                fontSize: `${ptToPx(settings.fontSize)}px`,
                lineHeight: settings.lineHeight,
                color: '#1e293b',
                marginTop: 0,
                marginBottom: `${6 * currentScale}px`,
              }}
            >
              <span style={{ fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: settings.chapterHeadingColor }}>
                {leadWord}{' '}
              </span>
              {restWords}
            </p>
          );
        }

        return (
          <p
            key={bIdx}
            style={{
              textIndent: `${settings.firstLineIndentMm * currentScale}px`,
              textAlign: settings.textAlign,
              fontSize: `${ptToPx(settings.fontSize)}px`,
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
    }
  };

  // Safe Zone Overlay Box Renderer
  const renderSafeZoneOverlay = (isVerso = false) => {
    if (!showSafeZone) return null;
    const bleed = (settings.bleedMm || 3) * currentScale;
    const safeMarginInner = (settings.marginInnerMm || 20) * currentScale;
    const safeMarginOuter = (settings.marginOuterMm || 16) * currentScale;
    const safeMarginTop = (settings.marginTopMm || 18) * currentScale;
    const safeMarginBottom = (settings.marginBottomMm || 20) * currentScale;

    return (
      <div className="safe-zone-overlay-container">
        {/* 3mm Bleed Guideline */}
        <div className="bleed-guide-line">
          <span className="bleed-label-tag">ব্লিড ৩ মিমি</span>
        </div>

        {/* 5mm Safe Margin Zone */}
        <div
          className="safe-zone-margin-box"
          style={{
            top: `${safeMarginTop}px`,
            bottom: `${safeMarginBottom}px`,
            left: `${isVerso ? safeMarginOuter : safeMarginInner}px`,
            right: `${isVerso ? safeMarginInner : safeMarginOuter}px`,
          }}
        >
          <span className="safe-label-tag">🛡️ সেফ জোন</span>
        </div>
      </div>
    );
  };

  const pos = settings.pageNumberPosition || 'bottom-outside';

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
            <BookOpen size={14} />
            <span>{lang === 'bn' ? 'স্প্রেড' : 'Spread'}</span>
          </button>

          <button
            type="button"
            className={`toolbar-btn ${previewMode === 'single' ? 'active' : ''}`}
            onClick={() => setPreviewMode('single')}
            title={lang === 'bn' ? 'একক পাতা ভিউ' : 'Single Page View'}
          >
            <FileText size={14} />
            <span>{lang === 'bn' ? '১ পাতা' : 'Single'}</span>
          </button>

          <button
            type="button"
            className={`toolbar-btn ${previewMode === 'cover' ? 'active' : ''}`}
            onClick={() => setPreviewMode('cover')}
            title={lang === 'bn' ? 'সামনের প্রচ্ছদ' : 'Front Cover'}
          >
            <Palette size={14} />
            <span>{lang === 'bn' ? 'প্রচ্ছদ' : 'Cover'}</span>
          </button>

          <button
            type="button"
            className={`toolbar-btn ${previewMode === 'wrap' ? 'active' : ''}`}
            onClick={() => setPreviewMode('wrap')}
            title={lang === 'bn' ? 'ফুল কভার র‍্যাপ (পেছন + স্পাইন + সামনে)' : 'Full Cover Wrap'}
          >
            <Layers size={14} />
            <span>{lang === 'bn' ? 'কভার র‍্যাপ' : 'Wrap'}</span>
          </button>

          <button
            type="button"
            className={`toolbar-btn ${previewMode === '3d' ? 'active' : ''}`}
            onClick={() => setPreviewMode('3d')}
            title={lang === 'bn' ? 'থ্রিডি রিয়েলিস্টিক মকআপ ভিউ' : '3D Realistic Mockup'}
          >
            <Box size={14} />
            <span>{lang === 'bn' ? '৩ডি মকআপ' : '3D'}</span>
          </button>

          <button
            type="button"
            className={`toolbar-btn ${showSafeZone ? 'active' : ''}`}
            style={{ color: showSafeZone ? '#10b981' : undefined }}
            onClick={() => setShowSafeZone(!showSafeZone)}
            title={lang === 'bn' ? 'কাটিং ও সেফ জোন গাইড অন/অফ করুন' : 'Toggle Safe Zone Guides'}
          >
            <ShieldCheck size={14} />
            <span>{lang === 'bn' ? 'সেফ জোন' : 'Safe Zone'}</span>
          </button>
        </div>

        {/* Device Simulation Switcher */}
        {isExpanded && (
          <div className="device-switcher-group">
            <button
              type="button"
              className={`device-pill-btn ${deviceMode === 'print' ? 'active' : ''}`}
              onClick={() => setDeviceMode('print')}
              title="প্রিন্ট পেজ ভিউ"
            >
              <Monitor size={12} />
              <span>প্রিন্ট</span>
            </button>
            <button
              type="button"
              className={`device-pill-btn ${deviceMode === 'kindle' ? 'active' : ''}`}
              onClick={() => setDeviceMode('kindle')}
              title="কিন্ডল পেপারহোয়াইট সিমুলেটর"
            >
              <BookOpen size={12} />
              <span>কিন্ডল</span>
            </button>
            <button
              type="button"
              className={`device-pill-btn ${deviceMode === 'tablet' ? 'active' : ''}`}
              onClick={() => setDeviceMode('tablet')}
              title="ট্যাবলেট / আইপ্যাড ভিউ"
            >
              <Tablet size={12} />
              <span>ট্যাবলেট</span>
            </button>
            <button
              type="button"
              className={`device-pill-btn ${deviceMode === 'mobile' ? 'active' : ''}`}
              onClick={() => setDeviceMode('mobile')}
              title="স্মার্টফোন মোবাইল ভিউ"
            >
              <Smartphone size={12} />
              <span>মোবাইল</span>
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
              title={lang === 'bn' ? 'ফুলস্ক্রিন বুক স্টুডিও খুলুন' : 'Open Fullscreen Book Studio'}
            >
              <Maximize2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Sub Toolbar for Internal Page Navigation */}
      {isExpanded && !['cover', 'wrap', '3d'].includes(previewMode) && (
        <div className="book-preview-sub-toolbar">
          <div className="section-pill-switcher">
            <button
              type="button"
              className={`section-pill-btn ${currentSection === 'front' ? 'active' : ''}`}
              onClick={() => setCurrentSection('front')}
            >
              <Bookmark size={13} />
              <span>{lang === 'bn' ? 'শুরুর পাতা' : 'Front Matter'}</span>
            </button>

            <button
              type="button"
              className={`section-pill-btn ${currentSection === 'toc' ? 'active' : ''}`}
              onClick={() => setCurrentSection('toc')}
            >
              <FileText size={13} />
              <span>{lang === 'bn' ? 'সূচিপত্র' : 'TOC'}</span>
            </button>

            <button
              type="button"
              className={`section-pill-btn ${currentSection === 'chapter' ? 'active' : ''}`}
              onClick={() => setCurrentSection('chapter')}
            >
              <FileText size={13} />
              <span>{lang === 'bn' ? 'অধ্যায় মূলপাঠ' : 'Chapters'}</span>
            </button>

            <button
              type="button"
              className={`section-pill-btn ${currentSection === 'back' ? 'active' : ''}`}
              onClick={() => setCurrentSection('back')}
            >
              <User size={13} />
              <span>{lang === 'bn' ? 'পরিশিষ্ট' : 'Back Matter'}</span>
            </button>
          </div>

          {currentSection === 'chapter' && chapters.length > 1 && (
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
        </div>
      )}

      {/* Main Preview Stage Viewport */}
      <div className="book-stage-viewport">
        {/* 1. FRONT COVER VIEW */}
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
                {settings.showChapterDecor && (
                  <div className="cover-decor-line">
                    {SCENE_BREAK_MOTIFS[settings.sceneBreakMotif || 'motifClassic']?.symbol || '❖ — ❖ — ❖'}
                  </div>
                )}
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
              <span> · আনুমানিক স্পাইন: {calculatedSpine} mm ({settings.paperGsm} GSM)</span>
              {settings.bleedMm > 0 && <span> · ব্লিড: {settings.bleedMm} mm</span>}
            </div>
          </div>
        )}

        {/* 2. FULL COVER WRAP SPREAD (BACK COVER + SPINE + FRONT COVER) */}
        {previewMode === 'wrap' && (
          <div className="book-cover-stage" style={{ padding: '20px 0' }}>
            <div
              className="cover-wrap-spread-container"
              style={{
                backgroundColor: settings.coverColor || '#1e3d32',
                minHeight: `${pageH}px`,
                fontFamily: settings.fontFamily,
              }}
            >
              {/* BACK COVER */}
              <div
                className="cover-wrap-back"
                style={{
                  width: `${pageW}px`,
                  minHeight: `${pageH}px`,
                  padding: `${padTop}px ${padOut}px`,
                }}
              >
                <div>
                  <div className="cover-badge" style={{ marginBottom: '14px' }}>
                    {lang === 'bn' ? 'পেছনের প্রচ্ছদ (Back Cover)' : 'Back Cover'}
                  </div>
                  <div className="back-blurb-box">
                    <p style={{ margin: 0, whiteSpace: 'pre-line' }}>
                      {settings.backCoverBlurb ||
                        (lang === 'bn'
                          ? 'বইটির আকর্ষণীয় ফ্ল্যাপ বক্তব্য ও সারাংশ এখানে প্রদর্শিত হবে। সেটিংসে প্রচ্ছদ ট্যাবে গিয়ে এটি সম্পাদনা করতে পারেন।'
                          : 'Book synopsis and back blurb description text.')}
                    </p>
                  </div>
                  {settings.authorBio && (
                    <div style={{ fontSize: `${ptToPx(settings.fontSize * 0.78, 8)}px`, opacity: 0.9, marginTop: '8px', borderLeft: '2px solid rgba(255,255,255,0.4)', paddingLeft: '8px' }}>
                      <strong style={{ display: 'block', marginBottom: '2px' }}>{settings.author}</strong>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {settings.authorBio}
                      </span>
                    </div>
                  )}
                </div>

                {/* Back Footer: Price, Publisher & EAN-13 Barcode */}
                <div className="back-footer-row">
                  <div>
                    {settings.publisher && (
                      <span style={{ fontSize: `${ptToPx(settings.fontSize * 0.82, 8.5)}px`, display: 'block', fontWeight: 600 }}>
                        {settings.publisher}
                      </span>
                    )}
                    <span style={{ fontSize: `${ptToPx(settings.fontSize * 0.85, 9)}px`, fontWeight: 800 }}>
                      মূল্য: {settings.coverPrice || settings.price || '৳ ৩৫০'}
                    </span>
                  </div>

                  {settings.showBarcode && (
                    <div
                      className="back-barcode-container"
                      dangerouslySetInnerHTML={{
                        __html: generateEan13Svg(
                          settings.barcodeNumber || settings.isbn || '9789849123456',
                          settings.coverPrice || settings.price || '৳ ৩৫০'
                        ),
                      }}
                    />
                  )}
                </div>
              </div>

              {/* SPINE */}
              <div
                className="cover-wrap-spine"
                style={{
                  width: `${Math.max(28, calculatedSpine * currentScale)}px`,
                  minHeight: `${pageH}px`,
                  padding: '20px 0',
                }}
              >
                <div className="spine-vertical-text" style={{ fontSize: `${ptToPx(settings.fontSize * 0.9, 9)}px` }}>
                  {settings.spineText || project.title || 'বইয়ের শিরোনাম'}
                  {settings.author && ` · ${settings.author}`}
                </div>
              </div>

              {/* FRONT COVER */}
              <div
                className="cover-wrap-front"
                style={{
                  width: `${pageW}px`,
                  minHeight: `${pageH}px`,
                  padding: `${padTop}px ${padOut}px`,
                }}
              >
                <div className="cover-badge">{lang === 'bn' ? 'সামনের প্রচ্ছদ' : 'Front Cover'}</div>
                <div className="cover-center-content">
                  <h1 className="cover-main-title">{project.title || (lang === 'bn' ? 'বইয়ের নাম' : 'Book Title')}</h1>
                  {settings.coverSubtitle && <p className="cover-sub-title">{settings.coverSubtitle}</p>}
                  {settings.showChapterDecor && (
                    <div className="cover-decor-line">
                      {SCENE_BREAK_MOTIFS[settings.sceneBreakMotif || 'motifClassic']?.symbol || '❖ — ❖ — ❖'}
                    </div>
                  )}
                </div>
                <div className="cover-bottom-author">
                  <span className="cover-author-name">{settings.author || (lang === 'bn' ? 'লেখকের নাম' : 'Author Name')}</span>
                  {settings.publisher && <span className="cover-publisher-name">{settings.publisher}</span>}
                </div>
              </div>
            </div>
            <div className="cover-meta-caption" style={{ textAlign: 'center', marginTop: '10px' }}>
              <span>📐 ফুল কভার র‍্যাপ স্প্রেড (ব্যাক + স্পাইন {calculatedSpine}mm + ফ্রন্ট) · প্রেস-রেডি কাটিং ও ক্রপ মার্কস</span>
            </div>
          </div>
        )}

        {/* 3. 3D REALISTIC BOOK MOCKUP VIEW */}
        {previewMode === '3d' && (
          <div className="book-3d-mockup-stage">
            <div
              className="book-3d-object"
              style={{
                backgroundColor: settings.coverColor || '#1e3d32',
                width: `${pageW * 0.95}px`,
                minHeight: `${pageH * 0.95}px`,
                padding: `${padTop}px ${padOut}px`,
                fontFamily: settings.fontFamily,
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div className="book-3d-spine-edge" />
              <div className="book-3d-pages-stack" />

              <div className="cover-badge" style={{ alignSelf: 'flex-start' }}>3D Realistic Book</div>
              <div className="cover-center-content">
                <h1 className="cover-main-title" style={{ fontSize: `${ptToPx(settings.fontSize * 2.1, 20)}px` }}>
                  {project.title || 'বইয়ের নাম'}
                </h1>
                {settings.coverSubtitle && <p className="cover-sub-title">{settings.coverSubtitle}</p>}
                {settings.showChapterDecor && (
                  <div className="cover-decor-line">
                    {SCENE_BREAK_MOTIFS[settings.sceneBreakMotif || 'motifClassic']?.symbol || '❖ — ❖ — ❖'}
                  </div>
                )}
              </div>
              <div className="cover-bottom-author">
                <span className="cover-author-name">{settings.author || 'লেখকের নাম'}</span>
                {settings.publisher && <span className="cover-publisher-name">{settings.publisher}</span>}
              </div>
            </div>
          </div>
        )}

        {/* 4. SPREAD & SINGLE VIEW (WITH DEVICE SIMULATOR & SAFE ZONE) */}
        {!['cover', 'wrap', '3d'].includes(previewMode) && (
          <div className={deviceMode === 'kindle' ? 'device-frame-kindle' : deviceMode === 'mobile' ? 'device-frame-mobile' : deviceMode === 'tablet' ? 'device-frame-tablet' : ''}>
            {deviceMode === 'kindle' && (
              <div className="kindle-status-bar">
                <span>Kindle Paperwhite</span>
                <span>10:45 AM</span>
                <span>🔋 94%</span>
              </div>
            )}
            {deviceMode === 'mobile' && <div className="mobile-notch" />}

            {/* SPREAD VIEW (VERSO & RECTO - 2 PAGES) */}
            {previewMode === 'spread' && (
              <div className="book-spread-stage">
                <div className="book-spread-booklet" style={{ fontFamily: settings.fontFamily }}>
                  {/* VERSO PAGE (LEFT) */}
                  <div
                    className="book-page-sheet verso"
                    style={{
                      width: `${pageW}px`,
                      minHeight: `${pageH}px`,
                      padding: `${padTop + extra * currentScale}px ${padIn}px ${padBot}px ${padOut}px`,
                      position: 'relative',
                    }}
                  >
                    {renderSafeZoneOverlay(true)}

                    {/* Running Header */}
                    <div className={`book-running-header left ${pos === 'top-outside' || pos === 'top-center' ? 'has-top-num' : ''}`}>
                      {pos === 'top-outside' && (
                        <span className="header-page-num" style={{ fontWeight: 700, marginRight: '10px' }}>
                          {formatPageNum(currentSection === 'front' ? 2 : currentSection === 'toc' ? 4 : currentSection === 'back' ? estimatedPages - 1 : currentChapterIdx * 2 + 2)}
                        </span>
                      )}
                      <span>{settings.runningHeader === 'author' ? settings.author : project.title}</span>
                      {pos === 'top-center' && (
                        <span className="header-page-num center" style={{ fontWeight: 700, marginLeft: 'auto', marginRight: 'auto' }}>
                          {formatPageNum(currentSection === 'front' ? 2 : currentSection === 'toc' ? 4 : currentSection === 'back' ? estimatedPages - 1 : currentChapterIdx * 2 + 2)}
                        </span>
                      )}
                    </div>

                    {/* Verso Content depends on currentSection */}
                    <div className="page-body-content">
                      {currentSection === 'front' ? (
                        /* Front Matter: Half-Title & CIP National Imprint */
                        <div className="verso-imprint-card">
                          <h3 className="verso-title">{settings.halfTitle || project.title}</h3>
                          {settings.author && <p className="verso-author">{settings.author}</p>}
                          <div className="verso-divider" />
                          <p className="verso-imprint-line">
                            {settings.copyrightNote || `© ${settings.year || new Date().getFullYear()} ${settings.author || project.title}`}
                          </p>
                          {settings.edition && (
                            <p className="verso-imprint-line">
                              {settings.edition}
                            </p>
                          )}
                          {settings.publisher && (
                            <p className="verso-imprint-line">
                              {lang === 'bn' ? 'প্রকাশক: ' : 'Publisher: '}
                              {settings.publisher}
                            </p>
                          )}
                          {settings.coverDesigner && (
                            <p className="verso-imprint-line">
                              {lang === 'bn' ? 'প্রচ্ছদ: ' : 'Cover: '}
                              {settings.coverDesigner}
                            </p>
                          )}
                          {settings.compositor && (
                            <p className="verso-imprint-line">
                              {lang === 'bn' ? 'অক্ষরবিন্যাস: ' : 'Compositor: '}
                              {settings.compositor}
                            </p>
                          )}
                          {settings.printer && (
                            <p className="verso-imprint-line">
                              {lang === 'bn' ? 'মুদ্রণ: ' : 'Printer: '}
                              {settings.printer}
                            </p>
                          )}
                          {settings.cipSubject && (
                            <p className="verso-imprint-line" style={{ fontSize: `${ptToPx(settings.fontSize * 0.78, 7.5)}px`, color: '#64748b' }}>
                              CIP: {settings.cipSubject}
                            </p>
                          )}
                          {settings.isbn && <p className="verso-imprint-line">ISBN {settings.isbn}</p>}
                          {settings.price && (
                            <p className="verso-imprint-line">
                              {lang === 'bn' ? 'মূল্য: ' : 'Price: '}
                              {settings.price}
                            </p>
                          )}
                        </div>
                      ) : currentSection === 'toc' ? (
                        /* TOC Left Page: Half-Title & Intro Note */
                        <div className="verso-imprint-card">
                          <h3 className="verso-title">{project.title}</h3>
                          {settings.author && <p className="verso-author">{settings.author}</p>}
                          <div className="verso-divider" />
                          <p className="verso-imprint-line" style={{ fontStyle: 'italic' }}>
                            {lang === 'bn' ? 'সূচিপত্র ও অধ্যায় বিন্যাসিকা' : 'Table of Contents & Structure'}
                          </p>
                        </div>
                      ) : currentSection === 'back' ? (
                        /* Back Matter Verso: Author Bio & Other Books */
                        <div className="back-matter-box">
                          <h4 className="back-section-heading">{lang === 'bn' ? 'লেখক পরিচিতি' : 'About the Author'}</h4>
                          <p className="back-text-content" style={{ whiteSpace: 'pre-line' }}>
                            {settings.authorBio || (lang === 'bn' ? 'লেখকের পরিচিতি ও সংক্ষিপ্ত সাহিত্যকর্ম।' : 'Author biographical notes.')}
                          </p>
                          {settings.otherBooks && (
                            <div style={{ marginTop: '12px', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
                              <h5 style={{ margin: '0 0 4px', fontSize: `${ptToPx(settings.fontSize * 0.9, 8.5)}px` }}>লেখকের অন্যান্য বই:</h5>
                              <p style={{ margin: 0, fontSize: `${ptToPx(settings.fontSize * 0.85, 8)}px`, color: '#475569', whiteSpace: 'pre-line' }}>
                                {settings.otherBooks}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Chapter Verso */
                        <div className="verso-imprint-card">
                          <h3 className="verso-title">{project.title}</h3>
                          {settings.author && <p className="verso-author">{settings.author}</p>}
                          <div className="verso-divider" />
                          <p className="verso-imprint-line">
                            {settings.copyrightNote || `© ${settings.year || new Date().getFullYear()} ${settings.author || project.title}`}
                          </p>
                          {settings.isbn && <p className="verso-imprint-line">ISBN {settings.isbn}</p>}
                        </div>
                      )}
                    </div>

                    {/* Running Footer with Dynamic Placement */}
                    {pos !== 'none' && !pos.startsWith('top') && (
                      <div className={`book-running-footer ${pos === 'bottom-center' ? 'center' : 'left'}`}>
                        <span>{formatPageNum(currentSection === 'front' ? 2 : currentSection === 'toc' ? 4 : currentSection === 'back' ? estimatedPages - 1 : currentChapterIdx * 2 + 2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Book Spine Crease Shadow */}
                  <div className="book-spine-crease" />

                  {/* RECTO PAGE (RIGHT) */}
                  <div
                    className="book-page-sheet recto"
                    style={{
                      width: `${pageW}px`,
                      minHeight: `${pageH}px`,
                      padding: `${padTop + extra * currentScale}px ${padOut}px ${padBot}px ${padIn}px`,
                      position: 'relative',
                    }}
                  >
                    {renderSafeZoneOverlay(false)}

                    {/* Running Header */}
                    <div className={`book-running-header right ${pos === 'top-outside' || pos === 'top-center' ? 'has-top-num' : ''}`}>
                      <span>
                        {currentSection === 'front'
                          ? settings.prefaceTitle || 'ভূমিকা'
                          : currentSection === 'toc'
                            ? 'সূচিপত্র'
                            : currentSection === 'back'
                              ? 'পরিশিষ্ট'
                              : currentChapter.title || 'অধ্যায় ১'}
                      </span>
                      {pos === 'top-outside' && (
                        <span className="header-page-num" style={{ fontWeight: 700, marginLeft: '10px' }}>
                          {formatPageNum(currentSection === 'front' ? 3 : currentSection === 'toc' ? 5 : currentSection === 'back' ? estimatedPages : currentChapterIdx * 2 + 3)}
                        </span>
                      )}
                    </div>

                    {/* Recto Content depends on currentSection */}
                    <div className="page-body-content">
                      {currentSection === 'front' ? (
                        /* Front Matter Recto: Dedication, Epigraph & Preface */
                        <div className="recto-preface-container">
                          {settings.dedication && (
                            <div style={{ textAlign: 'center', margin: `0 0 ${14 * currentScale}px`, fontStyle: 'italic', color: '#475569', fontSize: `${ptToPx(settings.fontSize * 0.95, 9)}px` }}>
                              <em>"{settings.dedication}"</em>
                            </div>
                          )}
                          {settings.epigraphText && (
                            <div style={{ margin: `0 0 ${14 * currentScale}px`, padding: `${8 * currentScale}px`, background: '#f8fafc', borderRadius: '4px', borderLeft: `3px solid ${settings.chapterHeadingColor}` }}>
                              <p style={{ margin: 0, fontStyle: 'italic', fontSize: `${ptToPx(settings.fontSize * 0.9, 8.5)}px` }}>
                                "{settings.epigraphText}"
                              </p>
                              {settings.epigraphSource && (
                                <small style={{ display: 'block', textAlign: 'right', marginTop: '4px', fontWeight: 600, color: '#64748b' }}>
                                  {settings.epigraphSource}
                                </small>
                              )}
                            </div>
                          )}
                          <h2
                            className="chapter-main-heading"
                            style={{
                              color: settings.chapterHeadingColor,
                              fontSize: `${ptToPx(settings.fontSize * 1.45, 13)}px`,
                              fontWeight: 800,
                              marginBottom: `${10 * currentScale}px`,
                            }}
                          >
                            {settings.prefaceTitle || (lang === 'bn' ? 'ভূমিকা' : 'Preface')}
                          </h2>
                          <p
                            style={{
                              textIndent: `${settings.firstLineIndentMm * currentScale}px`,
                              textAlign: settings.textAlign,
                              fontSize: `${ptToPx(settings.fontSize)}px`,
                              lineHeight: settings.lineHeight,
                              color: '#1e293b',
                              whiteSpace: 'pre-line',
                            }}
                          >
                            {settings.prefaceText ||
                              (lang === 'bn'
                                ? 'বইয়ের ভূমিকা বা লেখকের কথা এখানে সন্নিবেশিত হবে। সেটিংসে গিয়ে ভূমিকা যুক্ত করতে পারেন।'
                                : 'Author preface or foreword text will appear here.')}
                          </p>
                        </div>
                      ) : currentSection === 'toc' ? (
                        /* Table of Contents Preset View */
                        renderTableOfContents()
                      ) : currentSection === 'back' ? (
                        /* Back Matter Recto: Acknowledgement & Glossary */
                        <div className="recto-author-bio-container">
                          <h2
                            className="chapter-main-heading"
                            style={{
                              color: settings.chapterHeadingColor,
                              fontSize: `${ptToPx(settings.fontSize * 1.4, 12.5)}px`,
                              fontWeight: 800,
                              marginBottom: `${10 * currentScale}px`,
                            }}
                          >
                            {lang === 'bn' ? 'কৃতজ্ঞতা ও শব্দকোষ' : 'Acknowledgements & Glossary'}
                          </h2>
                          {settings.acknowledgement && (
                            <div style={{ marginBottom: `${12 * currentScale}px` }}>
                              <h4 style={{ margin: '0 0 4px', color: '#1e293b', fontSize: `${ptToPx(settings.fontSize * 1.05, 9.5)}px` }}>
                                কৃতজ্ঞতা স্বীকার:
                              </h4>
                              <p style={{ fontSize: `${ptToPx(settings.fontSize * 0.9, 8.5)}px`, lineHeight: settings.lineHeight, color: '#334155', whiteSpace: 'pre-line' }}>
                                {settings.acknowledgement}
                              </p>
                            </div>
                          )}
                          {settings.glossary && (
                            <div style={{ marginTop: `${10 * currentScale}px`, borderTop: '1px solid #e2e8f0', paddingTop: `${8 * currentScale}px` }}>
                              <h4 style={{ margin: '0 0 4px', color: '#1e293b', fontSize: `${ptToPx(settings.fontSize * 1.05, 9.5)}px` }}>
                                শব্দকোষ ও টীকা:
                              </h4>
                              <p style={{ fontSize: `${ptToPx(settings.fontSize * 0.9, 8.5)}px`, lineHeight: settings.lineHeight, color: '#334155', whiteSpace: 'pre-line' }}>
                                {settings.glossary}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Main Chapter Opening Page */
                        <>
                          {renderChapterHeader(currentChapter.title || (lang === 'bn' ? 'অধ্যায় ১: সাক্ষাৎকার ও প্রথম চাকরির প্রস্তুতি' : 'Chapter 1'), currentChapterIdx + 1)}
                          <div className="page-body-content">
                            {blocks.slice(0, isExpanded ? 24 : 12).map((b, idx) => renderBlock(b, idx))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Running Footer with Dynamic Placement */}
                    {pos !== 'none' && !pos.startsWith('top') && (
                      <div className={`book-running-footer ${pos === 'bottom-center' ? 'center' : 'right'}`}>
                        <span>{formatPageNum(currentSection === 'front' ? 3 : currentSection === 'toc' ? 5 : currentSection === 'back' ? estimatedPages : currentChapterIdx * 2 + 3)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SINGLE PAGE VIEW */}
            {previewMode === 'single' && (
              <div className="book-single-stage">
                <div
                  className="book-page-sheet single"
                  style={{
                    width: `${pageW}px`,
                    minHeight: `${pageH}px`,
                    padding: `${padTop + extra * currentScale}px ${padOut}px ${padBot}px ${padIn}px`,
                    fontFamily: settings.fontFamily,
                    position: 'relative',
                  }}
                >
                  {renderSafeZoneOverlay(false)}

                  <div className="book-running-header center">
                    <span>{currentChapter.title || project.title}</span>
                  </div>

                  {renderChapterHeader(currentChapter.title || (lang === 'bn' ? 'অধ্যায় ১: সাক্ষাৎকার ও প্রথম চাকরির প্রস্তুতি' : 'Chapter 1'), currentChapterIdx + 1)}

                  <div className="page-body-content">
                    {blocks.map((b, idx) => renderBlock(b, idx))}
                  </div>

                  {pos !== 'none' && !pos.startsWith('top') && (
                    <div className={`book-running-footer ${pos === 'bottom-outside' ? 'right' : 'center'}`}>
                      <span>{formatPageNum(currentChapterIdx + 1)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {deviceMode === 'kindle' && (
              <div className="kindle-reading-footer">
                <span>অধ্যায় {currentChapterIdx + 1} / {chapters.length}</span>
                <span>পৃষ্ঠা ১২ / {estimatedPages} · ৩ মিনিট বাকি</span>
                <span>২৪%</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Metadata Bar */}
      <div className="book-preview-footer-meta">
        <span>
          📏 {trim.w} × {trim.h} mm ({settings.pageSize})
        </span>
        <span> · 🔤 {settings.fontFamily}</span>
        <span> · 📄 আনুমানিক {estimatedPages} পৃষ্ঠা</span>
        <span> · 📐 স্পাইন: {calculatedSpine} mm</span>
      </div>
    </div>
  );
}

