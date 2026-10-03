import React from 'react';
import { 
  JobSearchFiltersState, 
  PostedTimeFilter, 
  JobRegionFilter, 
  JobSource 
} from '../../types/jobSearch';
import { buildGoogleAtsSearchUrl } from '../../utils/jobSearchApi';
import { JobSearchBar } from './JobSearchBar';
import { Clock, Globe, DollarSign, Layers } from 'lucide-react';

export interface JobSearchFiltersProps {
  filters: JobSearchFiltersState;
  onChangeFilters: (newFilters: JobSearchFiltersState) => void;
  totalFound: number;
  appliedCount?: number;
}

export const JobSearchFilters: React.FC<JobSearchFiltersProps> = ({
  filters,
  onChangeFilters,
  totalFound,
  appliedCount
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

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
      {/* Search Input Bar */}
      <JobSearchBar
        query={filters.query}
        onQueryChange={(q) => onChangeFilters({ ...filters, query: q })}
        googleAtsUrl={googleAtsUrl}
      />

      {/* Mandatory & Optional Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
        {/* Posted Time Filter */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-sky-400" />
            <span>Posted Within:</span>
          </label>
          <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['1d', '1w', '1mo', 'any'] as PostedTimeFilter[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => onChangeFilters({ ...filters, postedTime: t })}
                className={`py-1 text-[11px] rounded text-center transition-all cursor-pointer font-medium ${
                  filters.postedTime === t
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === '1d' ? '24h' : t === '1w' ? '1 Week' : t === '1mo' ? '1 Mo' : 'Any'}
              </button>
            ))}
          </div>
        </div>

        {/* Region Filter */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Globe className="w-3 h-3 text-sky-400" />
            <span>Remote Region:</span>
          </label>
          <select
            value={filters.region}
            onChange={(e) => onChangeFilters({ ...filters, region: e.target.value as JobRegionFilter })}
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="worldwide">🌐 Worldwide Only (Strict)</option>
            <option value="eu">🇪🇺 Europe / EMEA</option>
            <option value="us">🇺🇸 United States</option>
            <option value="latam">🌎 Latin America</option>
            <option value="apac">🌏 Asia-Pacific</option>
            <option value="any">🌍 Any Remote Region</option>
          </select>
        </div>

        {/* Salary Filter */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            <span>Min Salary:</span>
          </label>
          <select
            value={filters.minSalary}
            onChange={(e) => onChangeFilters({ ...filters, minSalary: Number(e.target.value) })}
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value={0}>Any / Not Specified</option>
            <option value={60000}>$60,000+ / yr</option>
            <option value={90000}>$90,000+ / yr</option>
            <option value={120000}>$120,000+ / yr</option>
            <option value={150000}>$150,000+ / yr</option>
            <option value={200000}>$200,000+ / yr</option>
          </select>
        </div>

        {/* Source Checkboxes */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Layers className="w-3 h-3 text-purple-400" />
            <span>Role Sources:</span>
          </label>
          <div className="flex items-center gap-3 pt-1">
            {(['ashby', 'greenhouse', 'lever'] as JobSource[]).map(src => (
              <label key={src} className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.sources[src]}
                  onChange={() => toggleSource(src)}
                  className="rounded bg-slate-950 border-slate-700 text-sky-600 focus:ring-0 cursor-pointer"
                />
                <span className="capitalize">{src}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count & Hide Applied Toggle */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
        <span className="text-slate-400">
          Found <strong className="text-sky-400">{totalFound}</strong> active remote roles
        </span>

        <label className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-300 hover:text-slate-100 cursor-pointer transition-colors select-none">
          <input
            type="checkbox"
            checked={filters.hideApplied}
            onChange={(e) => onChangeFilters({ ...filters, hideApplied: e.target.checked })}
            className="rounded bg-slate-900 border-slate-700 text-sky-600 focus:ring-0 cursor-pointer"
          />
          <span className="font-medium">Don&apos;t show already applied jobs</span>
          {typeof appliedCount === 'number' && appliedCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
              {appliedCount} applied
            </span>
          )}
        </label>
      </div>
    </div>
  );
};
