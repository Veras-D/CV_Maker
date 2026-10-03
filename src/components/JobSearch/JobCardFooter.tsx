import React from 'react';
import { RemoteJob } from '../../types/jobSearch';
import { ExternalLink, Sparkles } from 'lucide-react';

interface JobCardFooterProps {
  job: RemoteJob;
  isApplied: boolean;
  onSelectJob: (job: RemoteJob) => void;
  onApplyAndTailor: (job: RemoteJob) => void;
}

export const JobCardFooter: React.FC<JobCardFooterProps> = ({
  job,
  isApplied,
  onSelectJob,
  onApplyAndTailor
}) => {
  return (
    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 mt-1">
      <button
        type="button"
        onClick={() => onSelectJob(job)}
        className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
      >
        View Details
      </button>

      <div className="flex items-center gap-2">
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Open job link in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        <button
          type="button"
          onClick={() => onApplyAndTailor(job)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
            isApplied
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{isApplied ? 'Re-Tailor & Apply' : 'Apply & Tailor'}</span>
        </button>
      </div>
    </div>
  );
};
