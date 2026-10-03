import { RemoteJob } from '../types/jobSearch';

export type SuggestionType = 'role' | 'company' | 'tech';

export interface JobSearchSuggestion {
  id: string;
  label: string;
  type: SuggestionType;
  count: number;
}

export const TECH_TAXONOMY: readonly string[] = [
  'React',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Python',
  'Go',
  'Golang',
  'Rust',
  'Kubernetes',
  'Docker',
  'AWS',
  'GCP',
  'Azure',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'GraphQL',
  'Next.js',
  'Vue.js',
  'Angular',
  'Java',
  'C++',
  'C#',
  '.NET',
  'Ruby',
  'Ruby on Rails',
  'Elixir',
  'Kafka',
  'Redis',
  'Terraform',
  'Tailwind CSS',
  'Swift',
  'Kotlin',
  'Flutter',
  'PyTorch',
  'TensorFlow',
  'SQL',
  'Linux',
  'CI/CD'
];

export const FALLBACK_ROLES: readonly string[] = [
  'Software Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Full-Stack Developer',
  'DevOps Engineer',
  'Site Reliability Engineer',
  'Data Engineer',
  'Machine Learning Engineer',
  'QA Automation Engineer',
  'Security Engineer',
  'Product Manager'
];

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildTechRegex(tech: string): RegExp {
  const escaped = escapeRegExp(tech);
  const trailingBoundary = /\w$/.test(tech) ? '\\b' : '';
  const leadingBoundary = /^\w/.test(tech) ? '\\b' : '';
  return new RegExp(`${leadingBoundary}${escaped}${trailingBoundary}`, 'i');
}

export function countTechInJobs(tech: string, jobs: RemoteJob[]): number {
  if (jobs.length === 0) return 0;
  const regex = buildTechRegex(tech);
  let count = 0;
  for (const job of jobs) {
    const haystack = `${job.title} ${job.department || ''} ${job.descriptionPlain.slice(0, 1500)}`;
    if (regex.test(haystack)) {
      count++;
    }
  }
  return count;
}

export function cleanJobTitle(title: string): string {
  const cleaned = title
    .replace(/\s*[([]\s*(remote|hybrid|us|eu|emea|latam|apac|americas|worldwide|anywhere|global|wfh)[^)\]]*[)\]]/gi, '')
    .replace(/\s*-\s*(remote|hybrid|worldwide|anywhere|global|wfh)\s*$/gi, '')
    .trim();
  return cleaned || title;
}

function matchesQuery(text: string, q: string): boolean {
  const lower = text.toLowerCase();
  return q.length === 1 ? lower.startsWith(q) : lower.includes(q);
}

function getMatchingRoles(query: string, jobs: RemoteJob[]): JobSearchSuggestion[] {
  const q = query.trim().toLowerCase();
  const titleCounts = new Map<string, number>();

  for (const job of jobs) {
    const cleaned = cleanJobTitle(job.title);
    if (!cleaned) continue;
    titleCounts.set(cleaned, (titleCounts.get(cleaned) || 0) + 1);
  }

  const matches: Array<{ label: string; count: number; startsWith: boolean }> = [];

  for (const [title, count] of titleCounts.entries()) {
    if (matchesQuery(title, q) && title.toLowerCase() !== q) {
      matches.push({ label: title, count, startsWith: title.toLowerCase().startsWith(q) });
    }
  }

  if (matches.length === 0) {
    for (const role of FALLBACK_ROLES) {
      if (matchesQuery(role, q) && role.toLowerCase() !== q) {
        matches.push({ label: role, count: 0, startsWith: role.toLowerCase().startsWith(q) });
      }
    }
  }

  matches.sort((a, b) => {
    if (a.startsWith !== b.startsWith) return a.startsWith ? -1 : 1;
    if (b.count !== a.count) return b.count - a.count;
    return a.label.length - b.label.length;
  });

  return matches.slice(0, 3).map(m => ({
    id: `role-${m.label}`,
    label: m.label,
    type: 'role',
    count: m.count
  }));
}

function toTopSuggestions(
  matches: Array<{ label: string; count: number; startsWith: boolean }>,
  type: SuggestionType,
  limit = 3
): JobSearchSuggestion[] {
  matches.sort((a, b) => {
    if (a.startsWith !== b.startsWith) return a.startsWith ? -1 : 1;
    return b.count - a.count;
  });

  return matches.slice(0, limit).map(m => ({
    id: `${type}-${m.label}`,
    label: m.label,
    type,
    count: m.count
  }));
}

function getMatchingCompanies(query: string, jobs: RemoteJob[]): JobSearchSuggestion[] {
  const q = query.trim().toLowerCase();
  const companyCounts = new Map<string, number>();

  for (const job of jobs) {
    const company = job.company.trim();
    if (!company) continue;
    companyCounts.set(company, (companyCounts.get(company) || 0) + 1);
  }

  const matches: Array<{ label: string; count: number; startsWith: boolean }> = [];

  for (const [company, count] of companyCounts.entries()) {
    if (matchesQuery(company, q) && company.toLowerCase() !== q) {
      matches.push({ label: company, count, startsWith: company.toLowerCase().startsWith(q) });
    }
  }

  return toTopSuggestions(matches, 'company');
}

function getMatchingTech(query: string, jobs: RemoteJob[]): JobSearchSuggestion[] {
  const q = query.trim().toLowerCase();
  const matches: Array<{ label: string; count: number; startsWith: boolean }> = [];

  for (const tech of TECH_TAXONOMY) {
    if (matchesQuery(tech, q) && tech.toLowerCase() !== q) {
      const count = countTechInJobs(tech, jobs);
      matches.push({ label: tech, count, startsWith: tech.toLowerCase().startsWith(q) });
    }
  }

  return toTopSuggestions(matches, 'tech');
}

export function getJobSearchSuggestions(query: string, jobs: RemoteJob[]): JobSearchSuggestion[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const roles = getMatchingRoles(trimmed, jobs);
  const companies = getMatchingCompanies(trimmed, jobs);
  const tech = getMatchingTech(trimmed, jobs);

  return [...roles, ...companies, ...tech];
}
