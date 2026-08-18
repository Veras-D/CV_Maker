export type LanguageCode = string;

export interface LocalizedText {
  [lang: string]: string;
}

export interface WorkBullet {
  id: string;
  text: LocalizedText;
  tags: string[];
  enabled: boolean;
}

export interface WorkExperience {
  id: string;
  roleTitle: LocalizedText;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  summary?: LocalizedText;
  bullets: WorkBullet[];
  tags: string[];
  enabled: boolean;
}

export interface SkillItem {
  id: string;
  name: string;
  tags: string[];
  enabled: boolean;
}

export interface SkillCategory {
  id: string;
  categoryName: LocalizedText;
  skills: SkillItem[];
}

export interface ProjectItem {
  id: string;
  title: string;
  description: LocalizedText;
  url?: string;
  techStack: string[];
  tags: string[];
  enabled: boolean;
}

export interface EducationItem {
  id: string;
  institution: string;
  program: LocalizedText;
  dates: string;
  technologies?: string[];
  enabled: boolean;
}

export interface LanguageItem {
  id: string;
  language: LocalizedText;
  proficiency: LocalizedText;
  enabled: boolean;
}

export interface PDFMetadata {
  dc_title: string;
  dc_creator: string;
  cp_keywords: string;
  cp_description: string;
  cp_category: string;
}

export interface UserProfile {
  name: string;
  headline: LocalizedText;
  summary: LocalizedText;
  email: string;
  phone: string;
  location: string;
  portfolioUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  whatsappUrl?: string;
}

export type KanbanStatus = 
  | 'applied' 
  | 'hr_call' 
  | 'tech_interview' 
  | 'manager_interview' 
  | 'hired' 
  | 'archived';

export interface KanbanRole {
  id: string;
  roleTitle: string;
  company: string;
  location: string;
  salary?: string;
  status: KanbanStatus;
  dateApplied: string;
  roleUrl?: string;
  presetId?: string;
  coverLetterId?: string;
  notes?: string;
  updatedAt: string;
}

export interface CoverLetter {
  id: string;
  jobTitle: string;
  companyName: string;
  date: string;
  recipientName?: string;
  language: string;
  content: LocalizedText;
}

export interface AiConfig {
  provider: 'ollama' | 'local' | 'heuristic';
  endpoint: string;
  modelName: string;
}

export interface IngestionSources {
  githubUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
  cvPdfName?: string;
}

export interface RolePreset {
  id: string;
  name: string;
  description?: string;
  activeTags: string[];
  activeLanguage: string;
  activeLayout: 'classic' | 'modern' | 'minimal';
  metadata: PDFMetadata;
}

export interface CVData {
  profile: UserProfile;
  experiences: WorkExperience[];
  skillCategories: SkillCategory[];
  projects: ProjectItem[];
  education: EducationItem[];
  languages: LanguageItem[];
  presets: RolePreset[];
  activePresetId: string;
  kanbanRoles: KanbanRole[];
  coverLetters: CoverLetter[];
  aiConfig: AiConfig;
  ingestionSources: IngestionSources;
}

export const createEmptyCVData = (): CVData => ({
  profile: {
    name: '',
    headline: { en: '' },
    summary: { en: '' },
    email: '',
    phone: '',
    location: '',
    portfolioUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    whatsappUrl: ''
  },
  ingestionSources: {
    githubUrl: '',
    linkedinUrl: '',
    websiteUrl: '',
    cvPdfName: ''
  },
  aiConfig: {
    provider: 'ollama',
    endpoint: 'http://localhost:11434',
    modelName: 'llama3.2'
  },
  presets: [
    {
      id: 'preset-default',
      name: 'Default ATS Resume',
      description: 'Primary ATS-optimized layout.',
      activeTags: [],
      activeLanguage: 'en',
      activeLayout: 'classic',
      metadata: {
        dc_title: 'Resume',
        dc_creator: '',
        cp_keywords: '',
        cp_description: '',
        cp_category: 'Resume'
      }
    }
  ],
  activePresetId: 'preset-default',
  experiences: [],
  skillCategories: [],
  projects: [],
  education: [],
  languages: [],
  coverLetters: [],
  kanbanRoles: []
});
