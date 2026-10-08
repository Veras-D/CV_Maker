import React from 'react';
import { PageBudgetAudit } from '../../utils/cvPageBudgetOptimizer';
import { FileSpreadsheet, CheckCircle, AlertTriangle } from 'lucide-react';

export interface PageBudgetAuditBannerProps {
  audit?: PageBudgetAudit;
}

export const PageBudgetAuditBanner: React.FC<PageBudgetAuditBannerProps> = ({ audit }) => {
  if (!audit) return null;

  const isOnePage = audit.targetPages === 1;

  if (!audit.wasCompacted) {
    return (
      <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-200 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-emerald-300">
              {isOnePage ? '1-Page ATS Layout Verified' : `${audit.targetPages}-Page Layout Verified`}
            </span>
            <p className="text-[11px] text-emerald-400/80">
              Your resume naturally fits within {audit.targetPages} page{audit.targetPages > 1 ? 's' : ''}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-950/40 border border-purple-800/60 rounded-xl p-3 space-y-2 text-xs text-purple-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-purple-200">
              {isOnePage ? '1-Page ATS Layout Optimized' : `${audit.targetPages}-Page Layout Optimized`}
            </span>
            <p className="text-[11px] text-purple-300/80">
              Formatted to guarantee {audit.targetPages}-page compliance.
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-purple-900/60 border border-purple-700/60 text-[10px] font-mono text-purple-300">
          Max: {audit.targetPages} Page{audit.targetPages > 1 ? 's' : ''}
        </span>
      </div>

      {audit.omittedExperiencesCount > 0 && (
        <div className="bg-purple-950/60 rounded-lg px-2.5 py-1.5 border border-purple-900/80 flex items-center gap-2 text-[11px] text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>
            Omitted {audit.omittedExperiencesCount} older role{audit.omittedExperiencesCount > 1 ? 's' : ''} ({audit.omittedExperiences.join(', ')}) to fit {audit.targetPages} page{audit.targetPages > 1 ? 's' : ''}.
          </span>
        </div>
      )}
    </div>
  );
};
