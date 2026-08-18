import { CVData, WorkExperience, SkillCategory, ProjectItem } from '../types/cv';

// Curated technical lexicon covering standard domains and keywords
export const TECH_DOMAINS: Record<string, string[]> = {
  fullstack: [
    'fullstack', 'full-stack', 'react', 'typescript', 'javascript', 'next.js', 'vue', 'angular',
    'node', 'node.js', 'express', 'nestjs', 'html', 'css', 'tailwind', 'graphql', 'rest', 'api',
    'redux', 'zustand', 'webpack', 'vite', 'frontend', 'backend', 'web application'
  ],
  backend: [
    'backend', 'microservices', 'distributed systems', 'node.js', 'python', 'django', 'fastapi',
    'java', 'spring boot', 'golang', 'go', 'c#', '.net', 'rust', 'postgresql', 'postgres', 'mysql',
    'mongodb', 'redis', 'elasticsearch', 'kafka', 'rabbitmq', 'grpc', 'sql', 'nosql', 'prisma', 'orm'
  ],
  devops: [
    'devops', 'docker', 'kubernetes', 'k8s', 'terraform', 'aws', 'amazon web services', 'gcp',
    'google cloud', 'azure', 'ci/cd', 'github actions', 'gitlab ci', 'jenkins', 'helm', 'ansible',
    'linux', 'bash', 'shell', 'prometheus', 'grafana', 'cloudformation', 'iac', 'infrastructure'
  ],
  frontend: [
    'frontend', 'front-end', 'ui', 'ux', 'user interface', 'react', 'tailwind', 'css3', 'html5',
    'figma', 'design system', 'responsive', 'accessibility', 'a11y', 'storybook', 'sass', 'spa'
  ],
  ai_data: [
    'ai', 'artificial intelligence', 'machine learning', 'ml', 'llm', 'rag', 'vector database',
    'embeddings', 'langchain', 'pytorch', 'tensorflow', 'pandas', 'numpy', 'scikit-learn',
    'openai', 'nlp', 'data science', 'etl', 'pipeline', 'spark', 'sql'
  ],
  management: [
    'lead', 'team lead', 'engineering manager', 'tech lead', 'mentor', 'mentoring', 'agile',
    'scrum', 'kanban', 'sprint', 'jira', 'architecture', 'code review', 'roadmap', 'stakeholders'
  ],
  mobile: [
    'mobile', 'react native', 'flutter', 'ios', 'swift', 'android', 'kotlin', 'cross-platform'
  ],
  testing: [
    'testing', 'unit test', 'integration test', 'e2e', 'jest', 'vitest', 'cypress', 'playwright',
    'qa', 'tdd', 'test-driven', 'selenium'
  ]
};

export interface ATSMatchResult {
  atsScore: number;
  matchedTags: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  rankedExperiences: WorkExperience[];
  rankedSkills: SkillCategory[];
  rankedProjects: ProjectItem[];
}

/**
 * Tokenize string into lowercase alphanumeric words
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.-]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1);
}

/**
 * Calculate Term Frequency for a list of tokens
 */
function getTermFrequency(tokens: string[]): Record<string, number> {
  const tf: Record<string, number> = {};
  tokens.forEach(token => {
    tf[token] = (tf[token] || 0) + 1;
  });
  return tf;
}

/**
 * Cosine similarity between two token frequency vectors
 */
function calculateCosineSimilarity(tf1: Record<string, number>, tf2: Record<string, number>): number {
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  Object.keys(tf1).forEach(term => {
    const count1 = tf1[term];
    magnitude1 += count1 * count1;
    if (tf2[term]) {
      dotProduct += count1 * tf2[term];
    }
  });

  Object.values(tf2).forEach(count2 => {
    magnitude2 += count2 * count2;
  });

  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}

/**
 * Extract matched domain tags and technical keywords from job description
 */
export function analyzeJobDescription(jdText: string): { matchedTags: string[]; keywords: string[] } {
  const jdTokens = new Set(tokenize(jdText));
  const jdLower = jdText.toLowerCase();
  const tagScores: Record<string, number> = {};
  const foundKeywords = new Set<string>();

  Object.entries(TECH_DOMAINS).forEach(([tag, keywords]) => {
    let score = 0;
    keywords.forEach(kw => {
      const isPresent = kw.includes(' ') ? jdLower.includes(kw) : jdTokens.has(kw);
      if (isPresent) {
        score += 2;
        foundKeywords.add(kw);
      }
    });
    if (score > 0) {
      tagScores[tag] = score;
    }
  });

  const sortedTags = Object.keys(tagScores).sort((a, b) => (tagScores[b] || 0) - (tagScores[a] || 0));

  return {
    matchedTags: sortedTags.length > 0 ? sortedTags : ['fullstack'],
    keywords: Array.from(foundKeywords)
  };
}

