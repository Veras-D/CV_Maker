import React from 'react';
import { 
  JobSearchFiltersState, 
  PostedTimeFilter, 
  JobRegionFilter, 
  EmploymentType,
  ContractDuration
} from '../../types/jobSearch';
import { Clock, Globe, DollarSign, Briefcase, Zap } from 'lucide-react';
import { CustomSelect, SelectOption } from '../Common/CustomSelect';

interface JobFilterControlsRowProps {
  filters: JobSearchFiltersState;
  onChangeFilters: (newFilters: JobSearchFiltersState) => void;
}

const POSTED_TIME_OPTIONS: SelectOption[] = [
  { value: '24h', label: 'Past 24 Hours' },
  { value: '3d', label: 'Past 3 Days' },
  { value: '1w', label: 'Past Week' },
  { value: '2w', label: 'Past 2 Weeks' },
  { value: '1mo', label: 'Past Month' },
  { value: '2mo', label: 'Past 2 Months' },
  { value: '3mo', label: 'Past 3 Months' },
  { value: 'any', label: 'Any Time' }
];

const REGION_OPTIONS: SelectOption[] = [
  { value: 'worldwide', label: '🌐 Worldwide Only (Strict)' },
  { value: 'eu', label: '🇪🇺 Europe / EMEA' },
  { value: 'us', label: '🇺🇸 United States' },
  { value: 'latam', label: '🌎 Latin America' },
  { value: 'apac', label: '🌏 Asia-Pacific' },
  { value: 'any', label: '🌍 Any Remote Region' }
];

const EMPLOYMENT_TYPE_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All Employment Types' },
  { value: 'contract', label: '⚡ Contract / Freelance' },
  { value: 'full-time', label: 'Full-Time' },
  { value: 'part-time', label: 'Part-Time' }
];

const CONTRACT_DURATION_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Any Duration' },
  { value: '1mo', label: '⚡ 1 Month / Short-term' },
  { value: '1-3mo', label: '⚡ 1 – 3 Months' },
  { value: '3-6mo', label: '⚡ 3 – 6 Months' },
  { value: '6mo+', label: '⚡ 6+ Months (Long-term)' }
];

const SALARY_OPTIONS: SelectOption[] = [
  { value: '0', label: 'Any / Not Specified' },
  { value: '60000', label: '$60,000+ / yr' },
  { value: '90000', label: '$90,000+ / yr' },
  { value: '120000', label: '$120,000+ / yr' },
  { value: '150000', label: '$150,000+ / yr' },
  { value: '200000', label: '$200,000+ / yr' }
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
        <CustomSelect
          options={POSTED_TIME_OPTIONS}
          value={filters.postedTime}
          onChange={(val) => onChangeFilters({ ...filters, postedTime: val as PostedTimeFilter })}
        />
      </div>

      {/* Region Filter */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <Globe className="w-3 h-3 text-sky-400" />
          <span>Remote Region:</span>
        </label>
        <CustomSelect
          options={REGION_OPTIONS}
          value={filters.region}
          onChange={(val) => onChangeFilters({ ...filters, region: val as JobRegionFilter })}
        />
      </div>

      {/* Employment Type */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <Briefcase className="w-3 h-3 text-sky-400" />
          <span>Job Type:</span>
        </label>
        <CustomSelect
          options={EMPLOYMENT_TYPE_OPTIONS}
          value={filters.employmentType}
          onChange={(val) => onChangeFilters({ ...filters, employmentType: val as EmploymentType })}
        />
      </div>

      {/* Contract Duration Filter */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Contract Duration:</span>
        </label>
        <CustomSelect
          options={CONTRACT_DURATION_OPTIONS}
          value={filters.contractDuration}
          onChange={(val) => onChangeFilters({ ...filters, contractDuration: val as ContractDuration })}
        />
      </div>

      {/* Salary Filter */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <DollarSign className="w-3 h-3 text-emerald-400" />
          <span>Min Salary:</span>
        </label>
        <CustomSelect
          options={SALARY_OPTIONS}
          value={String(filters.minSalary)}
          onChange={(val) => onChangeFilters({ ...filters, minSalary: Number(val) })}
        />
      </div>
    </div>
  );
};
