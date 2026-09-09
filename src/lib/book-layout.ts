export type PagePreset =
  | 'banglabazar_demy8'
  | 'royal_size'
  | 'pocket_demy16'
  | 'A5'
  | 'US_Trade'
  | 'Digest'
  | 'B5'
  | 'A4'
  | 'custom';

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
export type SceneBreakMotif =
  | 'motifClassic'
  | 'motifFloral'
  | 'motifStars'
  | 'motifIslamic'
  | 'motifFleur'
  | 'motifAsterisk'
  | 'motifDiamond'
  | 'motifModernBar'
  | 'motifVine'
  | 'motifMinimalDots';
export type LeadInStyle = 'drop_cap' | 'bold_lead' | 'small_caps' | 'clean';

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
  edition: string;
  cipSubject: string;

  // Front & Back Matter
  halfTitle: string;
  epigraphText: string;
  epigraphSource: string;
  prefaceTitle: string;
  prefaceText: string;
  authorBio: string;
  otherBooks: string;
  acknowledgement: string;
  glossary: string;
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
  sceneBreakMotif: SceneBreakMotif;
  leadInStyle: LeadInStyle;

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
  backCoverBlurb: string;
  showBarcode: boolean;
  barcodeNumber: string;
  coverPrice: string;
  coverFinish: 'matte' | 'glossy';
  spineText: string;
  coverFrontImage: string;
  coverBackImage: string;
  coverShowTitle: boolean;
};

export const PAGE_PRESETS: Record<Exclude<PagePreset, 'custom'>, { w: number; h: number; label: string }> = {
  banglabazar_demy8: { w: 140, h: 215, label: 'বাংলাবাজার ডাবল ডিমাই ১/৮ — 140×215 mm (বাংলাদেশি প্রকাশনী স্ট্যান্ডার্ড)' },
  royal_size: { w: 155, h: 235, label: 'রয়্যাল সাইজ — 155×235 mm (হার্ডকভার, গবেষণা ও সাহিত্য সংকলন)' },
  pocket_demy16: { w: 115, h: 180, label: 'পকেট বই ডিমাই ১/১৬ — 115×180 mm (চটি ও পকেট বুক)' },
  A5: { w: 148, h: 210, label: 'A5 আন্তর্জাতিক — 148×210 mm (গ্লোবাল নন-ফিকশন ও একাডেমিক)' },
  US_Trade: { w: 152.4, h: 228.6, label: 'Amazon KDP US Trade — 6×9 in (আমাজন পেপারব্যাক স্ট্যান্ডার্ড)' },
  Digest: { w: 139.7, h: 215.9, label: 'Amazon KDP Digest — 5.5×8.5 in (আমাজন কমপ্যাক্ট বুক)' },
  B5: { w: 176, h: 250, label: 'B5 বড় টেক্সটবুক — 176×250 mm (পাঠ্যবই ও ম্যানুয়াল)' },
  A4: { w: 210, h: 297, label: 'A4 ম্যাগাজিন — 210×297 mm (ম্যাগাজিন ও ম্যানুস্ক্রিপ্ট)' },
};

export type PreflightIssue = {
  id: string;
  type: 'error' | 'warning' | 'info' | 'pass';
  title: string;
  message: string;
};

