import { AudioProofreader } from './components/AudioProofreader';
import { AIPanel } from './components/AIPanel';
import { ExportPanel } from './components/ExportPanel';
import type { Chapter, Project } from './api';
import type { Language } from './i18n';

export type ProTabKey = 'audio' | 'aiEdit' | 'analysis' | 'format';

export type ProPanelProps = {
  tab: ProTabKey;
  project: Project;
  chapter: Chapter;
  text: string;
  lang: Language;
  isPro: boolean;
  onTxt: () => void;
  onHtml?: () => void;
  onSentenceHighlight: (sentence: string) => void;
  onLocate: (id: string, quote: string) => void;
  onApply: (id: string, before: string, after: string) => boolean;
};

export function ProStudio(props: ProPanelProps) {
  if (props.tab === 'audio') {
    return (
      <div className="audio-tab-panel">
        <AudioProofreader
          text={props.text}
          isPro={props.isPro}
          lang={props.lang}
          onSentenceHighlight={props.onSentenceHighlight}
        />
      </div>
    );
  }

  if (props.tab === 'aiEdit' || props.tab === 'analysis') {
    return (
      <AIPanel
        project={props.project}
        chapter={props.chapter}
        defaultMode={props.tab === 'aiEdit' ? 'proofread' : 'chapter'}
        isPro={props.isPro}
        lang={props.lang}
        onLocate={props.onLocate}
        onApply={props.onApply}
      />
    );
  }

  if (props.tab === 'format') {
    return (
      <ExportPanel
        project={props.project}
        isPro={props.isPro}
        lang={props.lang}
        onTxt={props.onTxt}
        onHtml={props.onHtml}
      />
    );
  }

  return null;
}
