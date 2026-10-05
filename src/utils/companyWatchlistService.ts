export type AtsType = 'ashby' | 'greenhouse' | 'lever' | 'smartrecruiters';

export interface TrackedCompany {
  slug: string;
  name: string;
  ats: AtsType;
  isYc?: boolean;
  isCustom?: boolean;
  enabled: boolean;
}

const STORAGE_KEY = 'cv_maker_tracked_companies_v1';
const YC_HIRING_FEED_URL = 'https://yc-oss.github.io/api/companies/hiring.json';
const YC_CACHE_KEY = 'cv_maker_dynamic_yc_cache_v1';
const YC_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const BASE_COMPANIES: TrackedCompany[] = [
  // Ashby (AI & Modern Tech)
  { slug: 'openai', name: 'OpenAI', ats: 'ashby', isYc: true, enabled: true },
  { slug: 'linear', name: 'Linear', ats: 'ashby', isYc: true, enabled: true },
  { slug: 'resend', name: 'Resend', ats: 'ashby', isYc: true, enabled: true },
  { slug: 'vanta', name: 'Vanta', ats: 'ashby', isYc: true, enabled: true },
  { slug: 'posthog', name: 'PostHog', ats: 'ashby', isYc: true, enabled: true },
  { slug: 'cursor', name: 'Cursor', ats: 'ashby', isYc: true, enabled: true },
  { slug: 'ramp', name: 'Ramp', ats: 'ashby', enabled: true },
  { slug: 'synthesia', name: 'Synthesia', ats: 'ashby', enabled: true },
  { slug: 'perplexity', name: 'Perplexity', ats: 'ashby', enabled: true },
  { slug: 'elevenlabs', name: 'ElevenLabs', ats: 'ashby', enabled: true },
  { slug: 'modal', name: 'Modal', ats: 'ashby', enabled: true },

  // Greenhouse (Remote & Scaleups)
  { slug: 'stripe', name: 'Stripe', ats: 'greenhouse', isYc: true, enabled: true },
  { slug: 'gitlab', name: 'GitLab', ats: 'greenhouse', isYc: true, enabled: true },
  { slug: 'scaleai', name: 'Scale AI', ats: 'greenhouse', isYc: true, enabled: true },
  { slug: 'zapier', name: 'Zapier', ats: 'greenhouse', isYc: true, enabled: true },
  { slug: 'webflow', name: 'Webflow', ats: 'greenhouse', isYc: true, enabled: true },
  { slug: 'faire', name: 'Faire', ats: 'greenhouse', isYc: true, enabled: true },
  { slug: 'deel', name: 'Deel', ats: 'greenhouse', isYc: true, enabled: true },
  { slug: 'reddit', name: 'Reddit', ats: 'greenhouse', isYc: true, enabled: true },
  { slug: 'dropbox', name: 'Dropbox', ats: 'greenhouse', isYc: true, enabled: true },
  { slug: 'cloudflare', name: 'Cloudflare', ats: 'greenhouse', enabled: true },
  { slug: 'canonical', name: 'Canonical', ats: 'greenhouse', enabled: true },
  { slug: 'mongodb', name: 'MongoDB', ats: 'greenhouse', enabled: true },
  { slug: 'figma', name: 'Figma', ats: 'greenhouse', enabled: true },
  { slug: 'vercel', name: 'Vercel', ats: 'greenhouse', enabled: true },

  // Lever (AI & Tech)
  { slug: 'field-ai', name: 'FieldAI', ats: 'lever', enabled: true },
  { slug: 'spotify', name: 'Spotify', ats: 'lever', enabled: true },
  { slug: 'toptal', name: 'Toptal', ats: 'lever', enabled: true },
  { slug: 'wealthfront', name: 'Wealthfront', ats: 'lever', enabled: true },
  { slug: 'neon', name: 'Neon', ats: 'lever', enabled: true },

  // SmartRecruiters (Global Tech)
  { slug: 'canva', name: 'Canva', ats: 'smartrecruiters', enabled: true },
  { slug: 'mirantis', name: 'Mirantis', ats: 'smartrecruiters', enabled: true },
  { slug: 'jitterbit', name: 'Jitterbit', ats: 'smartrecruiters', enabled: true },
  { slug: 'invisibletechnologies', name: 'Invisible Technologies', ats: 'smartrecruiters', enabled: true },

  // Contract, QA & Global Tech Talent Networks
  { slug: 'testlio', name: 'Testlio (QA & Freelance Testing)', ats: 'greenhouse', enabled: true },
  { slug: 'telus-digital', name: 'Telus Digital (QA & AI Contracts)', ats: 'ashby', enabled: true },
  { slug: 'turing', name: 'Turing (AI & Developer Contracts)', ats: 'greenhouse', enabled: true },
  { slug: 'distantjob', name: 'DistantJob (Remote Developer Staffing)', ats: 'greenhouse', enabled: true },
  { slug: 'moduscreate', name: 'Modus Create (Global Tech Consulting)', ats: 'greenhouse', enabled: true },
  { slug: 'thoughtworks', name: 'Thoughtworks (Dev & QA Consulting)', ats: 'greenhouse', enabled: true },
  { slug: 'braintrust', name: 'Braintrust (Developer Talent Network)', ats: 'ashby', enabled: true },
  { slug: 'andela', name: 'Andela (Global Tech Talent)', ats: 'ashby', enabled: true }
];

