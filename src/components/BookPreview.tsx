import type { Project } from '../api';
import type { BookSettings } from '../lib/book-layout';
import { sheetExtraMm, trimSizeMm } from '../lib/book-layout';

export function BookPreview({
  project,
  settings,
  lang,
}: {
  project: Project;
  settings: BookSettings;
  lang: 'bn' | 'en';
}) {
  const trim = trimSizeMm(settings);
  const extra = sheetExtraMm(settings);
  const scale = 118 / (trim.w + extra * 2);
  const pageW = (trim.w + extra * 2) * scale;
  const pageH = (trim.h + extra * 2) * scale;
  const padIn = settings.marginInnerMm * scale;
  const padOut = settings.marginOuterMm * scale;
  const padTop = settings.marginTopMm * scale;
  const padBot = settings.marginBottomMm * scale;
  const sample = (project.chapters[0]?.text || '').replace(/\s+/g, ' ').trim().slice(0, 220);
  const firstChapter = project.chapters[0]?.title || (lang === 'bn' ? 'অধ্যায়' : 'Chapter');

  return (
    <div className="book-preview">
      <div className="book-preview-cover" style={{ background: settings.coverColor, width: pageW, minHeight: pageH * 0.72 }}>
        <small>{lang === 'bn' ? 'প্রচ্ছদ' : 'Cover'}</small>
        <strong>{project.title}</strong>
        {settings.coverSubtitle ? <em>{settings.coverSubtitle}</em> : null}
        <span>{settings.author || (lang === 'bn' ? 'লেখকের নাম' : 'Author')}</span>
      </div>

      <div className="book-preview-spread">
        <div
          className="book-page verso"
          style={{
            width: pageW,
            height: pageH,
            padding: `${padTop + extra * scale}px ${padIn}px ${padBot}px ${padOut}px`,
          }}
        >
          {settings.runningHeader !== 'none' && (
            <header>{settings.runningHeader === 'author' ? settings.author : project.title}</header>
          )}
          <p className="imprint-preview">
            {(settings.copyrightNote || `© ${settings.year || new Date().getFullYear()} ${settings.author || project.title}`).slice(0, 90)}
            {settings.isbn ? ` · ISBN ${settings.isbn}` : ''}
          </p>
          <footer>2</footer>
        </div>
        <div
          className="book-page recto"
          style={{
            width: pageW,
            height: pageH,
            padding: `${padTop + extra * scale}px ${padOut}px ${padBot}px ${padIn}px`,
            fontSize: Math.max(7, settings.fontSize * 0.62),
            lineHeight: settings.lineHeight,
          }}
        >
          {settings.runningHeader !== 'none' && (
            <header>{settings.runningHeader === 'title' ? project.title : (settings.author || project.title)}</header>
          )}
          <h4>{firstChapter}</h4>
          <p style={{ textIndent: settings.firstLineIndentMm * scale }}>{sample || (lang === 'bn' ? 'অধ্যায়ের নমুনা লেখা…' : 'Sample chapter text…')}</p>
          <footer>3</footer>
        </div>
      </div>
      <small className="book-preview-meta">
        {trim.w.toFixed(0)}×{trim.h.toFixed(0)} mm
        {settings.bleedMm ? ` · ${lang === 'bn' ? 'ব্লিড' : 'bleed'} ${settings.bleedMm} mm` : ''}
        {settings.includeCropMarks ? (lang === 'bn' ? ' · ক্রপ মার্ক' : ' · crop marks') : ''}
      </small>
    </div>
  );
}
