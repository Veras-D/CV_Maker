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
 * Ingest public profile info from a LinkedIn profile URL or handle
 */
export async function ingestFromLinkedin(inputUrlOrHandle: string): Promise<IngestionResult> {
  const clean = inputUrlOrHandle.trim().replace(/^@/, '');
  if (!clean) {
    throw new Error('Please enter a LinkedIn profile URL or username.');
  }

  const handle = clean
    .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '')
    .replace(/\/$/, '');

  const normalizedUrl = `https://www.linkedin.com/in/${handle}`;

  let detectedName: string | undefined;
  let detectedBio: string | undefined;

  try {
    const html = await fetchWebsiteHtml(normalizedUrl);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const metaTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const metaDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    const pageTitle = doc.querySelector('title')?.textContent || '';

    const titleToParse = metaTitle || pageTitle;
    detectedName = titleToParse ? titleToParse.replace(/\s*[-–|].*$/, '').trim() : undefined;
    detectedBio = metaDesc ? metaDesc.replace(/\s*[-–|].*$/, '').trim() : undefined;
  } catch {
    detectedName = handle
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  return {
    sourceType: 'linkedin',
    detectedName: detectedName || undefined,
    detectedBio: detectedBio || undefined,
    detectedLinkedinUrl: normalizedUrl,
    experiences: [],
    projects: [],
    skillCategories: [],
    education: [],
    languages: []
  };
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

/**
 * Merge an IngestionResult into the active CVData state
 */
export function mergeIngestionIntoCVData(current: CVData, result: IngestionResult): CVData {
  const isFullResume = result.sourceType === 'file' || result.sourceType === 'text';

  return {
    ...current,
    profile: mergeProfileFields(current.profile, result),
    experiences: result.experiences.length > 0 
      ? (isFullResume ? result.experiences : [...result.experiences, ...current.experiences])
      : current.experiences,
    education: result.education.length > 0 
      ? (isFullResume ? result.education : [...result.education, ...current.education])
      : current.education,
    languages: result.languages.length > 0 
      ? (isFullResume ? result.languages : [...result.languages, ...current.languages])
      : current.languages,
    projects: result.projects.length > 0 
      ? (isFullResume ? result.projects : [...current.projects, ...result.projects])
      : current.projects,
    skillCategories: result.skillCategories.length > 0 
      ? (isFullResume || current.skillCategories.length === 0 ? result.skillCategories : [...current.skillCategories, ...result.skillCategories])
      : current.skillCategories
  };
}
