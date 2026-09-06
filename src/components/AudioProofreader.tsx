import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, Sparkles, Headphones } from 'lucide-react';
import { type Language, translations } from '../i18n';

interface AudioProofreaderProps {
  text: string;
  isPro: boolean;
  lang: Language;
  onSentenceHighlight?: (sentence: string) => void;
}

export const AudioProofreader: React.FC<AudioProofreaderProps> = ({
  text,
  isPro,
  lang,
  onSentenceHighlight,
}) => {
  const t = translations[lang];
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [currentSentence, setCurrentSentence] = useState('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>('');

  const sentencesRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);
  const isPlayingRef = useRef(false);

  // Load available voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    function loadVoices() {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      // Default to Bengali or default voice
      const bengaliVoice = voices.find((v) => v.lang.startsWith('bn'));
      if (bengaliVoice) {
        setSelectedVoiceUri(bengaliVoice.voiceURI);
      } else if (voices.length > 0) {
        setSelectedVoiceUri(voices[0].voiceURI);
      }
    }

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Prepare sentences
  useEffect(() => {
    if (!text.trim()) {
      sentencesRef.current = [];
      return;
    }
    // Split by Bengali Dari (।), question mark, exclamation, newline or period
    const raw = text.split(/([।!?\n]+)/u);
    const parsed: string[] = [];
    for (let i = 0; i < raw.length; i += 2) {
      const sentence = raw[i]?.trim();
      const punct = raw[i + 1] || '';
      if (sentence) {
        parsed.push(sentence + punct);
      }
    }
    sentencesRef.current = parsed.length > 0 ? parsed : [text];
  }, [text]);

  function speakSentence(index: number) {
    if (!isPlayingRef.current || index >= sentencesRef.current.length) {
      stopPlayback();
      return;
    }

    const sentence = sentencesRef.current[index];
    setCurrentSentence(sentence);
    currentIndexRef.current = index;
    if (onSentenceHighlight) onSentenceHighlight(sentence);

    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = rate;

    // Pick selected voice
    if (selectedVoiceUri) {
      const voice = availableVoices.find((v) => v.voiceURI === selectedVoiceUri);
      if (voice) utterance.voice = voice;
    }

    utterance.onend = () => {
      if (isPlayingRef.current) {
        speakSentence(index + 1);
      }
    };

    utterance.onerror = () => {
      if (isPlayingRef.current) {
        speakSentence(index + 1);
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  function startPlayback() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    isPlayingRef.current = true;
    setIsPlaying(true);
    setIsPaused(false);
    speakSentence(currentIndexRef.current);
  }

  function pausePlayback() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }

  function resumePlayback() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }

  function stopPlayback() {
    isPlayingRef.current = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    currentIndexRef.current = 0;
    setCurrentSentence('');
    if (onSentenceHighlight) onSentenceHighlight('');
  }

  // ── Pro Feature Lock Gate ──
  if (!isPro) {
    return (
      <div className="audio-proofreader-pro-gate">
        <div className="pro-gate-icon">
          <Headphones size={32} />
        </div>
        <h3>{lang === 'bn' ? '💎 শুনে শুনে প্রুফরিডিং (Audio Proofreading)' : '💎 Audio Proofreading (Text-to-Speech)'}</h3>
        <p>
          {lang === 'bn'
            ? 'পাণ্ডুলিপি কানে শুনে স্বতঃস্ফূর্তভাবে ছন্দপতন, অপ্রয়োজনীয় শব্দের পুনরাবৃত্তি ও বাক্য গঠনের অসঙ্গতি সহজে চিহ্নিত করতে Lipishilpo Pro প্রয়োজন।'
            : 'Listen to your chapter read aloud to naturally detect awkward phrasing, pacing issues, and missing words with Lipishilpo Pro.'}
        </p>
        <ul className="pro-feature-list">
          <li>{lang === 'bn' ? '🎧 বাংলা ও ইংরেজি প্রাকৃতিক কণ্ঠে পাঠ' : '🎧 Natural Bengali & English Voice Synthesis'}</li>
          <li>{lang === 'bn' ? '⚡ গতি নিয়ন্ত্রণ (0.75x থেকে 1.5x স্পিড)' : '⚡ Adjustable reading speed rate'}</li>
          <li>{lang === 'bn' ? '🎯 পাঠের সময় লাইভ বাক্য হাইলাইটিং' : '🎯 Live sentence-by-sentence focus highlighting'}</li>
        </ul>
        <a href="https://lipishilpo.com/pro" target="_blank" rel="noopener" className="primary full pro-activate-btn">
          <Sparkles size={16} /> {lang === 'bn' ? 'লিপিশিল্প Pro সক্রিয় করুন' : 'Activate Lipishilpo Pro'}
        </a>
      </div>
    );
  }

  // ── Pro Audio Player ──
  return (
    <div className="audio-proofreader-widget">
      <div className="audio-header">
        <span className="audio-badge">
          <Volume2 size={16} /> {lang === 'bn' ? 'অডিও প্রুফরিডার (TTS)' : 'Audio Proofreader'}
        </span>
        <div className="speed-pills">
          {[0.75, 1.0, 1.25, 1.5].map((s) => (
            <button
              key={s}
              className={'speed-pill ' + (rate === s ? 'active' : '')}
              onClick={() => {
                setRate(s);
                if (isPlaying && !isPaused) {
                  window.speechSynthesis.cancel();
                  speakSentence(currentIndexRef.current);
                }
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <div className="audio-controls-row">
        {!isPlaying ? (
          <button className="primary play-btn" onClick={startPlayback} disabled={!text.trim()}>
            <Play size={16} /> {lang === 'bn' ? 'পড়া শুরু করুন' : 'Read Aloud'}
          </button>
        ) : isPaused ? (
          <button className="primary play-btn" onClick={resumePlayback}>
            <Play size={16} /> {lang === 'bn' ? 'চালিয়ে যান' : 'Resume'}
          </button>
        ) : (
          <button className="secondary pause-btn" onClick={pausePlayback}>
            <Pause size={16} /> {lang === 'bn' ? 'থামুন' : 'Pause'}
          </button>
        )}

        {isPlaying && (
          <button className="secondary stop-btn" onClick={stopPlayback} title="Stop">
            <Square size={14} />
          </button>
        )}
      </div>

      {currentSentence && (
        <div className="current-spoken-box">
          <small>{lang === 'bn' ? 'বর্তমান বাক্য:' : 'Currently reading:'}</small>
          <p>“{currentSentence}”</p>
        </div>
      )}
    </div>
  );
};
