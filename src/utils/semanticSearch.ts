import { CVData, WorkExperience, SkillCategory, ProjectItem, WorkBullet } from '../types/cv';
import { DOMAIN_TAXONOMY, getDomainsForSkill } from './skillOntology';
import {
  tokenizeClean,
  tokenizeRaw,
  getTermFrequency,
  calculateCosineSimilarity
} from './textProcessing';

export interface ATSMatchResult {
  atsScore: number;
  matchedTags: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  rankedExperiences: WorkExperience[];
  rankedSkills: SkillCategory[];
  rankedProjects: ProjectItem[];
}

export const tokenize = tokenizeRaw;
export { calculateCosineSimilarity };

/**
 * Score role domains based on job title hints and job description body
 */
function calculateDomainScores(
  titleLower: string,
  titleTokens: Set<string>,
  jdLower: string,
  jdTokens: Set<string>
): { domainScores: Record<string, number>; foundKeywords: Set<string> } {
  const domainScores: Record<string, number> = {};
  const foundKeywords = new Set<string>();

  if (/full[- ]?stack/i.test(titleLower)) {
    domainScores.frontend = (domainScores.frontend || 0) + 12;
    domainScores.backend = (domainScores.backend || 0) + 12;
  }

  Object.entries(DOMAIN_TAXONOMY).forEach(([domainId, domainDef]) => {
    let score = domainScores[domainId] || 0;
    domainDef.keywords.forEach(kw => {
      const inTitle = kw.includes(' ') ? titleLower.includes(kw) : titleTokens.has(kw);
      if (inTitle) {
        score += 10;
        foundKeywords.add(kw);
      }
      const inJD = kw.includes(' ') ? jdLower.includes(kw) : jdTokens.has(kw);
      if (inJD) {
        score += 2;
        foundKeywords.add(kw);
      }
    });
    if (score > 0) domainScores[domainId] = score;
  });

  return { domainScores, foundKeywords };
}

/**
 * Extract matched domain tags and technical keywords from job description
 */
export function analyzeJobDescription(
  jdText: string,
  jobTitle = ''
): { matchedTags: string[]; keywords: string[] } {
  const titleLower = jobTitle.toLowerCase();
  const titleTokens = new Set(tokenizeClean(jobTitle));
  const jdLower = jdText.toLowerCase();
  const jdTokens = new Set(tokenizeClean(jdText));

  const { domainScores, foundKeywords } = calculateDomainScores(
    titleLower,
    titleTokens,
    jdLower,
    jdTokens
  );

  const sorted = Object.entries(domainScores).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) {
    return { matchedTags: ['fullstack'], keywords: [] };
  }

  const maxScore = sorted[0][1];
  const matchedTags = sorted
    .filter(([_, s]) => s >= maxScore * 0.65 && s >= 6)
    .slice(0, 2)
    .map(([d]) => d);

  return {
    matchedTags: matchedTags.length > 0 ? matchedTags : [sorted[0][0]],
    keywords: Array.from(foundKeywords)
  };
}

/**
 * Score and rank experience bullets based on keywords, domains, and clean similarity
 */
function scoreBulletRelevance(
  bullet: WorkBullet,
  jdTF: Record<string, number>,
  matchedKeywords: string[],
  matchedTags: string[]
): { isRelevant: boolean; score: number } {
  const bText = `${bullet.text.en || ''} ${bullet.text.cs || ''}`.toLowerCase();
  const bTF = getTermFrequency(tokenizeClean(bText));
  const cosineSim = calculateCosineSimilarity(jdTF, bTF);

  let keywordBonus = 0;
  matchedKeywords.forEach(kw => {
    if (bText.includes(kw)) keywordBonus += 0.25;
  });

  let domainBonus = 0;
  const bulletTags = bullet.tags || [];
  const hasTagMatch = bulletTags.some(t => matchedTags.includes(t));
  if (hasTagMatch) domainBonus += 0.3;

  matchedTags.forEach(tag => {
    const domainDef = DOMAIN_TAXONOMY[tag];
    if (domainDef && domainDef.keywords.some(k => bText.includes(k))) {
      domainBonus += 0.2;
    }
  });

  const score = (cosineSim * 0.4) + Math.min(0.5, keywordBonus) + Math.min(0.4, domainBonus);
  const isRelevant = keywordBonus > 0 || domainBonus > 0 || cosineSim >= 0.15;

  return { isRelevant, score };
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
  const pTF = getTermFrequency(tokenizeClean(pText));
  const cosineSim = calculateCosineSimilarity(jdTF, pTF);

  const hasTechMatch = project.techStack.some(tech => {
    const techLower = tech.toLowerCase();
    const directKeyword = matchedKeywords.some(kw => techLower.includes(kw) || kw.includes(techLower));
    const techDomains = getDomainsForSkill(tech);
    const domainMatch = techDomains.some(d => matchedTags.includes(d));
    return directKeyword || domainMatch;
  });

  const projectTags = project.tags || [];
  const hasTagMatch = projectTags.some(t => matchedTags.includes(t));

  const score = cosineSim + (hasTechMatch || hasTagMatch ? 0.4 : 0);
  const isRelevant = hasTechMatch || hasTagMatch || cosineSim >= 0.15;

  return { isRelevant, score };
}