export function runPreflightInspection(
  settings: BookSettings,
  totalChars: number,
  chapterCount: number,
  unclosedBoxes = 0,
): {
  score: number;
  isPressReady: boolean;
  issues: PreflightIssue[];
} {
  const issues: PreflightIssue[] = [];
  const estPages = estimatePageCount(totalChars, settings);

  issues.push({
    id: 'checklist_scope',
    type: 'info',
    title: 'এটি লেআউট চেকলিস্ট',
    message: 'গাটার, ফন্ট, ক্রপ মার্ক ও মেটাডাটা দেখায়। প্রেসের bleed/overflow/imposition স্ক্যান নয় — সেটা প্রিন্টার করবে।',
  });

  // 1. Gutter Margin Check
  if (estPages > 280 && settings.marginInnerMm < 22) {
    issues.push({
      id: 'gutter_narrow_heavy',
      type: 'warning',
      title: 'ভেতরের গাটা মার্জিন কম',
      message: `বইটিতে আনুমানিক ${estPages} পৃষ্ঠা রয়েছে। বাইন্ডিংয়ের সময় লেখা লুকিয়ে যাওয়া রোধ করতে ভেতরের মার্জিন কমপক্ষে ২২ মিমি রাখা প্রয়োজন।`,
    });
  } else if (estPages > 140 && settings.marginInnerMm < 18) {
    issues.push({
      id: 'gutter_narrow_mid',
      type: 'warning',
      title: 'ভেতরের মার্জিন সতর্কতা',
      message: `মাঝারি আকারের বইয়ের (${estPages} পৃষ্ঠা) জন্য ভেতরের গাটা মার্জিন ২০ মিমি রাখা নিরাপদ।`,
    });
  } else {
    issues.push({
      id: 'gutter_ok',
      type: 'pass',
      title: 'বাইন্ডিং গাটা নিরাপদ',
      message: `ভেতরের মার্জিন (${settings.marginInnerMm} mm) বাইন্ডিং ও প্রেস কাটিংয়ের জন্য সম্পূর্ণ উপযুক্ত।`,
    });
  }

  // 2. Line Height & Typography Health
  if (settings.lineHeight < 1.4) {
    issues.push({
      id: 'line_height_tight',
      type: 'warning',
      title: 'লাইনের দূরত্ব কম',
      message: 'বাংলা যুক্তাক্ষর ও হ্রস্ব-ই/উ কার যেন একে অপরের গায়ে না লাগে সেজন্য লাইন হাইট ১.৪ বা তার বেশি রাখা উচিত।',
    });
  } else {
    issues.push({
      id: 'typography_ok',
      type: 'pass',
      title: 'টাইপোগ্রাফি সুষম',
      message: `ফন্ট সাইজ (${settings.fontSize} pt) ও লাইন স্পেসিং (${settings.lineHeight}) পড়ার জন্য অত্যন্ত আরামদায়ক।`,
    });
  }

  // 3. Bleed & Crop Marks Check
  if (settings.includeCropMarks) {
    issues.push({
      id: 'crop_marks_on',
      type: 'pass',
      title: 'কাটিং ক্রপ মার্কস অন',
      message: 'প্রেসে প্রিন্ট ও কাটিংয়ের জন্য ৩ মিমি কাটিং ব্লিড গাইড সক্রিয় রয়েছে।',
    });
  } else {
    issues.push({
      id: 'crop_marks_off',
      type: 'info',
      title: 'কাটিং মার্কস বন্ধ',
      message: 'লোকাল প্রেস থেকে ডাবল ডিমাই শিটে প্রিন্ট করতে চাইলে ক্রপ মার্কস অন রাখতে পারেন।',
    });
  }

  // 4. Table of Contents
  if (chapterCount >= 3 && !settings.includeToc) {
    issues.push({
      id: 'toc_missing',
      type: 'warning',
      title: 'সূচিপত্র বন্ধ রয়েছে',
      message: `বইটিতে ${chapterCount}টি অধ্যায় রয়েছে। পাঠকদের সুবিধার্থে স্বয়ংক্রিয় সূচিপত্র যোগ করার পরামর্শ দেওয়া হচ্ছে।`,
    });
  } else {
    issues.push({
      id: 'toc_ok',
      type: 'pass',
      title: 'সূচিপত্র ও নেভিগেশন',
      message: 'বইয়ের সূচিপত্র ও অধ্যায় কাঠামো সুসংগঠিত।',
    });
  }

  // 5. Imprint & Rights Metadata
  if (!settings.publisher && !settings.isbn) {
    issues.push({
      id: 'meta_incomplete',
      type: 'info',
      title: 'ইমপ্রিন্ট ও ISBN বাকি',
      message: 'বইটির অফিশিয়াল প্রকাশনার জন্য প্রকাশক ও ISBN নম্বর যুক্ত করুন।',
    });
  } else {
    issues.push({
      id: 'meta_ok',
      type: 'pass',
      title: 'প্রকাশনা স্বত্ব তথ্য',
      message: 'ইমপ্রিন্ট ও কপিরাইট মেটাডাটা সম্পূর্ণ রয়েছে।',
    });
  }

  if (unclosedBoxes > 0) {
    issues.push({
      id: 'unclosed_box',
      type: 'error',
      title: 'আনক্লোজড তথ্য বক্স',
      message: `${unclosedBoxes}টি :::box বন্ধ হয়নি (:::)। এক্সপোর্টে বক্স কেটে যেতে পারে — অধ্যায়ে শেষ মার্ক দিন।`,
    });
  }

  if (!settings.coverFrontImage) {
    issues.push({
      id: 'cover_art',
      type: 'info',
      title: 'কভার আর্ট নেই',
      message: 'এখন রং ও লেখায় প্রচ্ছদ হচ্ছে। প্রকাশকের আর্ট থাকলে স্টুডিওতে ছবি তুলুন।',
    });
  }

  const warnings = issues.filter((i) => i.type === 'warning').length;
  const errors = issues.filter((i) => i.type === 'error').length;
  const score = Math.max(0, 100 - warnings * 12 - errors * 25);
  const isPressReady = false;

  return { score, isPressReady, issues };
}

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

