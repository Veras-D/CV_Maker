import { RemoteJob } from '../types/jobSearch';
import { 
  detectJobRegion, 
  isStrictlyRemote, 
  detectContractDuration,
  parseSalaryRange
} from './jobFilterEngine';

export function stripHtml(input: string): string {
  if (!input) return '';
  const decoded = input
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');

  return decoded
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/(?:p|div|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, ' • ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&rsquo;|&lsquo;/g, "'")
    .replace(/&rdquo;|&ldquo;/g, '"')
    .replace(/&bull;/g, '•')
    .replace(/&hellip;/g, '…')
    .replace(/&#\d+;/g, ' ')
    .replace(/&#x[0-9a-f]+;/gi, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
}

interface RemotiveRawJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  category?: string;
  job_type?: string;
  publication_date: string;
  candidate_required_location?: string;
  salary?: string;
  description: string;
}

export async function fetchRemotiveJobs(): Promise<RemoteJob[]> {
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?limit=100', {
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return [];
    const data = await res.json();
    const rawJobs: RemotiveRawJob[] = data.jobs || [];

    return rawJobs.map(raw => {
      const loc = raw.candidate_required_location || 'Worldwide';
      const plain = stripHtml(raw.description || '');
      const durationInfo = detectContractDuration(raw.title, plain);
      const isContract = raw.job_type === 'contract' || raw.job_type === 'freelance' || Boolean(durationInfo.duration);
      const salaryRange = parseSalaryRange(raw.salary);

      return {
        id: `remotive-${raw.id}`,
        title: raw.title,
        company: raw.company_name,
        source: 'remotive' as const,
        url: raw.url,
        applyUrl: raw.url,
        location: loc,
        region: detectJobRegion(loc),
        publishedAt: raw.publication_date || new Date().toISOString(),
        salarySummary: raw.salary || undefined,
        minSalary: salaryRange.minSalary,
        maxSalary: salaryRange.maxSalary,
        currency: salaryRange.currency,
        descriptionPlain: plain,
        department: raw.category,
        employmentType: isContract ? 'contract' : raw.job_type === 'part_time' ? 'part-time' : 'full-time',
        contractDuration: durationInfo.duration,
        contractDurationLabel: durationInfo.label
      };
    });
  } catch {
    return [];
  }
}

interface JobicyRawJob {
  id: number;
  url: string;
  jobTitle: string;
  companyName: string;
  jobType?: string[];
  jobGeo?: string;
  pubDate: string;
  jobExcerpt?: string;
  jobDescription?: string;
  jobIndustry?: string[];
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  CAD: '$',
  EUR: '€',
  GBP: '£'
};

const PERIOD_LABELS: Record<string, string> = {
  hourly: ' / hr',
  monthly: ' / mo',
  yearly: ' / yr'
};

const PERIOD_MULTIPLIERS: Record<string, number> = {
  hourly: 2000,
  monthly: 12,
  yearly: 1
};

function buildSalarySummary(min?: number, max?: number, sym = '$', periodLabel = ' / yr'): string {
  if (min && max) {
    return `${sym}${min.toLocaleString('en-US')} - ${sym}${max.toLocaleString('en-US')}${periodLabel}`;
  }
  if (min) return `From ${sym}${min.toLocaleString('en-US')}${periodLabel}`;
  if (max) return `Up to ${sym}${max.toLocaleString('en-US')}${periodLabel}`;
  return '';
}

function sanitizePositiveNumber(val?: number | null): number | undefined {
  if (typeof val === 'number' && val > 0) return val;
  return undefined;
}

function calcAnnualized(val?: number, mult = 1): number | undefined {
  if (!val) return undefined;
  return Math.round(val * mult);
}

function resolvePeriodMultiplier(period?: string | null): number {
  if (!period) return 1;
  return PERIOD_MULTIPLIERS[period.toLowerCase()] || 1;
}

function formatJobicySalary(raw: JobicyRawJob): {
  salarySummary?: string;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
} {
  const min = sanitizePositiveNumber(raw.salaryMin);
  const max = sanitizePositiveNumber(raw.salaryMax);
  if (!min && !max) return {};

  const curr = raw.salaryCurrency || 'USD';
  const period = (raw.salaryPeriod || 'yearly').toLowerCase();
  const sym = CURRENCY_SYMBOLS[curr] || `${curr} `;
  const periodLabel = PERIOD_LABELS[period] || ' / yr';
  const mult = resolvePeriodMultiplier(raw.salaryPeriod);
  const summary = buildSalarySummary(min, max, sym, periodLabel);

  return {
    salarySummary: summary || undefined,
    minSalary: calcAnnualized(min, mult),
    maxSalary: calcAnnualized(max, mult),
    currency: curr
  };
}

export async function fetchJobicyJobs(): Promise<RemoteJob[]> {
  try {
    const res = await fetch('https://jobicy.com/api/v2/remote-jobs?count=50', {
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return [];
    const data = await res.json();
    const rawJobs: JobicyRawJob[] = data.jobs || [];

    return rawJobs.map(raw => {
      const loc = raw.jobGeo || 'Worldwide';
      const plain = stripHtml(raw.jobDescription || raw.jobExcerpt || '');
      const durationInfo = detectContractDuration(raw.jobTitle, plain);
      const types = (raw.jobType || []).map(t => t.toLowerCase());
      const isContract = types.some(t => t.includes('contract') || t.includes('freelance')) || Boolean(durationInfo.duration);
      const isPartTime = types.some(t => t.includes('part-time'));
      const salaryInfo = formatJobicySalary(raw);

      return {
        id: `jobicy-${raw.id}`,
        title: raw.jobTitle,
        company: raw.companyName,
        source: 'jobicy' as const,
        url: raw.url,
        applyUrl: raw.url,
        location: loc,
        region: detectJobRegion(loc),
        publishedAt: raw.pubDate || new Date().toISOString(),
        salarySummary: salaryInfo.salarySummary,
        minSalary: salaryInfo.minSalary,
        maxSalary: salaryInfo.maxSalary,
        currency: salaryInfo.currency,
        descriptionPlain: plain,
        department: raw.jobIndustry?.[0],
        employmentType: isContract ? 'contract' : isPartTime ? 'part-time' : 'full-time',
        contractDuration: durationInfo.duration,
        contractDurationLabel: durationInfo.label
      };
    });
  } catch {
    return [];
  }
}

interface SmartRecruitersRawJob {
  id: string;
  name: string;
  company: { identifier: string; name: string };
  releasedDate: string;
  location?: { remote?: boolean; fullLocation?: string; city?: string; country?: string };
  typeOfEmployment?: { label?: string };
  department?: { label?: string };
}

function parseSmartRecruitersJob(raw: SmartRecruitersRawJob, companySlug: string): RemoteJob | null {
  const isRemote = Boolean(raw.location?.remote) || isStrictlyRemote(raw.location?.fullLocation || '');
  if (!isRemote) return null;

  const loc = raw.location?.fullLocation || 'Remote';
  const durationInfo = detectContractDuration(raw.name, '');
  const empLabel = (raw.typeOfEmployment?.label || '').toLowerCase();
  const isContract = /contract|freelance/.test(empLabel) || Boolean(durationInfo.duration);
  const isPartTime = empLabel.includes('part-time');
  const compName = raw.company?.name || companySlug;
  const jobUrl = `https://jobs.smartrecruiters.com/${companySlug}/${raw.id}`;

  return {
    id: `sr-${companySlug}-${raw.id}`,
    title: raw.name,
    company: compName,
    source: 'smartrecruiters',
    url: jobUrl,
    applyUrl: jobUrl,
    location: loc,
    region: detectJobRegion(loc),
    publishedAt: raw.releasedDate || new Date().toISOString(),
    descriptionPlain: `${raw.name} at ${compName}. Visit link for full requirements.`,
    department: raw.department?.label,
    employmentType: isContract ? 'contract' : isPartTime ? 'part-time' : 'full-time',
    contractDuration: durationInfo.duration,
    contractDurationLabel: durationInfo.label
  };
}

export async function fetchSmartRecruitersCompany(companySlug: string): Promise<RemoteJob[]> {
  try {
    const res = await fetch(`https://api.smartrecruiters.com/v1/companies/${companySlug}/postings?limit=50`, {
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return [];
    const data = await res.json();
    const rawJobs: SmartRecruitersRawJob[] = Array.isArray(data.content) ? data.content : [];
    return rawJobs
      .map(raw => parseSmartRecruitersJob(raw, companySlug))
      .filter((j): j is RemoteJob => j !== null);
  } catch {
    return [];
  }
}
