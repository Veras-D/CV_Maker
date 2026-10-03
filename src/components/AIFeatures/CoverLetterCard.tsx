import React from 'react';
import { CoverLetterTone } from '../../utils/coverLetterSynthesizer';
import { CoverLetterToneSelector } from './CoverLetterToneSelector';

export interface CoverLetterCardProps {
  activeLanguage: string;
  coverLetterEditable: string;
  currentTone: CoverLetterTone;
  onCoverLetterChange: (v: string) => void;
  onSelectTone: (tone: CoverLetterTone) => void;
  onShuffleVariation: () => void;
  words: number;
  minutes: number;
}

export const CoverLetterCard: React.FC<CoverLetterCardProps> = ({
  activeLanguage,
  coverLetterEditable,
  currentTone,
  onCoverLetterChange,
  onSelectTone,
  onShuffleVariation,
  words,
  minutes
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-200">
          Tailored Cover Letter ({activeLanguage.toUpperCase()})
        </h4>
        <span className="text-[11px] text-slate-400">Editable preview</span>
      </div>

      <CoverLetterToneSelector
        currentTone={currentTone}
        onSelectTone={onSelectTone}
        onShuffleVariation={onShuffleVariation}
        wordCount={words}
        readTimeMinutes={minutes}
      />

      <textarea
        rows={10}
        value={coverLetterEditable}
        onChange={(e) => onCoverLetterChange(e.target.value)}
        className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 focus:border-sky-500 rounded-lg p-3.5 text-xs text-slate-100 placeholder:text-slate-500 leading-relaxed font-sans focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors shadow-inner resize-y"
      />
    </div>
  );
};
