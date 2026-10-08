import { 
  CVData, 
  LanguageCode, 
  WorkExperience, 
  WorkBullet 
} from '../types/cv';
import { 
  USABLE_PAGE_HEIGHT_MM, 
  calculateCvTotalHeightMm 
} from './pdfLayoutEstimator';

export interface PageBudgetAudit {
  originalHeightMm: number;
  optimizedHeightMm: number;
  maxAllowedHeightMm: number;
  targetPages: number;
  wasCompacted: boolean;
  omittedExperiencesCount: number;
  omittedExperiences: string[];
  trimmedBulletsCount: number;
  omittedProjectsCount: number;
  omittedSkillCategoriesCount: number;
  omittedEducationCount: number;
  auditNotes: string[];
}

export interface OptimizePageBudgetParams {
  cvData: CVData;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  matchedKeywords: string[];
  matchedTags: string[];
  maxPages?: number;
  language?: LanguageCode;
}

import { 
  optimizeEducation, 
  optimizeCompetencies, 
  pruneSecondaryProjects,
  backfillProjects,
  backfillBullets,
  backfillEducation,
  backfillSkills
} from './cvSectionOptimizers';

/**
 * Scores an experience for role relevance against job title, description, and keywords
 */
function evaluateExperienceRelevance(
  exp: WorkExperience,
  jobTitle: string,
  matchedKeywords: string[],
  matchedTags: string[]
): number {
  const roleLower = `${exp.roleTitle.en || ''} ${exp.roleTitle.cs || ''}`.toLowerCase();
  const jtTokens = jobTitle.toLowerCase().split(/[\s/-]+/).filter(t => t.length > 2);
  let score = 0;

  jtTokens.forEach(token => {
    if (roleLower.includes(token)) score += 3;
  });

  const bulletTexts = exp.bullets
    .filter(b => b.enabled)
    .map(b => `${b.text.en || ''} ${b.text.cs || ''}`.toLowerCase())
    .join(' ');

  matchedKeywords.forEach(kw => {
    if (roleLower.includes(kw)) score += 2;
    if (bulletTexts.includes(kw)) score += 0.5;
  });

  const expTags = exp.tags || [];
  expTags.forEach(t => {
    if (matchedTags.includes(t)) score += 2;
  });

  return score;
}

/**
 * Compresses bullet points on experiences to a minimum of 2 bullets per job
 */
function compressExperienceBullets(
  experiences: WorkExperience[],
  aggressiveness: 'moderate' | 'strict'
): { experiences: WorkExperience[]; trimmedBulletsCount: number } {
  let trimmedBulletsCount = 0;

  const updated = experiences.map((exp, idx) => {
    if (!exp.enabled) return exp;
    const activeBullets = exp.bullets.filter(b => b.enabled);
    if (activeBullets.length <= 2) return exp;

    // Jobs 0 & 1 keep 3 bullets if moderate, 2 if strict; older jobs keep 2 bullets
    const targetBullets = (idx < 2 && aggressiveness === 'moderate') ? 3 : 2;
    if (activeBullets.length <= targetBullets) return exp;

    let kept = 0;
    const newBullets: WorkBullet[] = exp.bullets.map(b => {
      if (!b.enabled) return b;
      if (kept < targetBullets) {
        kept++;
        return b;
      }
      trimmedBulletsCount++;
      return { ...b, enabled: false };
    });

    return { ...exp, bullets: newBullets };
  });

  return { experiences: updated, trimmedBulletsCount };
}


/**
 * Compresses bullet points on older experiences (idx >= 2) to 1 bullet if needed to fit budget
 */
function compressExperienceBulletsUltra(
  experiences: WorkExperience[]
): { experiences: WorkExperience[]; trimmedBulletsCount: number } {
  let trimmedBulletsCount = 0;

  const updated = experiences.map((exp, idx) => {
    if (!exp.enabled) return exp;
    const activeBullets = exp.bullets.filter(b => b.enabled);
    const targetBullets = idx < 2 ? 2 : 1;
    if (activeBullets.length <= targetBullets) return exp;

    let kept = 0;
    const newBullets: WorkBullet[] = exp.bullets.map(b => {
      if (!b.enabled) return b;
      if (kept < targetBullets) {
        kept++;
        return b;
      }
      trimmedBulletsCount++;
      return { ...b, enabled: false };
    });

    return { ...exp, bullets: newBullets };
  });

  return { experiences: updated, trimmedBulletsCount };
}

/**
 * Selects candidate experiences beyond the top 4 for pruning based on low relevance.
 * Strict rule: Experiences are ONLY pruned if there are MORE than 4 active experiences (> 4).
 * If user has <= 4 active experiences, no experiences are ever omitted.
 */
