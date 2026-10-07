import React from 'react';
import { RemoteJob } from '../../types/jobSearch';
import { formatRelativeTime } from '../../utils/jobFilterEngine';
import { CheckCircle2 } from 'lucide-react';

interface JobCardBadgesProps {
  job: RemoteJob;
  sourceStyle: { bg: string; text: string; border: string };
  appliedInfo: { isApplied: boolean; dateApplied?: string };
}

export const JobCardBadges: React.FC<JobCardBadgesProps> = ({ job, sourceStyle, appliedInfo }) => {
  const isContract = job.employmentType === 'contract' || job.employmentType === 'freelance' || Boolean(job.contractDuration);

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-slate-300">
          {job.company}
        </span>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${sourceStyle.bg} ${sourceStyle.text} ${sourceStyle.border}`}>
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
        {isContract && (
          <span className="bg-amber-950/80 text-amber-300 border border-amber-800/80 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
            <span>⚡ Contract{job.contractDurationLabel ? ` (${job.contractDurationLabel})` : ''}</span>
          </span>
        )}
        {job.employmentType === 'part-time' && (
          <span className="bg-blue-950/80 text-blue-300 border border-blue-800/80 text-[10px] font-medium px-2 py-0.5 rounded-full">
            Part-time
          </span>
        )}
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
  );
};
