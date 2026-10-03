import { RemoteJob, JobSearchFiltersState, EmploymentType, ContractDuration } from '../types/jobSearch';
import { KanbanRole } from '../types/cv';

const EU_KEYWORDS = ['europe', 'emea', 'eu', 'uk', 'united kingdom', 'germany', 'france', 'spain', 'poland', 'czech', 'portugal', 'netherlands', 'ireland', 'sweden', 'london', 'berlin', 'paris', 'amsterdam', 'madrid'];
const US_KEYWORDS = ['united states', 'usa', 'us', 'north america', 'san francisco', 'new york', 'austin', 'seattle', 'remote - us'];
const LATAM_KEYWORDS = ['latam', 'latin america', 'brazil', 'mexico', 'argentina', 'colombia', 'chile'];
const APAC_KEYWORDS = ['apac', 'asia', 'australia', 'singapore', 'japan', 'india', 'sydney', 'tokyo'];
const WORLDWIDE_KEYWORDS = ['worldwide', 'global', 'anywhere', 'work from anywhere', 'all locations', 'remote - global', 'remote - anywhere'];

export function detectJobRegion(locationStr: string): RemoteJob['region'] {
  const loc = (locationStr || '').toLowerCase();
  if (WORLDWIDE_KEYWORDS.some(k => loc.includes(k))) return 'worldwide';
  if (EU_KEYWORDS.some(k => loc.includes(k))) return 'eu';
  if (US_KEYWORDS.some(k => loc.includes(k))) return 'us';
  if (LATAM_KEYWORDS.some(k => loc.includes(k))) return 'latam';
  if (APAC_KEYWORDS.some(k => loc.includes(k))) return 'apac';
  if (loc.includes('remote') || !loc.trim()) return 'worldwide';
  return 'other';
}

const REMOTE_INDICATORS = ['remote', 'home based', 'telecommute', 'virtual', 'anywhere', 'worldwide', 'distributed'];

export function isStrictlyRemote(locationStr: string, workplaceType?: string): boolean {
  const loc = (locationStr || '').toLowerCase();
  const wp = (workplaceType || '').toLowerCase();
  if (wp === 'remote') return true;
  if (wp === 'inperson' || wp === 'on-site' || wp === 'onsite') return false;

  return REMOTE_INDICATORS.some(ind => loc.includes(ind));
}

const REGEX_1MO = /\b(?:(?:1|one)[ -](?:months?|mos?)|30[ -]days?|4[ -]weeks?|interim|short[- ]term)\b/;
const REGEX_1_3MO = /\b(?:(?:2|3|two|three)[ -](?:months?|mos?)|1[ -](?:to[ -])?3[ -](?:months?|mos?)|(?:8|12)[ -]weeks?)\b/;
const REGEX_3_6MO = /\b(?:(?:4|5|6|four|five|six)[ -](?:months?|mos?)|3[ -](?:to[ -])?6[ -](?:months?|mos?))\b/;
const REGEX_6MO_PLUS = /\b(?:(?:[7-9]|1[0-2])[ -](?:months?|mos?)|(?:6\+|12\+)[ -](?:months?|mos?)|1[ -]year|long[- ]term contract)\b/;

export function detectContractDuration(title: string, description: string): {
  duration?: '1mo' | '1-3mo' | '3-6mo' | '6mo+';
  label?: string;
} {
  const text = `${title} ${description}`.toLowerCase();
  if (REGEX_1MO.test(text)) return { duration: '1mo', label: '1 Mo' };
  if (REGEX_1_3MO.test(text)) return { duration: '1-3mo', label: '1–3 Mo' };
  if (REGEX_3_6MO.test(text)) return { duration: '3-6mo', label: '3–6 Mo' };
  if (REGEX_6MO_PLUS.test(text)) return { duration: '6mo+', label: '6+ Mo' };
  return {};
}

