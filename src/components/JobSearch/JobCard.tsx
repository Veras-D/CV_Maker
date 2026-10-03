import React from 'react';
import { RemoteJob } from '../../types/jobSearch';
import { formatRelativeTime, isJobAlreadyApplied } from '../../utils/jobFilterEngine';
import { KanbanRole } from '../../types/cv';
import { ExternalLink, Sparkles, CheckCircle2, Globe, DollarSign } from 'lucide-react';

export interface JobCardProps {
  job: RemoteJob;
  kanbanRoles: KanbanRole[];
  onSelectJob: (job: RemoteJob) => void;
  onApplyAndTailor: (job: RemoteJob) => void;
}

const SOURCE_COLORS: Record<RemoteJob['source'], { bg: string; text: string; border: string }> = {
  ashby: { bg: 'bg-purple-950/80', text: 'text-purple-300', border: 'border-purple-800/80' },
  greenhouse: { bg: 'bg-emerald-950/80', text: 'text-emerald-300', border: 'border-emerald-800/80' },
  lever: { bg: 'bg-sky-950/80', text: 'text-sky-300', border: 'border-sky-800/80' }
};

export const JobCard: React.FC<JobCardProps> = ({
  job,
  kanbanRoles,
  onSelectJob,
  onApplyAndTailor
}) => {
  const appliedInfo = isJobAlreadyApplied(job, kanbanRoles);

  const sourceStyle = SOURCE_COLORS[job.source] || SOURCE_COLORS.greenhouse;

  return (
    <div className={`bg-slate-900 border rounded-xl p-4 transition-all hover:border-slate-700 flex flex-col justify-between gap-3 ${
      appliedInfo.isApplied ? 'border-emerald-900/60 bg-slate-900/90' : 'border-slate-800'
    }`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-300">
              {job.company}
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${sourceStyle.bg} ${sourceStyle.text} ${sourceStyle.border}`}>
              {job.source}
            </span>
            {appliedInfo.isApplied && (
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-700/80 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Applied {appliedInfo.dateApplied ? `(${appliedInfo.dateApplied})` : ''}</span>
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 whitespace-nowrap">
            {formatRelativeTime(job.publishedAt)}
          </span>
        </div>

        <h3 
          onClick={() => onSelectJob(job)}
          className="text-sm sm:text-base font-bold text-slate-100 hover:text-sky-400 transition-colors cursor-pointer line-clamp-2"
        >
          {job.title}
        </h3>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-sky-400" />
            <span className="capitalize">{job.location || 'Remote'}</span>
          </div>

          {job.salarySummary && (
            <div className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              <span>{job.salarySummary}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {job.descriptionPlain || 'No description provided.'}
        </p>
      </div>

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
              appliedInfo.isApplied
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{appliedInfo.isApplied ? 'Re-Tailor & Apply' : 'Apply & Tailor'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
