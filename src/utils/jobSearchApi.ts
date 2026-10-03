import { RemoteJob } from '../types/jobSearch';
import { detectJobRegion, isStrictlyRemote } from './jobFilterEngine';

const ASHBY_COMPANIES = ['openai', 'linear', 'resend', 'ramp', 'vanta', 'synthesia'];
const GREENHOUSE_COMPANIES = ['canonical', 'gitlab', 'stripe', 'cloudflare', 'dropbox', 'reddit', 'mongodb'];
const LEVER_COMPANIES = ['spotify', 'palantir'];

const CACHE_KEY = 'cv_maker_cached_remote_jobs_v1';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getCachedJobs(): RemoteJob[] | null {
  try {
    const cachedStr = sessionStorage.getItem(CACHE_KEY);
    if (!cachedStr) return null;
    const { timestamp, jobs } = JSON.parse(cachedStr);
    const isValid = Date.now() - timestamp < CACHE_TTL_MS && Array.isArray(jobs);
    return isValid ? jobs : null;
  } catch {
    return null;
  }
}

export function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
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
    descriptionPlain: raw.descriptionPlain || stripHtml(raw.descriptionHtml || ''),
    descriptionHtml: raw.descriptionHtml,
    department: raw.department
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
    descriptionPlain: stripHtml(raw.content || ''),
    descriptionHtml: raw.content,
    department: raw.departments?.[0]?.name
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
    descriptionPlain: raw.descriptionPlain || stripHtml(raw.description || ''),
    descriptionHtml: raw.description,
    department: raw.categories?.department
  };
}

async function fetchAshbyCompany(companySlug: string): Promise<RemoteJob[]> {
  try {
    const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${companySlug}?includeCompensation=true`);
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
    const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${companySlug}/jobs?content=true`);
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
    const res = await fetch(`https://api.lever.co/v0/postings/${companySlug}?mode=json`);
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
  const rawQuery = `(site:jobs.ashbyhq.com OR site:job-boards.greenhouse.io OR site:boards.greenhouse.io OR site:jobs.lever.co) ${term} remote`;
  return `https://www.google.com/search?q=${encodeURIComponent(rawQuery)}`;
}

export async function fetchAllRemoteJobs(forceRefresh = false): Promise<RemoteJob[]> {
  if (!forceRefresh) {
    const cached = getCachedJobs();
    if (cached) return cached;
  }

  const promises: Promise<RemoteJob[]>[] = [
    ...ASHBY_COMPANIES.map(c => fetchAshbyCompany(c)),
    ...GREENHOUSE_COMPANIES.map(c => fetchGreenhouseCompany(c)),
    ...LEVER_COMPANIES.map(c => fetchLeverCompany(c))
  ];

  const results = await Promise.allSettled(promises);
  const allJobs: RemoteJob[] = [];

  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    allJobs.push(...r.value);
  }

  // Sort by publishedAt descending
  allJobs.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), jobs: allJobs }));
  } catch {
    // Quota exceeded or private browsing
  }

  return allJobs;
}