export function isJobAlreadyApplied(
  job: RemoteJob,
  kanbanRoles: KanbanRole[]
): { isApplied: boolean; dateApplied?: string; status?: string } {
  if (!kanbanRoles || kanbanRoles.length === 0) return { isApplied: false };

  const jobUrl = job.url.trim().toLowerCase();
  const jobComp = job.company.trim().toLowerCase();
  const jobTitle = job.title.trim().toLowerCase();

  const match = kanbanRoles.find(k => {
    if (k.roleUrl && jobUrl && k.roleUrl.trim().toLowerCase() === jobUrl) return true;
    const sameComp = k.company.trim().toLowerCase() === jobComp;
    const sameTitle = k.roleTitle.trim().toLowerCase() === jobTitle;
    return sameComp && sameTitle;
  });

  if (!match) return { isApplied: false };
  return {
    isApplied: true,
    dateApplied: match.dateApplied,
    status: match.status
  };
}

const TIME_FILTER_HOURS: Record<string, number> = {
  '24h': 24,
  '3d': 24 * 3,
  '1w': 24 * 7,
  '2w': 24 * 14,
  '1mo': 24 * 30,
  '2mo': 24 * 60,
  '3mo': 24 * 90
};

function matchesTimeFilter(publishedAt: string, filter: JobSearchFiltersState['postedTime']): boolean {
  const maxHours = TIME_FILTER_HOURS[filter];
  if (!maxHours) return true;

  const pubTime = new Date(publishedAt).getTime();
  if (isNaN(pubTime)) return true;

  const diffHours = (Date.now() - pubTime) / (1000 * 60 * 60);
  return diffHours <= maxHours;
}

function matchesRegion(jobRegion: RemoteJob['region'], filter: JobSearchFiltersState['region']): boolean {
  if (filter === 'any') return true;
  if (filter === 'worldwide') return jobRegion === 'worldwide';
  return jobRegion === filter;
}

function matchesSalary(job: RemoteJob, minFilter: number): boolean {
  if (minFilter <= 0) return true;
  if (job.maxSalary && job.maxSalary >= minFilter) return true;
  if (job.minSalary && job.minSalary >= minFilter) return true;
  return false;
}

function matchesEmploymentType(job: RemoteJob, filter: EmploymentType): boolean {
  if (filter === 'all') return true;
  if (filter === 'contract') {
    return job.employmentType === 'contract' || job.employmentType === 'freelance' || Boolean(job.contractDuration);
  }
  if (filter === 'full-time') {
    return job.employmentType === 'full-time' || !job.employmentType;
  }
  if (filter === 'part-time') {
    return job.employmentType === 'part-time';
  }
  return true;
}

function matchesContractDuration(job: RemoteJob, filter: ContractDuration): boolean {
  if (filter === 'all') return true;
  return job.contractDuration === filter;
}

interface FilterJobParams {
  jobs: RemoteJob[];
  filters: JobSearchFiltersState;
  kanbanRoles: KanbanRole[];
}

export function filterRemoteJobs(params: FilterJobParams): RemoteJob[] {
  const { jobs, filters, kanbanRoles } = params;
  const queryTokens = filters.query.toLowerCase().trim().split(/\s+/).filter(Boolean);

  return jobs.filter(job => {
    if (!filters.sources[job.source]) return false;
    if (!isStrictlyRemote(job.location)) return false;
    if (!matchesTimeFilter(job.publishedAt, filters.postedTime)) return false;
    if (!matchesRegion(job.region, filters.region)) return false;
    if (!matchesSalary(job, filters.minSalary)) return false;
    if (!matchesEmploymentType(job, filters.employmentType)) return false;
    if (!matchesContractDuration(job, filters.contractDuration)) return false;

    if (filters.hideApplied) {
      const appliedInfo = isJobAlreadyApplied(job, kanbanRoles);
      if (appliedInfo.isApplied) return false;
    }

    if (queryTokens.length > 0) {
      const titleLower = job.title.toLowerCase();
      const compLower = job.company.toLowerCase();
      const combined = `${titleLower} ${compLower}`;
      const matchesAll = queryTokens.every(tok => combined.includes(tok));
      if (!matchesAll) return false;
    }

    return true;
  });
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}
