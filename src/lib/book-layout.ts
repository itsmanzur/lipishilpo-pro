export type PagePreset = 'A5' | 'A4' | 'B5' | 'US_Trade' | 'Digest' | 'custom';
export type RunningHeader = 'none' | 'title' | 'author' | 'split';
export type NumberFormat = 'bn' | 'en';
export type TextAlign = 'justify' | 'left';
export type CalloutTheme = 'emerald' | 'sky' | 'amber' | 'slate';
export type BookThemePreset = 'nonfiction' | 'classic' | 'islamic' | 'minimal' | 'poetry' | 'custom';
export type ChapterStartSide = 'recto' | 'any';

export type BookSettings = {
  // Imprint & Publication Metadata
  author: string;
  publisher: string;
  year: string;
  isbn: string;
  price: string;
  coverDesigner: string;
  compositor: string;
  printer: string;
  dedication: string;
  copyrightNote: string;

  // Front & Back Matter
  prefaceTitle: string;
  prefaceText: string;
  authorBio: string;
  otherBooks: string;
  includeToc: boolean;

  // Book Layout & Paper
  pageSize: PagePreset;
  customWidthMm: number;
  customHeightMm: number;
  paperGsm: 70 | 80 | 100;
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  textAlign: TextAlign;
  numberFormat: NumberFormat;
  chapterStartSide: ChapterStartSide;

  // Margins
  marginInnerMm: number;
  marginOuterMm: number;
  marginTopMm: number;
  marginBottomMm: number;
  firstLineIndentMm: number;

  // Visual Theme & Colors
  themePreset: BookThemePreset;
  runningHeader: RunningHeader;
  chapterHeadingColor: string;
  subheadingColor: string;
  calloutTheme: CalloutTheme;
  quoteBorderColor: string;
  showChapterDecor: boolean;
  dropCap: boolean;

  // Cover & Print Specs
  bleedMm: number;
  includeCropMarks: boolean;
  coverSubtitle: string;
  coverColor: string;
};

export const PAGE_PRESETS: Record<Exclude<PagePreset, 'custom'>, { w: number; h: number; label: string }> = {
  A5: { w: 148, h: 210, label: 'A5 — 148×210 mm (স্ট্যান্ডার্ড বাংলা বই)' },
  B5: { w: 176, h: 250, label: 'B5 — 176×250 mm (বড় সাইজের টেক্সটবুক/ননফিকশন)' },
  US_Trade: { w: 152.4, h: 228.6, label: 'US Trade — 6×9 in (উপন্যাস ও আন্তর্জাতিক সাইজ)' },
  Digest: { w: 139.7, h: 215.9, label: 'Digest — 5.5×8.5 in (পকেট/কমপ্যাক্ট বই)' },
  A4: { w: 210, h: 297, label: 'A4 — 210×297 mm (ম্যানুস্ক্রিপ্ট/ডকুমেন্ট)' },
};

export const CALLOUT_THEMES: Record<CalloutTheme, { bg: string; border: string; title: string; label: string }> = {
  emerald: { bg: '#ecfdf5', border: '#a7f3d0', title: '#065f46', label: 'ইসলামি / সবুজ (Emerald)' },
  sky: { bg: '#f0f9ff', border: '#bae6fd', title: '#0369a1', label: 'তথ্য / আকাশী (Sky)' },
  amber: { bg: '#fffbeb', border: '#fde68a', title: '#92400e', label: 'টিপস / সোনালী (Amber)' },
  slate: { bg: '#f8fafc', border: '#cbd5e1', title: '#334155', label: 'ক্লাসিক / ধূসর (Slate)' },
};

export const BOOK_THEMES: Record<
  BookThemePreset,
  {
    name: string;
    description: string;
    icon: string;
    settings: Partial<BookSettings>;
  }
