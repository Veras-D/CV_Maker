export type JobSource = 'ashby' | 'greenhouse' | 'lever' | 'smartrecruiters' | 'remotive' | 'jobicy';

export type PostedTimeFilter = '1d' | '1w' | '1mo' | 'any';

export type JobRegionFilter = 'worldwide' | 'eu' | 'us' | 'latam' | 'apac' | 'any';

export type EmploymentType = 'all' | 'full-time' | 'contract' | 'part-time';

export type ContractDuration = 'all' | '1mo' | '1-3mo' | '3-6mo' | '6mo+';

export interface RemoteJob {
  id: string;
  title: string;
  company: string;
  source: JobSource;
  url: string;
  applyUrl?: string;
  location: string;
  region: 'worldwide' | 'eu' | 'us' | 'latam' | 'apac' | 'other';
  publishedAt: string;
  salarySummary?: string;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  descriptionPlain: string;
  descriptionHtml?: string;
  department?: string;
  employmentType?: 'full-time' | 'contract' | 'freelance' | 'part-time' | 'other';
  contractDuration?: '1mo' | '1-3mo' | '3-6mo' | '6mo+';
  contractDurationLabel?: string;
}

export interface JobSearchFiltersState {
  query: string;
  postedTime: PostedTimeFilter;
  region: JobRegionFilter;
  sources: Record<JobSource, boolean>;
  minSalary: number;
  hideApplied: boolean;
  employmentType: EmploymentType;
  contractDuration: ContractDuration;
}
