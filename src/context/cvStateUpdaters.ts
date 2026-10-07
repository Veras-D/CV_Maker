import { 
  CVData, 
  WorkExperience, 
  WorkBullet, 
  SkillCategory, 
  ProjectItem, 
  EducationItem, 
  LanguageItem, 
  KanbanRole, 
  KanbanStatus, 
  PDFMetadata,
  UserProfile
} from '../types/cv';
import { normalizeRoleUrl } from '../utils/kanbanUtils';

export const updateProfileState = (data: CVData, updated: Partial<UserProfile>): CVData => ({
  ...data,
  profile: { ...data.profile, ...updated }
});

export const addExperienceState = (data: CVData): CVData => {
  const newExp: WorkExperience = {
    id: `exp-${Date.now()}`,
    roleTitle: { en: "Role Title", cs: "Název Pozice" },
    company: "Company Name",
    location: "Location / Remote",
    startDate: "2024",
    endDate: "Present",
    summary: { en: "Role description", cs: "Popis pozice" },
    tags: ["fullstack"],
    enabled: true,
    bullets: [
      {
        id: `b-${Date.now()}-1`,
        text: { en: "Key responsibility or achievement", cs: "Klíčová odpovědnost nebo úspěch" },
        tags: ["fullstack"],
        enabled: true
      }
    ]
  };
  return { ...data, experiences: [newExp, ...data.experiences] };
};

export const updateExperienceState = (data: CVData, id: string, updated: Partial<WorkExperience>): CVData => ({
  ...data,
  experiences: data.experiences.map(e => e.id === id ? { ...e, ...updated } : e)
});

export const deleteExperienceState = (data: CVData, id: string): CVData => ({
  ...data,
  experiences: data.experiences.filter(e => e.id !== id)
});

export const toggleExperienceEnabledState = (data: CVData, id: string): CVData => ({
  ...data,
  experiences: data.experiences.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e)
});

export const addBulletState = (data: CVData, expId: string): CVData => {
  const newBullet: WorkBullet = {
    id: `b-${Date.now()}`,
    text: { en: "Achievement bullet point", cs: "Popis dosaženého výsledku" },
    tags: ["fullstack"],
    enabled: true
  };
  return {
    ...data,
    experiences: data.experiences.map(e => 
      e.id === expId ? { ...e, bullets: [...e.bullets, newBullet] } : e
    )
  };
};

export const updateBulletState = (
  data: CVData, 
  expId: string, 
  bulletId: string, 
  updated: Partial<WorkBullet>
): CVData => ({
  ...data,
  experiences: data.experiences.map(e => 
    e.id === expId ? {
      ...e,
      bullets: e.bullets.map(b => b.id === bulletId ? { ...b, ...updated } : b)
    } : e
  )
});

export const deleteBulletState = (data: CVData, expId: string, bulletId: string): CVData => ({
  ...data,
  experiences: data.experiences.map(e => 
    e.id === expId ? {
      ...e,
      bullets: e.bullets.filter(b => b.id !== bulletId)
    } : e
  )
});

export const addSkillCategoryState = (data: CVData, nameEn: string, nameCs?: string): CVData => {
  const newCat: SkillCategory = {
    id: `cat-${Date.now()}`,
    categoryName: { en: nameEn, ...(nameCs ? { cs: nameCs } : {}) },
    skills: []
  };
  return {
    ...data,
    skillCategories: [...data.skillCategories, newCat]
  };
};

export const updateSkillCategoryState = (data: CVData, catId: string, nameEn: string, nameCs?: string): CVData => ({
  ...data,
  skillCategories: data.skillCategories.map(c => 
    c.id === catId ? { ...c, categoryName: { ...c.categoryName, en: nameEn, ...(nameCs ? { cs: nameCs } : {}) } } : c
  )
});

export const deleteSkillCategoryState = (data: CVData, catId: string): CVData => ({
  ...data,
  skillCategories: data.skillCategories.filter(c => c.id !== catId)
});

