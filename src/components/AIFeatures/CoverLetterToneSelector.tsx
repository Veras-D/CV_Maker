import React from 'react';
import { Shuffle, Clock, FileText, Sparkles } from 'lucide-react';
import { CoverLetterTone } from '../../utils/coverLetterSynthesizer';

export interface CoverLetterToneSelectorProps {
  currentTone: CoverLetterTone;
  onSelectTone: (tone: CoverLetterTone) => void;
  onShuffleVariation: () => void;
  wordCount: number;
  readTimeMinutes: number;
  disabled?: boolean;
}

const TONE_OPTIONS: { id: CoverLetterTone; label: string; icon: string }[] = [
  { id: 'professional', label: 'Professional', icon: '👔' },
  { id: 'metric', label: 'Metric-Driven', icon: '📈' },
  { id: 'technical', label: 'Technical', icon: '⚙️' },
  { id: 'conversational', label: 'Conversational', icon: '💬' }
];

export const CoverLetterToneSelector: React.FC<CoverLetterToneSelectorProps> = ({
  currentTone,
  onSelectTone,
  onShuffleVariation,
  wordCount,
  readTimeMinutes,
  disabled = false
}) => {
  const isOptimal = wordCount >= 200 && wordCount <= 420;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 pb-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-sky-400" />
          Tone:
        </span>
        {TONE_OPTIONS.map((opt) => {
          const isActive = currentTone === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectTone(opt.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                isActive
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-sm font-semibold'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/80'
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          disabled={disabled}
          onClick={onShuffleVariation}
          title="Regenerate with alternative phrasing and hooks"
          className="bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-800/60 px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Shuffle className="w-3 h-3 text-purple-400" />
          <span>Shuffle Phrasing</span>
        </button>

        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-950 border border-slate-800 rounded-md text-[11px] text-slate-400">
          <FileText className="w-3 h-3 text-slate-500" />
          <span className={isOptimal ? 'text-emerald-400 font-medium' : 'text-slate-300'}>
            {wordCount}w
          </span>
          <span className="text-slate-600">·</span>
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{readTimeMinutes}m read</span>
        </div>
      </div>
    </div>
  );
};
