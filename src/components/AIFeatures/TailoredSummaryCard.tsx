import React from 'react';
import { SummaryStyleSelector } from './SummaryStyleSelector';
import { ExecutiveSummaryStyle } from '../../utils/localAiEngine';

export interface TailoredSummaryCardProps {
  activeLanguage: string;
  summaryEditable: string;
  currentSummaryStyle?: ExecutiveSummaryStyle;
  onSummaryChange: (v: string) => void;
  onSelectSummaryStyle?: (style: ExecutiveSummaryStyle) => void;
  onResetSummaryToMaster: () => void;
}

export const TailoredSummaryCard: React.FC<TailoredSummaryCardProps> = ({
  activeLanguage,
  summaryEditable,
  currentSummaryStyle,
  onSummaryChange,
  onSelectSummaryStyle,
  onResetSummaryToMaster
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-0.5">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold text-slate-200">
            Executive Profile Summary ({activeLanguage.toUpperCase()})
          </h4>
          <span className="text-[11px] text-slate-500">·</span>
          <span className="text-[11px] text-slate-400">Editable preview</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetSummaryToMaster}
            className="text-[11px] text-sky-400 hover:text-sky-300 hover:underline cursor-pointer"
            title="Restore original summary from Master Profile"
          >
            Reset to Master Summary
          </button>
        </div>
      </div>

      {onSelectSummaryStyle && (
        <SummaryStyleSelector
          currentStyle={currentSummaryStyle || 'authentic'}
          onSelectStyle={onSelectSummaryStyle}
        />
      )}

      <textarea
        rows={3}
        value={summaryEditable}
        onChange={(e) => onSummaryChange(e.target.value)}
        className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 focus:border-sky-500 rounded-lg p-3 text-xs text-slate-100 placeholder:text-slate-500 leading-relaxed font-sans focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors shadow-inner resize-y"
      />
    </div>
  );
};
