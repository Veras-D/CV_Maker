import { RemoteJob } from '../types/jobSearch';
import { detectJobRegion, isStrictlyRemote, detectContractDuration } from './jobFilterEngine';

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
