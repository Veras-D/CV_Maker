import React from 'react';
import { CoverLetterTone } from '../../utils/coverLetterSynthesizer';
import { CoverLetterToneSelector } from './CoverLetterToneSelector';
import { Shuffle, Clock, FileText } from 'lucide-react';

export interface CoverLetterCardProps {
  coverLetterEditable: string;
  currentTone: CoverLetterTone;
  onCoverLetterChange: (v: string) => void;
  onSelectTone: (tone: CoverLetterTone) => void;
  onShuffleVariation: () => void;
  words: number;
  minutes: number;
  activeLanguage?: string;
}

export const CoverLetterCard: React.FC<CoverLetterCardProps> = ({
  coverLetterEditable,
  currentTone,
  onCoverLetterChange,
  onSelectTone,
  onShuffleVariation,
  words,
  minutes,
  activeLanguage = 'en'
}) => {
  const isOptimal = words >= 200 && words <= 420;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
      {/* Header with Title and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-0.5">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold text-slate-200">
            Tailored Cover Letter ({activeLanguage.toUpperCase()})
          </h4>
          <span className="text-[11px] text-slate-500">·</span>
          <span className="text-[11px] text-slate-400">Editable preview</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onShuffleVariation}
            title="Regenerate with alternative phrasing and hooks"
            className="bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-800/60 px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Shuffle className="w-3 h-3 text-purple-400" />
            <span>Shuffle Phrasing</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-400 shadow-inner">
            <FileText className="w-3 h-3 text-slate-500" />
            <span className={isOptimal ? 'text-emerald-400 font-medium' : 'text-slate-300'}>
              {words}w
            </span>
            <span className="text-slate-600">·</span>
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{minutes}m read</span>
          </div>
        </div>
      </div>

      {/* Full-width Tone Selector */}
      <CoverLetterToneSelector
        currentTone={currentTone}
        onSelectTone={onSelectTone}
      />

      {/* Editor Textarea */}
      <textarea
        rows={10}
        value={coverLetterEditable}
        onChange={(e) => onCoverLetterChange(e.target.value)}
        className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 focus:border-sky-500 rounded-lg p-3.5 text-xs text-slate-100 placeholder:text-slate-500 leading-relaxed font-sans focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors shadow-inner resize-y"
      />
    </div>
  );
};
