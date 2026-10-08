import { describe, it, expect } from 'vitest';
import { 
  normalizeRoleUrl, 
  deduplicateKanbanRoles, 
  formatStageLabel, 
  isKanbanCardStale, 
  formatInactivityBadge,
  extractMinSalary,
  extractMinSalaryFromJob,
  backfillRoleSalaryFromCache
} from './kanbanUtils';
import { KanbanRole } from '../types/cv';

describe('kanbanUtils', () => {
  describe('normalizeRoleUrl', () => {
    it('normalizes casing and trailing slashes', () => {
      expect(normalizeRoleUrl('https://Jobs.Lever.Co/Company/Role/')).toBe('https://jobs.lever.co/company/role');
      expect(normalizeRoleUrl('  http://example.com/job  ')).toBe('https://example.com/job');
      expect(normalizeRoleUrl('')).toBe('');
      expect(normalizeRoleUrl(undefined)).toBe('');
    });
  });

  describe('deduplicateKanbanRoles', () => {
    it('merges duplicate cards by roleUrl while preserving advanced stage', () => {
      const mockRoles: KanbanRole[] = [
        {
          id: 'card-1',
          roleTitle: 'Frontend Engineer',
          company: 'Acme',
          location: 'Remote',
          status: 'applied',
          dateApplied: '2026-09-15',
          notes: 'Met founder at meetup',
          roleUrl: 'https://jobs.lever.co/acme/123/',
          updatedAt: '2026-09-15T10:00:00Z'
        },
        {
          id: 'card-2',
          roleTitle: 'Senior Frontend Engineer',
          company: 'Acme Corp',
          location: 'Remote',
          status: 'tech_interview',
          dateApplied: '2026-10-01',
          notes: 'Generic imported note',
          roleUrl: 'https://jobs.lever.co/acme/123',
          updatedAt: '2026-10-02T10:00:00Z'
        }
      ];

      const deduplicated = deduplicateKanbanRoles(mockRoles);
      expect(deduplicated).toHaveLength(1);
      expect(deduplicated[0].status).toBe('tech_interview');
      expect(deduplicated[0].roleTitle).toBe('Senior Frontend Engineer');
      expect(deduplicated[0].dateApplied).toBe('2026-09-15');
      expect(deduplicated[0].notes).toBe('Met founder at meetup');
    });

    it('keeps distinct roles untouched', () => {
      const mockRoles: KanbanRole[] = [
        {
          id: 'card-a',
          roleTitle: 'Engineer A',
          company: 'Alpha',
          location: 'Remote',
          status: 'applied',
          dateApplied: '2026-10-01',
          roleUrl: 'https://alpha.com/job1',
          updatedAt: '2026-10-01T10:00:00Z'
        },
        {
          id: 'card-b',
          roleTitle: 'Engineer B',
          company: 'Beta',
          location: 'Remote',
          status: 'hr_call',
          dateApplied: '2026-10-01',
          roleUrl: 'https://beta.com/job2',
          updatedAt: '2026-10-01T10:00:00Z'
        }
      ];

      const deduplicated = deduplicateKanbanRoles(mockRoles);
      expect(deduplicated).toHaveLength(2);
    });
  });

  describe('formatStageLabel', () => {
    it('returns human-friendly label for each pipeline stage', () => {
      expect(formatStageLabel('applied')).toBe('Applied');
      expect(formatStageLabel('hr_call')).toBe('HR Screening');
      expect(formatStageLabel('tech_interview')).toBe('Tech Interview');
      expect(formatStageLabel('manager_interview')).toBe('Manager Round');
      expect(formatStageLabel('hired')).toBe('Offer / Hired');
      expect(formatStageLabel('archived')).toBe('Archived');
    });
  });

  describe('inactivity helpers', () => {
    it('calculates staleness and formatted badge', () => {
      const now = new Date('2026-10-15T12:00:00Z');
      const staleRole: KanbanRole = {
        id: 'stale-1',
        roleTitle: 'Dev',
        company: 'StaleCo',
        location: 'Remote',
        status: 'applied',
        dateApplied: '2026-08-01',
        updatedAt: '2026-08-01T00:00:00Z'
      };

      expect(isKanbanCardStale(staleRole, now)).toBe(true);
      expect(formatInactivityBadge(75)).toBe('2mo inactive');
      expect(formatInactivityBadge(35)).toBe('35d inactive');
    });
  });
});

