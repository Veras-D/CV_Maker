import { CVData, WorkExperience, SkillCategory, ProjectItem, WorkBullet } from '../types/cv';
import { getDomainsForSkill } from './skillOntology';
import {
  getDynamicDomains,
  classifyCategory,
  bootstrapKnowledgeGraphFromCV,
  learnFromJobPosting
} from './knowledgeGraph';
import {
  tokenizeClean,
  tokenizeRaw,
  getTermFrequency,
  calculateCosineSimilarity,
  buildProximityMap,
  getProximityWeight,
  isValidKeyword
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
  const activeDomains = getDynamicDomains();

  if (/full[- ]?stack/i.test(titleLower)) {
    domainScores.frontend = (domainScores.frontend || 0) + 15;
    domainScores.backend = (domainScores.backend || 0) + 15;
  }

  Object.entries(activeDomains).forEach(([domainId, domainDef]) => {
    let score = domainScores[domainId] || 0;
    domainDef.keywords.forEach(kw => {
      if (!isValidKeyword(kw)) return;
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
    keywords: Array.from(foundKeywords).filter(isValidKeyword)
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
  const activeDomains = getDynamicDomains();

  let keywordBonus = 0;
  matchedKeywords.forEach(kw => {
    if (bText.includes(kw)) keywordBonus += 0.25;
  });

  let domainBonus = 0;
  const bulletTags = bullet.tags || [];
  const hasTagMatch = bulletTags.some(t => matchedTags.includes(t));
  if (hasTagMatch) domainBonus += 0.3;

  matchedTags.forEach(tag => {
    const domainDef = activeDomains[tag];
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
 * Rank work experiences and their bullets against the job description.
 * Ensures ALL career experiences appear (never dropping past roles)
 * and guarantees at least 2 bullets are enabled for each role.
 */
function rankExperiences(
  experiences: WorkExperience[],
  jdTF: Record<string, number>,
  matchedKeywords: string[],
  matchedTags: string[]
): WorkExperience[] {
  return experiences.map(exp => {
    const scoredBullets = exp.bullets.map((bullet, originalIndex) => {
      const { isRelevant, score } = scoreBulletRelevance(bullet, jdTF, matchedKeywords, matchedTags);
      return { bullet, originalIndex, isRelevant, score };
    });

    // Sort descending by score to prioritize top matching bullets
    scoredBullets.sort((a, b) => b.score - a.score);
    const relevantCount = scoredBullets.filter(s => s.isRelevant).length;

    // Guarantee at least 2 bullets for every experience (or all bullets if role has <= 2)
    const countToEnable = Math.min(exp.bullets.length, Math.max(2, relevantCount));

    // Select top-scoring bullets to enable
    const enabledIndices = new Set(
      scoredBullets.slice(0, countToEnable).map(s => s.originalIndex)
    );

    // Maintain original narrative order of bullets within the role
    const updatedBullets = exp.bullets.map((bullet, idx) => ({
      ...bullet,
      enabled: enabledIndices.has(idx)
    }));

    // All career experiences must appear to prevent cutting the user's career chronology
    return {
      ...exp,
      enabled: true,
      bullets: updatedBullets
    };
  });
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

function collectCandidateInventory(cvData: CVData): { skills: Set<string>; text: string } {
  const skills = new Set<string>();
  cvData.skillCategories?.forEach(c => c.skills?.forEach(s => s.name.trim() && skills.add(s.name.trim().toLowerCase())));
  cvData.projects?.forEach(p => {
    p.techStack?.forEach(ts => ts.trim() && skills.add(ts.trim().toLowerCase()));
    p.tags?.forEach(t => t.trim() && skills.add(t.trim().toLowerCase()));
  });
  cvData.experiences?.forEach(e => {
    e.tags?.forEach(t => t.trim() && skills.add(t.trim().toLowerCase()));
    const r = (e.roleTitle.en || e.roleTitle.cs || '').trim().toLowerCase();
    if (r) skills.add(r);
  });
  const text = [
    cvData.profile?.headline?.en, cvData.profile?.headline?.cs,
    cvData.profile?.summary?.en, cvData.profile?.summary?.cs,
    ...cvData.experiences.flatMap(e => e.bullets.map(b => `${b.text.en || ''} ${b.text.cs || ''}`))
  ].filter(Boolean).join(' ').toLowerCase();

  return { skills, text };
}

/**
 * Calculate ATS Match Score (0 to 100%), verified matching keywords, and missing keywords.
 * Strictly guarantees that matched and missing keyword lists are mutually exclusive.
 */
function calculateAtsScore(
  jobKeywords: string[],
  cvData: CVData,
  matchedTags: string[]
): { atsScore: number; matchedKeywords: string[]; missingKeywords: string[] } {
  const { skills: candidateSkills, text: candidateText } = collectCandidateInventory(cvData);
  const candidateSkillsArray = Array.from(candidateSkills);

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  const validJobKeywords = Array.from(new Set(jobKeywords.filter(isValidKeyword)));

  validJobKeywords.forEach(kw => {
    const kwLower = kw.toLowerCase();
    const isDirectMatch = candidateSkillsArray.some(cs => cs === kwLower || cs.includes(kwLower) || kwLower.includes(cs));
    const isTextMatch = isDirectMatch || candidateText.includes(kwLower);

    if (isTextMatch) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  const total = validJobKeywords.length;
  const baseRatio = total > 0 ? (matchedKeywords.length / total) : 0.8;
  const atsScore = Math.min(99, Math.max(35, Math.round(baseRatio * 75 + (matchedTags.length > 0 ? 20 : 0))));

  return { atsScore, matchedKeywords, missingKeywords };
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

  // Bootstrap knowledge graph from candidate's CV data
  bootstrapKnowledgeGraphFromCV(cvData);

  const fullJD = `${jobTitle} ${companyName} ${jobDescription}`;
  const jdTokens = tokenizeClean(fullJD);
  const jdTF = getTermFrequency(jdTokens);
  const { matchedTags, keywords: jobKeywords } = analyzeJobDescription(jobDescription, jobTitle);

  // Learn new terms from the job posting
  learnFromJobPosting(jobTitle, jobDescription, matchedTags);

  const { atsScore, matchedKeywords, missingKeywords } = calculateAtsScore(
    jobKeywords,
    cvData,
    matchedTags
  );

  const rankedExperiences = rankExperiences(cvData.experiences, jdTF, jobKeywords, matchedTags);
  const rankedSkills = rankSkills(cvData.skillCategories, jobKeywords, matchedTags);

  const scoredProjects = cvData.projects.map(p => {
    const { isRelevant, score } = evaluateProjectRelevance(p, jdTF, matchedTags, jobKeywords);
    return { project: { ...p, enabled: isRelevant }, score };
  });

  scoredProjects.sort((a, b) => b.score - a.score);
  const rankedProjects = scoredProjects.map(sp => sp.project);

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