export const SCENE_BREAK_MOTIFS: Record<
  SceneBreakMotif,
  { label: string; symbol: string; desc: string }
> = {
  motifClassic: { label: '১. ক্লাসিক রম্বস (Classic)', symbol: '❖ — ❖ — ❖', desc: 'ঐতিহ্যবাহী প্রকাশনী স্ট্যান্ডার্ড' },
  motifFloral: { label: '২. ফ্লোরাল ফ্লুরন (Floral)', symbol: '❧ — ❦ — ❧', desc: 'কাব্য ও সাহিত্যিক উপন্যাস' },
  motifStars: { label: '৩. ট্রিপল নক্ষত্র (Stars)', symbol: '✦ — ✧ — ✦', desc: 'বিজ্ঞান কল্পকাহিনী ও কিশোর সাহিত্য' },
  motifIslamic: { label: '৪. ইসলামিক রুব এল-হিযব (Islamic)', symbol: '۞ — ۩ — ۞', desc: 'ইসলামি ও ঐতিহাসিক গ্রন্থ' },
  motifFleur: { label: '৫. রয়্যাল লিলি (Fleur-de-lis)', symbol: '⚜ — ⚜ — ⚜', desc: 'গবেষণা ও অভিজাত গ্রন্থ' },
  motifAsterisk: { label: '৬. অলঙ্কৃত অ্যাস্টেরিস্ক (Asterisk)', symbol: '❋ — ❋ — ❋', desc: 'আন্তর্জাতিক পেপারব্যাক' },
  motifDiamond: { label: '৭. ডায়মন্ড গ্রিড (Diamond)', symbol: '◈ — ◇ — ◈', desc: 'নন-ফিকশন ও প্রবন্ধ' },
  motifModernBar: { label: '৮. মডার্ন সলিড বার (Modern)', symbol: '■ — ■ — ■', desc: 'আধুনিক থ্রিলার ও ব্যবসা' },
  motifVine: { label: '৯. আইভি ভাইন (Vine)', symbol: '✤ — ⁘ — ✤', desc: 'প্রকৃতি, পরিবেশ ও ভ্রমণকাহিনি' },
  motifMinimalDots: { label: '১০. মিনিমালিস্ট ডটস (Dots)', symbol: '• • •', desc: 'পরিচ্ছন্ন ছিমছাম মিনিমাল' },
};

export const LEAD_IN_STYLES: Record<
  LeadInStyle,
  { label: string; desc: string; sample: string }
> = {
  drop_cap: { label: 'আলংকারিক ড্রপ-ক্যাপ (Drop Cap)', desc: 'প্রথম অক্ষরটি ৩ লাইন সমান বড় ও আকর্ষণীয়', sample: 'পাণ্ডুলিপির শুরুতে...' },
  bold_lead: { label: 'বোল্ড লিড-ইন (Bold Lead)', desc: 'প্রথম ৩-৪টি শব্দ গাঢ় ও লক্ষণীয়', sample: 'প্রথম অধ্যায়ের শুরুতে...' },
  small_caps: { label: 'স্মল ক্যাপস ও স্পেসড (Small Caps)', desc: 'প্রথম শব্দ বড় ও অক্ষরের মাঝে ফাঁকা', sample: 'অ ধ্যা য় ১ —' },
  clean: { label: 'স্বাভাবিক প্রমিত (Clean)', desc: 'কোনো অতিরিক্ত অলঙ্করণ ছাড়া সাধারণ অনুচ্ছেদ', sample: 'সাধারণ অনুচ্ছেদ...' },
};

export function calculateEan13Checksum(raw12: string): number {
  const digits = raw12.replace(/\D/g, '').slice(0, 12).padEnd(12, '0').split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }
  const mod = sum % 10;
  return mod === 0 ? 0 : 10 - mod;
}

function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export type Ean13Layout = {
  binary: string;
  full13: string;
  first: string;
  leftText: string;
  rightText: string;
  price: string;
  barW: number;
  startX: number;
  hMain: number;
  hGuard: number;
  totalW: number;
  totalH: number;
};

