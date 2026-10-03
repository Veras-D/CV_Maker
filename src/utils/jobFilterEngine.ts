import { RemoteJob, JobSearchFiltersState } from '../types/jobSearch';
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

function matchesTimeFilter(publishedAt: string, filter: JobSearchFiltersState['postedTime']): boolean {
  if (filter === 'any') return true;
  const pubTime = new Date(publishedAt).getTime();
  if (isNaN(pubTime)) return true;
  const now = Date.now();
  const diffHours = (now - pubTime) / (1000 * 60 * 60);

  if (filter === '1d') return diffHours <= 24;
  if (filter === '1w') return diffHours <= 24 * 7;
  if (filter === '1mo') return diffHours <= 24 * 30;
  return true;
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
