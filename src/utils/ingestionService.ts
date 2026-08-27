import { CVData, WorkExperience, ProjectItem, SkillCategory, EducationItem, LanguageItem } from '../types/cv';
import { fetchWebsiteHtml } from './htmlFetchHelper';
import { extractTextFromPDF } from './pdfParser';
import { scrapePortfolioFromHTML } from './websiteScraper';
import { parseFullResumeContent } from './resumeSectionParser';

export interface IngestionResult {
  sourceType: 'github' | 'linkedin' | 'website' | 'text' | 'file';
  detectedName?: string;
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

interface RawGitHubRepo {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  topics?: string[];
  html_url: string;
  fork?: boolean;
}

function extractProjectsFromRepos(reposData: RawGitHubRepo[]): ProjectItem[] {
  if (!Array.isArray(reposData)) return [];
  return reposData
    .filter(r => !r.fork)
    .slice(0, 6)
    .map(r => ({
      id: `gh-${r.id}`,
      title: r.name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      description: {
        en: r.description || `Open-source ${r.language || 'software'} project developed on GitHub.`
      },
      techStack: [r.language, ...(r.topics || [])].filter(Boolean) as string[],
      url: r.html_url,
      tags: ['fullstack'],
      enabled: true
    }));
}

function extractSkillsFromRepos(reposData: RawGitHubRepo[]): SkillCategory[] {
  if (!Array.isArray(reposData)) return [];
  const detected = new Set<string>();
  reposData.forEach(r => {
    if (r.language) detected.add(r.language);
    if (Array.isArray(r.topics)) {
      r.topics.forEach(t => detected.add(t));
    }
  });

  if (detected.size === 0) return [];
  return [
    {
      id: `cat-github-${Date.now()}`,
      categoryName: { en: 'Technologies & Frameworks' },
      skills: Array.from(detected).slice(0, 14).map((s, idx) => ({
        id: `skill-gh-${idx}`,
        name: s.charAt(0).toUpperCase() + s.slice(1),
        tags: ['fullstack'],
        enabled: true
      }))
    }
  ];
}

/**
 * Fetch and parse a public GitHub profile and user repositories
 */
export async function ingestFromGitHub(inputUrlOrUsername: string): Promise<IngestionResult> {
  const username = inputUrlOrUsername
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\/$/, '')
    .trim();

  if (!username) {
    throw new Error('Please provide a valid GitHub username or URL.');
  }

  const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
  if (!userRes.ok) {
    throw new Error(`GitHub user "${username}" not found (${userRes.status}).`);
  }
  const userData = await userRes.json();

  const reposRes = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=10`
  );
  const reposData: RawGitHubRepo[] = reposRes.ok ? await reposRes.json() : [];

  return {
    sourceType: 'github',
    detectedName: userData.name || userData.login,
    detectedBio: userData.bio || '',
    detectedEmail: userData.email || '',
    detectedLocation: userData.location || '',
    detectedPortfolioUrl: userData.blog ? (userData.blog.startsWith('http') ? userData.blog : `https://${userData.blog}`) : '',
    detectedGithubUrl: userData.html_url || `https://github.com/${username}`,
    experiences: [],
    projects: extractProjectsFromRepos(reposData),
    skillCategories: extractSkillsFromRepos(reposData),
    education: [],
    languages: []
  };
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

/**
 * Merge an IngestionResult into the active CVData state
 */
export function mergeIngestionIntoCVData(current: CVData, result: IngestionResult): CVData {
  return {
    ...current,
    profile: {
      ...current.profile,
      name: result.detectedName || current.profile.name,
      summary: result.detectedBio ? { ...current.profile.summary, en: result.detectedBio } : current.profile.summary,
      email: result.detectedEmail || current.profile.email,
      phone: result.detectedPhone || current.profile.phone,
      location: result.detectedLocation || current.profile.location,
      githubUrl: result.detectedGithubUrl || current.profile.githubUrl,
      linkedinUrl: result.detectedLinkedinUrl || current.profile.linkedinUrl,
      portfolioUrl: result.detectedPortfolioUrl || current.profile.portfolioUrl
    },
    experiences: result.experiences.length > 0 ? [...result.experiences, ...current.experiences] : current.experiences,
    education: result.education.length > 0 ? [...result.education, ...current.education] : current.education,
    languages: result.languages.length > 0 ? [...result.languages, ...current.languages] : current.languages,
    projects: result.projects.length > 0 ? [...current.projects, ...result.projects] : current.projects,
    skillCategories: result.skillCategories.length > 0 
      ? (current.skillCategories.length === 0 ? result.skillCategories : [...current.skillCategories, ...result.skillCategories])
      : current.skillCategories
  };
}
