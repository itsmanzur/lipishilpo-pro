/** Fonts that both the studio preview and PDF/EPUB embed. */
export type BookFontId = 'Noto Serif Bengali' | 'Hind Siliguri' | 'Tiro Bangla';

export type BookFontSpec = {
  id: BookFontId;
  labelBn: string;
  labelEn: string;
  regular: string;
  bold: string;
};

export const BOOK_FONTS: BookFontSpec[] = [
  {
    id: 'Noto Serif Bengali',
    labelBn: 'Noto Serif Bengali — সাহিত্যিক সেরিফ (এক্সপোর্টে এমবেড)',
    labelEn: 'Noto Serif Bengali — literary serif (embedded in export)',
    regular: 'NotoSerifBengali-Regular.ttf',
    bold: 'NotoSerifBengali-Bold.ttf',
  },
  {
    id: 'Hind Siliguri',
    labelBn: 'Hind Siliguri — আধুনিক সান্স (এক্সপোর্টে এমবেড)',
    labelEn: 'Hind Siliguri — modern sans (embedded in export)',
    regular: 'HindSiliguri-Regular.ttf',
    bold: 'HindSiliguri-Regular.ttf',
  },
  {
    id: 'Tiro Bangla',
    labelBn: 'Tiro Bangla — ক্লাসিক প্রকাশনা (এক্সপোর্টে এমবেড)',
    labelEn: 'Tiro Bangla — classic publication (embedded in export)',
    regular: 'TiroBangla-Regular.ttf',
    bold: 'TiroBangla-Regular.ttf',
  },
];

const ALIASES: Record<string, BookFontId> = {
  SolaimanLipi: 'Noto Serif Bengali',
  Kalpurush: 'Noto Serif Bengali',
  'Noto Serif Bengali': 'Noto Serif Bengali',
  'Hind Siliguri': 'Hind Siliguri',
  'Tiro Bangla': 'Tiro Bangla',
};

export function resolveBookFont(family: string | undefined): BookFontSpec {
  const id = ALIASES[family || ''] || 'Noto Serif Bengali';
  return BOOK_FONTS.find((f) => f.id === id) || BOOK_FONTS[0];
}

export function fontBases(): string[] {
  const root = document.getElementById('lipishilpo-root');
  const free = (root?.dataset.fontsUrl ?? '/fonts/').replace(/\/$/, '');
  const pro = (root?.dataset.proFontsUrl ?? '').replace(/\/$/, '');
  return [pro, free].filter(Boolean);
}
