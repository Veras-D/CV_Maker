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
import { IngestionResult, mergeIngestionIntoCVData } from '../utils/ingestionService';
import * as updaters from './cvStateUpdaters';

const STORAGE_KEY = 'cv_maker_data_v3';

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

  // AI Ingestion Modal & Data Ingestion
  isIngestionModalOpen: boolean;
  setIsIngestionModalOpen: (open: boolean) => void;
  openIngestionModal: () => void;
  applyIngestionResult: (result: IngestionResult) => void;

  // Data Persistence & Reset
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;
  resetToDefaultData: () => void;
}

const CVContext = createContext<CVContextType | undefined>(undefined);

function loadInitialCVData(): CVData {
  try {
    localStorage.removeItem('cv_maker_data_v1');
    localStorage.removeItem('cv_maker_data_v2');
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to parse saved CV data:", e);
  }
  return createEmptyCVData();
}

export const CVProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cvData, setCvData] = useState<CVData>(loadInitialCVData);
  const [activeTab, setActiveTab] = useState<'tailor' | 'editor' | 'kanban' | 'metadata'>('tailor');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showArchivedKanban, setShowArchivedKanban] = useState(false);
  const [isIngestionModalOpen, setIsIngestionModalOpen] = useState(false);

  const openIngestionModal = () => setIsIngestionModalOpen(true);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
  }, [cvData]);

  const activePreset = cvData.presets.find(p => p.id === cvData.activePresetId) || cvData.presets[0];
  const activeLanguage = activePreset?.activeLanguage || 'en';
  const activeLayout = activePreset?.activeLayout || 'classic';

  const selectPreset = (presetId: string) => setCvData(prev => ({ ...prev, activePresetId: presetId }));

  const createPreset = (name: string, description?: string) => {
    const newPreset: RolePreset = {
      id: `preset-${Date.now()}`,
      name,
      description: description || 'Custom role preset',
      activeTags: [...selectedTags],
      activeLanguage,
      activeLayout,
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
      return { ...prev, presets: filtered, activePresetId: filtered[0].id };
    });
  };

  const setLanguage = (lang: string) => {
    setCvData(prev => ({
      ...prev,
      presets: prev.presets.map(p => p.id === prev.activePresetId ? { ...p, activeLanguage: lang } : p)
    }));
  };

  const setLayout = (layout: 'classic' | 'modern' | 'minimal') => {
    setCvData(prev => ({
      ...prev,
      presets: prev.presets.map(p => p.id === prev.activePresetId ? { ...p, activeLayout: layout } : p)
    }));
  };

  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const clearTagFilters = () => setSelectedTags([]);

  const exportDataJSON = () => JSON.stringify(cvData, null, 2);

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object' && parsed.profile && parsed.experiences) {
        setCvData(parsed);
        return true;
      }
    } catch (e) {
      console.error("Invalid JSON format", e);
    }
    return false;
  };

  const applyIngestionResult = (result: IngestionResult) => {
    setCvData(prev => mergeIngestionIntoCVData(prev, result));
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
      updateProfile: (u) => setCvData(prev => updaters.updateProfileState(prev, u)),
      addExperience: () => setCvData(prev => updaters.addExperienceState(prev)),
      updateExperience: (id, u) => setCvData(prev => updaters.updateExperienceState(prev, id, u)),
      deleteExperience: (id) => setCvData(prev => updaters.deleteExperienceState(prev, id)),
      toggleExperienceEnabled: (id) => setCvData(prev => updaters.toggleExperienceEnabledState(prev, id)),
      addBullet: (expId) => setCvData(prev => updaters.addBulletState(prev, expId)),
      updateBullet: (expId, bId, u) => setCvData(prev => updaters.updateBulletState(prev, expId, bId, u)),
      deleteBullet: (expId, bId) => setCvData(prev => updaters.deleteBulletState(prev, expId, bId)),
      addSkillCategory: (en, cs) => setCvData(prev => updaters.addSkillCategoryState(prev, en, cs)),
      updateSkillCategory: (id, en, cs) => setCvData(prev => updaters.updateSkillCategoryState(prev, id, en, cs)),
      deleteSkillCategory: (id) => setCvData(prev => updaters.deleteSkillCategoryState(prev, id)),
      addSkill: (id, name, tags) => setCvData(prev => updaters.addSkillState(prev, id, name, tags)),
      toggleSkillEnabled: (cId, sId) => setCvData(prev => updaters.toggleSkillEnabledState(prev, cId, sId)),
      deleteSkill: (cId, sId) => setCvData(prev => updaters.deleteSkillState(prev, cId, sId)),
      addProject: () => setCvData(prev => updaters.addProjectState(prev)),
      updateProject: (id, u) => setCvData(prev => updaters.updateProjectState(prev, id, u)),
      deleteProject: (id) => setCvData(prev => updaters.deleteProjectState(prev, id)),
      toggleProjectEnabled: (id) => setCvData(prev => updaters.toggleProjectEnabledState(prev, id)),
      addEducation: () => setCvData(prev => updaters.addEducationState(prev)),
      updateEducation: (id, u) => setCvData(prev => updaters.updateEducationState(prev, id, u)),
      deleteEducation: (id) => setCvData(prev => updaters.deleteEducationState(prev, id)),
      toggleEducationEnabled: (id) => setCvData(prev => updaters.toggleEducationEnabledState(prev, id)),
      addLanguage: () => setCvData(prev => updaters.addLanguageState(prev)),
      updateLanguage: (id, u) => setCvData(prev => updaters.updateLanguageState(prev, id, u)),
      deleteLanguage: (id) => setCvData(prev => updaters.deleteLanguageState(prev, id)),
      updateMetadata: (u) => setCvData(prev => updaters.updateMetadataState(prev, u)),
      addKanbanRole: (r) => setCvData(prev => updaters.addKanbanRoleState(prev, r)),
      updateKanbanRoleStatus: (id, s) => setCvData(prev => updaters.updateKanbanRoleStatusState(prev, id, s)),
      updateKanbanRole: (id, u) => setCvData(prev => updaters.updateKanbanRoleState(prev, id, u)),
      deleteKanbanRole: (id) => setCvData(prev => updaters.deleteKanbanRoleState(prev, id)),
      exportDataJSON,
      importDataJSON,
      resetToDefaultData,
      isIngestionModalOpen,
      setIsIngestionModalOpen,
      openIngestionModal,
      applyIngestionResult
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
