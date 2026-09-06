export interface DomainDefinition {
  id: string;
  label: string;
  keywords: string[];
}

export const DOMAIN_TAXONOMY: Record<string, DomainDefinition> = {
  testing: {
    id: 'testing',
    label: 'Testing & QA Automation',
    keywords: [
      'cypress', 'jest', 'vitest', 'playwright', 'selenium', 'junit', 'pytest',
      'e2e', 'end-to-end', 'unit test', 'integration test', 'qa', 'quality assurance',
      'test automation', 'tdd', 'bdd', 'test cases', 'manual testing',
      'automated testing', 'postman', 'appium', 'test runner', 'tester', 'test'
    ]
  },
  frontend: {
    id: 'frontend',
    label: 'Frontend Development',
    keywords: [
      'react', 'vue', 'angular', 'next.js', 'svelte', 'typescript', 'javascript',
      'html', 'html5', 'css', 'css3', 'tailwind', 'bootstrap', 'redux', 'zustand',
      'vite', 'webpack', 'ui', 'ux', 'responsive', 'frontend', 'front-end',
      'web application', 'web development', 'figma', 'storybook', 'sass', 'spa'
    ]
  },
  backend: {
    id: 'backend',
    label: 'Backend Engineering',
    keywords: [
      'java', 'spring', 'spring boot', 'c#', '.net', 'dotnet', 'python', 'django',
      'fastapi', 'node', 'node.js', 'express', 'nestjs', 'golang', 'go', 'rust',
      'php', 'laravel', 'ruby', 'rails', 'sql', 'postgresql', 'postgres', 'mysql',
      'mongodb', 'redis', 'elasticsearch', 'kafka', 'rabbitmq', 'microservices',
      'rest', 'rest api', 'graphql', 'grpc', 'backend', 'back-end', 'database'
    ]
  },
  devops: {
    id: 'devops',
    label: 'DevOps & Cloud Infrastructure',
    keywords: [
      'docker', 'kubernetes', 'k8s', 'terraform', 'aws', 'amazon web services',
      'gcp', 'google cloud', 'azure', 'ci/cd', 'github actions', 'gitlab ci',
      'jenkins', 'helm', 'ansible', 'linux', 'bash', 'shell', 'prometheus',
      'grafana', 'cloud', 'infrastructure'
    ]
  },
  ai_data: {
    id: 'ai_data',
    label: 'AI & Data Engineering',
    keywords: [
      'ai', 'artificial intelligence', 'machine learning', 'ml', 'llm', 'rag',
      'vector database', 'embeddings', 'langchain', 'pytorch', 'tensorflow',
      'pandas', 'numpy', 'scikit-learn', 'openai', 'nlp', 'data science',
      'etl', 'spark', 'data engineering'
    ]
  },
  mobile: {
    id: 'mobile',
    label: 'Mobile Development',
    keywords: [
      'react native', 'flutter', 'ios', 'swift', 'android', 'kotlin', 'cross-platform', 'mobile'
    ]
  },
  management: {
    id: 'management',
    label: 'Technical Leadership',
    keywords: [
      'tech lead', 'team lead', 'engineering manager', 'lead', 'scrum', 'agile',
      'kanban', 'sprint', 'jira', 'mentoring', 'mentor', 'code review',
      'architecture', 'stakeholder'
    ]
  }
};

const CANONICAL_TECH_NAMES: Record<string, string> = {
  'c#': 'C#',
  '.net': '.NET',
  'dotnet': '.NET',
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'react': 'React',
  'react native': 'React Native',
  'next.js': 'Next.js',
  'vue': 'Vue.js',
  'node': 'Node.js',
  'node.js': 'Node.js',
  'express': 'Express',
  'nestjs': 'NestJS',
  'spring boot': 'Spring Boot',
  'spring': 'Spring',
  'postgresql': 'PostgreSQL',
  'postgres': 'PostgreSQL',
  'mysql': 'MySQL',
  'mongodb': 'MongoDB',
  'graphql': 'GraphQL',
  'rest': 'REST APIs',
  'rest api': 'REST APIs',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'ci/cd': 'CI/CD',
  'github actions': 'GitHub Actions',
  'aws': 'AWS',
  'gcp': 'GCP',
  'azure': 'Azure',
  'cypress': 'Cypress',
  'jest': 'Jest',
  'vitest': 'Vitest',
  'playwright': 'Playwright',
  'selenium': 'Selenium',
  'junit': 'JUnit',
  'pytest': 'PyTest',
  'qa': 'QA',
  'e2e': 'E2E Testing',
  'tdd': 'TDD',
  'tailwind': 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',
  'html': 'HTML5',
  'css': 'CSS3',
  'linux': 'Linux',
  'java': 'Java',
  'python': 'Python',
  'golang': 'Go',
  'rust': 'Rust'
};

/**
 * Format raw technical keyword with standard industry capitalization
 */
export function formatTechnologyName(tech: string): string {
  const lower = tech.trim().toLowerCase();
  if (CANONICAL_TECH_NAMES[lower]) {
    return CANONICAL_TECH_NAMES[lower];
  }
  return tech
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Find all matching ontology domains for a given skill or keyword
 */
export function getDomainsForSkill(skillName: string): string[] {
  const lower = skillName.trim().toLowerCase();
  const matchedDomains: string[] = [];

  Object.values(DOMAIN_TAXONOMY).forEach(domain => {
    const hasKeyword = domain.keywords.some(kw => 
      lower === kw || lower.includes(kw) || (kw.length > 3 && kw.includes(lower))
    );
    if (hasKeyword) {
      matchedDomains.push(domain.id);
    }
  });

  return matchedDomains;
}

/**
 * Get human-readable label for a domain
 */
export function getDomainLabel(domainId: string): string {
  const domain = DOMAIN_TAXONOMY[domainId];
  if (!domain) return formatTechnologyName(domainId);
  return domain.label;
}
