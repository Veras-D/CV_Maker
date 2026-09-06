import { CVData, WorkExperience, SkillCategory, ProjectItem, WorkBullet } from '../types/cv';
import { DOMAIN_TAXONOMY, getDomainsForSkill } from './skillOntology';

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
 * Unicode-aware tokenizer for multilingual job descriptions & CVs
 */
export function tokenize(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#.-]/gu, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1);
}

/**
 * Calculate Term Frequency vector for tokens
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
export function calculateCosineSimilarity(tf1: Record<string, number>, tf2: Record<string, number>): number {
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

  Object.entries(DOMAIN_TAXONOMY).forEach(([domainId, domainDef]) => {
    let score = 0;
    domainDef.keywords.forEach(kw => {
      const isPresent = kw.includes(' ') ? jdLower.includes(kw) : jdTokens.has(kw);
      if (isPresent) {
        score += 2;
        foundKeywords.add(kw);
      }
    });
    if (score > 0) {
      tagScores[domainId] = score;
    }
  });

  const sortedTags = Object.keys(tagScores).sort((a, b) => (tagScores[b] || 0) - (tagScores[a] || 0));

  return {
    matchedTags: sortedTags.length > 0 ? sortedTags : ['fullstack'],
    keywords: Array.from(foundKeywords)
  };
}

/**
 * Check if a project matches the job description via tech stack, ontology or text
 */
function evaluateProjectRelevance(
  project: ProjectItem,
  jdTF: Record<string, number>,
  matchedTags: string[],
  matchedKeywords: string[]
): { isRelevant: boolean; score: number } {
  const pText = `${project.title} ${project.description.en || ''} ${project.description.cs || ''} ${project.techStack.join(' ')}`;
  const pTF = getTermFrequency(tokenize(pText));
  const cosineSim = calculateCosineSimilarity(jdTF, pTF);

  // Check if any tool in project tech stack matches JD keywords or belongs to a matched domain
  const hasDirectTechMatch = project.techStack.some(tech => {
    const techLower = tech.toLowerCase();
    const directKeyword = matchedKeywords.some(kw => techLower.includes(kw) || kw.includes(techLower));
    const techDomains = getDomainsForSkill(tech);
    const domainMatch = techDomains.some(d => matchedTags.includes(d));
    return directKeyword || domainMatch;
  });

  const score = cosineSim + (hasDirectTechMatch ? 0.4 : 0);
  const isRelevant = score > 0.05 || hasDirectTechMatch || matchedTags.length === 0;

  return { isRelevant, score };
}

/**
 * Score and rank experience bullets without dead tag dependencies
 */
function scoreBulletRelevance(
  bullet: WorkBullet,
  jdTF: Record<string, number>,
  matchedKeywords: string[],
  matchedTags: string[]
): number {
  const bText = `${bullet.text.en || ''} ${bullet.text.cs || ''}`;
  const bLower = bText.toLowerCase();
  const bTF = getTermFrequency(tokenize(bText));
  const cosineSim = calculateCosineSimilarity(jdTF, bTF);

  let keywordBonus = 0;
  matchedKeywords.forEach(kw => {
    if (bLower.includes(kw)) {
      keywordBonus += 0.15;
    }
  });

  let domainBonus = 0;
  matchedTags.forEach(tag => {
    const domainDef = DOMAIN_TAXONOMY[tag];
    if (domainDef && domainDef.keywords.some(k => bLower.includes(k))) {
      domainBonus += 0.1;
    }
  });

  return (cosineSim * 0.5) + Math.min(0.4, keywordBonus) + Math.min(0.2, domainBonus);
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
    const expText = `${exp.company} ${exp.roleTitle.en || ''} ${exp.roleTitle.cs || ''} ${exp.summary?.en || ''}`;
    const expTF = getTermFrequency(tokenize(expText));
    const expSim = calculateCosineSimilarity(jdTF, expTF);

    const scoredBullets = exp.bullets.map(bullet => ({
      bullet,
      relevance: scoreBulletRelevance(bullet, jdTF, matchedKeywords, matchedTags)
    }));

    scoredBullets.sort((a, b) => b.relevance - a.relevance);

    const updatedBullets = scoredBullets.map((item, idx) => ({
      ...item.bullet,
      enabled: idx < 2 || item.relevance > 0.05 || matchedKeywords.length === 0
    }));

    const hasEnabledBullet = updatedBullets.some(b => b.enabled);
    return {
      ...exp,
      enabled: expSim > 0.02 || hasEnabledBullet || matchedTags.length === 0,
      bullets: updatedBullets
    };
  });

  // 2. Rank & Filter Skills
  const rankedSkills = cvData.skillCategories.map(cat => {
    const updatedSkills = cat.skills.map(s => {
      const sLower = s.name.toLowerCase();
      const isMatched = matchedKeywords.some(kw => sLower.includes(kw) || kw.includes(sLower));
      const sDomains = getDomainsForSkill(s.name);
      const hasDomain = sDomains.some(d => matchedTags.includes(d));
      return {
        ...s,
        enabled: isMatched || hasDomain || matchedKeywords.length === 0
      };
    });

    return { ...cat, skills: updatedSkills };
  });

  // 3. Rank & Filter Projects (with Skill Ontology awareness)
  const scoredProjects = cvData.projects.map(p => {
    const { isRelevant, score } = evaluateProjectRelevance(p, jdTF, matchedTags, matchedKeywords);
    return { project: { ...p, enabled: isRelevant }, score };
  });

  scoredProjects.sort((a, b) => b.score - a.score);
  const rankedProjects = scoredProjects.map(sp => sp.project);

  // 4. Calculate ATS Match Score (0 to 100%)
  const totalRelevantSkills = matchedKeywords.length;
  const candidateSkills = new Set(
    cvData.skillCategories.flatMap(c => c.skills.map(s => s.name.toLowerCase()))
  );
  
  let matchCount = 0;
  const missingKeywords: string[] = [];

  matchedKeywords.forEach(kw => {
    const matched = Array.from(candidateSkills).some(cs => cs.includes(kw) || kw.includes(cs));
    if (matched) {
      matchCount++;
    } else {
      missingKeywords.push(kw);
    }
  });

  const baseRatio = totalRelevantSkills > 0 ? (matchCount / totalRelevantSkills) : 0.85;
  const atsScore = Math.min(99, Math.max(50, Math.round(baseRatio * 80 + (matchedTags.length > 0 ? 18 : 0))));

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