/**
 * Filter and rank work experiences based on target domains and matched keywords
 */
function rankExperiences(
  experiences: WorkExperience[],
  jdTF: Record<string, number>,
  matchedKeywords: string[],
  matchedTags: string[]
): WorkExperience[] {
  const ranked = experiences.map(exp => {
    const scoredBullets = exp.bullets.map(bullet => {
      const { isRelevant, score } = scoreBulletRelevance(bullet, jdTF, matchedKeywords, matchedTags);
      return { bullet: { ...bullet, enabled: isRelevant }, score };
    });

    scoredBullets.sort((a, b) => b.score - a.score);
    const updatedBullets = scoredBullets.map(sb => sb.bullet);
    const hasEnabledBullet = updatedBullets.some(b => b.enabled);
    const expTags = exp.tags || [];
    const roleMatchesDomain = expTags.some(t => matchedTags.includes(t));

    return {
      ...exp,
      enabled: hasEnabledBullet || roleMatchesDomain,
      bullets: updatedBullets
    };
  });

  if (ranked.every(e => !e.enabled) && experiences.length > 0) {
    return experiences.map(e => ({
      ...e,
      enabled: true,
      bullets: e.bullets.map((b, idx) => ({ ...b, enabled: idx < 3 }))
    }));
  }

  return ranked;
}

/**
 * Filter and prioritize skills based on target domains and matched keywords
 */
function rankSkills(
  skillCategories: SkillCategory[],
  matchedKeywords: string[],
  matchedTags: string[]
): SkillCategory[] {
  const ranked = skillCategories.map(cat => {
    const updatedSkills = cat.skills.map(s => {
      const sLower = s.name.toLowerCase();
      const isDirectMatch = matchedKeywords.some(kw => sLower === kw || sLower.includes(kw) || kw.includes(sLower));
      const sDomains = getDomainsForSkill(s.name);
      const skillTags = s.tags || [];
      const hasDomainMatch = skillTags.some(t => matchedTags.includes(t)) || sDomains.some(d => matchedTags.includes(d));

      return {
        ...s,
        enabled: isDirectMatch || hasDomainMatch
      };
    });

    updatedSkills.sort((a, b) => {
      if (a.enabled && !b.enabled) return -1;
      if (!a.enabled && b.enabled) return 1;
      return 0;
    });

    return { ...cat, skills: updatedSkills };
  });

  const totalEnabled = ranked.reduce((acc, cat) => acc + cat.skills.filter(s => s.enabled).length, 0);
  if (totalEnabled === 0 && skillCategories.length > 0) {
    return skillCategories;
  }

  return ranked;
}

/**
 * Calculate ATS Match Score (0 to 100%) and missing keywords
 */
function calculateAtsScore(
  matchedKeywords: string[],
  skillCategories: SkillCategory[],
  matchedTags: string[]
): { atsScore: number; missingKeywords: string[]; candidateSkills: Set<string> } {
  const candidateSkills = new Set(
    skillCategories.flatMap(c => c.skills.map(s => s.name.toLowerCase()))
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

  const baseRatio = matchedKeywords.length > 0 ? (matchCount / matchedKeywords.length) : 0.8;
  const atsScore = Math.min(99, Math.max(40, Math.round(baseRatio * 75 + (matchedTags.length > 0 ? 20 : 0))));

  return { atsScore, missingKeywords, candidateSkills };
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
  const jdTokens = tokenizeClean(fullJD);
  const jdTF = getTermFrequency(jdTokens);
  const { matchedTags, keywords: matchedKeywords } = analyzeJobDescription(jobDescription, jobTitle);

  const rankedExperiences = rankExperiences(cvData.experiences, jdTF, matchedKeywords, matchedTags);
  const rankedSkills = rankSkills(cvData.skillCategories, matchedKeywords, matchedTags);

  const scoredProjects = cvData.projects.map(p => {
    const { isRelevant, score } = evaluateProjectRelevance(p, jdTF, matchedTags, matchedKeywords);
    return { project: { ...p, enabled: isRelevant }, score };
  });

  scoredProjects.sort((a, b) => b.score - a.score);
  const rankedProjects = scoredProjects.map(sp => sp.project);

  const { atsScore, missingKeywords } = calculateAtsScore(
    matchedKeywords,
    cvData.skillCategories,
    matchedTags
  );

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