export function getDefaultCompanies(): TrackedCompany[] {
  return [...BASE_COMPANIES];
}

export function getSavedTrackedCompanies(): TrackedCompany[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultCompanies();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const existingSlugs = new Set(parsed.map((c: TrackedCompany) => c.slug));
      const defaults = getDefaultCompanies();
      const missing = defaults.filter(d => !existingSlugs.has(d.slug));
      if (missing.length > 0) {
        const merged = [...parsed, ...missing];
        saveTrackedCompanies(merged);
        return merged;
      }
      return parsed;
    }
  } catch {
    // Storage access error fallback
  }
  return getDefaultCompanies();
}

export function saveTrackedCompanies(companies: TrackedCompany[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
  } catch {
    // Storage quota or permission error
  }
}

export function toggleCompanyEnabled(companies: TrackedCompany[], slug: string): TrackedCompany[] {
  const updated = companies.map(c => (c.slug === slug ? { ...c, enabled: !c.enabled } : c));
  saveTrackedCompanies(updated);
  return updated;
}

export function setYcCompaniesEnabled(companies: TrackedCompany[], enabled: boolean): TrackedCompany[] {
  const updated = companies.map(c => (c.isYc ? { ...c, enabled } : c));
  saveTrackedCompanies(updated);
  return updated;
}

export function setAllCompaniesEnabled(companies: TrackedCompany[], enabled: boolean): TrackedCompany[] {
  const updated = companies.map(c => ({ ...c, enabled }));
  saveTrackedCompanies(updated);
  return updated;
}

export function removeTrackedCompany(companies: TrackedCompany[], slug: string): TrackedCompany[] {
  const updated = companies.filter(c => c.slug !== slug);
  saveTrackedCompanies(updated);
  return updated;
}

interface AtsCandidate {
  ats: AtsType;
  url: string;
}

function getCandidateEndpoints(slug: string): AtsCandidate[] {
  return [
    { ats: 'greenhouse', url: `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs` },
    { ats: 'ashby', url: `https://api.ashbyhq.com/posting-api/job-board/${slug}` },
    { ats: 'lever', url: `https://api.lever.co/v0/postings/${slug}` },
    { ats: 'smartrecruiters', url: `https://api.smartrecruiters.com/v1/companies/${slug}/postings?limit=1` }
  ];
}

export async function detectCompanyAts(rawSlug: string): Promise<{ slug: string; ats: AtsType } | null> {
  const normalized = rawSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
  if (!normalized) return null;

  const candidates = getCandidateEndpoints(normalized);
  for (const c of candidates) {
    try {
      const res = await fetch(c.url, { method: 'HEAD', signal: AbortSignal.timeout(3500) });
      if (res.ok) return { slug: normalized, ats: c.ats };
    } catch {
      // Continue to next ATS candidate
    }
  }
  return null;
}

export async function addCustomTrackedCompany(
  currentList: TrackedCompany[],
  rawSlug: string,
  explicitAts?: AtsType
): Promise<{ success: boolean; list: TrackedCompany[]; error?: string }> {
  const normalized = rawSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
  if (!normalized) return { success: false, list: currentList, error: 'Please enter a valid company slug.' };

  const existing = currentList.find(c => c.slug === normalized);
  if (existing) {
    if (!existing.enabled) {
      const updated = toggleCompanyEnabled(currentList, normalized);
      return { success: true, list: updated };
    }
    return { success: false, list: currentList, error: `"${normalized}" is already in your tracked list.` };
  }

  let detectedAts = explicitAts;
  if (!detectedAts) {
    const res = await detectCompanyAts(normalized);
    if (!res) {
      return {
        success: false,
        list: currentList,
        error: `Could not verify "${normalized}" on Ashby, Greenhouse, Lever, or SmartRecruiters.`
      };
    }
    detectedAts = res.ats;
  }

  const displayName = normalized
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const newCompany: TrackedCompany = {
    slug: normalized,
    name: displayName,
    ats: detectedAts,
    isCustom: true,
    enabled: true
  };

  const updated = [...currentList, newCompany];
  saveTrackedCompanies(updated);
  return { success: true, list: updated };
}

interface YcFeedItem {
  name: string;
  slug: string;
  top_company?: boolean;
  isHiring?: boolean;
}

export async function fetchLiveYcCompanies(): Promise<{ slug: string; name: string }[]> {
  try {
    const cached = localStorage.getItem(YC_CACHE_KEY);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < YC_CACHE_TTL_MS && Array.isArray(data)) {
        return data;
      }
    }

    const res = await fetch(YC_HIRING_FEED_URL, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return [];
    const items: YcFeedItem[] = await res.json();
    const filtered = items
      .filter(item => Boolean(item.slug && (item.top_company || item.isHiring)))
      .slice(0, 100)
      .map(item => ({ slug: item.slug, name: item.name }));

    localStorage.setItem(YC_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: filtered }));
    return filtered;
  } catch {
    return [];
  }
}
