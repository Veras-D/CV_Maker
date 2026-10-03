import { RemoteJob } from '../types/jobSearch';
import { detectJobRegion, isStrictlyRemote, detectContractDuration } from './jobFilterEngine';
import { 
  stripHtml, 
  fetchRemotiveJobs, 
  fetchJobicyJobs, 
  fetchSmartRecruitersCompany 
} from './jobSearchAggregators';
import { getSavedTrackedCompanies, TrackedCompany } from './companyWatchlistService';

const CACHE_KEY = 'cv_maker_cached_remote_jobs_v9';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let memoryCachedJobs: { timestamp: number; jobs: RemoteJob[] } | null = null;

function cleanupOldCaches(): void {
  const obsoleteKeys = [
    'cv_maker_cached_remote_jobs_v1',
    'cv_maker_cached_remote_jobs_v2',
    'cv_maker_cached_remote_jobs_v3',
    'cv_maker_cached_remote_jobs_v4',
    'cv_maker_cached_remote_jobs_v5',
    'cv_maker_cached_remote_jobs_v6',
    'cv_maker_cached_remote_jobs_v7',
    'cv_maker_cached_remote_jobs_v8'
  ];
  for (const key of obsoleteKeys) {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      // Storage access failure ignored
    }
  }
}
cleanupOldCaches();

function toCompactJob(job: RemoteJob): RemoteJob {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    source: job.source,
    url: job.url,
    applyUrl: job.applyUrl,
    location: job.location,
    region: job.region,
    publishedAt: job.publishedAt,
    salarySummary: job.salarySummary,
    minSalary: job.minSalary,
    maxSalary: job.maxSalary,
    currency: job.currency,
    descriptionPlain: job.descriptionPlain ? job.descriptionPlain.slice(0, 1000) : '',
    department: job.department,
    employmentType: job.employmentType,
    contractDuration: job.contractDuration,
    contractDurationLabel: job.contractDurationLabel
  };
}