/**
 * Perform Client-Side Hybrid Semantic RAG Matching on the Master CV against a Job Vacancy
 */
export function performHybridSemanticMatch(params: {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  cvData: CVData;
}): ATSMatchResult {
  const { jobTitle, companyName, jobDescription, cvData } = params;
  const fullJD = `${jobTitle} ${companyName} ${jobDescription}`;
  const jdTokens = tokenize(fullJD);
  const jdTF = getTermFrequency(jdTokens);
  const { matchedTags, keywords: matchedKeywords } = analyzeJobDescription(fullJD);

  // 1. Rank & Filter Experiences & Bullets
  const rankedExperiences = cvData.experiences.map(exp => {
    const expText = `${exp.company} ${exp.roleTitle.en || ''} ${exp.summary?.en || ''}`;
    const expTF = getTermFrequency(tokenize(expText));
    const expSim = calculateCosineSimilarity(jdTF, expTF);
    const hasTagMatch = exp.tags.some(t => matchedTags.includes(t));

    const scoredBullets = exp.bullets.map(bullet => {
      const bText = bullet.text.en || '';
      const bTF = getTermFrequency(tokenize(bText));
      const bSim = calculateCosineSimilarity(jdTF, bTF);
      const bTagMatch = bullet.tags.some(t => matchedTags.includes(t));

      // Hybrid relevance score (0 - 1)
      const relevance = (bSim * 0.7) + (bTagMatch ? 0.3 : 0);
      return { bullet, relevance };
    });

    // Sort bullets by semantic relevance
    scoredBullets.sort((a, b) => b.relevance - a.relevance);

    const updatedBullets = scoredBullets.map((item, idx) => ({
      ...item.bullet,
      // Enable all top-matching bullets or fallback to enabled
      enabled: item.relevance > 0.05 || idx < 3 || matchedTags.length === 0
    }));

    return {
      ...exp,
      enabled: expSim > 0.02 || hasTagMatch || matchedTags.includes('fullstack'),
      bullets: updatedBullets
    };
  });

  // 2. Rank & Filter Skills
  const rankedSkills = cvData.skillCategories.map(cat => {
    const updatedSkills = cat.skills.map(s => {
      const sLower = s.name.toLowerCase();
      const isMatched = matchedKeywords.some(kw => sLower.includes(kw) || kw.includes(sLower));
      const hasTag = s.tags.some(t => matchedTags.includes(t));
      return {
        ...s,
        enabled: isMatched || hasTag || matchedTags.length === 0
      };
    });

    return {
      ...cat,
      skills: updatedSkills
    };
  });

  // 3. Rank & Filter Projects
  const rankedProjects = cvData.projects.map(p => {
    const pText = `${p.title} ${p.description.en || ''} ${p.techStack.join(' ')}`;
    const pTF = getTermFrequency(tokenize(pText));
    const pSim = calculateCosineSimilarity(jdTF, pTF);
    const hasTag = p.tags.some(t => matchedTags.includes(t));
    return {
      ...p,
      enabled: pSim > 0.05 || hasTag || matchedTags.length === 0
    };
  });

  // 4. Calculate ATS Match Score (0 to 100%)
  const totalRelevantSkills = matchedKeywords.length;
  const candidateSkills = new Set(
    cvData.skillCategories.flatMap(c => c.skills.map(s => s.name.toLowerCase()))
  );
  
  let matchCount = 0;
  const missingKeywords: string[] = [];

  matchedKeywords.forEach(kw => {
    if (Array.from(candidateSkills).some(cs => cs.includes(kw) || kw.includes(cs))) {
      matchCount++;
    } else {
      missingKeywords.push(kw);
    }
  });

  const baseRatio = totalRelevantSkills > 0 ? (matchCount / totalRelevantSkills) : 0.8;
  const atsScore = Math.min(98, Math.max(45, Math.round(baseRatio * 85 + (matchedTags.length > 0 ? 15 : 0))));

  return {
    atsScore,
    matchedTags,
    matchedKeywords,
    missingKeywords: missingKeywords.slice(0, 8),
    rankedExperiences,
    rankedSkills,
    rankedProjects
  };
}
