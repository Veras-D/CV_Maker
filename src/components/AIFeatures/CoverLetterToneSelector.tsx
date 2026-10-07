import React from 'react';
import { Sparkles } from 'lucide-react';
import { CoverLetterTone } from '../../utils/coverLetterSynthesizer';

export interface CoverLetterToneSelectorProps {
  currentTone: CoverLetterTone;
  onSelectTone: (tone: CoverLetterTone) => void;
  onShuffleVariation?: () => void;
  wordCount?: number;
  readTimeMinutes?: number;
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
  disabled = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-950/40 p-2 rounded-xl border border-slate-800/80">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 px-1 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
        <span>Tone:</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 flex-1">
        {TONE_OPTIONS.map((opt) => {
          const isActive = currentTone === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectTone(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-sm font-semibold ring-1 ring-sky-500/30'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{opt.icon}</span>
              <span className="truncate">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