export function layoutEan13(rawInput: string, priceTag?: string): Ean13Layout {
  const clean = String(rawInput || '').replace(/\D/g, '');
  let full13 = clean;
  if (clean.length === 12) {
    full13 = clean + calculateEan13Checksum(clean);
  } else if (clean.length < 13) {
    const padded = clean.padEnd(12, '0');
    full13 = padded + calculateEan13Checksum(padded);
  } else {
    full13 = clean.slice(0, 13);
  }

  const L_CODES = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
  const G_CODES = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'];
  const R_CODES = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100'];

  const PARITY: Record<number, string[]> = {
    0: ['L', 'L', 'L', 'L', 'L', 'L'],
    1: ['L', 'L', 'G', 'L', 'G', 'G'],
    2: ['L', 'L', 'G', 'G', 'L', 'G'],
    3: ['L', 'L', 'G', 'G', 'G', 'L'],
    4: ['L', 'G', 'L', 'L', 'G', 'G'],
    5: ['L', 'G', 'G', 'L', 'L', 'G'],
    6: ['L', 'G', 'G', 'G', 'L', 'L'],
    7: ['L', 'G', 'L', 'G', 'L', 'G'],
    8: ['L', 'G', 'L', 'G', 'G', 'L'],
    9: ['L', 'G', 'G', 'L', 'G', 'L'],
  };

  const d = full13.split('').map(Number);
  const first = d[0];
  const parity = PARITY[first] || PARITY[0];

  // Start guard: 101
  let binary = '101';

  // Left 6 digits
  for (let i = 0; i < 6; i++) {
    const digit = d[i + 1];
    const type = parity[i];
    binary += type === 'L' ? L_CODES[digit] : G_CODES[digit];
  }

  // Center guard: 01010
  binary += '01010';

  // Right 6 digits (always R)
  for (let i = 0; i < 6; i++) {
    const digit = d[i + 7];
    binary += R_CODES[digit];
  }

  // End guard: 101
  binary += '101';

  const barW = 1.4;
  const hMain = 38;
  const hGuard = 44;
  const startX = 16;
  const price = String(priceTag || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 40);
  const totalW = startX + binary.length * barW + 16;
  const totalH = hGuard + 18 + (price ? 14 : 0);

  return {
    binary,
    full13,
    first: String(first),
    leftText: full13.slice(1, 7),
    rightText: full13.slice(7),
    price,
    barW,
    startX,
    hMain,
    hGuard,
    totalW,
    totalH,
  };
}

