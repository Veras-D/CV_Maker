import { describe, it, expect } from 'vitest';
import { 
  updateProfileState, 
  addExperienceState, 
  updateExperienceState, 
  deleteExperienceState, 
  toggleExperienceEnabledState,
  addKanbanRoleState,
  updateKanbanRoleStatusState,
  updateKanbanRoleState,
  createPresetState
} from './cvStateUpdaters';
import { createEmptyCVData } from '../types/cv';

describe('cvStateUpdaters', () => {
  it('updates user profile immutably', () => {
    const initial = createEmptyCVData();
    const updated = updateProfileState(initial, { name: 'John Doe', email: 'john@example.com' });

    expect(updated.profile.name).toBe('John Doe');
    expect(updated.profile.email).toBe('john@example.com');
    expect(initial.profile.name).toBe(''); // Verify original not mutated
  });

  it('adds and updates work experiences', () => {
    const initial = createEmptyCVData();
    const withExp = addExperienceState(initial);
    expect(withExp.experiences).toHaveLength(1);

    const expId = withExp.experiences[0].id;
    const modified = updateExperienceState(withExp, expId, { company: 'Stripe' });
    expect(modified.experiences[0].company).toBe('Stripe');

    const toggled = toggleExperienceEnabledState(modified, expId);
    expect(toggled.experiences[0].enabled).toBe(false);

    const deleted = deleteExperienceState(toggled, expId);
    expect(deleted.experiences).toHaveLength(0);
  });

  it('manages Kanban roles and status transitions', () => {
    const initial = createEmptyCVData();
    const withRole = addKanbanRoleState(initial, {
      roleTitle: 'Senior Frontend Engineer',
      company: 'GitLab',
      status: 'applied',
      location: 'Remote',
      dateApplied: '2026-10-04',
      notes: 'Initial test'
    });

    expect(withRole.kanbanRoles).toHaveLength(1);
    const roleId = withRole.kanbanRoles[0].id;
    expect(withRole.kanbanRoles[0].status).toBe('applied');

    const interviewing = updateKanbanRoleStatusState(withRole, roleId, 'hr_call');
    expect(interviewing.kanbanRoles[0].status).toBe('hr_call');
  });

  it('updates existing card and preserves pipeline stage when roleUrl matches', () => {
    const initial = createEmptyCVData();
    const created = addKanbanRoleState(initial, {
      roleTitle: 'Software Engineer',
      company: 'Field AI',
      status: 'tech_interview',
      location: 'Remote',
      dateApplied: '2026-10-01',
      roleUrl: 'https://jobs.lever.co/field-ai/cce9d6c0-55c9-4513-b4f6-9508c2bc34d5'
    });

    expect(created.kanbanRoles).toHaveLength(1);
    expect(created.kanbanRoles[0].status).toBe('tech_interview');

    // Attempt to add a new card with the same roleUrl (with different trailing slash and casing)
    const reAdded = addKanbanRoleState(created, {
      roleTitle: 'Senior Software Engineer (Updated)',
      company: 'Field AI Inc',
      status: 'applied', // New card defaults to applied
      location: 'San Francisco, CA',
      dateApplied: '2026-10-07',
      roleUrl: 'https://JOBS.LEVER.CO/field-ai/cce9d6c0-55c9-4513-b4f6-9508c2bc34d5/'
    });

    // Still only 1 card, but updated title and preserved tech_interview stage!
    expect(reAdded.kanbanRoles).toHaveLength(1);
    expect(reAdded.kanbanRoles[0].roleTitle).toBe('Senior Software Engineer (Updated)');
    expect(reAdded.kanbanRoles[0].status).toBe('tech_interview');
  });

  it('prevents assigning duplicate roleUrl when updating an existing card', () => {
    const initial = createEmptyCVData();
    const withCard1 = addKanbanRoleState(initial, {
      roleTitle: 'Card 1',
      company: 'Company 1',
      status: 'applied',
      location: 'Remote',
      dateApplied: '2026-10-01',
      roleUrl: 'https://jobs.lever.co/first'
    });
    const withCard2 = addKanbanRoleState(withCard1, {
      roleTitle: 'Card 2',
      company: 'Company 2',
      status: 'applied',
      location: 'Remote',
      dateApplied: '2026-10-01',
      roleUrl: 'https://jobs.lever.co/second'
    });

    expect(withCard2.kanbanRoles).toHaveLength(2);
    const card2Id = withCard2.kanbanRoles[0].id;

    const updated = updateKanbanRoleState(withCard2, card2Id, {
      roleUrl: 'https://jobs.lever.co/first'
    });

    const card2 = updated.kanbanRoles.find(r => r.id === card2Id);
    expect(card2?.roleUrl).toBe('https://jobs.lever.co/second');
  });

  it('creates new role presets with custom tags', () => {
    const initial = createEmptyCVData();
    const withPreset = createPresetState(initial, 'Tech Lead', ['react', 'leadership'], 'Tech lead preset');

    expect(withPreset.presets.length).toBeGreaterThan(initial.presets.length);
    const newPreset = withPreset.presets.find(p => p.name === 'Tech Lead');
    expect(newPreset).toBeDefined();
    expect(newPreset?.activeTags).toEqual(['react', 'leadership']);
    expect(withPreset.activePresetId).toBe(newPreset?.id);
  });
});
