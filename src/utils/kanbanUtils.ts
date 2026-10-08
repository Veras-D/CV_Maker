import { KanbanRole, KanbanStatus } from '../types/cv';

export const INACTIVITY_THRESHOLD_DAYS = 30;

export const normalizeRoleUrl = (url?: string): string => {
  if (!url || typeof url !== 'string') return '';
  let cleaned = url.trim().toLowerCase().replace(/^http:\/\//, 'https://');
  while (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }
  return cleaned;
};

export const STAGE_PRIORITY: Record<KanbanStatus, number> = {
  applied: 1,
  hr_call: 2,
  tech_interview: 3,
  manager_interview: 4,
  hired: 5,
  archived: 0
};

export const STAGE_LABELS: Record<KanbanStatus, string> = {
  applied: 'Applied',
  hr_call: 'HR Screening',
  tech_interview: 'Tech Interview',
  manager_interview: 'Manager Round',
  hired: 'Offer / Hired',
  archived: 'Archived'
};

export const formatStageLabel = (status: KanbanStatus): string => {
  return STAGE_LABELS[status] || status;
};

export function parseSalaryNumbers(cleaned: string): number[] {
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
    }
    if (val > 0) nums.push(Math.round(val));
  }
  return nums;
}

export function detectSalaryCurrency(str: string, fallback = 'USD'): string {
  if (/€|EUR/i.test(str)) return 'EUR';
  if (/£|GBP/i.test(str)) return 'GBP';
  if (/CZK|Kč/i.test(str)) return 'CZK';
  if (fallback && ['USD', 'EUR', 'GBP', 'CZK'].includes(fallback.toUpperCase())) {
    return fallback.toUpperCase();
  }
  return 'USD';
}

/**
 * Extracts and formats the minimum salary value from a salary range string.
 * Example: "$115,600 - $170,000 / yr" -> "115,600 USD / yr"
 * Example: "$5,000 - $8,000 / mo" -> "5,000 USD / mo"
 */
export function extractMinSalary(str?: string, fallbackCurrency?: string): string | undefined {
  if (!str || typeof str !== 'string') return undefined;
  const trimmed = str.trim();
  if (!trimmed) return undefined;

  const isMonthly = /month|mo/i.test(trimmed);
  const curr = detectSalaryCurrency(trimmed, fallbackCurrency);
  const currencyUnit = curr === 'CZK' ? 'CZK / mo' : isMonthly ? `${curr} / mo` : `${curr} / yr`;

  const cleaned = trimmed.replace(/([0-9])[,.]([0-9]{3})(?![0-9kKmM])/g, '$1$2');
  const nums = parseSalaryNumbers(cleaned);
  if (nums.length === 0) return undefined;

  const minVal = Math.min(...nums);
  return `${minVal.toLocaleString('en-US')} ${currencyUnit}`;
}

export interface SalaryJobSource {
  salarySummary?: string;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
}

/**
 * Resolves the minimum salary for a job, prioritizing salary range summary then numerical minSalary.
 */
export function extractMinSalaryFromJob(job: SalaryJobSource): string | undefined {
  if (!job) return undefined;

  if (job.salarySummary?.trim()) {
    const fromSummary = extractMinSalary(job.salarySummary, job.currency);
    if (fromSummary) return fromSummary;
  }

  const num = (typeof job.minSalary === 'number' && job.minSalary > 0)
    ? job.minSalary
    : (typeof job.maxSalary === 'number' && job.maxSalary > 0)
      ? job.maxSalary
      : undefined;

  if (num) {
    const curr = detectSalaryCurrency(job.currency || '', 'USD');
    const unit = curr === 'CZK' ? 'CZK / mo' : `${curr} / yr`;
    return `${num.toLocaleString('en-US')} ${unit}`;
  }

  return undefined;
}