function pruneExperiencesByRelevance(
  experiences: WorkExperience[],
  currentCvData: CVData,
  maxAllowedHeightMm: number,
  params: OptimizePageBudgetParams
): { experiences: WorkExperience[]; omitted: string[] } {
  const omitted: string[] = [];
  let candidateExperiences = [...experiences];
  const lang = params.language || 'en';

  const enabledIndices = candidateExperiences
    .map((e, idx) => (e.enabled ? idx : -1))
    .filter(idx => idx !== -1);

  // If candidate has 4 or fewer active experiences, NEVER omit any experience
  if (enabledIndices.length <= 4) {
    return { experiences: candidateExperiences, omitted: [] };
  }

  // The first 4 active experiences are 100% immune from being omitted
  const protectedIndices = new Set(enabledIndices.slice(0, 4));

  // Evaluate experiences beyond the top 4 for pruning
  const droppable = candidateExperiences
    .map((exp, originalIdx) => {
      if (protectedIndices.has(originalIdx) || !exp.enabled) return null;
      const relScore = evaluateExperienceRelevance(exp, params.jobTitle, params.matchedKeywords, params.matchedTags);
      return { exp, originalIdx, relScore };
    })
    .filter((item): item is { exp: WorkExperience; originalIdx: number; relScore: number } => item !== null);

  // Sort lowest relevance first; if equal relevance, oldest (higher originalIdx) first
  droppable.sort((a, b) => a.relScore - b.relScore || b.originalIdx - a.originalIdx);

  for (const item of droppable) {
    const testCv: CVData = { ...currentCvData, experiences: candidateExperiences };
    if (calculateCvTotalHeightMm(testCv, lang) <= maxAllowedHeightMm) {
      break;
    }

    candidateExperiences = candidateExperiences.map((e, idx) => {
      if (idx === item.originalIdx) {
        omitted.push(e.roleTitle.en || e.roleTitle.cs || e.company);
        return { ...e, enabled: false };
      }
      return e;
    });
  }

  return { experiences: candidateExperiences, omitted };
}

function compressAndPruneExperiences(
  data: CVData,
  maxAllowedHeightMm: number,
  params: OptimizePageBudgetParams,
  auditNotes: string[]
): {
  data: CVData;
  trimmedBullets: number;
  omittedExp: string[];
  omittedProjectFallback: number;
} {
  let current = data;
  let trimmedBullets = 0;
  let omittedProjectFallback = 0;
  const lang = params.language || 'en';

  if (calculateCvTotalHeightMm(current, lang) > maxAllowedHeightMm) {
    const bMod = compressExperienceBullets(current.experiences, 'moderate');
    current = { ...current, experiences: bMod.experiences };
    trimmedBullets += bMod.trimmedBulletsCount;
  }

  if (calculateCvTotalHeightMm(current, lang) > maxAllowedHeightMm) {
    const bStrict = compressExperienceBullets(current.experiences, 'strict');
    current = { ...current, experiences: bStrict.experiences };
    trimmedBullets += bStrict.trimmedBulletsCount;
    if (trimmedBullets > 0) {
      auditNotes.push('Streamlined bullets to top relevant achievements (retaining min 2 bullets per role).');
    }
  }

  let omittedExp: string[] = [];
  if (calculateCvTotalHeightMm(current, lang) > maxAllowedHeightMm) {
    const expRes = pruneExperiencesByRelevance(current.experiences, current, maxAllowedHeightMm, params);
    current = { ...current, experiences: expRes.experiences };
    omittedExp = expRes.omitted;
    if (omittedExp.length > 0) {
      auditNotes.push(`Omitted ${omittedExp.length} older/less-relevant experience(s) to guarantee ${params.maxPages || 1}-page ATS fit.`);
    }
  }

  if (calculateCvTotalHeightMm(current, lang) > maxAllowedHeightMm && current.projects.some(p => p.enabled)) {
    current = { ...current, projects: current.projects.map(p => ({ ...p, enabled: false })) };
    omittedProjectFallback = 1;
    auditNotes.push('Omitted featured project to prioritize core professional employment history.');
  }

  if (calculateCvTotalHeightMm(current, lang) > maxAllowedHeightMm) {
    const bUltra = compressExperienceBulletsUltra(current.experiences);
    current = { ...current, experiences: bUltra.experiences };
    trimmedBullets += bUltra.trimmedBulletsCount;
  }

  return { data: current, trimmedBullets, omittedExp, omittedProjectFallback };
}


/**
 * Main Page Budget Optimizer:
 * Orchestrates multi-tier pruning cascade to guarantee strict single-page (or target-page) ATS layout,
 * followed by opportunistic recovery to maximize information density without leaving empty space.
 */