describe('kanbanUtils salary helpers', () => {
  describe('extractMinSalary', () => {
    it('extracts minimum value from USD annual salary range', () => {
      expect(extractMinSalary('$115,600 - $170,000 / yr')).toBe('115,600 USD / yr');
      expect(extractMinSalary('$115,600 - $170,000/yr')).toBe('115,600 USD / yr');
      expect(extractMinSalary('$ $115,600 - $170,000 / yr')).toBe('115,600 USD / yr');
    });

    it('extracts minimum value from abbreviated k/m ranges', () => {
      expect(extractMinSalary('$115k - $170k / yr')).toBe('115,000 USD / yr');
      expect(extractMinSalary('$115.5k - $170k')).toBe('115,500 USD / yr');
      expect(extractMinSalary('$1.2m - $1.5m / yr')).toBe('1,200,000 USD / yr');
    });

    it('handles foreign currencies and monthly periods', () => {
      expect(extractMinSalary('€60,000 - €80,000 / yr')).toBe('60,000 EUR / yr');
      expect(extractMinSalary('£50,000 - £70,000 / yr')).toBe('50,000 GBP / yr');
      expect(extractMinSalary('$5,000 - $8,000 / mo')).toBe('5,000 USD / mo');
      expect(extractMinSalary('$5,000 - $8,000 / month')).toBe('5,000 USD / mo');
      expect(extractMinSalary('100,000 CZK / mo')).toBe('100,000 CZK / mo');
    });

    it('handles single salary numbers and pre-formatted values', () => {
      expect(extractMinSalary('$120,000')).toBe('120,000 USD / yr');
      expect(extractMinSalary('From $115,600 / yr')).toBe('115,600 USD / yr');
      expect(extractMinSalary('Up to $170,000 / yr')).toBe('170,000 USD / yr');
      expect(extractMinSalary('145,000 USD / yr')).toBe('145,000 USD / yr');
    });

    it('returns undefined for missing or text-only salaries', () => {
      expect(extractMinSalary(undefined)).toBeUndefined();
      expect(extractMinSalary('')).toBeUndefined();
      expect(extractMinSalary('Competitive')).toBeUndefined();
      expect(extractMinSalary('DOE')).toBeUndefined();
    });
  });

  describe('extractMinSalaryFromJob', () => {
    it('prioritizes salarySummary range over plain number', () => {
      const res = extractMinSalaryFromJob({
        salarySummary: '$115,600 - $170,000 / yr',
        minSalary: 115600,
        maxSalary: 170000,
        currency: 'USD'
      });
      expect(res).toBe('115,600 USD / yr');
    });

    it('falls back to numeric minSalary when salarySummary is absent', () => {
      const res = extractMinSalaryFromJob({
        minSalary: 95000,
        currency: 'EUR'
      });
      expect(res).toBe('95,000 EUR / yr');
    });

    it('returns undefined when no salary info is present', () => {
      expect(extractMinSalaryFromJob({})).toBeUndefined();
    });
  });

  describe('backfillRoleSalaryFromCache', () => {
    it('backfills missing salary when roleUrl matches cached job', () => {
      const role: KanbanRole = {
        id: 'role-1',
        roleTitle: 'SDET',
        company: 'Flex',
        location: 'Remote',
        status: 'applied',
        dateApplied: '2026-10-08',
        roleUrl: 'https://jobicy.com/jobs/92645-sdet',
        updatedAt: '2026-10-08T00:00:00Z'
      };

      const cachedJobs = [
        {
          url: 'https://jobicy.com/jobs/92645-sdet',
          company: 'Flex',
          title: 'SDET',
          salarySummary: '$115,600 - $170,000 / yr'
        }
      ];

      const updated = backfillRoleSalaryFromCache(role, cachedJobs);
      expect(updated.salary).toBe('115,600 USD / yr');
    });

    it('preserves existing salary without overwriting', () => {
      const role: KanbanRole = {
        id: 'role-2',
        roleTitle: 'SDET',
        company: 'Flex',
        location: 'Remote',
        salary: '130,000 USD / yr',
        status: 'applied',
        dateApplied: '2026-10-08',
        roleUrl: 'https://jobicy.com/jobs/92645-sdet',
        updatedAt: '2026-10-08T00:00:00Z'
      };

      const cachedJobs = [
        {
          url: 'https://jobicy.com/jobs/92645-sdet',
          salarySummary: '$115,600 - $170,000 / yr'
        }
      ];

      const updated = backfillRoleSalaryFromCache(role, cachedJobs);
      expect(updated.salary).toBe('130,000 USD / yr');
    });
  });
});
