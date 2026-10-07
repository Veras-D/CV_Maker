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
      <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3.5 flex items-center justify-between text-xs text-emerald-200 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-emerald-300">
              {isOnePage ? '1-Page ATS Compliance Verified' : `${audit.targetPages}-Page Budget Verified`}
            </span>
            <p className="text-[11px] text-emerald-400/80">
              Your resume naturally fits within {audit.targetPages} page(s) ({audit.optimizedHeightMm}mm / {audit.maxAllowedHeightMm}mm). No items were cut.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-950/40 border border-purple-800/60 rounded-xl p-3.5 space-y-2 text-xs text-purple-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-purple-200">
              {isOnePage ? '1-Page ATS Layout Optimizer Applied' : `${audit.targetPages}-Page Layout Optimizer Applied`}
            </span>
            <p className="text-[11px] text-purple-300/80">
              Compacted from {audit.originalHeightMm}mm to {audit.optimizedHeightMm}mm to guarantee single-page compliance.
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-purple-900/60 border border-purple-700/60 text-[10px] font-mono text-purple-300">
          Max: {audit.targetPages} Page{audit.targetPages > 1 ? 's' : ''}
        </span>
      </div>

      <div className="bg-purple-950/60 rounded-lg p-2.5 border border-purple-900/80 space-y-1.5 text-[11px]">
        {audit.omittedExperiencesCount > 0 && (
          <div className="flex items-start gap-1.5 text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              Omitted <strong>{audit.omittedExperiencesCount}</strong> older/less-relevant experience(s) ({audit.omittedExperiences.join(', ')}). Your 2 most recent roles and high-relevance positions were protected.
            </span>
          </div>
        )}

        {audit.trimmedBulletsCount > 0 && (
          <div className="text-purple-300/90 pl-5">
            • Streamlined bullets to top-scoring achievements (guaranteeing min. 2 bullets per job).
          </div>
        )}

        {audit.omittedProjectsCount > 0 && (
          <div className="text-purple-300/90 pl-5">
            • Preserved top #1 matched project; trimmed secondary projects to protect employment space.
          </div>
        )}

        {audit.omittedSkillCategoriesCount > 0 && (
          <div className="text-purple-300/90 pl-5">
            • Filtered skill categories with fewer than 3 matching items to maintain density.
          </div>
        )}

        {audit.omittedEducationCount > 0 && (
          <div className="text-purple-300/90 pl-5">
            • Retained top 2 longest & most job-relevant academic credentials.
          </div>
        )}
      </div>
    </div>
  );
};
