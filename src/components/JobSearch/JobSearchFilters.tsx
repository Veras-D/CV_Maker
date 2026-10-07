import React from 'react';
import { JobSearchFiltersState, JobSource, RemoteJob } from '../../types/jobSearch';
import { buildGoogleAtsSearchUrl } from '../../utils/jobSearchApi';
import { JobSearchBar } from './JobSearchBar';
import { JobFilterControlsRow } from './JobFilterControlsRow';
import { JobSourceCheckboxes } from './JobSourceCheckboxes';

export interface JobSearchFiltersProps {
  filters: JobSearchFiltersState;
  onChangeFilters: (newFilters: JobSearchFiltersState) => void;
  totalFound: number;
  jobs?: RemoteJob[];
  appliedCount?: number;
  clickedCount?: number;
  isLoading?: boolean;
  onOpenCompaniesModal?: () => void;
}

export const JobSearchFilters: React.FC<JobSearchFiltersProps> = ({
  filters,
  onChangeFilters,
  totalFound,
  jobs,
  appliedCount,
  clickedCount,
  isLoading,
  onOpenCompaniesModal
}) => {
  const toggleSource = (source: JobSource) => {
    onChangeFilters({
      ...filters,
      sources: {
        ...filters.sources,
        [source]: !filters.sources[source]
      }
    });
  };

  const googleAtsUrl = buildGoogleAtsSearchUrl(filters.query);
  const displayHiddenCount = clickedCount ?? appliedCount;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
      <JobSearchBar
        query={filters.query}
        onQueryChange={(q) => onChangeFilters({ ...filters, query: q })}
        googleAtsUrl={googleAtsUrl}
        jobs={jobs}
      />

      <JobFilterControlsRow
        filters={filters}
        onChangeFilters={onChangeFilters}
      />

      <JobSourceCheckboxes
        sources={filters.sources}
        onToggleSource={toggleSource}
        onOpenCompaniesModal={onOpenCompaniesModal}
      />

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
        <span className="text-slate-400">
          {isLoading ? (
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span>Searching live remote boards...</span>
            </span>
          ) : (
            <>Found <strong className="text-sky-400">{totalFound}</strong> active remote roles</>
          )}
        </span>

        <label className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-300 hover:text-slate-100 cursor-pointer transition-colors select-none">
          <input
            type="checkbox"
            checked={Boolean(filters.hideClicked ?? filters.hideApplied)}
            onChange={(e) => {
              const checked = e.target.checked;
              onChangeFilters({
                ...filters,
                hideClicked: checked,
                hideApplied: checked
              });
            }}
            className="rounded bg-slate-900 border-slate-700 text-sky-600 focus:ring-0 cursor-pointer"
          />
          <span className="font-medium">Hide already clicked</span>
          {typeof displayHiddenCount === 'number' && displayHiddenCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
              {displayHiddenCount}
            </span>
          )}
        </label>
      </div>
    </div>
  );
};
