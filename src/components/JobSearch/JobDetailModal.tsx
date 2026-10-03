import React from 'react';
import { RemoteJob } from '../../types/jobSearch';
import { KanbanRole } from '../../types/cv';
import { formatRelativeTime } from '../../utils/jobFilterEngine';
import { X, ExternalLink, Sparkles, CheckCircle2, Globe, DollarSign, Building } from 'lucide-react';

export interface JobDetailModalProps {
  job: RemoteJob | null;
  kanbanRoles: KanbanRole[];
  onClose: () => void;
  onApplyAndTailor: (job: RemoteJob) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  kanbanRoles,
  onClose,
  onApplyAndTailor
}) => {
  if (!job) return null;

  const appliedInfo = kanbanRoles.find(k => {
    if (k.roleUrl && job.url && k.roleUrl.trim().toLowerCase() === job.url.trim().toLowerCase()) return true;
    return k.company.trim().toLowerCase() === job.company.trim().toLowerCase() &&
           k.roleTitle.trim().toLowerCase() === job.title.trim().toLowerCase();
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/40">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {job.company}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 bg-slate-800 uppercase tracking-wider text-slate-300">
                {job.source}
              </span>
              {appliedInfo && (
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-700/80 text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Already Applied {appliedInfo.dateApplied ? `(${appliedInfo.dateApplied})` : ''}</span>
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-100">
              {job.title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span className="capitalize">{job.location || 'Remote'}</span>
              </div>

              {job.salarySummary && (
                <div className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{job.salarySummary}</span>
                </div>
              )}

              <span className="text-slate-500">
                Posted {formatRelativeTime(job.publishedAt)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Job Description & Requirements
          </h4>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans space-y-3">
            {job.descriptionPlain}
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            Source: <strong className="text-slate-200 uppercase">{job.source}</strong> ATS
          </span>

          <div className="flex items-center gap-2">
            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>Direct Listing</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              type="button"
              onClick={() => {
                onApplyAndTailor(job);
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-sky-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{appliedInfo ? 'Re-Tailor & Apply' : 'Apply & Tailor CV'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
