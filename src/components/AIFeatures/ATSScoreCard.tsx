import React from 'react';
import { Target } from 'lucide-react';
import { LocalTailorOutput } from '../../utils/localAiEngine';

export const ATSScoreCard: React.FC<{ output: LocalTailorOutput }> = ({ output }) => {
  const { atsScore, matchedKeywords, missingKeywords } = output.matchResult;

  const scoreColor = atsScore >= 80 
    ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' 
    : 'text-amber-400 border-amber-500/40 bg-amber-950/40';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-white">Local ATS Semantic Match</span>
        </div>
        <div className={`text-xs font-bold px-2.5 py-1 rounded-full border ${scoreColor}`}>
          {atsScore}% Match
        </div>
      </div>

      {matchedKeywords.length > 0 && (
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Matched Skills & Keywords ({matchedKeywords.length})
          </span>
          <div className="flex flex-wrap gap-1">
            {matchedKeywords.slice(0, 10).map((kw, idx) => (
              <span key={idx} className="text-[10px] bg-sky-950/80 text-sky-300 border border-sky-800/60 px-2 py-0.5 rounded font-medium">
                ✓ {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {missingKeywords.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Job Keywords to Consider Adding:
          </span>
          <div className="flex flex-wrap gap-1">
            {missingKeywords.map((kw, idx) => (
              <span key={idx} className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded">
                + {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
