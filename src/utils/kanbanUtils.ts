import { KanbanRole } from '../types/cv';

export const INACTIVITY_THRESHOLD_DAYS = 30;

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
