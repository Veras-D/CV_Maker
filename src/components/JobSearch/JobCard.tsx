import React from 'react';
import { RemoteJob } from '../../types/jobSearch';
import { isJobAlreadyApplied } from '../../utils/jobFilterEngine';
import { KanbanRole } from '../../types/cv';
import { Globe, DollarSign } from 'lucide-react';
import { JobCardBadges } from './JobCardBadges';
import { JobCardFooter } from './JobCardFooter';

export interface JobCardProps {
  job: RemoteJob;
  kanbanRoles: KanbanRole[];
  onSelectJob: (job: RemoteJob) => void;
  onApplyAndTailor: (job: RemoteJob) => void;
}

const SOURCE_COLORS: Record<RemoteJob['source'], { bg: string; text: string; border: string }> = {
  ashby: { bg: 'bg-purple-950/80', text: 'text-purple-300', border: 'border-purple-800/80' },
  greenhouse: { bg: 'bg-emerald-950/80', text: 'text-emerald-300', border: 'border-emerald-800/80' },
  lever: { bg: 'bg-sky-950/80', text: 'text-sky-300', border: 'border-sky-800/80' },
  smartrecruiters: { bg: 'bg-indigo-950/80', text: 'text-indigo-300', border: 'border-indigo-800/80' },
  remotive: { bg: 'bg-rose-950/80', text: 'text-rose-300', border: 'border-rose-800/80' },
  jobicy: { bg: 'bg-cyan-950/80', text: 'text-cyan-300', border: 'border-cyan-800/80' }
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
        <JobCardBadges
          job={job}
          sourceStyle={sourceStyle}
          appliedInfo={appliedInfo}
        />

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

      <JobCardFooter
        job={job}
        isApplied={appliedInfo.isApplied}
        onSelectJob={onSelectJob}
        onApplyAndTailor={onApplyAndTailor}
      />
    </div>
  );
};
