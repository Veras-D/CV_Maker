import { ProjectItem, SkillCategory } from '../types/cv';
import { IngestionResult } from './ingestionService';

export interface GitHubUserRepo {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  topics?: string[];
  html_url: string;
  stargazers_count?: number;
  fork?: boolean;
}

export interface GitHubUserProfile {
  login: string;
  name?: string | null;
  bio?: string | null;
  email?: string | null;
  location?: string | null;
  blog?: string | null;
  html_url: string;
}

export function extractGitHubUsername(input: string): string {
  return input
    .trim()
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\/$/, '')
    .split('/')[0];
}

/**
 * Fetch a GitHub user's profile and all their public repositories
 */
export async function fetchUserGitHubRepos(usernameOrUrl: string): Promise<{
  profile: GitHubUserProfile;
  repos: GitHubUserRepo[];
}> {
  const username = extractGitHubUsername(usernameOrUrl);
  if (!username) {
    throw new Error('Please enter a valid GitHub profile URL or username.');
  }

  const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
  if (!userRes.ok) {
    throw new Error(`GitHub user "${username}" not found (${userRes.status}).`);
  }
  const profile: GitHubUserProfile = await userRes.json();

  const reposRes = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`
  );
  if (!reposRes.ok) {
    throw new Error(`Failed to load repositories for "${username}" (${reposRes.status}).`);
  }
  const allRepos: GitHubUserRepo[] = await reposRes.json();

  // Return non-fork repositories first, but allow all
  const sorted = Array.isArray(allRepos)
    ? allRepos.sort((a, b) => (a.fork === b.fork ? 0 : a.fork ? 1 : -1))
    : [];

  return { profile, repos: sorted };
}

function buildProjectFromRepo(repo: GitHubUserRepo): ProjectItem {
  const title = repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const techStack = [repo.language, ...(repo.topics || [])].filter(Boolean) as string[];

  return {
    id: `gh-${repo.id}`,
    title,
    description: {
      en: repo.description || `Open-source ${repo.language || 'software'} project developed on GitHub.`
    },
    techStack,
    url: repo.html_url,
    tags: ['fullstack'],
    enabled: true
  };
}

function extractSkillCategoriesFromRepos(selectedRepos: GitHubUserRepo[]): SkillCategory[] {
  const allSkills = new Set<string>();
  selectedRepos.forEach(repo => {
    if (repo.language) allSkills.add(repo.language);
    if (Array.isArray(repo.topics)) {
      repo.topics.forEach(t => allSkills.add(t));
    }
  });

  if (allSkills.size === 0) return [];
  return [{
    id: `cat-gh-${Date.now()}`,
    categoryName: { en: 'Technologies & Frameworks' },
    skills: Array.from(allSkills).slice(0, 14).map((s, idx) => ({
      id: `skill-gh-${idx}`,
      name: s.charAt(0).toUpperCase() + s.slice(1),
      tags: ['fullstack'],
      enabled: true
    }))
  }];
}

/**
 * Convert user-selected repositories and profile data into an IngestionResult
 */
export function convertSelectedReposToIngestion(
  profile: GitHubUserProfile,
  selectedRepos: GitHubUserRepo[]
): IngestionResult {
  const projects = selectedRepos.map(buildProjectFromRepo);
  const skillCategories = extractSkillCategoriesFromRepos(selectedRepos);
  const normalizedBlog = profile.blog
    ? (profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`)
    : undefined;

  return {
    sourceType: 'github',
    detectedName: profile.name || profile.login,
    detectedBio: profile.bio || undefined,
    detectedEmail: profile.email || undefined,
    detectedLocation: profile.location || undefined,
    detectedPortfolioUrl: normalizedBlog,
    detectedGithubUrl: profile.html_url || `https://github.com/${profile.login}`,
    experiences: [],
    projects,
    skillCategories,
    education: [],
    languages: []
  };
}
