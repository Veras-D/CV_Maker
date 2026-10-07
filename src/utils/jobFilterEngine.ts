import { RemoteJob, JobSearchFiltersState, EmploymentType, ContractDuration } from '../types/jobSearch';
import { KanbanRole } from '../types/cv';
import { isJobClicked } from './clickedJobsService';

const US_REGEX = /\b(?:united states|usa|u\.s\.a\.?|u\.s\.?|us|north america|san francisco|new york|austin|seattle|california|chicago|boston|los angeles|remote - us|remote u\.?s\.?|us only|usa only)\b/i;
const EU_REGEX = /\b(?:europe|emea|eu|uk|united kingdom|germany|france|spain|poland|czech|portugal|netherlands|ireland|sweden|london|berlin|paris|amsterdam|madrid)\b/i;
const LATAM_REGEX = /\b(?:latam|latin america|brazil|mexico|argentina|colombia|chile)\b/i;
const APAC_REGEX = /\b(?:apac|asia|australia|singapore|japan|india|sydney|tokyo)\b/i;
const WORLDWIDE_KEYWORDS = ['worldwide', 'global', 'anywhere', 'work from anywhere', 'all locations', 'remote - global', 'remote - anywhere'];

function isSpecificRegion(loc: string): RemoteJob['region'] | null {
  if (US_REGEX.test(loc)) return 'us';
  if (EU_REGEX.test(loc)) return 'eu';
  if (LATAM_REGEX.test(loc)) return 'latam';
  if (APAC_REGEX.test(loc)) return 'apac';
  return null;
}

export function detectJobRegion(locationStr: string): RemoteJob['region'] {
  const loc = (locationStr || '').toLowerCase();
  const specific = isSpecificRegion(loc);

  if (loc.includes('worldwide')) return 'worldwide';
  if (specific) return specific;

  const hasWorldwideKeyword = WORLDWIDE_KEYWORDS.some(k => loc.includes(k));
  if (hasWorldwideKeyword || loc.includes('remote') || !loc.trim()) {
    return 'worldwide';
  }
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

function parseSalaryNumbers(cleaned: string, isHourly: boolean, isMonthly: boolean): number[] {
  const regex = /([0-9]+(?:[.,][0-9]+)?)\s*([kKmM])?/g;
  const matches = [...cleaned.matchAll(regex)];
  const nums: number[] = [];

  for (const m of matches) {
    if (!m[1]) continue;
    let val = parseFloat(m[1].replace(',', '.'));
    const unit = (m[2] || '').toLowerCase();
    if (unit === 'k') {
      val *= 1000;
    } else if (unit === 'm') {
      val *= 1000000;
    } else if (isHourly) {
      val *= 2000;
    } else if (isMonthly && val < 50000) {
      val *= 12;
    }
    if (val > 0) nums.push(Math.round(val));
  }
  return nums;
}

function detectSalaryCurrency(str: string): string {
  if (/€|EUR/i.test(str)) return 'EUR';
  if (/£|GBP/i.test(str)) return 'GBP';
  if (/CAD/i.test(str)) return 'CAD';
  return 'USD';
}

export function parseSalaryRange(str?: string): { minSalary?: number; maxSalary?: number; currency?: string } {
  if (!str || typeof str !== 'string') return {};
  const trimmed = str.trim();
  if (!trimmed) return {};

  const isHourly = /hour|hr|\/h/i.test(trimmed);
  const isMonthly = /month|mo/i.test(trimmed);
  const cleaned = trimmed.replace(/([0-9])[,.]([0-9]{3})(?![0-9kK])/g, '$1$2');
  const nums = parseSalaryNumbers(cleaned, isHourly, isMonthly);
  const currency = detectSalaryCurrency(trimmed);

  if (nums.length === 0) return { currency };

  const minSalary = nums.length === 1 ? nums[0] : Math.min(nums[0], nums[1]);
  const maxSalary = nums.length === 1 ? nums[0] : Math.max(nums[0], nums[1]);
  return { minSalary, maxSalary, currency };
}

function matchesSalary(job: RemoteJob, minFilter: number): boolean {
  if (minFilter <= 0) return true;
  let min = job.minSalary;
  let max = job.maxSalary;
  if (min === undefined && max === undefined && job.salarySummary) {
    const parsed = parseSalaryRange(job.salarySummary);
    min = parsed.minSalary;
    max = parsed.maxSalary;
  }
  if (max && max >= minFilter) return true;
  if (min && min >= minFilter) return true;
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

function matchesSearchQuery(job: RemoteJob, tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  const titleLower = job.title.toLowerCase();
  const compLower = job.company.toLowerCase();
  const deptLower = (job.department || '').toLowerCase();
  const descSnippet = (job.descriptionPlain || '').slice(0, 2000).toLowerCase();
  const ycTag = job.isYc ? 'yc ycombinator y-combinator' : '';
  const combined = `${titleLower} ${compLower} ${deptLower} ${ycTag} ${descSnippet}`;
  return tokens.every(tok => combined.includes(tok));
}

function isJobClickedOrAppliedHidden(
  job: RemoteJob,
  filters: JobSearchFiltersState,
  kanbanRoles: KanbanRole[],
  clickedJobIds?: Set<string>
): boolean {
  const shouldHide = Boolean(filters.hideClicked || filters.hideApplied);
  if (!shouldHide) return false;

  const applied = isJobAlreadyApplied(job, kanbanRoles).isApplied;
  if (applied) return true;

  if (filters.hideClicked) {
    const clicked = clickedJobIds ? clickedJobIds.has(job.id) : isJobClicked(job.id);
    if (clicked) return true;
  }

  return false;
}

export interface FilterJobParams {
  jobs: RemoteJob[];
  filters: JobSearchFiltersState;
  kanbanRoles: KanbanRole[];
  clickedJobIds?: Set<string>;
}

export function filterRemoteJobs(params: FilterJobParams): RemoteJob[] {
  const { jobs, filters, kanbanRoles, clickedJobIds } = params;
  const queryTokens = filters.query.toLowerCase().trim().split(/\s+/).filter(Boolean);

  return jobs.filter(job => {
    if (!filters.sources[job.source]) return false;
    if (!matchesTimeFilter(job.publishedAt, filters.postedTime)) return false;
    if (!matchesRegion(job.region, filters.region)) return false;
    if (!matchesSalary(job, filters.minSalary)) return false;
    if (!matchesEmploymentType(job, filters.employmentType)) return false;
    if (!matchesContractDuration(job, filters.contractDuration)) return false;
    if (isJobClickedOrAppliedHidden(job, filters, kanbanRoles, clickedJobIds)) return false;
    return matchesSearchQuery(job, queryTokens);
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