export function generateEan13Svg(rawInput: string, priceTag?: string): string {
  const layout = layoutEan13(rawInput, priceTag);
  let rects = '';
  for (let i = 0; i < layout.binary.length; i++) {
    if (layout.binary[i] === '1') {
      const isGuard = i < 3 || (i >= 45 && i < 50) || i >= 92;
      const h = isGuard ? layout.hGuard : layout.hMain;
      rects += `<rect x="${(layout.startX + i * layout.barW).toFixed(2)}" y="6" width="${layout.barW.toFixed(2)}" height="${h}" fill="#111827" />`;
    }
  }

  const safePrice = escapeSvgText(layout.price);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${layout.totalW} ${layout.totalH}" width="${layout.totalW}" height="${layout.totalH}" style="background:#ffffff; border-radius:4px; padding:4px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <rect width="${layout.totalW}" height="${layout.totalH}" fill="#ffffff"/>
    ${rects}
    <text x="${layout.startX - 7}" y="42" font-family="monospace" font-size="9" font-weight="bold" fill="#111827">${escapeSvgText(layout.first)}</text>
    <text x="${layout.startX + 18}" y="${layout.hGuard + 10}" font-family="monospace" font-size="8.5" font-weight="bold" fill="#111827" letter-spacing="1.5">${escapeSvgText(layout.leftText)}</text>
    <text x="${layout.startX + 78}" y="${layout.hGuard + 10}" font-family="monospace" font-size="8.5" font-weight="bold" fill="#111827" letter-spacing="1.5">${escapeSvgText(layout.rightText)}</text>
    ${layout.price ? `<text x="${layout.totalW / 2}" y="${layout.totalH - 3}" font-family="sans-serif" font-size="8" font-weight="700" text-anchor="middle" fill="#475569">মূল্য: ${safePrice}</text>` : ''}
  </svg>`;

  return svg;
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
  edition: '',
  cipSubject: '',

  halfTitle: '',
  epigraphText: '',
  epigraphSource: '',
  prefaceTitle: 'ভূমিকা',
  prefaceText: '',
  authorBio: '',
  otherBooks: '',
  acknowledgement: '',
  glossary: '',
  includeToc: true,
  tocPreset: 'classic-dots',

  pageSize: 'banglabazar_demy8',
  customWidthMm: 140,
  customHeightMm: 215,
  paperGsm: 80,
  fontSize: 12,
  lineHeight: 1.55,
  fontFamily: 'Noto Serif Bengali',
  textAlign: 'justify',
  numberFormat: 'bn',
  chapterStartSide: 'recto',

  pageNumberPosition: 'bottom-outside',
  pageNumberStyle: 'plain',
  runningHeader: 'split',
  chapterHeaderStyle: 'classic',
  sceneBreakMotif: 'motifClassic',
  leadInStyle: 'drop_cap',

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
  backCoverBlurb: '',
  showBarcode: true,
  barcodeNumber: '9789849123456',
  coverPrice: '৳ ৩৫০',
  coverFinish: 'matte',
  spineText: '',
  coverFrontImage: '',
  coverBackImage: '',
  coverShowTitle: true,
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
  return PAGE_PRESETS[s.pageSize] ?? PAGE_PRESETS.banglabazar_demy8;
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
  return Boolean(s.publisher || s.year || s.isbn || s.copyrightNote || s.price || s.coverDesigner || s.edition);
}

export function estimatePageCount(totalCharacters: number, s: BookSettings): number {
  const charsPerPage = s.fontSize <= 11 ? 1400 : s.fontSize <= 12 ? 1150 : 950;
  const bodyPages = Math.max(8, Math.ceil(totalCharacters / charsPerPage));
  const frontPages = 4 + (s.includeToc ? 2 : 0) + (s.prefaceText ? 2 : 0) + (s.epigraphText ? 2 : 0);
  const backPages = (s.authorBio ? 2 : 0) + (s.glossary ? 2 : 0) + (s.acknowledgement ? 2 : 0);
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
    !['banglabazar_demy8', 'royal_size', 'pocket_demy16', 'A5', 'A4', 'B5', 'US_Trade', 'Digest', 'custom'].includes(s.pageSize) ||
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
    fontFamily: ['Noto Serif Bengali', 'Hind Siliguri', 'Tiro Bangla'].includes(String(raw.fontFamily))
      ? String(raw.fontFamily)
      : defaultBookSettings.fontFamily,
    numberFormat: raw.numberFormat || defaultBookSettings.numberFormat,
    textAlign: raw.textAlign || defaultBookSettings.textAlign,
    paperGsm: raw.paperGsm || defaultBookSettings.paperGsm,
    chapterStartSide: raw.chapterStartSide || defaultBookSettings.chapterStartSide,
    pageNumberPosition: raw.pageNumberPosition || defaultBookSettings.pageNumberPosition,
    pageNumberStyle: raw.pageNumberStyle || defaultBookSettings.pageNumberStyle,
    tocPreset: raw.tocPreset || defaultBookSettings.tocPreset,
    chapterHeaderStyle: raw.chapterHeaderStyle || defaultBookSettings.chapterHeaderStyle,
    sceneBreakMotif: raw.sceneBreakMotif || defaultBookSettings.sceneBreakMotif,
    leadInStyle: raw.leadInStyle || defaultBookSettings.leadInStyle,
    backCoverBlurb: raw.backCoverBlurb ?? defaultBookSettings.backCoverBlurb,
    showBarcode: raw.showBarcode ?? defaultBookSettings.showBarcode,
    barcodeNumber: raw.barcodeNumber || defaultBookSettings.barcodeNumber,
    coverPrice: (raw.coverPrice || defaultBookSettings.coverPrice).slice(0, 40),
    coverFinish: raw.coverFinish || defaultBookSettings.coverFinish,
    spineText: raw.spineText || defaultBookSettings.spineText,
    coverFrontImage: typeof raw.coverFrontImage === 'string' ? raw.coverFrontImage : '',
    coverBackImage: typeof raw.coverBackImage === 'string' ? raw.coverBackImage : '',
    coverShowTitle: raw.coverShowTitle !== false,
    halfTitle: raw.halfTitle || defaultBookSettings.halfTitle,
    epigraphText: raw.epigraphText || defaultBookSettings.epigraphText,
    epigraphSource: raw.epigraphSource || defaultBookSettings.epigraphSource,
    acknowledgement: raw.acknowledgement || defaultBookSettings.acknowledgement,
    glossary: raw.glossary || defaultBookSettings.glossary,
    edition: raw.edition || defaultBookSettings.edition,
    cipSubject: raw.cipSubject || defaultBookSettings.cipSubject,
  };
}
