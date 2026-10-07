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

function mergeTwoKanbanRoles(existing: KanbanRole, incoming: KanbanRole): KanbanRole {
  const existingPriority = STAGE_PRIORITY[existing.status] ?? 0;
  const incomingPriority = STAGE_PRIORITY[incoming.status] ?? 0;
  const status = incomingPriority > existingPriority ? incoming.status : existing.status;

  return {
    ...existing,
    ...incoming,
    id: existing.id,
    roleUrl: existing.roleUrl || incoming.roleUrl,
    status,
    dateApplied: existing.dateApplied?.trim() ? existing.dateApplied : (incoming.dateApplied || existing.dateApplied),
    notes: existing.notes?.trim() ? existing.notes : (incoming.notes || existing.notes),
    updatedAt: new Date().toISOString()
  };
}

export const deduplicateKanbanRoles = (roles: KanbanRole[]): KanbanRole[] => {
  if (!roles || !Array.isArray(roles)) return [];

  const seenUrls = new Map<string, KanbanRole>();
  const result: KanbanRole[] = [];

  for (const role of roles) {
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
