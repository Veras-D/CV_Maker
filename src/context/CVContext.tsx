import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  CVData, 
  RolePreset, 
  PDFMetadata, 
  KanbanRole, 
  KanbanStatus, 
  WorkExperience, 
  WorkBullet,
  SkillCategory,
  ProjectItem,
  EducationItem,
  LanguageItem,
  UserProfile,
  createEmptyCVData
} from '../types/cv';

const STORAGE_KEY = 'cv_maker_data_v2';

interface CVContextType {
  cvData: CVData;
  activePreset: RolePreset;
  activeLanguage: string;
  selectedTags: string[];
  activeLayout: 'classic' | 'modern' | 'minimal';
  activeTab: 'tailor' | 'editor' | 'kanban' | 'metadata';
  showArchivedKanban: boolean;
  
  // Navigation
  setActiveTab: (tab: 'tailor' | 'editor' | 'kanban' | 'metadata') => void;
  setShowArchivedKanban: (show: boolean) => void;

  // Preset & Filtering
  selectPreset: (presetId: string) => void;
  createPreset: (name: string, description?: string) => void;
  deletePreset: (presetId: string) => void;
  setLanguage: (lang: string) => void;
  setLayout: (layout: 'classic' | 'modern' | 'minimal') => void;
  toggleTagFilter: (tag: string) => void;
  clearTagFilters: () => void;

  // Profile Editor
  updateProfile: (profile: Partial<UserProfile>) => void;

  // Work Experience Editor
  addExperience: () => void;
  updateExperience: (id: string, updated: Partial<WorkExperience>) => void;
  deleteExperience: (id: string) => void;
  toggleExperienceEnabled: (id: string) => void;
  addBullet: (expId: string) => void;
  updateBullet: (expId: string, bulletId: string, updated: Partial<WorkBullet>) => void;
  deleteBullet: (expId: string, bulletId: string) => void;

  // Skills Editor
  addSkillCategory: (categoryNameEn: string, categoryNameCs?: string) => void;
  updateSkillCategory: (catId: string, nameEn: string, nameCs?: string) => void;
  deleteSkillCategory: (catId: string) => void;
  addSkill: (catId: string, name: string, tags: string[]) => void;
  toggleSkillEnabled: (catId: string, skillId: string) => void;
  deleteSkill: (catId: string, skillId: string) => void;

  // Projects Editor
  addProject: () => void;
  updateProject: (id: string, updated: Partial<ProjectItem>) => void;
  deleteProject: (id: string) => void;
  toggleProjectEnabled: (id: string) => void;

  // Education Editor
  addEducation: () => void;
  updateEducation: (id: string, updated: Partial<EducationItem>) => void;
  deleteEducation: (id: string) => void;
  toggleEducationEnabled: (id: string) => void;

  // Languages Editor
  addLanguage: () => void;
  updateLanguage: (id: string, updated: Partial<LanguageItem>) => void;
  deleteLanguage: (id: string) => void;

  // Metadata Editor
  updateMetadata: (metadata: Partial<PDFMetadata>) => void;

  // Kanban Role Tracker
  addKanbanRole: (role: Omit<KanbanRole, 'id' | 'updatedAt'>) => void;
  updateKanbanRoleStatus: (id: string, status: KanbanStatus) => void;
  updateKanbanRole: (id: string, updated: Partial<KanbanRole>) => void;
  deleteKanbanRole: (id: string) => void;

  // Data Persistence & Reset
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;
  resetToDefaultData: () => void;
}

const CVContext = createContext<CVContextType | undefined>(undefined);

