export type LanguageCode = 'en' | 'cs';

export interface LocalizedText {
  en: string;
  cs: string;
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
  endDate: string; // e.g. "Present" or "Jul 2024"
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

export interface RolePreset {
  id: string;
  name: string;
  description?: string;
  activeTags: string[];
  activeLanguage: LanguageCode;
  activeLayout: 'modern' | 'minimal' | 'classic';
  accentColor: string;
  metadata: PDFMetadata;
}

export type KanbanStatus = 'wishlist' | 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';

export interface KanbanRole {
  id: string;
  roleTitle: string;
  company: string;
  location: string;
  salary?: string;
  status: KanbanStatus;
  dateApplied: string;
  roleUrl?: string;
  presetId?: string; // Linked CV preset version
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
  language: LanguageCode;
  content: LocalizedText;
  presetId?: string;
}

export interface AiConfig {
  provider: 'ollama' | 'local' | 'heuristic';
  endpoint: string; // e.g. http://localhost:11434
  modelName: string; // e.g. llama3.2, mistral, phi3
}

export interface IngestionSources {
  githubUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
  cvPdfName?: string;
  customLinks: string[];
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
