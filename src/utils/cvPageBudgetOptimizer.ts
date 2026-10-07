import { 
  CVData, 
  LanguageCode, 
  WorkExperience, 
  WorkBullet, 
  ProjectItem, 
  SkillCategory, 
  EducationItem 
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

/**
 * Parses duration in years from dates string and evaluates college/degree seniority
 */
function evaluateEducationSeniority(edu: EducationItem): number {
  const dates = edu.dates || '';
  const years = dates.match(/\b(19\d\d|20\d\d)\b/g);
  let duration = 1;
  if (years && years.length >= 2) {
    const start = parseInt(years[0], 10);
    const end = parseInt(years[years.length - 1], 10);
    if (end >= start) duration = Math.max(1, end - start);
  } else if (years && years.length === 1) {
    duration = 2;
  }

  const instLower = edu.institution.toLowerCase();
  const progLower = `${edu.program.en || ''} ${edu.program.cs || ''}`.toLowerCase();
  let degreeBonus = 0;
  if (/university|univerzita|college|vysoká škola/i.test(instLower)) degreeBonus += 3;
  if (/master|mgr|ing|phd|bachelor|bc|b\.sc|m\.sc/i.test(progLower)) degreeBonus += 3;

  return duration + degreeBonus;
}

function evaluateEducationRelevance(edu: EducationItem, matchedKeywords: string[], jobTitle: string): number {
  const progLower = `${edu.program.en || ''} ${edu.program.cs || ''}`.toLowerCase();
  const jtLower = jobTitle.toLowerCase();
  let score = 0;
  if (/computer|software|informatics|informatika|engineering|technology/i.test(progLower)) {
    score += 4;
  }
  matchedKeywords.forEach(kw => {
    if (progLower.includes(kw)) score += 1;
  });
  if (jtLower.includes('engineer') && progLower.includes('engineer')) score += 2;
  return score;
}

/**
 * Filter education to at most 2 items: longest duration + most relevant
 */
function optimizeEducation(
  education: EducationItem[],
  matchedKeywords: string[],
  jobTitle: string
): { optimized: EducationItem[]; omittedCount: number } {
  const active = education.filter(e => e.enabled);
  if (active.length <= 2) {
    return { optimized: education, omittedCount: 0 };
  }

  const scored = active.map(edu => {
    const seniority = evaluateEducationSeniority(edu);
    const relevance = evaluateEducationRelevance(edu, matchedKeywords, jobTitle);
    const compositeScore = (seniority * 2) + (relevance * 4);
    return { edu, compositeScore };
  });

  scored.sort((a, b) => b.compositeScore - a.compositeScore);
  const retainedIds = new Set(scored.slice(0, 2).map(s => s.edu.id));

  const optimized = education.map(edu => ({
    ...edu,
    enabled: retainedIds.has(edu.id)
  }));

  return { optimized, omittedCount: active.length - 2 };
}

/**
 * Enforces minimum 3 skills per competence category
 */
function optimizeCompetencies(
  skillCategories: SkillCategory[],
  _matchedKeywords: string[],
  _matchedTags: string[]
): { optimized: SkillCategory[]; omittedCategoriesCount: number } {
  let omittedCategoriesCount = 0;

  const optimized = skillCategories.map(cat => {
    const activeSkills = cat.skills.filter(s => s.enabled);
    if (activeSkills.length < 3) {
      omittedCategoriesCount++;
      return {
        ...cat,
        skills: cat.skills.map(s => ({ ...s, enabled: false }))
      };
    }
    return cat;
  });

  return { optimized, omittedCategoriesCount };
}

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
 * Keeps at least 1 project if possible; disables secondary projects
 */
function pruneSecondaryProjects(
  projects: ProjectItem[]
): { projects: ProjectItem[]; omittedProjectsCount: number } {
  const active = projects.filter(p => p.enabled);
  if (active.length <= 1) return { projects, omittedProjectsCount: 0 };

  let keptOne = false;
  let omittedProjectsCount = 0;

  const updated = projects.map(p => {
    if (!p.enabled) return p;
    if (!keptOne) {
      keptOne = true;
      return p;
    }
    omittedProjectsCount++;
    return { ...p, enabled: false };
  });

  return { projects: updated, omittedProjectsCount };
}

/**
 * Selects candidate experiences beyond the top 2 for pruning based on low relevance
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

  // Evaluate experiences at index >= 2 (Jobs 0 & 1 are 100% IMMUNE)
  const droppable = candidateExperiences
    .map((exp, originalIdx) => {
      if (originalIdx < 2 || !exp.enabled) return null;
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

  return { data: current, trimmedBullets, omittedExp, omittedProjectFallback };
}

/**
 * Main Page Budget Optimizer:
 * Orchestrates multi-tier pruning cascade to guarantee strict single-page (or target-page) ATS layout.
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
  let omittedProjectsTotal = 0;

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

  // Step 1: Competencies (Filter categories with < 3 skills)
  const skillsRes = optimizeCompetencies(currentData.skillCategories, params.matchedKeywords, params.matchedTags);
  currentData = { ...currentData, skillCategories: skillsRes.optimized };
  const omittedSkillCatsTotal = skillsRes.omittedCategoriesCount;
  if (omittedSkillCatsTotal > 0) {
    auditNotes.push(`Omitted ${omittedSkillCatsTotal} skill categories with fewer than 3 relevant skills.`);
  }

  // Step 2: Education (Keep top 2: longest duration + most relevant)
  const eduRes = optimizeEducation(currentData.education, params.matchedKeywords, params.jobTitle);
  currentData = { ...currentData, education: eduRes.optimized };
  const omittedEduTotal = eduRes.omittedCount;
  if (omittedEduTotal > 0) {
    auditNotes.push(`Prioritized top 2 academic credentials; omitted ${omittedEduTotal} secondary education entry.`);
  }

  // Step 3: Projects (Keep at least 1 project; trim secondary projects)
  if (calculateCvTotalHeightMm(currentData, language) > maxAllowedHeightMm) {
    const projRes = pruneSecondaryProjects(currentData.projects);
    currentData = { ...currentData, projects: projRes.projects };
    omittedProjectsTotal = projRes.omittedProjectsCount;
    if (omittedProjectsTotal > 0) {
      auditNotes.push(`Preserved #1 best-matched project and trimmed ${omittedProjectsTotal} secondary projects.`);
    }
  }

  // Steps 4-7: Bullets and Experiences pruning
  const expResults = compressAndPruneExperiences(currentData, maxAllowedHeightMm, params, auditNotes);
  currentData = expResults.data;
  const trimmedBulletsTotal = expResults.trimmedBullets;
  const omittedExpList = expResults.omittedExp;
  omittedProjectsTotal += expResults.omittedProjectFallback;

  const optimizedHeightMm = Math.round(calculateCvTotalHeightMm(currentData, language));

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
      omittedProjectsCount: omittedProjectsTotal,
      omittedSkillCategoriesCount: omittedSkillCatsTotal,
      omittedEducationCount: omittedEduTotal,
      auditNotes
    }
  };
}
