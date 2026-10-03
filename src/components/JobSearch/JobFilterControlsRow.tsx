import React from 'react';
import { 
  JobSearchFiltersState, 
  PostedTimeFilter, 
  JobRegionFilter, 
  EmploymentType,
  ContractDuration
} from '../../types/jobSearch';
import { Clock, Globe, DollarSign, Briefcase, Zap } from 'lucide-react';

interface JobFilterControlsRowProps {
  filters: JobSearchFiltersState;
  onChangeFilters: (newFilters: JobSearchFiltersState) => void;
}

const POSTED_TIME_OPTIONS: { id: PostedTimeFilter; label: string }[] = [
  { id: '24h', label: 'Past 24 Hours' },
  { id: '3d', label: 'Past 3 Days' },
  { id: '1w', label: 'Past Week' },
  { id: '2w', label: 'Past 2 Weeks' },
  { id: '1mo', label: 'Past Month' },
  { id: '2mo', label: 'Past 2 Months' },
  { id: '3mo', label: 'Past 3 Months' },
  { id: 'any', label: 'Any Time' }
];

export const JobFilterControlsRow: React.FC<JobFilterControlsRowProps> = ({
  filters,
  onChangeFilters
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-800/80">
      {/* Posted Time Filter */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3 text-sky-400" />
          <span>Posted Within:</span>
        </label>
        <select
          value={filters.postedTime}
          onChange={(e) => onChangeFilters({ ...filters, postedTime: e.target.value as PostedTimeFilter })}
          className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
        >
          {POSTED_TIME_OPTIONS.map(t => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
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

      {/* Employment Type */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <Briefcase className="w-3 h-3 text-sky-400" />
          <span>Job Type:</span>
        </label>
        <select
          value={filters.employmentType}
          onChange={(e) => onChangeFilters({ ...filters, employmentType: e.target.value as EmploymentType })}
          className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
        >
          <option value="all">All Employment Types</option>
          <option value="contract">⚡ Contract / Freelance</option>
          <option value="full-time">Full-Time</option>
          <option value="part-time">Part-Time</option>
        </select>
      </div>

      {/* Contract Duration Filter */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Contract Duration:</span>
        </label>
        <select
          value={filters.contractDuration}
          onChange={(e) => onChangeFilters({ ...filters, contractDuration: e.target.value as ContractDuration })}
          className={`w-full bg-slate-950 border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer ${
            filters.contractDuration !== 'all' || filters.employmentType === 'contract'
              ? 'border-amber-700/80 text-amber-200 focus:border-amber-500'
              : 'border-slate-800 hover:border-slate-700 text-slate-200 focus:border-sky-500'
          }`}
        >
          <option value="all">Any Duration</option>
          <option value="1mo">⚡ 1 Month / Short-term</option>
          <option value="1-3mo">⚡ 1 – 3 Months</option>
          <option value="3-6mo">⚡ 3 – 6 Months</option>
          <option value="6mo+">⚡ 6+ Months (Long-term)</option>
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
    </div>
  );
};
