import { getDefaultCompanies } from './companyWatchlistService';

const YC_ALL_FEED_URL = 'https://yc-oss.github.io/api/companies/all.json';
const YC_HIRING_FEED_URL = 'https://yc-oss.github.io/api/companies/hiring.json';
const YC_CACHE_KEY = 'cv_maker_dynamic_yc_cache_v2';
const YC_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
export const YC_DIRECTORY_UPDATED_EVENT = 'cv_maker_yc_directory_updated';

export function cleanCompanyKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// In-memory set of live YC keys
let liveYcKeys: Set<string> | null = null;
let activeFetchPromise: Promise<Set<string>> | null = null;
let liveDirectoryCompanies: LiveDirectoryCompany[] | null = null;

export interface LiveDirectoryCompany {
  name: string;
  slug: string;
}

function getSeedYcKeys(): Set<string> {
  const seed = new Set<string>();
  // Include initial verified YC companies from default watchlist as baseline before first live fetch
  for (const c of getDefaultCompanies()) {
    if (c.isYc) {
      seed.add(cleanCompanyKey(c.slug));
      seed.add(cleanCompanyKey(c.name));
    }
  }
  return seed;
}

export function getLiveDirectoryCompanies(): LiveDirectoryCompany[] {
  if (liveDirectoryCompanies && liveDirectoryCompanies.length > 0) {
    return liveDirectoryCompanies;
  }

  try {
    const cached = localStorage.getItem(YC_CACHE_KEY);
    const parsed = cached ? JSON.parse(cached) : null;
    if (parsed && Array.isArray(parsed.companies) && parsed.companies.length > 0) {
      const list = parsed.companies as LiveDirectoryCompany[];
      liveDirectoryCompanies = list;
      return list;
    }
  } catch {
    // Storage access fallback
  }

  // Fallback to initial seed companies from watchlist
  const seed: LiveDirectoryCompany[] = [];
  for (const c of getDefaultCompanies()) {
    seed.push({ name: c.name, slug: c.slug });
  }
  return seed;
}

export function searchLiveDirectory(query: string, limit = 8): LiveDirectoryCompany[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const companies = getLiveDirectoryCompanies();
  const matches: { company: LiveDirectoryCompany; score: number }[] = [];

  for (const c of companies) {
    const nameLower = c.name.toLowerCase();
    const slugLower = c.slug.toLowerCase();
    let score = 0;
    if (nameLower === q || slugLower === q) score = 100;
    else if (nameLower.startsWith(q) || slugLower.startsWith(q)) score = 80;
    else if (nameLower.includes(q)) score = 50;
    else if (slugLower.includes(q)) score = 30;

    if (score > 0) {
      matches.push({ company: c, score });
    }
  }

  matches.sort((a, b) => b.score - a.score || a.company.name.localeCompare(b.company.name));
  return matches.slice(0, limit).map(m => m.company);
}

export function getLiveYcKeys(): Set<string> {
  if (liveYcKeys && liveYcKeys.size > 0) return liveYcKeys;

  try {
    const cached = localStorage.getItem(YC_CACHE_KEY);
    const parsed = cached ? JSON.parse(cached) : null;
    if (parsed && Array.isArray(parsed.data) && parsed.data.length > 0) {
      liveYcKeys = new Set(parsed.data.map(cleanCompanyKey));
      return liveYcKeys;
    }
  } catch {
    // Storage access fallback
  }

  liveYcKeys = getSeedYcKeys();
  return liveYcKeys;
}

export function isDynamicYcBusiness(companyName?: string, companySlug?: string): boolean {
  if (!companyName && !companySlug) return false;
  const keys = getLiveYcKeys();
  if (keys.size === 0) return false;

  const candidates: string[] = [];
  if (companyName) {
    const cleanName = cleanCompanyKey(companyName);
    candidates.push(cleanName);
    const stripped = cleanName.replace(/(?:inc|llc|ltd|corp|corporation|gmbh|bv|co)$/g, '');
    if (stripped && stripped !== cleanName) {
      candidates.push(stripped);
    }
  }
  if (companySlug) {
    const cleanSlug = cleanCompanyKey(companySlug);
    candidates.push(cleanSlug);
    const stripped = cleanSlug.replace(/(?:inc|llc|ltd|corp|corporation|gmbh|bv|co)$/g, '');
    if (stripped && stripped !== cleanSlug) {
      candidates.push(stripped);
    }
  }

  return candidates.some(c => keys.has(c));
}