function trySetStorage(storage: Storage, key: string, value: string): boolean {
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function persistToStorage(compactJobs: RemoteJob[]): void {
  const payload = JSON.stringify({ timestamp: Date.now(), jobs: compactJobs });
  if (trySetStorage(localStorage, CACHE_KEY, payload)) return;

  const fallback = JSON.stringify({ timestamp: Date.now(), jobs: compactJobs.slice(0, 250) });
  if (trySetStorage(localStorage, CACHE_KEY, fallback)) return;

  trySetStorage(sessionStorage, CACHE_KEY, payload);
}

function saveJobsToCache(jobs: RemoteJob[]): void {
  if (!Array.isArray(jobs) || jobs.length === 0) return;
  memoryCachedJobs = { timestamp: Date.now(), jobs };
  cleanupOldCaches();
  const compactJobs = jobs.slice(0, 500).map(toCompactJob);
  persistToStorage(compactJobs);
}

export function getCachedJobs(): RemoteJob[] | null {
  if (memoryCachedJobs && Date.now() - memoryCachedJobs.timestamp < CACHE_TTL_MS) {
    return memoryCachedJobs.jobs;
  }
  try {
    const cachedStr = localStorage.getItem(CACHE_KEY) || sessionStorage.getItem(CACHE_KEY);
    if (!cachedStr) return null;
    const { timestamp, jobs } = JSON.parse(cachedStr);
    const isValid = Date.now() - timestamp < CACHE_TTL_MS && Array.isArray(jobs) && jobs.length >= 20;
    if (isValid) {
      memoryCachedJobs = { timestamp, jobs };
      return jobs;
    }
  } catch {
    return null;
  }
  return null;
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

interface AshbyRawJob {
  id: string;
  title: string;
  location?: string;
  isRemote?: boolean;
  workplaceType?: string;
  jobUrl?: string;
  applyUrl?: string;
  publishedAt?: string;
  descriptionPlain?: string;
  descriptionHtml?: string;
  department?: string;
  compensation?: {
    scrapeableCompensationSalarySummary?: string;
    summaryComponents?: Array<{
      minValue?: number;
      maxValue?: number;
      currencyCode?: string;
    }>;
  };
}

function parseAshbyJob(raw: AshbyRawJob, companySlug: string): RemoteJob | null {
  const loc = raw.location || 'Remote';
  if (!isStrictlyRemote(loc, raw.workplaceType)) return null;

  const compSummary = raw.compensation?.summaryComponents?.[0];
  const plain = raw.descriptionPlain || stripHtml(raw.descriptionHtml || '');
  const durationInfo = detectContractDuration(raw.title, plain);
  const isContract = raw.title.toLowerCase().includes('contract') || Boolean(durationInfo.duration);

  return {
    id: `ashby-${companySlug}-${raw.id}`,
    title: raw.title,
    company: capitalize(companySlug),
    source: 'ashby',
    url: raw.jobUrl || raw.applyUrl || `https://jobs.ashbyhq.com/${companySlug}`,
    applyUrl: raw.applyUrl || raw.jobUrl,
    location: loc,
    region: detectJobRegion(loc),
    publishedAt: raw.publishedAt || new Date().toISOString(),
    salarySummary: raw.compensation?.scrapeableCompensationSalarySummary,
    minSalary: compSummary?.minValue,
    maxSalary: compSummary?.maxValue,
    currency: compSummary?.currencyCode,
    descriptionPlain: plain,
    department: raw.department,
    employmentType: isContract ? 'contract' : 'full-time',
    contractDuration: durationInfo.duration,
    contractDurationLabel: durationInfo.label
  };
}

interface GreenhouseRawJob {
  id: number | string;
  title: string;
  company_name?: string;
  location?: { name?: string };
  absolute_url?: string;
  updated_at?: string;
  first_published?: string;
  content?: string;
  departments?: Array<{ name: string }>;
}

function parseGreenhouseJob(raw: GreenhouseRawJob, companySlug: string): RemoteJob | null {
  const loc = raw.location?.name || 'Remote';
  if (!isStrictlyRemote(loc)) return null;

  const plain = stripHtml(raw.content || '');
  const durationInfo = detectContractDuration(raw.title, plain);
  const isContract = raw.title.toLowerCase().includes('contract') || Boolean(durationInfo.duration);

  return {
    id: `gh-${companySlug}-${raw.id}`,
    title: raw.title,
    company: raw.company_name || capitalize(companySlug),
    source: 'greenhouse',
    url: raw.absolute_url || `https://job-boards.greenhouse.io/${companySlug}`,
    applyUrl: raw.absolute_url,
    location: loc,
    region: detectJobRegion(loc),
    publishedAt: raw.updated_at || raw.first_published || new Date().toISOString(),
    descriptionPlain: plain,
    department: raw.departments?.[0]?.name,
    employmentType: isContract ? 'contract' : 'full-time',
    contractDuration: durationInfo.duration,
    contractDurationLabel: durationInfo.label
  };
}

interface LeverRawJob {
  id: string;
  text: string;
  workplaceType?: string;
  hostedUrl?: string;
  applyUrl?: string;
  createdAt?: number;
  description?: string;
  descriptionPlain?: string;
  categories?: {
    location?: string;
    department?: string;
  };
}

function parseLeverJob(raw: LeverRawJob, companySlug: string): RemoteJob | null {
  const loc = raw.categories?.location || 'Remote';
  if (!isStrictlyRemote(loc, raw.workplaceType)) return null;

  const plain = raw.descriptionPlain || stripHtml(raw.description || '');
  const durationInfo = detectContractDuration(raw.text, plain);
  const isContract = raw.text.toLowerCase().includes('contract') || Boolean(durationInfo.duration);

  return {
    id: `lever-${companySlug}-${raw.id}`,
    title: raw.text,
    company: capitalize(companySlug),
    source: 'lever',
    url: raw.hostedUrl || `https://jobs.lever.co/${companySlug}`,
    applyUrl: raw.applyUrl || raw.hostedUrl,
    location: loc,
    region: detectJobRegion(loc),
    publishedAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
    descriptionPlain: plain,
    department: raw.categories?.department,
    employmentType: isContract ? 'contract' : 'full-time',
    contractDuration: durationInfo.duration,
    contractDurationLabel: durationInfo.label
  };
}

async function fetchAshbyCompany(companySlug: string): Promise<RemoteJob[]> {
  try {
    const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${companySlug}?includeCompensation=true`, {
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return [];
    const data = await res.json();
    const jobs: AshbyRawJob[] = data.jobs || [];
    return jobs.map(j => parseAshbyJob(j, companySlug)).filter((j): j is RemoteJob => j !== null);
  } catch {
    return [];
  }
}

async function fetchGreenhouseCompany(companySlug: string): Promise<RemoteJob[]> {
  try {
    const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${companySlug}/jobs?content=true`, {
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return [];
    const data = await res.json();
    const jobs: GreenhouseRawJob[] = data.jobs || [];
    return jobs.map(j => parseGreenhouseJob(j, companySlug)).filter((j): j is RemoteJob => j !== null);
  } catch {
    return [];
  }
}

async function fetchLeverCompany(companySlug: string): Promise<RemoteJob[]> {
  try {
    const res = await fetch(`https://api.lever.co/v0/postings/${companySlug}?mode=json`, {
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return [];
    const jobs: LeverRawJob[] = await res.json();
    if (!Array.isArray(jobs)) return [];
    return jobs.map(j => parseLeverJob(j, companySlug)).filter((j): j is RemoteJob => j !== null);
  } catch {
    return [];
  }
}

export function buildGoogleAtsSearchUrl(query: string): string {
  const q = query.trim();
  const term = q ? `"${q}"` : '"software engineer"';
  const rawQuery = `(site:jobs.ashbyhq.com OR site:job-boards.greenhouse.io OR site:boards.greenhouse.io OR site:jobs.lever.co OR site:jobs.smartrecruiters.com OR site:remotive.com OR site:jobicy.com) ${term} remote`;
  return `https://www.google.com/search?q=${encodeURIComponent(rawQuery)}`;
}

function fetchCompanyJobs(company: TrackedCompany): Promise<RemoteJob[]> {
  switch (company.ats) {
    case 'ashby':
      return fetchAshbyCompany(company.slug);
    case 'greenhouse':
      return fetchGreenhouseCompany(company.slug);
    case 'lever':
      return fetchLeverCompany(company.slug);
    case 'smartrecruiters':
      return fetchSmartRecruitersCompany(company.slug);
    default:
      return Promise.resolve([]);
  }
}

export async function fetchAllRemoteJobs(forceRefresh = false): Promise<RemoteJob[]> {
  if (!forceRefresh) {
    const cached = getCachedJobs();
    if (cached && cached.length >= 20) return cached;
  }

  const enabledCompanies = getSavedTrackedCompanies().filter(c => c.enabled);
  const promises: Promise<RemoteJob[]>[] = [
    ...enabledCompanies.map(c => fetchCompanyJobs(c)),
    fetchRemotiveJobs(),
    fetchJobicyJobs()
  ];

  const results = await Promise.allSettled(promises);
  const allJobs: RemoteJob[] = [];

  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    allJobs.push(...r.value);
  }

  // Sort by publishedAt descending
  allJobs.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  saveJobsToCache(allJobs);

  return allJobs;
}