export function optimizeCVPageBudget(params: OptimizePageBudgetParams): {
  optimizedData: CVData;
  audit: PageBudgetAudit;
} {
  const { cvData, maxPages = 1, language = 'en' } = params;
  const maxAllowedHeightMm = maxPages * USABLE_PAGE_HEIGHT_MM;
  const originalHeightMm = Math.round(calculateCvTotalHeightMm(cvData, language));

  let currentData: CVData = { ...cvData };
  const auditNotes: string[] = [];

  // If already fits naturally, return without modifications
  if (originalHeightMm <= maxAllowedHeightMm) {
    return {
      optimizedData: currentData,
      audit: {
        originalHeightMm,
        optimizedHeightMm: originalHeightMm,
        maxAllowedHeightMm,
        targetPages: maxPages,
        wasCompacted: false,
        omittedExperiencesCount: 0,
        omittedExperiences: [],
        trimmedBulletsCount: 0,
        omittedProjectsCount: 0,
        omittedSkillCategoriesCount: 0,
        omittedEducationCount: 0,
        auditNotes: ['Document naturally fits within the target page limit.']
      }
    };
  }

  // Track originally enabled IDs so recovery never enables user-disabled items
  const originallyEnabledSkills = new Set(
    cvData.skillCategories.flatMap(c => c.skills.filter(s => s.enabled).map(s => s.id))
  );
  const originallyEnabledProjects = new Set(
    cvData.projects.filter(p => p.enabled).map(p => p.id)
  );
  const originallyEnabledEducation = new Set(
    cvData.education.filter(e => e.enabled).map(e => e.id)
  );
  const originallyEnabledBullets = new Set(
    cvData.experiences.flatMap(e => e.bullets.filter(b => b.enabled).map(b => b.id))
  );

  // PHASE 1: Progressive Pruning (only prune what is necessary to fit)
  if (calculateCvTotalHeightMm(currentData, language) > maxAllowedHeightMm) {
    const skillsRes = optimizeCompetencies(currentData.skillCategories, params.matchedKeywords, params.matchedTags);
    currentData = { ...currentData, skillCategories: skillsRes.optimized };
  }

  if (calculateCvTotalHeightMm(currentData, language) > maxAllowedHeightMm) {
    const eduRes = optimizeEducation(currentData.education, params.matchedKeywords, params.jobTitle);
    currentData = { ...currentData, education: eduRes.optimized };
  }

  if (calculateCvTotalHeightMm(currentData, language) > maxAllowedHeightMm) {
    const projRes = pruneSecondaryProjects(currentData.projects);
    currentData = { ...currentData, projects: projRes.projects };
  }

  let omittedExpList: string[] = [];
  if (calculateCvTotalHeightMm(currentData, language) > maxAllowedHeightMm) {
    const expResults = compressAndPruneExperiences(currentData, maxAllowedHeightMm, params, auditNotes);
    currentData = expResults.data;
    omittedExpList = expResults.omittedExp;
  }

  // PHASE 2: Space Maximization / Backfilling (fill leftover space efficiently!)
  currentData = backfillProjects(currentData, originallyEnabledProjects, maxAllowedHeightMm, language);
  currentData = backfillBullets(currentData, originallyEnabledBullets, maxAllowedHeightMm, language);
  currentData = backfillEducation(currentData, originallyEnabledEducation, maxAllowedHeightMm, language);
  currentData = backfillSkills(currentData, originallyEnabledSkills, maxAllowedHeightMm, language);

  const optimizedHeightMm = Math.round(calculateCvTotalHeightMm(currentData, language));

  const omittedProjectsTotal = cvData.projects.filter(p => p.enabled).length -
    currentData.projects.filter(p => p.enabled).length;

  const originalBulletsCount = cvData.experiences.flatMap(e => e.bullets).filter(b => b.enabled).length;
  const currentBulletsCount = currentData.experiences.flatMap(e => e.bullets).filter(b => b.enabled).length;
  const trimmedBulletsTotal = Math.max(0, originalBulletsCount - currentBulletsCount);

  const omittedEduTotal = cvData.education.filter(e => e.enabled).length -
    currentData.education.filter(e => e.enabled).length;

  const omittedSkillCatsTotal = cvData.skillCategories.filter(c => c.skills.some(s => s.enabled)).length -
    currentData.skillCategories.filter(c => c.skills.some(s => s.enabled)).length;

  return {
    optimizedData: currentData,
    audit: {
      originalHeightMm,
      optimizedHeightMm,
      maxAllowedHeightMm,
      targetPages: maxPages,
      wasCompacted: true,
      omittedExperiencesCount: omittedExpList.length,
      omittedExperiences: omittedExpList,
      trimmedBulletsCount: trimmedBulletsTotal,
      omittedProjectsCount: Math.max(0, omittedProjectsTotal),
      omittedSkillCategoriesCount: Math.max(0, omittedSkillCatsTotal),
      omittedEducationCount: Math.max(0, omittedEduTotal),
      auditNotes
    }
  };
}