interface YcRawItem {
  slug?: string;
  name?: string;
  former_names?: string[];
}

function isYcCacheFresh(): boolean {
  try {
    const cached = localStorage.getItem(YC_CACHE_KEY);
    if (!cached) return false;
    const { timestamp } = JSON.parse(cached);
    return Date.now() - timestamp < YC_CACHE_TTL_MS;
  } catch {
    return false;
  }
}

function parseYcItems(items: YcRawItem[]): {
  freshKeys: Set<string>;
  rawList: string[];
  directoryList: LiveDirectoryCompany[];
} {
  const freshKeys = new Set<string>();
  const rawList: string[] = [];
  const directoryList: LiveDirectoryCompany[] = [];
  const seenSlugs = new Set<string>();

  for (const item of items) {
    if (item.slug) {
      const s = cleanCompanyKey(item.slug);
      freshKeys.add(s);
      rawList.push(s);
      const slugLower = item.slug.toLowerCase();
      if (item.name && !seenSlugs.has(slugLower)) {
        seenSlugs.add(slugLower);
        directoryList.push({ name: item.name, slug: item.slug });
      }
    }
    if (item.name) {
      const n = cleanCompanyKey(item.name);
      freshKeys.add(n);
      rawList.push(n);
    }
    const formerNames = Array.isArray(item.former_names) ? item.former_names : [];
    for (const fn of formerNames) {
      if (!fn) continue;
      const f = cleanCompanyKey(fn);
      freshKeys.add(f);
      rawList.push(f);
    }
  }

  return { freshKeys, rawList, directoryList };
}

async function requestLiveYcFeed(): Promise<Response | null> {
  try {
    const res = await fetch(YC_ALL_FEED_URL, { signal: AbortSignal.timeout(12000) });
    if (res.ok) return res;
  } catch {
    // Fallback to hiring feed
  }

  try {
    const res = await fetch(YC_HIRING_FEED_URL, { signal: AbortSignal.timeout(8000) });
    if (res.ok) return res;
  } catch {
    // Both feeds unavailable
  }

  return null;
}

export async function fetchLiveYcDirectory(force = false): Promise<Set<string>> {
  if (activeFetchPromise && !force) {
    return activeFetchPromise;
  }

  if (!force && liveYcKeys && liveYcKeys.size > 100 && isYcCacheFresh()) {
    return liveYcKeys;
  }

  const runFetch = async (): Promise<Set<string>> => {
    try {
      const res = await requestLiveYcFeed();
      if (!res) return getLiveYcKeys();

      const items: YcRawItem[] = await res.json();
      const { freshKeys, rawList, directoryList } = parseYcItems(items);

      liveYcKeys = freshKeys;
      liveDirectoryCompanies = directoryList;
      try {
        localStorage.setItem(
          YC_CACHE_KEY,
          JSON.stringify({
            timestamp: Date.now(),
            data: rawList,
            companies: directoryList.slice(0, 1500)
          })
        );
      } catch {
        // Storage quota ignored
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(YC_DIRECTORY_UPDATED_EVENT));
      }

      return freshKeys;
    } catch (err) {
      console.warn('Could not fetch live YC directory, using existing YC set:', err);
    } finally {
      activeFetchPromise = null;
    }

    return getLiveYcKeys();
  };

  activeFetchPromise = runFetch();
  return activeFetchPromise;
}

// Background prefetch on module initial load in browser
if (typeof window !== 'undefined') {
  setTimeout(() => {
    fetchLiveYcDirectory(false).catch(() => {});
  }, 100);
}