> = {
  nonfiction: {
    name: 'নন-ফিকশন ও আত্মউন্নয়ন',
    description: 'নীল অধ্যায় শিরোনাম, সবুজ তথ্য বক্স, উদ্ধৃতি বার ও চেকলিস্ট হেডিং',
    icon: '💼',
    settings: {
      fontFamily: 'Noto Serif Bengali',
      chapterHeadingColor: '#1a56db',
      subheadingColor: '#166534',
      calloutTheme: 'emerald',
      quoteBorderColor: '#1a56db',
      showChapterDecor: true,
      dropCap: false,
      fontSize: 12,
      lineHeight: 1.55,
      textAlign: 'justify',
      runningHeader: 'split',
    },
  },
  classic: {
    name: 'ক্লাসিক সাহিত্য ও উপন্যাস',
    description: 'ঐতিহ্যবাহী অলঙ্করণ, ড্রপ-ক্যাপ, ক্ল্যাসিক সেরিপ ফন্ট ও গভীর মার্জিন',
    icon: '🏛️',
    settings: {
      fontFamily: 'Noto Serif Bengali',
      chapterHeadingColor: '#111827',
      subheadingColor: '#374151',
      calloutTheme: 'slate',
      quoteBorderColor: '#64748b',
      showChapterDecor: true,
      dropCap: true,
      fontSize: 12,
      lineHeight: 1.6,
      textAlign: 'justify',
      runningHeader: 'split',
    },
  },
  islamic: {
    name: 'ইসলামিক ও গবেষণা গ্রন্থ',
    description: 'কুরআন-হাদিসের বিশেষ বক্স, আরবি-বাংলা ডুয়াল স্টাইলিং ও তথ্যসূত্র',
    icon: '🌿',
    settings: {
      fontFamily: 'Noto Serif Bengali',
      chapterHeadingColor: '#065f46',
      subheadingColor: '#047857',
      calloutTheme: 'emerald',
      quoteBorderColor: '#059669',
      showChapterDecor: true,
      dropCap: false,
      fontSize: 12.5,
      lineHeight: 1.6,
      textAlign: 'justify',
      runningHeader: 'split',
    },
  },
  minimal: {
    name: 'আধুনিক মিনিমালিস্ট',
    description: 'পরিচ্ছন্ন সান্স-সেরিফ হেডিং, ছিমছাম লেআউট ও আধুনিক পেজিং',
    icon: '🚀',
    settings: {
      fontFamily: 'Hind Siliguri',
      chapterHeadingColor: '#0f172a',
      subheadingColor: '#0284c7',
      calloutTheme: 'sky',
      quoteBorderColor: '#0284c7',
      showChapterDecor: false,
      dropCap: false,
      fontSize: 11.5,
      lineHeight: 1.5,
      textAlign: 'justify',
      runningHeader: 'title',
    },
  },
  poetry: {
    name: 'কবিতা ও নাট্যগ্রন্থ',
    description: 'কেন্দ্রমুখী পংক্তি, প্রমিত স্পেসিং ও মার্জিত ইতালীয় স্টাইল',
    icon: '📜',
    settings: {
      fontFamily: 'Tiro Bangla',
      chapterHeadingColor: '#475569',
      subheadingColor: '#334155',
      calloutTheme: 'slate',
      quoteBorderColor: '#94a3b8',
      showChapterDecor: true,
      dropCap: false,
      fontSize: 13,
      lineHeight: 1.8,
      textAlign: 'left',
      firstLineIndentMm: 0,
      runningHeader: 'title',
    },
  },
  custom: {
    name: 'কাস্টম ডিজাইন',
    description: 'নিজের মতো করে রঙ, ফন্ট এবং মার্জিন কনফিগার করুন',
    icon: '⚙️',
    settings: {},
  },
};

