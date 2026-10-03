import { CVData, WorkExperience, SkillCategory, ProjectItem, WorkBullet } from '../types/cv';
import { DOMAIN_TAXONOMY, getDomainsForSkill } from './skillOntology';
import {
  tokenizeClean,
  tokenizeRaw,
  getTermFrequency,
  calculateCosineSimilarity,
  buildProximityMap,
  getProximityWeight
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
 * Score role domains based on job title hints and job description body with proximity weighting
 */
function calculateDomainScores(
  titleLower: string,
  titleTokens: Set<string>,
  jdLower: string
): { domainScores: Record<string, number>; foundKeywords: Set<string> } {
  const domainScores: Record<string, number> = {};
  const foundKeywords = new Set<string>();
  const proximityMap = buildProximityMap(jdLower);

  if (/full[- ]?stack/i.test(titleLower)) {
    domainScores.frontend = (domainScores.frontend || 0) + 15;
    domainScores.backend = (domainScores.backend || 0) + 15;
  }

  Object.entries(DOMAIN_TAXONOMY).forEach(([domainId, domainDef]) => {
    let score = domainScores[domainId] || 0;
    domainDef.keywords.forEach(kw => {
      const inTitle = kw.includes(' ') ? titleLower.includes(kw) : titleTokens.has(kw);
      if (inTitle) {
        score += 15;
        foundKeywords.add(kw);
      }

      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      let match: RegExpExecArray | null;
      while ((match = regex.exec(jdLower)) !== null) {
        const weight = getProximityWeight(match.index, proximityMap);
        score += weight;
        if (weight >= 2) {
          foundKeywords.add(kw);
        }
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

  const { domainScores, foundKeywords } = calculateDomainScores(titleLower, titleTokens, jdLower);
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
 * Classify a skill category into universal or domain-specific bucket
 */
function classifyCategory(catName: string, skills: { name: string }[]): string {
  const lower = catName.toLowerCase();
  if (/language|jazyk|programov/i.test(lower)) return 'universal_languages';
  if (/developer tool|nástroj|practice|general tool/i.test(lower)) return 'universal_tools';
  if (/test|qa|quality|automation|testov/i.test(lower)) return 'testing';
  if (/front[- ]?end|ui|ux|web design|styling/i.test(lower)) return 'frontend';
  if (/back[- ]?end|database|databáz|server|api|sql/i.test(lower)) return 'backend';
  if (/devops|cloud|infrastruct|sysadmin/i.test(lower)) return 'devops';
  if (/mobile|mobiln|ios|android/i.test(lower)) return 'mobile';
  if (/data|ai|machine learning/i.test(lower)) return 'ai_data';

  const counts: Record<string, number> = {};
  skills.forEach(s => {
    getDomainsForSkill(s.name).forEach(d => {
      counts[d] = (counts[d] || 0) + 1;
    });
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : 'other';
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
 * Check if a project matches the job description via tech stack or target domain
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
 * Filter and rank work experiences, guaranteeing at least 2 bullets for any included role
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
      return { bullet, isRelevant, score };
    });

    scoredBullets.sort((a, b) => b.score - a.score);
    const relevantCount = scoredBullets.filter(s => s.isRelevant).length;
    const expTags = exp.tags || [];
    const roleMatchesDomain = expTags.some(t => matchedTags.includes(t));
    const isExpEnabled = relevantCount > 0 || roleMatchesDomain;

    if (!isExpEnabled) {
      return { ...exp, enabled: false, bullets: scoredBullets.map(s => ({ ...s.bullet, enabled: false })) };
    }

    const countToEnable = Math.min(exp.bullets.length, Math.max(2, relevantCount));
    const updatedBullets = scoredBullets.map((s, idx) => ({
      ...s.bullet,
      enabled: idx < countToEnable
    }));

    return { ...exp, enabled: true, bullets: updatedBullets };
  });

  if (ranked.every(e => !e.enabled) && experiences.length > 0) {
    return experiences.map(e => ({
      ...e,
      enabled: true,
      bullets: e.bullets.map((b, idx) => ({ ...b, enabled: idx < 2 }))
    }));
  }

  return ranked;
}

/**
 * Filter categories on the vertical without slicing foundational skills on the horizontal
 */
function rankSkills(
  skillCategories: SkillCategory[],
  matchedKeywords: string[],
  matchedTags: string[]
): SkillCategory[] {
  const ranked = skillCategories.map(cat => {
    const catType = classifyCategory(cat.categoryName.en || '', cat.skills);

    if (catType === 'universal_languages' || catType === 'universal_tools') {
      return { ...cat, skills: cat.skills.map(s => ({ ...s, enabled: true })) };
    }

    if (matchedTags.includes(catType)) {
      return { ...cat, skills: cat.skills.map(s => ({ ...s, enabled: true })) };
    }

    const hasDirectKeyword = cat.skills.some(s => {
      const sLower = s.name.toLowerCase();
      return matchedKeywords.some(kw => sLower === kw || sLower.includes(kw) || kw.includes(sLower));
    });

    if (!hasDirectKeyword) {
      return { ...cat, skills: cat.skills.map(s => ({ ...s, enabled: false })) };
    }

    const updated = cat.skills.map(s => {
      const sLower = s.name.toLowerCase();
      const direct = matchedKeywords.some(kw => sLower === kw || sLower.includes(kw) || kw.includes(sLower));
      return { ...s, enabled: direct };
    });

    return { ...cat, skills: updated };
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
