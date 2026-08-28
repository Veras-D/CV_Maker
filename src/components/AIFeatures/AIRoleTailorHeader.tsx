import React from 'react';
import { Zap, Sparkles } from 'lucide-react';

export interface AIRoleTailorHeaderProps {
  isMasterEmpty: boolean;
  onOpenIngestionModal: () => void;
}

export const AIRoleTailorHeader: React.FC<AIRoleTailorHeaderProps> = ({
  isMasterEmpty,
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
