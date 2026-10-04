import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { RemoteJob } from '../../types/jobSearch';
import { KanbanRole } from '../../types/cv';
import { formatRelativeTime, isJobAlreadyApplied } from '../../utils/jobFilterEngine';
import { openExternalUrl } from '../../utils/urlHelper';
import { 
  X, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Globe, 
  DollarSign, 
  Building,
  Clock,
  Briefcase
} from 'lucide-react';

export interface JobDetailModalProps {
  job: RemoteJob | null;
  kanbanRoles: KanbanRole[];
  onClose: () => void;
  onApplyAndTailor: (job: RemoteJob) => void;
}

const getEmploymentLabel = (job: RemoteJob): string => {
  const isContract = job.employmentType === 'contract' || job.employmentType === 'freelance' || Boolean(job.contractDuration);
  if (isContract) {
    return `Contract${job.contractDurationLabel ? ` (${job.contractDurationLabel})` : ''}`;
  }
  return 'Full-time';
};

interface JobDetailMetaGridProps {
  job: RemoteJob;
}

const JobDetailMetaGrid: React.FC<JobDetailMetaGridProps> = ({ job }) => {
  const employmentLabel = getEmploymentLabel(job);
  const salaryColorClass = job.salarySummary ? 'text-emerald-400' : 'text-slate-400';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
      <div className="space-y-0.5">
        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1">
          <Briefcase className="w-3 h-3 text-sky-400" />
          Type
        </span>
        <p className="text-slate-200 font-medium truncate" title={employmentLabel}>
          {employmentLabel}
        </p>
      </div>

      <div className="space-y-0.5">
        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1">
          <Globe className="w-3 h-3 text-sky-400" />
          Location
        </span>
        <p className="text-slate-200 font-medium capitalize truncate" title={job.location || 'Remote'}>
          {job.location || 'Remote'}
        </p>
      </div>

      <div className="space-y-0.5">
        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1">
          <DollarSign className="w-3 h-3 text-emerald-400" />
          Compensation
        </span>
        <p className={`font-medium truncate ${salaryColorClass}`} title={job.salarySummary || 'Not specified'}>
          {job.salarySummary || 'Not specified'}
        </p>
      </div>

      <div className="space-y-0.5">
        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          Posted
        </span>
        <p className="text-slate-300 font-medium truncate">
          {formatRelativeTime(job.publishedAt)}
        </p>
      </div>
    </div>
  );
};

interface JobDetailFooterProps {
  job: RemoteJob;
  isApplied: boolean;
  onApplyAndTailor: (job: RemoteJob) => void;
  onClose: () => void;
}

const JobDetailFooter: React.FC<JobDetailFooterProps> = ({
  job,
  isApplied,
  onApplyAndTailor,
  onClose
}) => {
  return (
    <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
      <span className="text-xs text-slate-400">
        Source: <strong className="text-slate-200 uppercase">{job.source}</strong> ATS
      </span>

      <div className="flex items-center gap-2">
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              openExternalUrl(job.url);
            }}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
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
          <span>{isApplied ? 'Re-Tailor & Apply' : 'Apply & Tailor CV'}</span>
        </button>
      </div>
    </div>
  );
};

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  kanbanRoles,
  onClose,
  onApplyAndTailor
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!job) return null;

  const appliedInfo = isJobAlreadyApplied(job, kanbanRoles);

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex justify-end overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Right Drawer */}
      <div className="relative w-full max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-10 animate-slide-in-right overflow-hidden">
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/50 shrink-0 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-slate-400" />
                <span>{job.company}</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 bg-slate-800 uppercase tracking-wider text-slate-300">
                {job.source}
              </span>
              {job.isYc && (
                <span 
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-950/70 border border-orange-800/60 text-orange-400 tracking-wider shadow-sm select-none"
                  title="Y Combinator Company"
                >
                  YC
                </span>
              )}
              {appliedInfo.isApplied && (
                <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-700/80 text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Applied {appliedInfo.dateApplied ? `(${appliedInfo.dateApplied})` : ''}</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight leading-snug">
            {job.title}
          </h2>

          <JobDetailMetaGrid job={job} />
        </div>

        {/* Scrollable Description Body */}
        <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Job Description & Requirements
          </h4>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans space-y-3 selection:bg-sky-500/30">
            {job.descriptionPlain}
          </div>
        </div>

        <JobDetailFooter 
          job={job}
          isApplied={appliedInfo.isApplied}
          onApplyAndTailor={onApplyAndTailor}
          onClose={onClose}
        />
      </div>
    </div>,
    document.body
  );
};