export const addSkillState = (data: CVData, catId: string, name: string, tags: string[]): CVData => {
  const newSkill = {
    id: `sk-${Date.now()}`,
    name,
    tags: tags.length ? tags : ["fullstack"],
    enabled: true
  };
  return {
    ...data,
    skillCategories: data.skillCategories.map(c => 
      c.id === catId ? { ...c, skills: [...c.skills, newSkill] } : c
    )
  };
};

export const toggleSkillEnabledState = (data: CVData, catId: string, skillId: string): CVData => ({
  ...data,
  skillCategories: data.skillCategories.map(c => 
    c.id === catId ? {
      ...c,
      skills: c.skills.map(s => s.id === skillId ? { ...s, enabled: !s.enabled } : s)
    } : c
  )
});

export const deleteSkillState = (data: CVData, catId: string, skillId: string): CVData => ({
  ...data,
  skillCategories: data.skillCategories.map(c => 
    c.id === catId ? {
      ...c,
      skills: c.skills.filter(s => s.id !== skillId)
    } : c
  )
});

export const addProjectState = (data: CVData): CVData => ({
  ...data,
  projects: [
    ...data.projects,
    {
      id: `proj-${Date.now()}`,
      title: "Project Title",
      description: { en: "Description of the project", cs: "Popis projektu" },
      techStack: ["React", "TypeScript"],
      tags: ["fullstack"],
      enabled: true
    }
  ]
});

export const updateProjectState = (data: CVData, id: string, updated: Partial<ProjectItem>): CVData => ({
  ...data,
  projects: data.projects.map(p => p.id === id ? { ...p, ...updated } : p)
});

export const deleteProjectState = (data: CVData, id: string): CVData => ({
  ...data,
  projects: data.projects.filter(p => p.id !== id)
});

export const toggleProjectEnabledState = (data: CVData, id: string): CVData => ({
  ...data,
  projects: data.projects.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)
});

export const addEducationState = (data: CVData): CVData => ({
  ...data,
  education: [
    ...data.education,
    {
      id: `edu-${Date.now()}`,
      institution: "University / Institute",
      program: { en: "Degree / Program Title", cs: "Titul / Název Programu" },
      dates: "2023 - 2024",
      technologies: [],
      enabled: true
    }
  ]
});

export const updateEducationState = (data: CVData, id: string, updated: Partial<EducationItem>): CVData => ({
  ...data,
  education: data.education.map(e => e.id === id ? { ...e, ...updated } : e)
});

export const deleteEducationState = (data: CVData, id: string): CVData => ({
  ...data,
  education: data.education.filter(e => e.id !== id)
});

export const toggleEducationEnabledState = (data: CVData, id: string): CVData => ({
  ...data,
  education: data.education.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e)
});

export const addLanguageState = (data: CVData): CVData => ({
  ...data,
  languages: [
    ...data.languages,
    {
      id: `lang-${Date.now()}`,
      language: { en: "Language Name", cs: "Název Jazyka" },
      proficiency: { en: "Proficiency Level", cs: "Úroveň" },
      enabled: true
    }
  ]
});

export const updateLanguageState = (data: CVData, id: string, updated: Partial<LanguageItem>): CVData => ({
  ...data,
  languages: data.languages.map(l => l.id === id ? { ...l, ...updated } : l)
});

export const deleteLanguageState = (data: CVData, id: string): CVData => ({
  ...data,
  languages: data.languages.filter(l => l.id !== id)
});

export const updateMetadataState = (data: CVData, metadata: Partial<PDFMetadata>): CVData => ({
  ...data,
  presets: data.presets.map(p => 
    p.id === data.activePresetId ? {
      ...p,
      metadata: { ...p.metadata, ...metadata }
    } : p
  )
});

