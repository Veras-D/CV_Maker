export type JobSource = 'ashby' | 'greenhouse' | 'lever';

export type PostedTimeFilter = '1d' | '1w' | '1mo' | 'any';

export type JobRegionFilter = 'worldwide' | 'eu' | 'us' | 'latam' | 'apac' | 'any';

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
}

export interface JobSearchFiltersState {
  query: string;
  postedTime: PostedTimeFilter;
  region: JobRegionFilter;
  sources: Record<JobSource, boolean>;
  minSalary: number;
  hideApplied: boolean;
}
