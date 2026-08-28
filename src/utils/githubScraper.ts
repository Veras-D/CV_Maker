import { ProjectItem, SkillCategory } from '../types/cv';
import { IngestionResult } from './ingestionService';

interface GitHubRepoResponse {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  topics?: string[];
  html_url: string;
  owner?: {
    login: string;
    html_url: string;
  };
}

function parseRepoSlug(input: string): { owner: string; repo: string } | null {
  const clean = input
    .trim()
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\/$/, '');
  
  const parts = clean.split('/');
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return { owner: parts[0], repo: parts[1] };
  }
  return null;
}

async function fetchSingleRepo(repoInput: string): Promise<{ project: ProjectItem; repo: GitHubRepoResponse }> {
  const parsed = parseRepoSlug(repoInput);
  if (!parsed) {
    throw new Error(`Invalid GitHub repository format: "${repoInput}". Please use "owner/repo" or "https://github.com/owner/repo".`);
  }

  const res = await fetch(`https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`);
  if (!res.ok) {
    throw new Error(`GitHub repository "${parsed.owner}/${parsed.repo}" not found or private (${res.status}).`);
  }

  const data: GitHubRepoResponse = await res.json();
  const title = data.name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const techStack = [data.language, ...(data.topics || [])].filter(Boolean) as string[];

  const project: ProjectItem = {
    id: `gh-${data.id}`,
    title,
    description: {
      en: data.description || `Open-source ${data.language || 'software'} project developed on GitHub.`
    },
    techStack,
    url: data.html_url,
    tags: ['fullstack'],
    enabled: true
  };

  return { project, repo: data };
}

/**
 * Fetch specific individual GitHub project repositories and extract metadata & skills
 */
export async function ingestFromGitHubRepos(repoInputs: string[]): Promise<IngestionResult> {
  const validInputs = repoInputs.map(r => r.trim()).filter(Boolean);
  if (validInputs.length === 0) {
    throw new Error('Please add at least one GitHub project repository URL or slug (e.g. owner/repo).');
  }

  const projects: ProjectItem[] = [];
  const allSkills = new Set<string>();
  let primaryGithubUrl: string | undefined;

  for (const input of validInputs) {
    const { project, repo } = await fetchSingleRepo(input);
    projects.push(project);
    project.techStack.forEach(t => allSkills.add(t));
    if (!primaryGithubUrl && repo.owner?.html_url) {
      primaryGithubUrl = repo.owner.html_url;
    }
  }

  const skillCategories: SkillCategory[] = allSkills.size > 0 ? [{
    id: `cat-gh-${Date.now()}`,
    categoryName: { en: 'Technologies & Frameworks' },
    skills: Array.from(allSkills).slice(0, 14).map((s, idx) => ({
      id: `skill-gh-${idx}`,
      name: s.charAt(0).toUpperCase() + s.slice(1),
      tags: ['fullstack'],
      enabled: true
    }))
  }] : [];

  return {
    sourceType: 'github',
    detectedGithubUrl: primaryGithubUrl,
    experiences: [],
    projects,
    skillCategories,
    education: [],
    languages: []
  };
}