export const defaultBookSettings: BookSettings = {
  author: '',
  publisher: '',
  year: String(new Date().getFullYear()),
  isbn: '',
  price: '',
  coverDesigner: '',
  compositor: '',
  printer: '',
  dedication: '',
  copyrightNote: '',

  prefaceTitle: 'ভূমিকা',
  prefaceText: '',
  authorBio: '',
  otherBooks: '',
  includeToc: true,

  pageSize: 'A5',
  customWidthMm: 140,
  customHeightMm: 210,
  paperGsm: 80,
  fontSize: 12,
  lineHeight: 1.5,
  fontFamily: 'Noto Serif Bengali',
  textAlign: 'justify',
  numberFormat: 'bn',
  chapterStartSide: 'recto',

  marginInnerMm: 20,
  marginOuterMm: 16,
  marginTopMm: 18,
  marginBottomMm: 20,
  firstLineIndentMm: 5,

  themePreset: 'nonfiction',
  runningHeader: 'split',
  chapterHeadingColor: '#1a56db',
  subheadingColor: '#166534',
  calloutTheme: 'emerald',
  quoteBorderColor: '#64748b',
  showChapterDecor: true,
  dropCap: false,

  bleedMm: 0,
  includeCropMarks: false,
  coverSubtitle: '',
  coverColor: '#1e3d32',
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function trimSizeMm(s: BookSettings): { w: number; h: number } {
  if (s.pageSize === 'custom') {
    return {
      w: clamp(Number(s.customWidthMm) || 140, 90, 320),
      h: clamp(Number(s.customHeightMm) || 210, 120, 420),
    };
  }
  return PAGE_PRESETS[s.pageSize] ?? PAGE_PRESETS.A5;
}

export function markGutterMm(s: BookSettings) {
  return s.includeCropMarks ? 8 : 0;
}

export function sheetExtraMm(s: BookSettings) {
  return Math.max(0, Number(s.bleedMm) || 0) + markGutterMm(s);
}

export function mmToPt(mm: number) {
  return (mm * 72) / 25.4;
}

export function mmToTwip(mm: number) {
  return Math.round((mm * 1440) / 25.4);
}

export function sheetSizePt(s: BookSettings): { width: number; height: number } {
  const trim = trimSizeMm(s);
  const extra = sheetExtraMm(s);
  return {
    width: mmToPt(trim.w + extra * 2),
    height: mmToPt(trim.h + extra * 2),
  };
}

export function contentMarginsPt(
  s: BookSettings,
  verso = false,
): [number, number, number, number] {
  const extra = sheetExtraMm(s);
  const inner = mmToPt(s.marginInnerMm + extra);
  const outer = mmToPt(s.marginOuterMm + extra);
  const top = mmToPt(s.marginTopMm + extra);
  const bottom = mmToPt(s.marginBottomMm + extra + 4);
  return verso ? [outer, top, inner, bottom] : [inner, top, outer, bottom];
}

export function hasImprint(s: BookSettings) {
  return Boolean(s.publisher || s.year || s.isbn || s.copyrightNote || s.price || s.coverDesigner);
}

export function estimatePageCount(totalCharacters: number, s: BookSettings): number {
  const charsPerPage = s.fontSize <= 11 ? 1400 : s.fontSize <= 12 ? 1150 : 950;
  const bodyPages = Math.max(8, Math.ceil(totalCharacters / charsPerPage));
  const frontPages = 4 + (s.includeToc ? 2 : 0) + (s.prefaceText ? 2 : 0);
  const backPages = s.authorBio ? 2 : 0;
  let total = bodyPages + frontPages + backPages;
  if (total % 2 !== 0) total += 1;
  return total;
}

export function calculateSpineMm(pageCount: number, paperGsm: number): number {
  const pageThicknessMm = paperGsm === 70 ? 0.052 : paperGsm === 80 ? 0.06 : 0.075;
  const leafCount = Math.ceil(pageCount / 2);
  const spine = leafCount * pageThicknessMm;
  return Math.max(4, Math.min(80, Math.round(spine * 10) / 10));
}

export function validateSettings(s: BookSettings) {
  if (
    !s ||
    !['A5', 'A4', 'B5', 'US_Trade', 'Digest', 'custom'].includes(s.pageSize) ||
    ![10, 11, 11.5, 12, 12.5, 13, 14, 16].includes(s.fontSize) ||
    s.marginInnerMm < 10 ||
    s.marginInnerMm > 40 ||
    s.marginOuterMm < 10 ||
    s.marginOuterMm > 40 ||
    s.marginTopMm < 10 ||
    s.marginTopMm > 40 ||
    s.marginBottomMm < 10 ||
    s.marginBottomMm > 40 ||
    s.firstLineIndentMm < 0 ||
    s.firstLineIndentMm > 16 ||
    s.bleedMm < 0 ||
    s.bleedMm > 6 ||
    typeof s.author !== 'string' ||
    s.author.length > 200
  ) {
    throw new Error('বইয়ের ফরম্যাটের সেটিংস সঠিক নয়।');
  }
}

export function normalizeSettings(raw: Partial<BookSettings> & { marginMm?: number }): BookSettings {
  const fallback = raw.marginMm && raw.marginInnerMm == null
    ? raw.marginMm
    : defaultBookSettings.marginInnerMm;
  return {
    ...defaultBookSettings,
    ...raw,
    marginInnerMm: raw.marginInnerMm ?? fallback,
    marginOuterMm: raw.marginOuterMm ?? fallback,
    marginTopMm: raw.marginTopMm ?? fallback,
    marginBottomMm: raw.marginBottomMm ?? fallback,
    chapterHeadingColor: raw.chapterHeadingColor || defaultBookSettings.chapterHeadingColor,
    subheadingColor: raw.subheadingColor || defaultBookSettings.subheadingColor,
    calloutTheme: raw.calloutTheme || defaultBookSettings.calloutTheme,
    quoteBorderColor: raw.quoteBorderColor || defaultBookSettings.quoteBorderColor,
    themePreset: raw.themePreset || defaultBookSettings.themePreset,
    year: raw.year || defaultBookSettings.year,
    coverColor: raw.coverColor || defaultBookSettings.coverColor,
    fontFamily: raw.fontFamily || defaultBookSettings.fontFamily,
    numberFormat: raw.numberFormat || defaultBookSettings.numberFormat,
    textAlign: raw.textAlign || defaultBookSettings.textAlign,
    paperGsm: raw.paperGsm || defaultBookSettings.paperGsm,
    chapterStartSide: raw.chapterStartSide || defaultBookSettings.chapterStartSide,
  };
}
