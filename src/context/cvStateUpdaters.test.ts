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
  createPresetState,
  addLanguageState,
  addSkillCategoryState,
  addSkillState
} from './cvStateUpdaters';
import { createEmptyCVData } from '../types/cv';
import { EDITOR_LIMITS } from '../utils/editorLimits';

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

  it('updates existing card and preserves pipeline stage, notes, and dateApplied when roleUrl matches', () => {
    const initial = createEmptyCVData();
    const created = addKanbanRoleState(initial, {
      roleTitle: 'Software Engineer',
      company: 'Field AI',
      status: 'tech_interview',
      location: 'Remote',
      dateApplied: '2026-10-01',
      notes: 'Initial interview notes from recruiter',
      roleUrl: 'https://jobs.lever.co/field-ai/cce9d6c0-55c9-4513-b4f6-9508c2bc34d5'
    });

    expect(created.kanbanRoles).toHaveLength(1);
    expect(created.kanbanRoles[0].status).toBe('tech_interview');
    expect(created.kanbanRoles[0].dateApplied).toBe('2026-10-01');
    expect(created.kanbanRoles[0].notes).toBe('Initial interview notes from recruiter');

    // Attempt to add a new card with the same roleUrl (with different trailing slash and casing)
    const reAdded = addKanbanRoleState(created, {
      roleTitle: 'Senior Software Engineer (Updated)',
      company: 'Field AI Inc',
      status: 'applied', // New card defaults to applied
      location: 'San Francisco, CA',
      dateApplied: '2026-10-07', // New re-apply date
      notes: 'Default AI tailoring notes', // Incoming default note
      roleUrl: 'https://JOBS.LEVER.CO/field-ai/cce9d6c0-55c9-4513-b4f6-9508c2bc34d5/'
    });

    // Still only 1 card, updated title & company, but preserved tech_interview stage, original date applied, and original notes!
    expect(reAdded.kanbanRoles).toHaveLength(1);
    expect(reAdded.kanbanRoles[0].roleTitle).toBe('Senior Software Engineer (Updated)');
    expect(reAdded.kanbanRoles[0].company).toBe('Field AI Inc');
    expect(reAdded.kanbanRoles[0].status).toBe('tech_interview'); // Preserved stage!
    expect(reAdded.kanbanRoles[0].dateApplied).toBe('2026-10-01'); // Preserved original date applied!
    expect(reAdded.kanbanRoles[0].notes).toBe('Initial interview notes from recruiter'); // Preserved original notes!
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

  it('enforces maximum languages limit', () => {
    let state = createEmptyCVData();
    state.languages = [];
    for (let i = 0; i < EDITOR_LIMITS.MAX_LANGUAGES + 3; i++) {
      state = addLanguageState(state);
    }
    expect(state.languages).toHaveLength(EDITOR_LIMITS.MAX_LANGUAGES);
  });

  it('enforces maximum skill categories limit', () => {
    let state = createEmptyCVData();
    state.skillCategories = [];
    for (let i = 0; i < EDITOR_LIMITS.MAX_SKILL_CATEGORIES + 3; i++) {
      state = addSkillCategoryState(state, `Cat ${i}`);
    }
    expect(state.skillCategories).toHaveLength(EDITOR_LIMITS.MAX_SKILL_CATEGORIES);
  });

  it('enforces maximum skills per category limit', () => {
    let state = createEmptyCVData();
    state.skillCategories = [];
    state = addSkillCategoryState(state, 'Frontend');
    const catId = state.skillCategories[0].id;

    for (let i = 0; i < EDITOR_LIMITS.MAX_CATEGORY_SKILLS + 3; i++) {
      state = addSkillState(state, catId, `Skill ${i}`, ['tag']);
    }
    expect(state.skillCategories[0].skills).toHaveLength(EDITOR_LIMITS.MAX_CATEGORY_SKILLS);
  });
});
