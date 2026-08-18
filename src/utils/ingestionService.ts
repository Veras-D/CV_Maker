import { CVData, WorkExperience, ProjectItem, SkillCategory, EducationItem, LanguageItem } from '../types/cv';

export interface IngestionResult {
  sourceType: 'github' | 'website' | 'text' | 'file';
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

  // 1. Fetch user profile
  const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
  if (!userRes.ok) {
    throw new Error(`GitHub user "${username}" not found (${userRes.status}).`);
  }
  const userData = await userRes.json();

  // 2. Fetch top repositories
  const reposRes = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=10`
  );
  const reposData = reposRes.ok ? await reposRes.json() : [];

  const projects: ProjectItem[] = Array.isArray(reposData)
    ? reposData
        .filter((r: { fork?: boolean }) => !r.fork)
        .slice(0, 5)
        .map((r: { id: number; name: string; description: string; language: string; topics?: string[]; html_url: string }) => ({
          id: `gh-${r.id}`,
          title: r.name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          description: {
            en: r.description || `Open-source ${r.language || 'software'} project developed on GitHub.`
          },
          techStack: [r.language, ...(r.topics || [])].filter(Boolean) as string[],
          url: r.html_url,
          tags: ['fullstack'],
          enabled: true
        }))
    : [];

  // Extract unique languages & technologies
  const detectedSkills = new Set<string>();
  if (Array.isArray(reposData)) {
    reposData.forEach((r: { language?: string; topics?: string[] }) => {
      if (r.language) detectedSkills.add(r.language);
      if (Array.isArray(r.topics)) r.topics.forEach(t => detectedSkills.add(t));
    });
  }

  const skillCategories: SkillCategory[] = detectedSkills.size > 0 ? [
    {
      id: `cat-github-${Date.now()}`,
      categoryName: { en: 'Technologies & Frameworks' },
      skills: Array.from(detectedSkills).slice(0, 12).map((s, idx) => ({
        id: `skill-gh-${idx}`,
        name: s.charAt(0).toUpperCase() + s.slice(1),
        tags: ['fullstack'],
        enabled: true
      }))
    }
  ] : [];

  return {
    sourceType: 'github',
    detectedName: userData.name || userData.login,
    detectedBio: userData.bio || '',
    detectedEmail: userData.email || '',
    detectedLocation: userData.location || '',
    detectedPortfolioUrl: userData.blog ? (userData.blog.startsWith('http') ? userData.blog : `https://${userData.blog}`) : '',
    detectedGithubUrl: userData.html_url || `https://github.com/${username}`,
    experiences: [],
    projects,
    skillCategories,
    education: [],
    languages: []
  };
}

/**
 * Fetch and extract metadata, text, and project links from a portfolio or website URL
 */
export async function ingestFromWebsite(url: string): Promise<IngestionResult> {
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
  
  const res = await fetch(normalizedUrl);
  if (!res.ok) {
    throw new Error(`Unable to fetch website (${res.status}).`);
  }

  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Extract title and meta description
  const pageTitle = doc.querySelector('title')?.innerText || '';
  const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  
  // Extract main headings
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
 * Parse raw resume text into structured CVData sections
 */
export function parseRawResumeText(rawText: string): IngestionResult {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  let detectedEmail = '';
  let detectedPhone = '';
  let detectedName = '';
  let detectedLocation = '';
  let detectedGithubUrl = '';
  let detectedLinkedinUrl = '';

  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) detectedEmail = emailMatch[0];

  const phoneMatch = rawText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) detectedPhone = phoneMatch[0];

  const ghMatch = rawText.match(/https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+/);
  if (ghMatch) detectedGithubUrl = ghMatch[0];

  const liMatch = rawText.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/);
  if (liMatch) detectedLinkedinUrl = liMatch[0];

  // First non-empty short line is usually the candidate's name
  if (lines.length > 0 && lines[0].length < 40 && !lines[0].includes('@')) {
    detectedName = lines[0];
  }

  // Detect skills (comma separated lists)
  const detectedSkills: string[] = [];
  const skillKeywords = ['react', 'typescript', 'javascript', 'node.js', 'python', 'docker', 'aws', 'sql', 'html', 'css', 'tailwind', 'graphql', 'git'];
  const textLower = rawText.toLowerCase();

  skillKeywords.forEach(kw => {
    if (textLower.includes(kw)) {
      detectedSkills.push(kw.charAt(0).toUpperCase() + kw.slice(1));
    }
  });

  const skillCategories: SkillCategory[] = detectedSkills.length > 0 ? [
    {
      id: `cat-extracted-${Date.now()}`,
      categoryName: { en: 'Extracted Skills' },
      skills: detectedSkills.map((s, idx) => ({
        id: `skill-ext-${idx}`,
        name: s,
        tags: ['fullstack'],
        enabled: true
      }))
    }
  ] : [];

  return {
    sourceType: 'text',
    detectedName: detectedName || undefined,
    detectedEmail: detectedEmail || undefined,
    detectedPhone: detectedPhone || undefined,
    detectedLocation: detectedLocation || undefined,
    detectedGithubUrl: detectedGithubUrl || undefined,
    detectedLinkedinUrl: detectedLinkedinUrl || undefined,
    experiences: [],
    projects: [],
    skillCategories,
    education: [],
    languages: []
  };
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