export function backfillRoleSalaryFromCache(
  role: KanbanRole, 
  cachedJobs?: Array<SalaryJobSource & { url?: string; company?: string; title?: string }> | null
): KanbanRole {
  if (role.salary?.trim() || !cachedJobs || cachedJobs.length === 0) return role;

  const normUrl = normalizeRoleUrl(role.roleUrl);
  const roleComp = role.company.trim().toLowerCase();
  const roleTitle = role.roleTitle.trim().toLowerCase();

  const match = cachedJobs.find(j => normUrl && normalizeRoleUrl(j.url) === normUrl) ||
    cachedJobs.find(j => 
      Boolean(j.company && j.title) &&
      j.company!.trim().toLowerCase() === roleComp &&
      j.title!.trim().toLowerCase() === roleTitle
    );

  if (match) {
    const minSalary = extractMinSalaryFromJob(match);
    if (minSalary) {
      return { ...role, salary: minSalary };
    }
  }

  return role;
}

function resolveMergedSalary(incomingSalary?: string, existingSalary?: string): string | undefined {
  const chosen = incomingSalary?.trim() || existingSalary?.trim();
  if (!chosen) return undefined;
  return extractMinSalary(chosen) || chosen;
}

function mergeTwoKanbanRoles(existing: KanbanRole, incoming: KanbanRole): KanbanRole {
  const existingPriority = STAGE_PRIORITY[existing.status] ?? 0;
  const incomingPriority = STAGE_PRIORITY[incoming.status] ?? 0;
  const status = incomingPriority > existingPriority ? incoming.status : existing.status;
  const salary = resolveMergedSalary(incoming.salary, existing.salary);

  return {
    ...existing,
    ...incoming,
    id: existing.id,
    roleUrl: existing.roleUrl || incoming.roleUrl,
    status,
    salary,
    dateApplied: existing.dateApplied?.trim() ? existing.dateApplied : (incoming.dateApplied || existing.dateApplied),
    notes: existing.notes?.trim() ? existing.notes : (incoming.notes || existing.notes),
    updatedAt: new Date().toISOString()
  };
}

export const deduplicateKanbanRoles = (
  roles: KanbanRole[],
  cachedJobs?: Array<SalaryJobSource & { url?: string; company?: string; title?: string }> | null
): KanbanRole[] => {
  if (!roles || !Array.isArray(roles)) return [];

  const seenUrls = new Map<string, KanbanRole>();
  const result: KanbanRole[] = [];

  for (const rawRole of roles) {
    const normalizedSalary = rawRole.salary?.trim() ? (extractMinSalary(rawRole.salary) || rawRole.salary) : undefined;
    let role = normalizedSalary !== rawRole.salary ? { ...rawRole, salary: normalizedSalary } : rawRole;
    if (cachedJobs && !role.salary) {
      role = backfillRoleSalaryFromCache(role, cachedJobs);
    }

    const normUrl = normalizeRoleUrl(role.roleUrl);
    if (!normUrl) {
      result.push(role);
      continue;
    }

    const existing = seenUrls.get(normUrl);
    if (!existing) {
      seenUrls.set(normUrl, role);
      result.push(role);
      continue;
    }

    const merged = mergeTwoKanbanRoles(existing, role);
    seenUrls.set(normUrl, merged);
    const index = result.findIndex(r => r.id === existing.id);
    if (index !== -1) {
      result[index] = merged;
    }
  }

  return result;
};

/**
 * Calculates the number of elapsed calendar days since a role's last update or application date.
 */
export const getKanbanInactivityDays = (role: KanbanRole, referenceDate: Date = new Date()): number => {
  const dateStr = role.updatedAt || role.dateApplied;
  if (!dateStr) return 0;

  const timestamp = new Date(dateStr).getTime();
  if (isNaN(timestamp)) return 0;

  const diffMs = referenceDate.getTime() - timestamp;
  if (diffMs <= 0) return 0;

  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Determines whether a role is considered stale/inactive (>= 30 days without updates),
 * excluding terminal statuses ('hired' and 'archived').
 */
export const isKanbanCardStale = (role: KanbanRole, referenceDate: Date = new Date()): boolean => {
  if (role.status === 'hired' || role.status === 'archived') {
    return false;
  }
  return getKanbanInactivityDays(role, referenceDate) >= INACTIVITY_THRESHOLD_DAYS;
};

/**
 * Returns a human-friendly string for the inactivity badge (e.g. "32d inactive", "2mo inactive").
 */
export const formatInactivityBadge = (days: number): string => {
  if (days >= 60) {
    const months = Math.floor(days / 30);
    return `${months}mo inactive`;
  }
  return `${days}d inactive`;
};
