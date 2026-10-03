import React from 'react';
import { JobSource } from '../../types/jobSearch';
import { Layers } from 'lucide-react';

interface JobSourceCheckboxesProps {
  sources: Record<JobSource, boolean>;
  onToggleSource: (source: JobSource) => void;
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
  onToggleSource
}) => {
  return (
    <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
      <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
        <Layers className="w-3 h-3 text-purple-400" />
        <span>ATS & Job Board Sources:</span>
      </label>
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