export const CVProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cvData, setCvData] = useState<CVData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved CV data:", e);
      }
    }
    return createEmptyCVData();
  });

  const [activeTab, setActiveTab] = useState<'tailor' | 'editor' | 'kanban' | 'metadata'>('tailor');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showArchivedKanban, setShowArchivedKanban] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
  }, [cvData]);

  // Active Preset
  const activePreset = cvData.presets.find(p => p.id === cvData.activePresetId) || cvData.presets[0];
  const activeLanguage = activePreset?.activeLanguage || 'en';
  const activeLayout = activePreset?.activeLayout || 'classic';

  // Preset handlers
  const selectPreset = (presetId: string) => {
    setCvData(prev => ({ ...prev, activePresetId: presetId }));
  };

  const createPreset = (name: string, description?: string) => {
    const newPreset: RolePreset = {
      id: `preset-${Date.now()}`,
      name,
      description: description || 'Custom role preset',
      activeTags: [...selectedTags],
      activeLanguage: activeLanguage,
      activeLayout: activeLayout,
      metadata: { ...activePreset.metadata, dc_title: `${cvData.profile.name} - ${name}` }
    };
    setCvData(prev => ({
      ...prev,
      presets: [...prev.presets, newPreset],
      activePresetId: newPreset.id
    }));
  };

  const deletePreset = (presetId: string) => {
    if (cvData.presets.length <= 1) return;
    setCvData(prev => {
      const filtered = prev.presets.filter(p => p.id !== presetId);
      return {
        ...prev,
        presets: filtered,
        activePresetId: filtered[0].id
      };
    });
  };

  const setLanguage = (lang: string) => {
    setCvData(prev => ({
      ...prev,
      presets: prev.presets.map(p => 
        p.id === prev.activePresetId ? { ...p, activeLanguage: lang } : p
      )
    }));
  };

  const setLayout = (layout: 'classic' | 'modern' | 'minimal') => {
    setCvData(prev => ({
      ...prev,
      presets: prev.presets.map(p => 
        p.id === prev.activePresetId ? { ...p, activeLayout: layout } : p
      )
    }));
  };

  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  // Profile
  const updateProfile = (updated: Partial<UserProfile>) => {
    setCvData(prev => ({
      ...prev,
      profile: { ...prev.profile, ...updated }
    }));
  };

  // Experiences
  const addExperience = () => {
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
    setCvData(prev => ({ ...prev, experiences: [newExp, ...prev.experiences] }));
  };

  const updateExperience = (id: string, updated: Partial<WorkExperience>) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.map(e => e.id === id ? { ...e, ...updated } : e)
    }));
  };

  const deleteExperience = (id: string) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.filter(e => e.id !== id)
    }));
  };

  const toggleExperienceEnabled = (id: string) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e)
    }));
  };

  const addBullet = (expId: string) => {
    const newBullet: WorkBullet = {
      id: `b-${Date.now()}`,
      text: { en: "Achievement bullet point", cs: "Popis dosaženého výsledku" },
      tags: ["fullstack"],
      enabled: true
    };
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.map(e => 
        e.id === expId ? { ...e, bullets: [...e.bullets, newBullet] } : e
      )
    }));
  };

  const updateBullet = (expId: string, bulletId: string, updated: Partial<WorkBullet>) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.map(e => 
        e.id === expId ? {
          ...e,
          bullets: e.bullets.map(b => b.id === bulletId ? { ...b, ...updated } : b)
        } : e
      )
    }));
  };

  const deleteBullet = (expId: string, bulletId: string) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.map(e => 
        e.id === expId ? {
          ...e,
          bullets: e.bullets.filter(b => b.id !== bulletId)
        } : e
      )
    }));
  };

  // Skills
  const addSkillCategory = (categoryNameEn: string, categoryNameCs?: string) => {
    const newCat: SkillCategory = {
      id: `cat-${Date.now()}`,
      categoryName: { en: categoryNameEn, ...(categoryNameCs ? { cs: categoryNameCs } : {}) },
      skills: []
    };
    setCvData(prev => ({ ...prev, skillCategories: [...prev.skillCategories, newCat] }));
  };

  const updateSkillCategory = (catId: string, nameEn: string, nameCs?: string) => {
    setCvData(prev => ({
      ...prev,
      skillCategories: prev.skillCategories.map(c => 
        c.id === catId ? { ...c, categoryName: { ...c.categoryName, en: nameEn, ...(nameCs ? { cs: nameCs } : {}) } } : c
      )
    }));
  };

  const deleteSkillCategory = (catId: string) => {
    setCvData(prev => ({
      ...prev,
      skillCategories: prev.skillCategories.filter(c => c.id !== catId)
    }));
  };

  const addSkill = (catId: string, name: string, tags: string[]) => {
    const newSkill = {
      id: `sk-${Date.now()}`,
      name,
      tags: tags.length ? tags : ["fullstack"],
      enabled: true
    };
    setCvData(prev => ({
      ...prev,
      skillCategories: prev.skillCategories.map(c => 
        c.id === catId ? { ...c, skills: [...c.skills, newSkill] } : c
      )
    }));
  };

  const toggleSkillEnabled = (catId: string, skillId: string) => {
    setCvData(prev => ({
      ...prev,
      skillCategories: prev.skillCategories.map(c => 
        c.id === catId ? {
          ...c,
          skills: c.skills.map(s => s.id === skillId ? { ...s, enabled: !s.enabled } : s)
        } : c
      )
    }));
  };

  const deleteSkill = (catId: string, skillId: string) => {
    setCvData(prev => ({
      ...prev,
      skillCategories: prev.skillCategories.map(c => 
        c.id === catId ? {
          ...c,
          skills: c.skills.filter(s => s.id !== skillId)
        } : c
      )
    }));
  };

  // Projects
  const addProject = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: "Project Title",
      description: { en: "Description of the project", cs: "Popis projektu" },
      techStack: ["React", "TypeScript"],
      tags: ["fullstack"],
      enabled: true
    };
    setCvData(prev => ({ ...prev, projects: [...prev.projects, newProj] }));
  };

  const updateProject = (id: string, updated: Partial<ProjectItem>) => {
    setCvData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...updated } : p)
    }));
  };

  const deleteProject = (id: string) => {
    setCvData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
  };

  const toggleProjectEnabled = (id: string) => {
    setCvData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)
    }));
  };

  // Education
  const addEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: "University / Institute",
      program: { en: "Degree / Program Title", cs: "Titul / Název Programu" },
      dates: "2023 - 2024",
      technologies: [],
      enabled: true
    };
    setCvData(prev => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const updateEducation = (id: string, updated: Partial<EducationItem>) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, ...updated } : e)
    }));
  };

  const deleteEducation = (id: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter(e => e.id !== id)
    }));
  };

  const toggleEducationEnabled = (id: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e)
    }));
  };

  // Languages
  const addLanguage = () => {
    const newLang: LanguageItem = {
      id: `lang-${Date.now()}`,
      language: { en: "Language Name", cs: "Název Jazyka" },
      proficiency: { en: "Proficiency Level", cs: "Úroveň" },
      enabled: true
    };
    setCvData(prev => ({ ...prev, languages: [...prev.languages, newLang] }));
  };

  const updateLanguage = (id: string, updated: Partial<LanguageItem>) => {
    setCvData(prev => ({
      ...prev,
      languages: prev.languages.map(l => l.id === id ? { ...l, ...updated } : l)
    }));
  };

  const deleteLanguage = (id: string) => {
    setCvData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l.id !== id)
    }));
  };

  // PDF Metadata
  const updateMetadata = (metadata: Partial<PDFMetadata>) => {
    setCvData(prev => ({
      ...prev,
      presets: prev.presets.map(p => 
        p.id === prev.activePresetId ? {
          ...p,
          metadata: { ...p.metadata, ...metadata }
        } : p
      )
    }));
  };

  // Kanban
  const addKanbanRole = (role: Omit<KanbanRole, 'id' | 'updatedAt'>) => {
    const newRole: KanbanRole = {
      ...role,
      id: `kanban-${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    setCvData(prev => ({
      ...prev,
      kanbanRoles: [newRole, ...prev.kanbanRoles]
    }));
  };

  const updateKanbanRoleStatus = (id: string, status: KanbanStatus) => {
    setCvData(prev => ({
      ...prev,
      kanbanRoles: prev.kanbanRoles.map(r => 
        r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
      )
    }));
  };

  const updateKanbanRole = (id: string, updated: Partial<KanbanRole>) => {
    setCvData(prev => ({
      ...prev,
      kanbanRoles: prev.kanbanRoles.map(r => 
        r.id === id ? { ...r, ...updated, updatedAt: new Date().toISOString() } : r
      )
    }));
  };

  const deleteKanbanRole = (id: string) => {
    setCvData(prev => ({
      ...prev,
      kanbanRoles: prev.kanbanRoles.filter(r => r.id !== id)
    }));
  };

  // Export / Import / Reset
  const exportDataJSON = () => {
    const filename = `cv_master_backup_${new Date().toISOString().slice(0, 10)}.json`;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cvData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    return filename;
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile && parsed.experiences && parsed.presets) {
        setCvData(parsed);
        return true;
      }
    } catch (e) {
      console.error("Invalid JSON format", e);
    }
    return false;
  };

  const resetToDefaultData = () => {
    setCvData(createEmptyCVData());
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <CVContext.Provider value={{
      cvData,
      activePreset,
      activeLanguage,
      selectedTags,
      activeLayout,
      activeTab,
      showArchivedKanban,
      setActiveTab,
      setShowArchivedKanban,
      selectPreset,
      createPreset,
      deletePreset,
      setLanguage,
      setLayout,
      toggleTagFilter,
      clearTagFilters,
      updateProfile,
      addExperience,
      updateExperience,
      deleteExperience,
      toggleExperienceEnabled,
      addBullet,
      updateBullet,
      deleteBullet,
      addSkillCategory,
      updateSkillCategory,
      deleteSkillCategory,
      addSkill,
      toggleSkillEnabled,
      deleteSkill,
      addProject,
      updateProject,
      deleteProject,
      toggleProjectEnabled,
      addEducation,
      updateEducation,
      deleteEducation,
      toggleEducationEnabled,
      addLanguage,
      updateLanguage,
      deleteLanguage,
      updateMetadata,
      addKanbanRole,
      updateKanbanRoleStatus,
      updateKanbanRole,
      deleteKanbanRole,
      exportDataJSON,
      importDataJSON,
      resetToDefaultData
    }}>
      {children}
    </CVContext.Provider>
  );
};

export const useCV = () => {
  const context = useContext(CVContext);
  if (!context) {
    throw new Error('useCV must be used within a CVProvider');
  }
  return context;
};
