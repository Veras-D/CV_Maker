import { EducationItem, ProjectItem, SkillCategory } from '../types/cv';

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
export function optimizeEducation(
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
export function optimizeCompetencies(
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
 * Keeps at least 1 project if possible; disables secondary projects
 */
export function pruneSecondaryProjects(
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
