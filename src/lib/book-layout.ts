export type PagePreset = 'A5' | 'A4' | 'B5' | 'US_Trade' | 'Digest' | 'custom';
export type RunningHeader = 'none' | 'title' | 'author' | 'split';
export type NumberFormat = 'bn' | 'en';
export type TextAlign = 'justify' | 'left';
export type CalloutTheme = 'emerald' | 'sky' | 'amber' | 'slate';
export type BookThemePreset = 'nonfiction' | 'classic' | 'islamic' | 'minimal' | 'poetry' | 'custom';
export type ChapterStartSide = 'recto' | 'any';
export type PageNumberPosition = 'bottom-outside' | 'bottom-center' | 'top-outside' | 'top-center' | 'none';
export type PageNumberStyle = 'plain' | 'dash' | 'bracket' | 'motif' | 'circle';
export type TocPreset = 'classic-dots' | 'modern-big' | 'ornamented' | 'summary' | 'minimal';
export type ChapterHeaderStyle = 'classic' | 'modern-minimal' | 'ornament-frame' | 'drop-num';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export function toBengaliNumerals(val: number | string): string {
  return String(val).replace(/\d/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

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
  tocPreset: TocPreset;

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

  // Page Numbering & Headers
  pageNumberPosition: PageNumberPosition;
  pageNumberStyle: PageNumberStyle;
  runningHeader: RunningHeader;
  chapterHeaderStyle: ChapterHeaderStyle;

  // Margins
  marginInnerMm: number;
  marginOuterMm: number;
  marginTopMm: number;
  marginBottomMm: number;
  firstLineIndentMm: number;

  // Visual Theme & Colors
  themePreset: BookThemePreset;
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

export const PAGE_NUMBER_POSITIONS: Record<PageNumberPosition, { label: string; desc: string; description: string }> = {
  'bottom-outside': { label: 'নিচে বাইরে (স্ট্যান্ডার্ড)', desc: 'বাম পাতায় নিচে-বামে এবং ডান পাতায় নিচে-ডানে', description: 'বাম পাতায় নিচে-বামে এবং ডান পাতায় নিচে-ডানে' },
  'bottom-center': { label: 'নিচে মাঝে (সেন্টার)', desc: 'প্রতিটি পৃষ্ঠার নিচের মাঝামাঝি অংশে', description: 'প্রতিটি পৃষ্ঠার নিচের মাঝামাঝি অংশে' },
  'top-outside': { label: 'উপরে বাইরে (হেডারে)', desc: 'রানিং হেডারের সাথে পৃষ্ঠার উপরের কোণে', description: 'রানিং হেডারের সাথে পৃষ্ঠার উপরের কোণে' },
  'top-center': { label: 'উপরে মাঝে (হেডারে)', desc: 'রানিং হেডারের সাথে উপরের মাঝে', description: 'রানিং হেডারের সাথে উপরের মাঝে' },
  'none': { label: 'নম্বর নেই (বন্ধ)', desc: 'কোনো পৃষ্ঠা নম্বর প্রদর্শিত হবে না', description: 'কোনো পৃষ্ঠা নম্বর প্রদর্শিত হবে না' },
};

export const PAGE_NUMBER_STYLES: Record<PageNumberStyle, { label: string; example: string; sample: string }> = {
  plain: { label: 'সাধারণ সংখ্যা', example: '১, ২, ৩', sample: '১' },
  dash: { label: 'ড্যাশ ও হাইফেন', example: '— ১ —, — ২ —', sample: '— ১ —' },
  bracket: { label: 'ক্লাসিক বন্ধনী', example: '[ ১ ], [ ২ ]', sample: '[ ১ ]' },
  motif: { label: 'অলঙ্কৃত প্রতীক (❖)', example: '❖ ১ ❖, ❖ ২ ❖', sample: '❖ ১ ❖' },
  circle: { label: 'বুলেট ডট (•)', example: '• ১ •, • ২ •', sample: '• ১ •' },
};

export const TOC_PRESETS: Record<
  TocPreset,
  {
    name: string;
    label: string;
    description: string;
    icon: string;
  }
> = {
  'classic-dots': {
    name: '১. ক্লাসিক ডট লিডার',
    label: 'ক্লাসিক ডটেড লিডার',
    description: 'ঐতিহ্যবাহী ডটেড লাইন লিডার ও ডান-বিন্যস্ত পৃষ্ঠা নম্বর (উপন্যাস ও সাহিত্য)',
    icon: '📜',
  },
  'modern-big': {
    name: '২. মডার্ন বিগ নিউমেরাল',
    label: 'মডার্ন বিগ নিউমেরাল',
    description: 'বড় বোল্ড সংখ্যা (০১, ০২) ও পরিচ্ছন্ন শিরোনাম (নন-ফিকশন ও ক্যারিয়ার)',
    icon: '🚀',
  },
  'ornamented': {
    name: '৩. অলঙ্কৃত সাহিত্যিক',
    label: 'অলঙ্কৃত সাহিত্যিক',
    description: 'অধ্যায়ের শুরুতে মার্জিত প্রকাশনা মোটিফ ও ডিভাইডার (ক্লাসিক ও ধর্মীয় গ্রন্থ)',
    icon: '❖',
  },
  'summary': {
    name: '৪. ম্যাগাজিন ও সারাংশ সূচি',
    label: 'সারাংশ সূচিপত্র',
    description: 'অধ্যায় শিরোনামের সাথে ছোট এক লাইনের সারাংশ বিবরণী (গাইড ও প্রশিক্ষণ)',
    icon: '📑',
  },
  'minimal': {
    name: '৫. মিনিমালিস্ট ক্লিন গ্রিড',
    label: 'মিনিমালিস্ট পরিচ্ছন্ন',
    description: 'কোনো ডট ছাড়া স্নিগ্ধ ও পরিচ্ছন্ন আর্ট বুক লেআউট (আধুনিক ও কাব্যগ্রন্থ)',
    icon: '✨',
  },
};

export const CHAPTER_HEADER_STYLES: Record<
  ChapterHeaderStyle,
  {
    name: string;
    label: string;
    description: string;
  }
> = {
  'classic': {
    name: 'ক্লাসিক সাহিত্যিক (Classic)',
    label: 'ক্লাসিক সাহিত্যিক',
    description: 'ঐতিহ্যবাহী শিরোনাম ও নিচে অলঙ্কৃত মোটিফ ডিভাইডার',
  },
  'modern-minimal': {
    name: 'মডার্ন মিনিমাল (Modern Minimal)',
    label: 'মডার্ন মিনিমাল',
    description: 'আধুনিক অধ্যায় ট্যাগ, গাঢ় শিরোনাম ও অ্যাকসেন্ট আন্ডারলাইন বার',
  },
  'ornament-frame': {
    name: 'অলঙ্কৃত ভিন্টেজ ফ্রেম (Ornament Frame)',
    label: 'অলঙ্কৃত ভিন্টেজ ফ্রেম',
    description: 'মার্জিত চারকোনা অলঙ্কৃত বর্ডার ফ্রেমের ভেতরে শিরোনাম',
  },
  'drop-num': {
    name: 'বিগ ড্রপ নাম্বার (Drop Number)',
    label: 'বিগ ড্রপ নাম্বার',
    description: 'বড় স্টাইলিশ সংখ্যা (০১, ০২) এবং তার পাশে অধ্যায় শিরোনাম',
  },
};

export function formatStyledPageNumber(
  pageNum: number | string,
  style: PageNumberStyle = 'plain',
  numberFormat: 'bn' | 'en' = 'bn'
): string {
  const digits = numberFormat === 'bn' ? toBengaliNumerals(pageNum) : String(pageNum);
  switch (style) {
    case 'dash':
      return `— ${digits} —`;
    case 'bracket':
      return `[ ${digits} ]`;
    case 'motif':
      return `❖ ${digits} ❖`;
    case 'circle':
      return `• ${digits} •`;
    case 'plain':
    default:
      return digits;
  }
}

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
  tocPreset: 'classic-dots',

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

  pageNumberPosition: 'bottom-outside',
  pageNumberStyle: 'plain',
  runningHeader: 'split',
  chapterHeaderStyle: 'classic',

  marginInnerMm: 20,
  marginOuterMm: 16,
  marginTopMm: 18,
  marginBottomMm: 20,
  firstLineIndentMm: 5,

  themePreset: 'nonfiction',
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
    pageNumberPosition: raw.pageNumberPosition || defaultBookSettings.pageNumberPosition,
    pageNumberStyle: raw.pageNumberStyle || defaultBookSettings.pageNumberStyle,
    tocPreset: raw.tocPreset || defaultBookSettings.tocPreset,
    chapterHeaderStyle: raw.chapterHeaderStyle || defaultBookSettings.chapterHeaderStyle,
  };
}
