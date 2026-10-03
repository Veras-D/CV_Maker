import React from 'react';
import { JobSource } from '../../types/jobSearch';
import { Layers, Building2 } from 'lucide-react';

interface JobSourceCheckboxesProps {
  sources: Record<JobSource, boolean>;
  onToggleSource: (source: JobSource) => void;
  onOpenCompaniesModal?: () => void;
}

const SOURCES: { id: JobSource; label: string }[] = [
  { id: 'ashby', label: 'Ashby' },
  { id: 'greenhouse', label: 'Greenhouse' },
  { id: 'lever', label: 'Lever' },
  { id: 'smartrecruiters', label: 'SmartRecruiters' },
  { id: 'remotive', label: 'Remotive' },
  { id: 'jobicy', label: 'Jobicy' }
];

export const JobSourceCheckboxes: React.FC<JobSourceCheckboxesProps> = ({
  sources,
  onToggleSource,
  onOpenCompaniesModal
}) => {
  return (
    <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <Layers className="w-3 h-3 text-purple-400" />
          <span>ATS & Job Board Sources:</span>
        </label>
        {onOpenCompaniesModal && (
          <button
            type="button"
            onClick={onOpenCompaniesModal}
            className="text-[11px] font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-sky-950/50 hover:bg-sky-950/80 border border-sky-800/60 transition-colors cursor-pointer"
          >
            <Building2 className="w-3 h-3 text-sky-400" />
            <span>Tracked Companies</span>
            <span className="text-[10px] px-1 rounded bg-orange-950/90 border border-orange-700/70 text-orange-400 font-semibold">YC & Custom</span>
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-0.5">
        {SOURCES.map(src => (
          <label key={src.id} className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(sources[src.id])}
              onChange={() => onToggleSource(src.id)}
              className="rounded bg-slate-950 border-slate-700 text-sky-600 focus:ring-0 cursor-pointer"
            />
            <span>{src.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
