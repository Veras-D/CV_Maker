import { CVData, WorkExperience, ProjectItem, SkillCategory, EducationItem, LanguageItem } from '../types/cv';
import { fetchWebsiteHtml } from './htmlFetchHelper';
import { extractTextFromPDF } from './pdfParser';

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
    .slice(0, 5)
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
      skills: Array.from(detected).slice(0, 12).map((s, idx) => ({
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
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const pageTitle = doc.querySelector('title')?.innerText || '';
  const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const h1Text = doc.querySelector('h1')?.innerText?.trim() || '';

  const paragraphs = Array.from(doc.querySelectorAll('p'))
    .map(p => p.innerText.trim())
    .filter(text => text.length > 30)
    .slice(0, 5)
    .join(' ');

  const detectedName = h1Text.length > 0 && h1Text.length < 35 ? h1Text : pageTitle.split(/[-|]/)[0].trim();
  const detectedBio = metaDesc || paragraphs.slice(0, 300);

  return {
    sourceType: 'website',
    detectedName: detectedName || undefined,
    detectedBio: detectedBio || undefined,
    detectedPortfolioUrl: normalizedUrl,
    experiences: [],
    projects: [],
    skillCategories: [],
    education: [],
    languages: []
  };
}

/**
 * Ingest public profile info from a LinkedIn profile URL or handle
 */
export async function ingestFromLinkedin(inputUrlOrHandle: string): Promise<IngestionResult> {
  const clean = inputUrlOrHandle.trim().replace(/^@/, '');
  const normalizedUrl = clean.startsWith('http')
    ? clean
    : `https://www.linkedin.com/in/${clean.replace(/^in\//, '')}`;

  const html = await fetchWebsiteHtml(normalizedUrl);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const pageTitle = doc.querySelector('title')?.innerText || '';
  const metaTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
  const metaDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';

  const titleToParse = metaTitle || pageTitle;
  const detectedName = titleToParse.replace(/\s*[-–|].*$/, '').trim();
  const detectedBio = metaDesc.replace(/\s*[-–|].*$/, '').trim();

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

function extractContactMatches(rawText: string) {
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = rawText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const ghMatch = rawText.match(/https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+/);
  const liMatch = rawText.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/);

  return {
    detectedEmail: emailMatch ? emailMatch[0] : '',
    detectedPhone: phoneMatch ? phoneMatch[0] : '',
    detectedGithubUrl: ghMatch ? ghMatch[0] : '',
    detectedLinkedinUrl: liMatch ? liMatch[0] : ''
  };
}

function extractSkillsFromText(rawText: string): SkillCategory[] {
  const detectedSkills = new Set<string>();
  const skillKeywords = [
    'react', 'typescript', 'javascript', 'node.js', 'python', 'rust', 'docker', 
    'kubernetes', 'aws', 'sql', 'postgresql', 'mongodb', 'html', 'css', 'tailwind', 
    'graphql', 'git', 'next.js', 'vue', 'angular', 'c++', 'java', 'linux', 'ci/cd', 'redux'
  ];
  const textLower = rawText.toLowerCase();

  skillKeywords.forEach(kw => {
    const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(textLower)) {
      detectedSkills.add(kw.charAt(0).toUpperCase() + kw.slice(1));
    }
  });

  if (detectedSkills.size === 0) return [];
  return [
    {
      id: `cat-extracted-${Date.now()}`,
      categoryName: { en: 'Extracted Skills' },
      skills: Array.from(detectedSkills).map((s, idx) => ({
        id: `skill-ext-${idx}`,
        name: s,
        tags: ['fullstack'],
        enabled: true
      }))
    }
  ];
}

/**
 * Parse raw resume text into structured CVData sections
 */
export function parseRawResumeText(rawText: string): IngestionResult {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const contacts = extractContactMatches(rawText);

  // Filter out any non-human header lines (e.g. PDF headers, URLs, emails)
  const candidateNameLines = lines.filter(l => 
    !l.startsWith('%') && 
    !l.startsWith('/') && 
    !l.startsWith('http') && 
    !l.includes('@') &&
    !/\b(?:obj|endobj|stream|endstream|xref|trailer|page|resume|cv)\b/i.test(l) &&
    l.length >= 2 &&
    l.length <= 40
  );

  const detectedName = candidateNameLines.length > 0 ? candidateNameLines[0] : '';

  return {
    sourceType: 'text',
    detectedName: detectedName || undefined,
    detectedEmail: contacts.detectedEmail || undefined,
    detectedPhone: contacts.detectedPhone || undefined,
    detectedGithubUrl: contacts.detectedGithubUrl || undefined,
    detectedLinkedinUrl: contacts.detectedLinkedinUrl || undefined,
    experiences: [],
    projects: [],
    skillCategories: extractSkillsFromText(rawText),
    education: [],
    languages: []
  };
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
  const result = parseRawResumeText(rawText);
  return { ...result, sourceType: 'file' };
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
    projects: result.projects.length > 0 ? [...current.projects, ...result.projects] : current.projects,
    skillCategories: result.skillCategories.length > 0 
      ? (current.skillCategories.length === 0 ? result.skillCategories : [...current.skillCategories, ...result.skillCategories])
      : current.skillCategories
  };
}
