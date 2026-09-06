export type PagePreset = 'A5' | 'A4' | 'B5' | 'US_Trade' | 'Digest' | 'custom';
export type RunningHeader = 'none' | 'title' | 'author' | 'split';

export type BookSettings = {
  author: string;
  publisher: string;
  year: string;
  isbn: string;
  dedication: string;
  copyrightNote: string;
  pageSize: PagePreset;
  customWidthMm: number;
  customHeightMm: number;
  fontSize: number;
  lineHeight: number;
  marginInnerMm: number;
  marginOuterMm: number;
  marginTopMm: number;
  marginBottomMm: number;
  firstLineIndentMm: number;
  includeToc: boolean;
  runningHeader: RunningHeader;
  bleedMm: number;
  includeCropMarks: boolean;
  coverSubtitle: string;
  coverColor: string;
};

export const PAGE_PRESETS: Record<Exclude<PagePreset, 'custom'>, { w: number; h: number }> = {
  A5: { w: 148, h: 210 },
  A4: { w: 210, h: 297 },
  B5: { w: 176, h: 250 },
  US_Trade: { w: 152.4, h: 228.6 },
  Digest: { w: 139.7, h: 215.9 },
};

export const defaultBookSettings: BookSettings = {
  author: '',
  publisher: '',
  year: String(new Date().getFullYear()),
  isbn: '',
  dedication: '',
  copyrightNote: '',
  pageSize: 'A5',
  customWidthMm: 140,
  customHeightMm: 210,
  fontSize: 12,
  lineHeight: 1.5,
  marginInnerMm: 20,
  marginOuterMm: 16,
  marginTopMm: 18,
  marginBottomMm: 20,
  firstLineIndentMm: 5,
  includeToc: true,
  runningHeader: 'split',
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
  return Boolean(s.publisher || s.year || s.isbn || s.copyrightNote);
}

export function validateSettings(s: BookSettings) {
  if (
    !s ||
    !['A5', 'A4', 'B5', 'US_Trade', 'Digest', 'custom'].includes(s.pageSize) ||
    ![10, 11, 12, 13, 14, 16].includes(s.fontSize) ||
    ![1.3, 1.5, 1.8].includes(s.lineHeight) ||
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
    year: raw.year || defaultBookSettings.year,
    coverColor: raw.coverColor || defaultBookSettings.coverColor,
  };
}
