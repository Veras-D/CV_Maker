const CLICKED_JOBS_STORAGE_KEY = 'cv_maker_clicked_jobs_v1';
const MAX_CLICKED_STORED = 2000;
export const CLICKED_JOBS_UPDATED_EVENT = 'cv_maker_clicked_jobs_updated';

let cachedClickedIds: Set<string> | null = null;

export function getClickedJobIds(): Set<string> {
  if (cachedClickedIds) return cachedClickedIds;

  try {
    const raw = localStorage.getItem(CLICKED_JOBS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        cachedClickedIds = new Set(parsed);
        return cachedClickedIds;
      }
    }
  } catch {
    // Storage access fallback
  }

  cachedClickedIds = new Set<string>();
  return cachedClickedIds;
}

export function markJobAsClicked(jobId: string): Set<string> {
  if (!jobId) return getClickedJobIds();
  const current = getClickedJobIds();
  if (current.has(jobId)) return current;

  current.add(jobId);
  try {
    const arr = Array.from(current);
    const trimmed = arr.length > MAX_CLICKED_STORED ? arr.slice(arr.length - MAX_CLICKED_STORED) : arr;
    localStorage.setItem(CLICKED_JOBS_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage quota fallback
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CLICKED_JOBS_UPDATED_EVENT, { detail: jobId }));
  }

  return new Set(current);
}

export function isJobClicked(jobId?: string): boolean {
  if (!jobId) return false;
  return getClickedJobIds().has(jobId);
}

export function clearClickedJobs(): void {
  cachedClickedIds = new Set<string>();
  try {
    localStorage.removeItem(CLICKED_JOBS_STORAGE_KEY);
  } catch {
    // Storage fallback
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CLICKED_JOBS_UPDATED_EVENT));
  }
}
