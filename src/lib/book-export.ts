/* oxlint-disable eslint/no-control-regex -- Strip characters invalid in XML and download filenames. */
import { zipSync, strToU8 } from 'fflate';
import { escapeXml as xml, type Project, validateProject } from './manuscript';
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import {
  type BookSettings,
  CALLOUT_THEMES,
  contentMarginsPt,
  defaultBookSettings,
  hasImprint,
  mmToPt,
  mmToTwip,
  sheetExtraMm,
  sheetSizePt,
  trimSizeMm,
  validateSettings,
} from './book-layout';
import { parseChapterContent, toBengaliNumerals, type BookBlock } from './book-parser';

export type { BookSettings } from './book-layout';
export { defaultBookSettings, validateSettings } from './book-layout';

export type FontFiles = {
  regular: Uint8Array;
  bold: Uint8Array;
  license: Uint8Array;
  latin: Uint8Array;
  latinBold: Uint8Array;
};

export function paragraphs(text: string) {
  return text.replace(/\r\n?/g, '\n').split('\n');
}

function createBookId() {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  const bytes = new Uint8Array(16);
  c?.getRandomValues?.(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function fetchFont(base: string, name: string): Promise<Uint8Array | null> {
  const r = await fetch(`${base}/${name}`);
  if (!r.ok) return null;
  return new Uint8Array(await r.arrayBuffer());
}

export async function loadFonts(): Promise<FontFiles> {
  const root = document.getElementById('lipishilpo-root');
  const fontsBase = (root?.dataset.fontsUrl ?? '/fonts/').replace(/\/$/, '');

  const [regular, boldTry, license, latin, latinBoldTry] = await Promise.all([
    fetchFont(fontsBase, 'NotoSerifBengali-Regular.ttf'),
    fetchFont(fontsBase, 'NotoSerifBengali-Bold.ttf'),
    fetchFont(fontsBase, 'OFL.txt'),
    fetchFont(fontsBase, 'NotoSerif-Regular.ttf'),
    fetchFont(fontsBase, 'NotoSerif-Bold.ttf'),
  ]);
  if (!regular || !latin || !license) {
    throw new Error('বাংলা ফন্ট লোড হয়নি। সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।');
  }
  return {
    regular,
    bold: boldTry && boldTry.byteLength !== regular.byteLength ? boldTry : regular,
    license,
    latin,
    latinBold: latinBoldTry && latinBoldTry.byteLength !== latin.byteLength ? latinBoldTry : latin,
  };
}

export function mixedText(text: string) {
  return text
    .split(/([\u0980-\u09ff\u0964\u0965\u200c\u200d]+)/u)
    .filter(Boolean)
    .map((chunk) => ({
      text: chunk,
      font: /[\u0980-\u09ff\u0964\u0965]/u.test(chunk) ? 'NotoBengali' : 'NotoLatin',
    }));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  const n = m ? parseInt(m[1], 16) : 0x1e3d32;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function cropMarkCanvas(s: BookSettings) {
  const sheet = sheetSizePt(s);
  const extra = mmToPt(sheetExtraMm(s));
  const bleed = mmToPt(s.bleedMm || 0);
  const trimX = extra;
  const trimY = extra;
  const trimW = sheet.width - extra * 2;
  const trimH = sheet.height - extra * 2;
  const bleedX = extra - bleed;
  const bleedY = extra - bleed;
  const mark = 10;
  const color = '#222';
  const lines = [
    [trimX, 2, trimX, 2 + mark],
    [trimX + trimW, 2, trimX + trimW, 2 + mark],
    [trimX, sheet.height - 2 - mark, trimX, sheet.height - 2],
    [trimX + trimW, sheet.height - 2 - mark, trimX + trimW, sheet.height - 2],
    [2, trimY, 2 + mark, trimY],
    [sheet.width - 2 - mark, trimY, sheet.width - 2, trimY],
    [2, trimY + trimH, 2 + mark, trimY + trimH],
    [sheet.width - 2 - mark, trimY + trimH, sheet.width - 2, trimY + trimH],
  ];
  if (bleed > 0.5) {
    lines.push(
      [bleedX, 2, bleedX, 2 + mark * 0.6],
      [sheet.width - bleedX, 2, sheet.width - bleedX, 2 + mark * 0.6],
    );
  }
  return lines.map(([x1, y1, x2, y2]) => ({
    type: 'line' as const,
    x1, y1, x2, y2,
    lineWidth: 0.6,
    lineColor: color,
  }));
}

function frontMatterCount(s: BookSettings) {
  return 1 + (hasImprint(s) ? 1 : 0) + (s.dedication.trim() ? 1 : 0) + (s.includeToc ? 1 : 0);
}

export function pdfDefinition(project: Project, s: BookSettings): TDocumentDefinitions {
  validateProject(project);
  validateSettings(s);
  const english = project.language === 'English';
  const indent = mmToPt(s.firstLineIndentMm);
  const content: Content[] = [
    {
      text: mixedText(project.title || 'পাণ্ডুলিপি'),
      fontSize: 28,
      bold: true,
      alignment: 'center',
      margin: [0, 90, 0, 25],
    },
    {
      text: mixedText(s.author),
      alignment: 'center',
      fontSize: 16,
      margin: [0, 0, 0, 12],
    },
  ];
  if (s.coverSubtitle.trim()) {
    content.push({
      text: mixedText(s.coverSubtitle),
      alignment: 'center',
      fontSize: 12,
      margin: [0, 0, 0, 20],
    });
  }

  if (hasImprint(s)) {
    const lines = [
      s.copyrightNote || (english
        ? `© ${s.year || new Date().getFullYear()} ${s.author || project.title}`.trim()
        : `© ${s.year || new Date().getFullYear()} ${s.author || project.title}`.trim()),
      s.publisher ? (english ? `Published by ${s.publisher}` : `প্রকাশক: ${s.publisher}`) : '',
      s.year ? (english ? `Year: ${s.year}` : `প্রকাশকাল: ${s.year}`) : '',
      s.isbn ? `ISBN ${s.isbn}` : '',
    ].filter(Boolean);
    content.push({
      stack: lines.map((line, i) => ({
        text: mixedText(line),
        fontSize: 11,
        margin: [0, i === 0 ? 0 : 8, 0, 0],
      })),
      pageBreak: 'before',
      margin: [0, 40, 0, 0],
    });
  }

  if (s.dedication.trim()) {
    content.push({
      text: mixedText(s.dedication),
      italics: true,
      alignment: 'center',
      fontSize: 13,
      pageBreak: 'before',
      margin: [20, 120, 20, 0],
    });
  }

  if (s.includeToc) {
    content.push({
      toc: {
        title: {
          text: mixedText(english ? 'Contents' : 'সূচিপত্র'),
          fontSize: 20,
          bold: true,
          margin: [0, 0, 0, 20],
        },
      },
      pageBreak: 'before',
    });
  }

  const calloutTheme = CALLOUT_THEMES[s.calloutTheme] || CALLOUT_THEMES.emerald;

  for (const c of project.chapters) {
    content.push({
      text: mixedText(c.title || 'অধ্যায়'),
      fontSize: 22,
      bold: true,
      color: s.chapterHeadingColor || '#1a56db',
      margin: [0, 15, 0, 18],
      pageBreak: 'before',
      // @ts-expect-error — tocItem exists at runtime
      tocItem: true,
    });

    const blocks = parseChapterContent(c.text || '');
    for (const b of blocks) {
      if (b.type === 'heading') {
        content.push({
          text: mixedText(b.text),
          fontSize: b.level === 1 ? 16 : b.level === 2 ? 14 : 12,
          bold: true,
          color: s.subheadingColor || '#166534',
          margin: [0, 12, 0, 6],
        });
      } else if (b.type === 'quote') {
        content.push({
          table: {
            widths: ['*'],
            body: [
              [
                {
                  stack: [
                    {
                      text: mixedText(b.text),
                      italics: true,
                      color: '#334155',
                      fontSize: s.fontSize * 0.95,
                    },
                    b.source
                      ? {
                          text: mixedText(`— ${b.source}`),
                          color: '#64748b',
                          fontSize: s.fontSize * 0.85,
                          alignment: 'right',
                          margin: [0, 4, 0, 0],
                        }
                      : { text: '' },
                  ],
                  border: [true, false, false, false],
                  borderColor: [s.quoteBorderColor || '#64748b', '', '', ''],
                  fillColor: '#f8fafc',
                  margin: [8, 4, 8, 4],
                },
              ],
            ],
          },
          layout: {
            vLineWidth: (i: number) => (i === 0 ? 3 : 0),
            hLineWidth: () => 0,
            vLineColor: () => s.quoteBorderColor || '#64748b',
            paddingLeft: () => 10,
            paddingRight: () => 8,
            paddingTop: () => 4,
            paddingBottom: () => 4,
          },
          margin: [0, 8, 0, 10],
        });
      } else if (b.type === 'callout') {
        content.push({
          table: {
            widths: ['*'],
            body: [
              [
                {
                  stack: [
                    {
                      text: mixedText(b.title),
                      bold: true,
                      color: calloutTheme.title,
                      fontSize: s.fontSize * 1.05,
                      margin: [0, 0, 0, 4],
                    },
                    {
                      text: mixedText(b.text),
                      color: '#1e293b',
                      fontSize: s.fontSize * 0.92,
                      lineHeight: s.lineHeight,
                    },
                  ],
                  fillColor: calloutTheme.bg,
                  borderColor: [calloutTheme.border, calloutTheme.border, calloutTheme.border, calloutTheme.border],
                  margin: [10, 8, 10, 8],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => calloutTheme.border,
            vLineColor: () => calloutTheme.border,
            paddingLeft: () => 10,
            paddingRight: () => 10,
            paddingTop: () => 8,
            paddingBottom: () => 8,
          },
          margin: [0, 10, 0, 12],
        });
      } else if (b.type === 'citation') {
        content.push({
          text: mixedText(b.text),
          fontSize: Math.max(8.5, s.fontSize * 0.82),
          color: '#64748b',
          italics: true,
          margin: [0, 8, 0, 6],
        });
      } else if (b.type === 'list') {
        content.push({
          ul: b.items.map((item) => ({
            text: mixedText(item),
            margin: [0, 2, 0, 2],
            fontSize: s.fontSize * 0.95,
          })),
          margin: [12, 4, 0, 8],
        });
      } else if (b.type === 'divider') {
        content.push({
          text: mixedText('❖ — ❖ — ❖'),
          alignment: 'center',
          color: '#94a3b8',
          margin: [0, 10, 0, 10],
        });
      } else {
        content.push({
          text: mixedText(b.text || ' '),
          margin: [0, 0, 0, b.text ? 6 : 3],
          alignment: s.textAlign || 'justify',
          leadingIndent: b.text.trim() ? indent : 0,
        });
      }
    }
  }

  const skipHeaderUntil = frontMatterCount(s);
  const marks = s.includeCropMarks ? cropMarkCanvas(s) : [];

  return {
    info: { title: project.title, author: s.author, creator: 'লিপিশিল্প প্রো' },
    pageSize: sheetSizePt(s),
    pageMargins: contentMarginsPt(s, false),
    defaultStyle: {
      font: 'NotoBengali',
      fontSize: s.fontSize,
      lineHeight: s.lineHeight,
      color: '#222222',
    },
    content,
    header: (page) => {
      const headerStack: Content[] = [];
      if (marks.length) {
        headerStack.push({
          canvas: marks,
          absolutePosition: { x: 0, y: 0 },
        });
      }
      if (s.runningHeader !== 'none' && page > skipHeaderUntil) {
        const even = page % 2 === 0;
        const label =
          s.runningHeader === 'author'
            ? s.author
            : s.runningHeader === 'title'
              ? project.title
              : even
                ? project.title
                : s.author || project.title;
        if (label) {
          headerStack.push({
            text: mixedText(label),
            alignment: even ? 'left' : 'right',
            fontSize: 9,
            color: '#555',
            margin: [0, 8, 0, 0],
          });
        }
      }
      return headerStack.length ? { stack: headerStack } : { text: '' };
    },
    footer: (page, pages) => {
      if (page <= 1) return { text: '' };
      const numStr = s.numberFormat === 'bn' ? toBengaliNumerals(page) : String(page);
      const totalStr = s.numberFormat === 'bn' ? toBengaliNumerals(pages) : String(pages);
      return {
        text: mixedText(`${numStr} / ${totalStr}`),
        alignment: 'center',
        fontSize: 9.5,
        color: '#666',
        margin: [0, 8, 0, 0],
      };
    },
  };
}

function base64(bytes: Uint8Array) {
  let out = '';
  for (let i = 0; i < bytes.length; i += 8192) {
    out += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return btoa(out);
}

function pdfFonts(fonts: FontFiles) {
  return {
    fontMap: {
      NotoLatin: {
        normal: 'Latin-Regular.ttf',
        bold: 'Latin-Bold.ttf',
        italics: 'Latin-Regular.ttf',
        bolditalics: 'Latin-Bold.ttf',
      },
      NotoBengali: {
        normal: 'Noto-Regular.ttf',
        bold: 'Noto-Bold.ttf',
        italics: 'Noto-Regular.ttf',
        bolditalics: 'Noto-Bold.ttf',
      },
    },
    vfs: {
      'Latin-Regular.ttf': base64(fonts.latin),
      'Latin-Bold.ttf': base64(fonts.latinBold),
      'Noto-Regular.ttf': base64(fonts.regular),
      'Noto-Bold.ttf': base64(fonts.bold),
    },
  };
}

export async function makePdf(
  project: Project,
  s: BookSettings,
  fonts: FontFiles,
): Promise<Blob> {
  const pdfMake = (await import('pdfmake/build/pdfmake')).default;
  const { fontMap, vfs } = pdfFonts(fonts);
  return new Promise((resolve, reject) => {
    try {
      pdfMake.createPdf(pdfDefinition(project, s), undefined, fontMap, vfs).getBlob(resolve);
    } catch (e) {
      reject(e);
    }
  });
}

export async function makeCoverPdf(
  project: Project,
  s: BookSettings,
  fonts: FontFiles,
): Promise<Blob> {
  const pdfMake = (await import('pdfmake/build/pdfmake')).default;
  const { fontMap, vfs } = pdfFonts(fonts);
  const sheet = sheetSizePt(s);
  const rgb = hexToRgb(s.coverColor);
  const def: TDocumentDefinitions = {
    pageSize: sheet,
    pageMargins: [36, 48, 36, 48],
    defaultStyle: { font: 'NotoBengali', color: '#f4efe4' },
    background: () => ({
      canvas: [
        {
          type: 'rect',
          x: 0,
          y: 0,
          w: sheet.width,
          h: sheet.height,
          color: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        },
      ],
    }),
    content: ([
      {
        text: mixedText(project.title || 'পাণ্ডুলিপি'),
        fontSize: 32,
        bold: true,
        alignment: 'center',
        margin: [10, 80, 10, 20] as [number, number, number, number],
        color: '#f4efe4',
      },
      ...(s.coverSubtitle.trim()
        ? [{
            text: mixedText(s.coverSubtitle),
            fontSize: 13,
            alignment: 'center' as const,
            margin: [20, 0, 20, 24] as [number, number, number, number],
            color: '#d9c9a8',
          }]
        : []),
      {
        text: mixedText(s.author),
        fontSize: 16,
        alignment: 'center',
        margin: [0, 20, 0, 0] as [number, number, number, number],
        color: '#f4efe4',
      },
    ] as Content[]),
  };
  return new Promise((resolve, reject) => {
    try {
      pdfMake.createPdf(def, undefined, fontMap, vfs).getBlob(resolve);
    } catch (e) {
      reject(e);
    }
  });
}

export async function makeDocx(project: Project, s: BookSettings): Promise<Uint8Array> {
  validateProject(project);
  validateSettings(s);
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    Footer,
    Header,
    PageNumber,
    InternalHyperlink,
    Bookmark,
  } = await import('docx');
  const english = project.language === 'English';
  const font = 'Noto Serif Bengali';
  const run = {
    font: { ascii: 'Noto Serif', hAnsi: 'Noto Serif', cs: font, eastAsia: font },
    size: s.fontSize * 2,
    sizeComplexScript: s.fontSize * 2,
    language: { value: english ? 'en-US' : 'bn-BD' },
  };
  const children = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 1800, after: 600 },
      children: [
        new TextRun({ ...run, text: project.title, bold: true, size: 56, sizeComplexScript: 56 }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ ...run, text: s.author })],
    }),
  ];
  if (s.coverSubtitle.trim()) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ ...run, text: s.coverSubtitle, italics: true })],
    }));
  }
  if (hasImprint(s)) {
    const imprint = [
      s.copyrightNote || `© ${s.year || new Date().getFullYear()} ${s.author || project.title}`.trim(),
      s.publisher ? (english ? `Published by ${s.publisher}` : `প্রকাশক: ${s.publisher}`) : '',
      s.year ? (english ? `Year: ${s.year}` : `প্রকাশকাল: ${s.year}`) : '',
      s.isbn ? `ISBN ${s.isbn}` : '',
    ].filter(Boolean);
    imprint.forEach((line, i) => {
      children.push(new Paragraph({
        pageBreakBefore: i === 0,
        spacing: { before: i === 0 ? 600 : 160 },
        children: [new TextRun({ ...run, text: line })],
      }));
    });
  }
  if (s.dedication.trim()) {
    children.push(new Paragraph({
      pageBreakBefore: true,
      alignment: AlignmentType.CENTER,
      spacing: { before: 1600 },
      children: [new TextRun({ ...run, text: s.dedication, italics: true })],
    }));
  }
  if (s.includeToc) {
    children.push(new Paragraph({
      text: english ? 'Contents' : 'সূচিপত্র',
      heading: HeadingLevel.HEADING_1,
      pageBreakBefore: true,
    }));
    project.chapters.forEach((c, i) =>
      children.push(new Paragraph({
        children: [
          new InternalHyperlink({
            anchor: `chapter-${i}`,
            children: [new TextRun({ ...run, text: c.title })],
          }),
        ],
        spacing: { after: 160 },
      })),
    );
  }
  project.chapters.forEach((c, i) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        children: [
          new Bookmark({
            id: `chapter-${i}`,
            children: [
              new TextRun({
                ...run,
                text: c.title,
                bold: true,
                size: 42,
                sizeComplexScript: 42,
                color: (s.chapterHeadingColor || '#1a56db').replace('#', ''),
              }),
            ],
          }),
        ],
        spacing: { before: 600, after: 400 },
      }),
    );

    const blocks = parseChapterContent(c.text || '');
    for (const b of blocks) {
      if (b.type === 'heading') {
        children.push(
          new Paragraph({
            heading: b.level === 1 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                ...run,
                text: b.text,
                bold: true,
                color: (s.subheadingColor || '#166534').replace('#', ''),
              }),
            ],
          }),
        );
      } else if (b.type === 'quote') {
        children.push(
          new Paragraph({
            indent: { left: 720 },
            spacing: { before: 200, after: 200 },
            children: [
              new TextRun({
                ...run,
                text: b.text + (b.source ? ` — ${b.source}` : ''),
                italics: true,
                color: '334155',
              }),
            ],
          }),
        );
      } else if (b.type === 'callout') {
        children.push(
          new Paragraph({
            indent: { left: 400, right: 400 },
            spacing: { before: 240, after: 60 },
            children: [
              new TextRun({ ...run, text: `【 ${b.title} 】`, bold: true, color: '065F46' }),
            ],
          }),
        );
        children.push(
          new Paragraph({
            indent: { left: 400, right: 400 },
            spacing: { before: 60, after: 240 },
            children: [
              new TextRun({
                ...run,
                text: b.text,
                size: (s.fontSize - 1) * 2,
                sizeComplexScript: (s.fontSize - 1) * 2,
              }),
            ],
          }),
        );
      } else if (b.type === 'citation') {
        children.push(
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                ...run,
                text: b.text,
                italics: true,
                size: (s.fontSize - 2) * 2,
                color: '64748B',
              }),
            ],
          }),
        );
      } else if (b.type === 'list') {
        for (const item of b.items) {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { before: 60, after: 60 },
              children: [new TextRun({ ...run, text: item })],
            }),
          );
        }
      } else if (b.type === 'divider') {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
            children: [new TextRun({ ...run, text: '❖ — ❖ — ❖', color: '94A3B8' })],
          }),
        );
      } else if (b.type === 'paragraph') {
        children.push(
          new Paragraph({
            children: [new TextRun({ ...run, text: b.text })],
            spacing: { after: 100, line: Math.round(240 * s.lineHeight) },
            alignment: s.textAlign === 'left' ? AlignmentType.LEFT : AlignmentType.JUSTIFIED,
            indent: b.text.trim() && s.firstLineIndentMm ? { firstLine: mmToTwip(s.firstLineIndentMm) } : undefined,
            widowControl: true,
          }),
        );
      }
    }
  });
  const trim = trimSizeMm(s);
  const headerText =
    s.runningHeader === 'none'
      ? ''
      : s.runningHeader === 'author'
        ? s.author
        : project.title;
  const doc = new Document({
    creator: 'লিপিশিল্প',
    title: project.title,
    description: 'লিপিশিল্প থেকে রপ্তানিকৃত পাণ্ডুলিপি',
    styles: {
      default: {
        document: {
          run,
          paragraph: { spacing: { line: Math.round(240 * s.lineHeight) } },
        },
      },
      paragraphStyles: [
        {
          id: 'Title',
          name: 'Title',
          basedOn: 'Normal',
          run: { ...run, bold: true, size: 56, sizeComplexScript: 56 },
        },
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          run: { ...run, bold: true, size: 40, sizeComplexScript: 40 },
          paragraph: { keepNext: true },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: mmToTwip(trim.w), height: mmToTwip(trim.h) },
            margin: {
              top: mmToTwip(s.marginTopMm),
              bottom: mmToTwip(s.marginBottomMm),
              left: mmToTwip(s.marginInnerMm),
              right: mmToTwip(s.marginOuterMm),
              gutter: 0,
            },
          },
          titlePage: true,
        },
        headers: headerText
          ? {
              default: new Header({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ ...run, text: headerText, italics: true, size: 16, sizeComplexScript: 16 })],
                  }),
                ],
              }),
            }
          : undefined,
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ ...run, children: [PageNumber.CURRENT] })],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
  return new Uint8Array(await Packer.toBuffer(doc));
}

