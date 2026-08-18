import React from 'react';
import { Zap, Globe, Sparkles } from 'lucide-react';
import { CustomSelect, SelectOption } from '../Common/CustomSelect';

const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: 'en', label: 'English (EN)' },
  { value: 'cs', label: 'Čeština (CS)', isPro: true },
  { value: 'de', label: 'Deutsch (DE)', isPro: true },
  { value: 'fr', label: 'Français (FR)', isPro: true },
  { value: 'es', label: 'Español (ES)', isPro: true },
  { value: 'pt', label: 'Português (PT)', isPro: true }
];

export interface AIRoleTailorHeaderProps {
  activeLanguage: string;
  isMasterEmpty: boolean;
  onLanguageChange: (lang: string) => void;
  onOpenProModal: () => void;
  onOpenIngestionModal: () => void;
}

export const AIRoleTailorHeader: React.FC<AIRoleTailorHeaderProps> = ({
  activeLanguage,
  isMasterEmpty,
  onLanguageChange,
  onOpenProModal,
  onOpenIngestionModal
}) => {
  return (
    <>
      <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-[200px]">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-sky-400" />
            <span>Target Vacancy Auto-Tailor (100% Local RAG)</span>
          </h1>
          <p className="text-xs text-slate-400">
            Semantic ATS matching, bullet re-ranking, and cover letter synthesis
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <span className="text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap">
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span>Target Language:</span>
          </span>
          <CustomSelect
            options={LANGUAGE_OPTIONS}
            value={activeLanguage}
            onChange={onLanguageChange}
            onProClick={onOpenProModal}
            className="min-w-[130px]"
          />
        </div>
      </div>

      {isMasterEmpty && (
        <div className="bg-gradient-to-r from-sky-950/80 to-slate-900 border border-sky-800/60 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">Fast Track: Import Your Profile Data</p>
              <p className="text-slate-400 text-[11px]">Auto-import repositories, skills, and bio from GitHub, website, or resume text.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenIngestionModal}
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs shrink-0 transition-all cursor-pointer flex items-center gap-1.5 shadow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Importer</span>
          </button>
        </div>
      )}
    </>
  );
};
