import { describe, it, expect } from 'vitest';
import { 
  normalizeRoleUrl, 
  deduplicateKanbanRoles, 
  formatStageLabel, 
  isKanbanCardStale, 
  formatInactivityBadge 
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
          dateApplied: '2026-10-01',
          roleUrl: 'https://jobs.lever.co/acme/123/',
          updatedAt: '2026-10-01T10:00:00Z'
        },
        {
          id: 'card-2',
          roleTitle: 'Senior Frontend Engineer',
          company: 'Acme Corp',
          location: 'Remote',
          status: 'tech_interview',
          dateApplied: '2026-10-01',
          roleUrl: 'https://jobs.lever.co/acme/123',
          updatedAt: '2026-10-02T10:00:00Z'
        }
      ];

      const deduplicated = deduplicateKanbanRoles(mockRoles);
      expect(deduplicated).toHaveLength(1);
      expect(deduplicated[0].status).toBe('tech_interview');
      expect(deduplicated[0].roleTitle).toBe('Senior Frontend Engineer');
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
