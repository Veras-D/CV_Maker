import { CVData, WorkExperience, ProjectItem, SkillCategory, EducationItem, LanguageItem } from '../types/cv';
import { fetchWebsiteHtml } from './htmlFetchHelper';
import { extractTextFromPDF } from './pdfParser';
import { scrapePortfolioFromHTML } from './websiteScraper';
import { parseFullResumeContent } from './resumeSectionParser';
import { fetchUserGitHubRepos, convertSelectedReposToIngestion } from './githubScraper';

export { 
  fetchUserGitHubRepos, 
  convertSelectedReposToIngestion 
} from './githubScraper';
export type { GitHubUserRepo, GitHubUserProfile } from './githubScraper';

export interface IngestionResult {
  sourceType: 'github' | 'linkedin' | 'website' | 'text' | 'file';
  detectedName?: string;
  detectedHeadline?: string;
  detectedBio?: string;
  detectedEmail?: string;
  detectedPhone?: string;
  detectedLocation?: string;
  detectedPortfolioUrl?: string;
  detectedGithubUrl?: string;
  detectedLinkedinUrl?: string;
  experiences: WorkExperience[];
  projects: ProjectItem[];
  skillCategories: SkillCategory[];
  education: EducationItem[];
  languages: LanguageItem[];
}

/**
 * Fetch and parse a public GitHub profile and user repositories
 */
export async function ingestFromGitHub(inputUrlOrUsername: string): Promise<IngestionResult> {
  const { profile, repos } = await fetchUserGitHubRepos(inputUrlOrUsername);
  return convertSelectedReposToIngestion(profile, repos.slice(0, 10));
}

/**
 * Fetch and extract metadata, text, and project links from a portfolio or website URL
 */
export async function ingestFromWebsite(url: string): Promise<IngestionResult> {
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
  const html = await fetchWebsiteHtml(normalizedUrl);
  return scrapePortfolioFromHTML(html, normalizedUrl);
}



/**
 * Parse raw resume text into structured CVData sections
 */
export function parseRawResumeText(rawText: string): IngestionResult {
  return parseFullResumeContent(rawText, 'text');
}

function parseJsonCVFile(parsed: Partial<CVData>): IngestionResult {
  const profile = parsed.profile;
  return {
    sourceType: 'file',
    detectedName: profile?.name,
    detectedBio: profile?.summary?.en || profile?.summary?.cs,
    detectedEmail: profile?.email,
    detectedPhone: profile?.phone,
    detectedLocation: profile?.location,
    detectedGithubUrl: profile?.githubUrl,
    detectedLinkedinUrl: profile?.linkedinUrl,
    detectedPortfolioUrl: profile?.portfolioUrl,
    experiences: parsed.experiences || [],
    projects: parsed.projects || [],
    skillCategories: parsed.skillCategories || [],
    education: parsed.education || [],
    languages: parsed.languages || []
  };
}

const ALLOWED_EXTENSIONS = ['pdf', 'txt', 'md', 'json'];

/**
 * Ingest CV data from an uploaded file (.pdf, .txt, .md, .json)
 */
export async function ingestFromFile(file: File): Promise<IngestionResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`Unsupported file type ".${ext || 'unknown'}". Please upload a .pdf, .txt, .md, or .json file.`);
  }

  if (ext === 'json') {
    const text = await file.text();
    return parseJsonCVFile(JSON.parse(text));
  }

  const rawText = ext === 'pdf' ? await extractTextFromPDF(file) : await file.text();
  return parseFullResumeContent(rawText, 'file');
}

function mergeProfileFields(profile: CVData['profile'], result: IngestionResult): CVData['profile'] {
  return {
    ...profile,
    name: result.detectedName || profile.name,
    headline: result.detectedHeadline ? { ...profile.headline, en: result.detectedHeadline } : profile.headline,
    summary: result.detectedBio ? { ...profile.summary, en: result.detectedBio } : profile.summary,
    email: result.detectedEmail || profile.email,
    phone: result.detectedPhone || profile.phone,
    location: result.detectedLocation || profile.location,
    githubUrl: result.detectedGithubUrl || profile.githubUrl,
    linkedinUrl: result.detectedLinkedinUrl || profile.linkedinUrl,
    portfolioUrl: result.detectedPortfolioUrl || profile.portfolioUrl
  };
}

function selectSectionList<T>(currentList: T[], incomingList: T[], isFullResume: boolean): T[] {
  if (incomingList.length === 0) return currentList;
  return isFullResume ? incomingList : [...incomingList, ...currentList];
}

function collectExistingSkillNames(categories: SkillCategory[]): Set<string> {
  const seen = new Set<string>();
  categories.forEach(cat => {
    cat.skills.forEach(s => seen.add(s.name.toLowerCase().trim()));
  });
  return seen;
}

function mergeSkillsList(currentSkills: SkillCategory[], incomingSkills: SkillCategory[], isFullResume: boolean): SkillCategory[] {
  if (incomingSkills.length === 0) return currentSkills;
  if (isFullResume || currentSkills.length === 0) return incomingSkills;

  const seenSkillNames = collectExistingSkillNames(currentSkills);
  const updatedCategories = currentSkills.map(cat => ({
    ...cat,
    skills: [...cat.skills]
  }));
  const primaryCategory = updatedCategories[0];

  incomingSkills.forEach(cat => {
    cat.skills.forEach(skill => {
      const lower = skill.name.toLowerCase().trim();
      if (!seenSkillNames.has(lower) && primaryCategory) {
        seenSkillNames.add(lower);
        primaryCategory.skills.push({
          id: `skill-${Date.now()}-${primaryCategory.skills.length}`,
          name: skill.name,
          tags: ['fullstack'],
          enabled: true
        });
      }
    });
  });

  return updatedCategories;
}

/**
 * Merge an IngestionResult into the active CVData state
 */
export function mergeIngestionIntoCVData(current: CVData, result: IngestionResult): CVData {
  const isFull = result.sourceType === 'file' || result.sourceType === 'text';

  return {
    ...current,
    profile: mergeProfileFields(current.profile, result),
    experiences: selectSectionList(current.experiences, result.experiences, isFull),
    education: selectSectionList(current.education, result.education, isFull),
    languages: selectSectionList(current.languages, result.languages, isFull),
    projects: isFull && result.projects.length > 0 ? result.projects : [...current.projects, ...result.projects],
    skillCategories: mergeSkillsList(current.skillCategories, result.skillCategories, isFull)
  };
}
