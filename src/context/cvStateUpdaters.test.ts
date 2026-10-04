import { describe, it, expect } from 'vitest';
import { 
  updateProfileState, 
  addExperienceState, 
  updateExperienceState, 
  deleteExperienceState, 
  toggleExperienceEnabledState,
  addKanbanRoleState,
  updateKanbanRoleStatusState,
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
