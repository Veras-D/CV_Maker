import React from 'react';
import { Sparkles } from 'lucide-react';
import { ExecutiveSummaryStyle } from '../../utils/summarySynthesizer';

export interface SummaryStyleSelectorProps {
  currentStyle: ExecutiveSummaryStyle;
  onSelectStyle: (style: ExecutiveSummaryStyle) => void;
  disabled?: boolean;
}

const STYLE_OPTIONS: { id: ExecutiveSummaryStyle; label: string; icon: string }[] = [
  { id: 'authentic', label: 'Balanced', icon: '🛡️' },
  { id: 'technical', label: 'Technical Depth', icon: '⚙️' },
  { id: 'impact', label: 'Impact & Scale', icon: '🚀' }
];

export const SummaryStyleSelector: React.FC<SummaryStyleSelectorProps> = ({
  currentStyle,
  onSelectStyle,
  disabled = false
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mr-1 shrink-0">
        <Sparkles className="w-3 h-3 text-sky-400" />
        <span>Style:</span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {STYLE_OPTIONS.map((opt) => {
          const isActive = currentStyle === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectStyle(opt.id)}
              className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-sm font-semibold ring-1 ring-sky-500/30'
                  : 'bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