export function makeEpub(project: Project, s: BookSettings, fonts: FontFiles): Uint8Array {
  validateProject(project);
  validateSettings(s);
  const lang = project.language === 'English' ? 'en' : 'bn';
  const id = 'urn:uuid:' + createBookId();
  const date = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const xhtml = (title: string, body: string) =>
    `<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${lang}" lang="${lang}"><head><title>${xml(title)}</title><link rel="stylesheet" type="text/css" href="style.css"/></head><body>${body}</body></html>`;
  const files: Record<string, Uint8Array | [Uint8Array, { level: 0 }]> = {
    mimetype: [strToU8('application/epub+zip'), { level: 0 }],
    'META-INF/container.xml': strToU8(
      '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
    ),
  };
  files['EPUB/title.xhtml'] = strToU8(
    xhtml(
      project.title,
      `<section class="titlepage" epub:type="titlepage"><h1>${xml(project.title)}</h1>${s.coverSubtitle ? `<p class="sub">${xml(s.coverSubtitle)}</p>` : ''}<p>${xml(s.author)}</p></section>`,
    ),
  );
  const extraItems: string[] = [];
  const extraSpine: string[] = [];
  if (hasImprint(s)) {
    const imprint = [
      s.copyrightNote || `© ${s.year || new Date().getFullYear()} ${s.author || project.title}`.trim(),
      s.publisher ? (lang === 'en' ? `Published by ${s.publisher}` : `প্রকাশক: ${s.publisher}`) : '',
      s.year ? (lang === 'en' ? `Year: ${s.year}` : `প্রকাশকাল: ${s.year}`) : '',
      s.isbn ? `ISBN ${s.isbn}` : '',
    ].filter(Boolean);
    files['EPUB/imprint.xhtml'] = strToU8(
      xhtml(lang === 'en' ? 'Copyright' : 'স্বত্ব', `<section epub:type="copyright-page">${imprint.map((l) => `<p>${xml(l)}</p>`).join('')}</section>`),
    );
    extraItems.push('<item id="imprint" href="imprint.xhtml" media-type="application/xhtml+xml"/>');
    extraSpine.push('<itemref idref="imprint"/>');
  }
  if (s.dedication.trim()) {
    files['EPUB/dedication.xhtml'] = strToU8(
      xhtml(lang === 'en' ? 'Dedication' : 'উৎসর্গ', `<section class="dedication" epub:type="dedication"><p>${xml(s.dedication)}</p></section>`),
    );
    extraItems.push('<item id="dedication" href="dedication.xhtml" media-type="application/xhtml+xml"/>');
    extraSpine.push('<itemref idref="dedication"/>');
  }
  files['EPUB/nav.xhtml'] = strToU8(
    xhtml(
      lang === 'en' ? 'Contents' : 'সূচিপত্র',
      `<nav epub:type="toc" id="toc"><h1>${lang === 'en' ? 'Contents' : 'সূচিপত্র'}</h1><ol>${project.chapters.map((c, i) => `<li><a href="chapter-${i}.xhtml">${xml(c.title)}</a></li>`).join('')}</ol></nav>`,
    ),
  );
  files['EPUB/style.css'] = strToU8(
    `@font-face{font-family:Lipishilpo;src:url('fonts/regular.ttf')}@font-face{font-family:Lipishilpo;src:url('fonts/bold.ttf');font-weight:bold}@font-face{font-family:LipishilpoLatin;src:url('fonts/latin.ttf')}@font-face{font-family:LipishilpoLatin;src:url('fonts/latin-bold.ttf');font-weight:bold}body{font-family:Lipishilpo,LipishilpoLatin,serif;line-height:${s.lineHeight};margin:5%;text-align:${s.textAlign};}p{white-space:pre-wrap;margin:0 0 .65em;text-indent:${s.firstLineIndentMm}mm;}h1{font-size:1.8em;line-height:1.4;page-break-after:avoid;color:${s.chapterHeadingColor || '#1a56db'};text-indent:0;}h2,h3{color:${s.subheadingColor || '#166534'};text-indent:0;}blockquote.book-quote{border-left:3px solid ${s.quoteBorderColor || '#64748b'};padding-left:12px;margin:1em 0;font-style:italic;color:#334155;}div.book-callout{background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:6px;padding:12px;margin:1.2em 0;}div.book-callout-title{font-weight:bold;color:#065f46;margin-bottom:6px;border-bottom:1px solid #a7f3d0;padding-bottom:4px;}p.book-citation{font-size:0.85em;color:#64748b;font-style:italic;border-top:1px dashed #cbd5e1;padding-top:6px;margin-top:1.2em;}a{color:inherit}section.titlepage{text-align:center;padding-top:20%;}section.titlepage p.sub{font-style:italic;opacity:.85}section.dedication{text-align:center;padding-top:30%;font-style:italic}`,
  );
  files['EPUB/fonts/regular.ttf'] = fonts.regular;
  files['EPUB/fonts/bold.ttf'] = fonts.bold;
  files['EPUB/fonts/OFL.txt'] = fonts.license;
  files['EPUB/fonts/latin.ttf'] = fonts.latin;
  files['EPUB/fonts/latin-bold.ttf'] = fonts.latinBold;

  project.chapters.forEach((c, i) => {
    const blocks = parseChapterContent(c.text || '');
    const chapterHtml = blocks
      .map((b) => {
        if (b.type === 'heading') return `<h${b.level + 1}>${xml(b.text)}</h${b.level + 1}>`;
        if (b.type === 'quote') return `<blockquote class="book-quote"><p>${xml(b.text)}</p>${b.source ? `<small>— ${xml(b.source)}</small>` : ''}</blockquote>`;
        if (b.type === 'callout') return `<div class="book-callout"><div class="book-callout-title">${xml(b.title)}</div><p>${xml(b.text)}</p></div>`;
        if (b.type === 'citation') return `<p class="book-citation">${xml(b.text)}</p>`;
        if (b.type === 'list') return `<ul>${b.items.map((it) => `<li>${xml(it)}</li>`).join('')}</ul>`;
        if (b.type === 'divider') return `<div style="text-align:center;margin:1em 0;color:#94a3b8;">❖ — ❖ — ❖</div>`;
        return `<p>${b.text ? xml(b.text) : '&#160;'}</p>`;
      })
      .join('');

    files[`EPUB/chapter-${i}.xhtml`] = strToU8(
      xhtml(
        c.title,
        `<section epub:type="chapter"><h1>${xml(c.title)}</h1>${chapterHtml}</section>`,
      ),
    );
  });
  files['EPUB/package.opf'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id" xml:lang="${lang}"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="book-id">${id}</dc:identifier><dc:title>${xml(project.title)}</dc:title><dc:language>${lang}</dc:language>${s.author ? `<dc:creator>${xml(s.author)}</dc:creator>` : ''}${s.publisher ? `<dc:publisher>${xml(s.publisher)}</dc:publisher>` : ''}${s.isbn ? `<dc:identifier>${xml(s.isbn)}</dc:identifier>` : ''}<meta property="dcterms:modified">${date}</meta></metadata><manifest><item id="title" href="title.xhtml" media-type="application/xhtml+xml"/>${extraItems.join('')}<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="css" href="style.css" media-type="text/css"/><item id="regular" href="fonts/regular.ttf" media-type="font/ttf"/><item id="bold" href="fonts/bold.ttf" media-type="font/ttf"/><item id="latin" href="fonts/latin.ttf" media-type="font/ttf"/><item id="latin-bold" href="fonts/latin-bold.ttf" media-type="font/ttf"/><item id="license" href="fonts/OFL.txt" media-type="text/plain"/>${project.chapters.map((_, i) => `<item id="c${i}" href="chapter-${i}.xhtml" media-type="application/xhtml+xml"/>`).join('')}</manifest><spine><itemref idref="title"/>${extraSpine.join('')}${s.includeToc ? '<itemref idref="nav"/>' : ''}${project.chapters.map((_, i) => `<itemref idref="c${i}"/>`).join('')}</spine></package>`,
  );
  return zipSync(files, { level: 6 });
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_');
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