export const addKanbanRoleState = (data: CVData, role: Omit<KanbanRole, 'id' | 'updatedAt'>): CVData => {
  const normUrl = normalizeRoleUrl(role.roleUrl);

  if (normUrl) {
    const existingIndex = data.kanbanRoles.findIndex(
      r => normalizeRoleUrl(r.roleUrl) === normUrl
    );

    if (existingIndex !== -1) {
      const existing = data.kanbanRoles[existingIndex];
      const updatedRole: KanbanRole = {
        ...existing,
        roleTitle: role.roleTitle.trim() || existing.roleTitle,
        company: role.company.trim() || existing.company,
        location: role.location || existing.location,
        salary: role.salary !== undefined ? role.salary : existing.salary,
        roleUrl: role.roleUrl || existing.roleUrl,
        // PRESERVE the pipeline stage (status), notes, and dateApplied as requested!
        status: existing.status,
        dateApplied: existing.dateApplied?.trim() ? existing.dateApplied : (role.dateApplied || existing.dateApplied),
        notes: existing.notes?.trim() ? existing.notes : (role.notes || existing.notes),
        updatedAt: new Date().toISOString()
      };

      const updatedKanbanRoles = [...data.kanbanRoles];
      updatedKanbanRoles[existingIndex] = updatedRole;
      return { ...data, kanbanRoles: updatedKanbanRoles };
    }
  }

  const newRole: KanbanRole = {
    ...role,
    id: `kanban-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    updatedAt: new Date().toISOString()
  };
  return { ...data, kanbanRoles: [newRole, ...data.kanbanRoles] };
};

export const updateKanbanRoleStatusState = (data: CVData, id: string, status: KanbanStatus): CVData => ({
  ...data,
  kanbanRoles: data.kanbanRoles.map(r => 
    r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
  )
});

export const updateKanbanRoleState = (data: CVData, id: string, updated: Partial<KanbanRole>): CVData => {
  const normUrl = normalizeRoleUrl(updated.roleUrl);

  if (normUrl) {
    const isDuplicate = data.kanbanRoles.some(
      r => r.id !== id && normalizeRoleUrl(r.roleUrl) === normUrl
    );
    if (isDuplicate) {
      const { roleUrl: _ignored, ...safeUpdated } = updated;
      return {
        ...data,
        kanbanRoles: data.kanbanRoles.map(r => 
          r.id === id ? { ...r, ...safeUpdated, updatedAt: new Date().toISOString() } : r
        )
      };
    }
  }

  return {
    ...data,
    kanbanRoles: data.kanbanRoles.map(r => 
      r.id === id ? { ...r, ...updated, updatedAt: new Date().toISOString() } : r
    )
  };
};

export const deleteKanbanRoleState = (data: CVData, id: string): CVData => ({
  ...data,
  kanbanRoles: data.kanbanRoles.filter(r => r.id !== id)
});

export const createPresetState = (data: CVData, name: string, activeTags: string[], description?: string): CVData => {
  const activePreset = data.presets.find(p => p.id === data.activePresetId) || data.presets[0];
  const newPreset = {
    id: `preset-${Date.now()}`,
    name,
    description: description || 'Custom role preset',
    activeTags: [...activeTags],
    activeLanguage: activePreset?.activeLanguage || 'en',
    activeLayout: activePreset?.activeLayout || 'classic',
    metadata: { ...activePreset.metadata, dc_title: `${data.profile.name} - ${name}` }
  };
  return {
    ...data,
    presets: [...data.presets, newPreset],
    activePresetId: newPreset.id
  };
};

export const deletePresetState = (data: CVData, presetId: string): CVData => {
  if (data.presets.length <= 1) return data;
  const filtered = data.presets.filter(p => p.id !== presetId);
  return { ...data, presets: filtered, activePresetId: filtered[0].id };
};

export const setLanguageState = (data: CVData, lang: string): CVData => ({
  ...data,
  presets: data.presets.map(p => p.id === data.activePresetId ? { ...p, activeLanguage: lang } : p)
});

export const setLayoutState = (data: CVData, layout: 'classic' | 'modern' | 'minimal'): CVData => ({
  ...data,
  presets: data.presets.map(p => p.id === data.activePresetId ? { ...p, activeLayout: layout } : p)
});
