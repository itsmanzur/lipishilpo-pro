import { createRoot, type Root } from 'react-dom/client';
import { ProStudio, type ProPanelProps, type ProTabKey } from './ProStudio';
import './pro-studio.css';

type ProHost = {
  tabs: { key: ProTabKey; label: { en: string; bn: string } }[];
  sidebar: { key: ProTabKey; label: { en: string; bn: string } }[];
  mount: (el: HTMLElement, props: ProPanelProps) => void;
  update: (props: ProPanelProps) => void;
  unmount: () => void;
};

declare global {
  interface Window {
    LipishilpoPro?: ProHost;
  }
}

let root: Root | null = null;
let host: HTMLElement | null = null;

const api = {
  tabs: [
    { key: 'audio' as ProTabKey, label: { en: 'Audio', bn: 'অডিও পাঠ' } },
    { key: 'aiEdit' as ProTabKey, label: { en: 'AI Edit', bn: 'AI সম্পাদনা' } },
    { key: 'analysis' as ProTabKey, label: { en: 'Analysis', bn: 'বিশ্লেষণ' } },
    { key: 'format' as ProTabKey, label: { en: 'Format', bn: 'ফরম্যাটিং' } },
  ],
  sidebar: [
    { key: 'analysis' as ProTabKey, label: { en: 'Text Analysis', bn: 'লেখা বিশ্লেষণ' } },
    { key: 'format' as ProTabKey, label: { en: 'Book Formatting', bn: 'বই ফরম্যাটিং' } },
  ],
  mount(el: HTMLElement, props: ProPanelProps) {
    if (host !== el) {
      root?.unmount();
      root = createRoot(el);
      host = el;
    }
    root?.render(<ProStudio {...props} />);
  },
  update(props: ProPanelProps) {
    if (!root) return;
    root.render(<ProStudio {...props} />);
  },
  unmount() {
    root?.unmount();
    root = null;
    host = null;
  },
};

window.LipishilpoPro = api;
window.dispatchEvent(new CustomEvent('lipishilpo-pro-ready'));
