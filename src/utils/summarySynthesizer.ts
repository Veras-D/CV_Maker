import { CVData, LanguageCode } from '../types/cv';
import { formatTechnologyName, getDomainLabel } from './skillOntology';

export type ExecutiveSummaryStyle = 'authentic' | 'technical' | 'impact';

export interface SummarySynthesizerParams {
  cvData: CVData;
  jobTitle: string;
  matchedTags: string[];
  matchedKeywords: string[];
  language?: LanguageCode;
}

/**
 * Clean noisy job titles (e.g. parentheticals, locations, hiring codes, trailing departments).
 * Example: "Senior Backend Engineer (Go/Kubernetes, Remote - US) - Payments" -> "Senior Backend Engineer"
 */
export function cleanJobTitle(rawTitle: string): string {
  if (!rawTitle || typeof rawTitle !== 'string') return 'Software Engineer';

  // 1. Strip parentheticals, square brackets, and curly brackets
  let cleaned = rawTitle
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\{[^}]*\}/g, ' ');

  // 2. Strip common trailing work mode / location indicators
  cleaned = cleaned.replace(
    /\s*[-|–—:/]\s*(remote|hybrid|on-site|onsite|emea|us|eu|uk|prague|berlin|london|full[- ]time|part[- ]time|contract|permanent|relocation)\b.*$/i,
    ''
  );

  // 3. If there is a delimiter (e.g., " - " or " | "), check if first part is a complete title
  const delimiterMatch = cleaned.match(/^(.+?)\s+[-|–—|]\s+(.+)$/);
  if (delimiterMatch) {
    const firstPart = delimiterMatch[1].trim();
    if (/\b(engineer|developer|architect|lead|manager|designer|specialist|consultant|tester|qa|programmer|inženýr|vývojář)\b/i.test(firstPart)) {
      cleaned = firstPart;
    }
  }

  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned.length >= 2 ? cleaned : (rawTitle.trim() || 'Software Engineer');
}

/**
 * Estimate career tenure in years by examining start dates in candidate experiences.
 */
export function estimateCareerYears(cvData: CVData): number {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];

  for (const exp of cvData.experiences || []) {
    if (exp.enabled === false) continue;
    const match = exp.startDate?.match(/\b(19\d{2}|20\d{2})\b/);
    if (match) {
      const y = parseInt(match[1], 10);
      if (y >= 1980 && y <= currentYear) {
        years.push(y);
      }
    }
  }

  if (years.length === 0) return 0;
  const earliestYear = Math.min(...years);
  const diff = currentYear - earliestYear;
  return Math.max(1, Math.min(diff, 40));
}

function addCategorySkills(inventory: Set<string>, categories?: CVData['skillCategories']): void {
  categories?.forEach(cat => {
    cat.skills?.forEach(sk => {
      if (sk.name) inventory.add(sk.name.toLowerCase().trim());
      sk.tags?.forEach(t => inventory.add(t.toLowerCase().trim()));
    });
  });
}

function addExperienceAndProjectTags(
  inventory: Set<string>,
  experiences?: CVData['experiences'],
  projects?: CVData['projects']
): void {
  experiences?.forEach(exp => exp.tags?.forEach(t => inventory.add(t.toLowerCase().trim())));
  projects?.forEach(proj => {
    proj.techStack?.forEach(ts => inventory.add(ts.toLowerCase().trim()));
    proj.tags?.forEach(t => inventory.add(t.toLowerCase().trim()));
  });
}

function collectCandidateInventory(cvData: CVData): Set<string> {
  const inventory = new Set<string>();
  addCategorySkills(inventory, cvData.skillCategories);
  addExperienceAndProjectTags(inventory, cvData.experiences, cvData.projects);
  return inventory;
}

function isInventoryMatch(lower: string, inventory: Set<string>): boolean {
  if (inventory.has(lower)) return true;
  for (const item of inventory) {
    if (item.includes(lower) || lower.includes(item)) return true;
  }
  return false;
}

function fallbackKeywords(
  rawKeywords: string[],
  excluded: Set<string>,
  seen: Set<string>
): string[] {
  const fallback: string[] = [];
  for (const raw of rawKeywords) {
    const formatted = formatTechnologyName(raw).trim();
    const lower = formatted.toLowerCase();
    if (seen.has(lower) || excluded.has(lower)) continue;
    seen.add(lower);
    fallback.push(formatted);
    if (fallback.length >= 3) break;
  }
  return fallback;
}

/**
 * Extract matched technologies that are genuinely verified in the candidate's CV.
 */
export function getCandidateMatchedSkills(
  cvData: CVData,
  matchedKeywords: string[],
  targetRole: string
): string[] {
  const roleTokens = new Set(
    targetRole.toLowerCase().split(/[\s/,-]+/).filter(w => w.length > 2)
  );
  const genericTerms = new Set([
    'test', 'tester', 'testing', 'qa', 'quality', 'engineer', 'engineering',
    'developer', 'development', 'software', 'lead', 'senior', 'junior', 'staff'
  ]);
  const inventory = collectCandidateInventory(cvData);
  const verified: string[] = [];
  const seen = new Set<string>();

  for (const raw of matchedKeywords) {
    const formatted = formatTechnologyName(raw).trim();
    const lower = formatted.toLowerCase();
    if (seen.has(lower) || roleTokens.has(lower) || genericTerms.has(lower)) continue;

    if (isInventoryMatch(lower, inventory)) {
      seen.add(lower);
      verified.push(formatted);
      if (verified.length >= 4) break;
    }
  }

  if (verified.length === 0) {
    const excluded = new Set([...roleTokens, ...genericTerms]);
    return fallbackKeywords(matchedKeywords, excluded, seen);
  }

  return verified;
}

function formatNaturalList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function formatDomainFocus(matchedTags: string[]): string {
  const validTags = matchedTags.slice(0, 2);
  if (validTags.length === 0) return 'software engineering';
  const labels = validTags.map(getDomainLabel);
  if (labels.length === 1) return labels[0];
  return `${labels[0]} and ${labels[1]}`;
}

interface SummaryBuilderProps {
  style: ExecutiveSummaryStyle;
  cleanRole: string;
  tenure: number;
  domainFocus: string;
  kwList: string;
}

function buildEnglishSummary(props: SummaryBuilderProps): string {
  const { style, cleanRole, tenure, domainFocus, kwList } = props;
  const tenureYears = tenure > 0 ? ` with ${tenure}+ years of experience` : '';
  const kwPhrase = kwList ? ` and core expertise in ${kwList}` : '';
  const kwTech = kwList ? `, with hands-on proficiency across ${kwList}` : '';
  const kwImpact = kwList ? `, leveraging ${kwList}` : '';

  if (style === 'technical') {
    const tenureTech = tenure > 0 ? ` with ${tenure}+ years of technical depth` : '';
    return `Seasoned ${cleanRole}${tenureTech} specializing in ${domainFocus}${kwTech}. Focused on architecting resilient distributed systems, enforcing code quality, and driving engineering excellence across the full development lifecycle.`;
  }

  if (style === 'impact') {
    return `Impact-focused ${cleanRole}${tenureYears} driving product velocity and technical ownership in ${domainFocus}${kwImpact}. Proven track record of scaling mission-critical platforms, accelerating delivery cycles, and translating complex requirements into tangible outcomes.`;
  }

  return `Results-driven ${cleanRole}${tenureYears} specializing in ${domainFocus}${kwPhrase}. Proven track record of delivering resilient, high-quality software solutions and driving continuous improvement across engineering teams.`;
}

function buildCzechSummary(props: SummaryBuilderProps): string {
  const { style, cleanRole, tenure, domainFocus, kwList } = props;
  const yearsCs = tenure === 1 ? '1 rokem' : `${tenure} lety`;
  const tenurePhrase = tenure > 0 ? ` s více než ${yearsCs} zkušeností` : '';
  const kwPhrase = kwList ? ` a praktickými zkušenostmi s technologiemi ${kwList}` : '';

  if (style === 'technical') {
    const techTenure = tenure > 0 ? ` s více než ${yearsCs} technické praxe` : '';
    return `${cleanRole}${techTenure} se zaměřením na ${domainFocus}${kwPhrase}. Důraz na architekturu odolných systémů, čistý kód a vysokou spolehlivost řešení v celém životním cyklu vývoje.`;
  }

  if (style === 'impact') {
    return `${cleanRole} orientovaný na výsledky${tenurePhrase} v oblasti ${domainFocus}${kwPhrase}. Prokazatelné výsledky při dodávání klíčových produktů, optimalizaci procesů a mezioborové spolupráci.`;
  }

  return `${cleanRole}${tenurePhrase} se specializací na ${domainFocus}${kwPhrase}. Prokazatelné výsledky při vývoji spolehlivých, škálovatelných aplikací a efektivní spolupráci v agilních týmech.`;
}

/**
 * Synthesizes a natural, role-tailored summary by style archetype.
 */
export function synthesizeExecutiveSummaryByStyle(
  style: ExecutiveSummaryStyle,
  params: SummarySynthesizerParams
): string {
  const { cvData, jobTitle, matchedTags, matchedKeywords, language = 'en' } = params;
  const rawMaster = (cvData.profile.summary[language] || cvData.profile.summary.en || '').trim();
  const masterSummary = rawMaster.includes('aligned with ATS standards') ? '' : rawMaster;

  // Authentic style strictly preserves candidate's authentic master summary if one exists
  if (style === 'authentic' && masterSummary.length > 20) {
    return masterSummary;
  }

  const cleanRole = cleanJobTitle(jobTitle);
  const tenure = estimateCareerYears(cvData);
  const matchedSkills = getCandidateMatchedSkills(cvData, matchedKeywords, cleanRole);
  const domainFocus = formatDomainFocus(matchedTags);
  const kwList = matchedSkills.length > 0 ? formatNaturalList(matchedSkills) : '';

  const builderProps: SummaryBuilderProps = { style, cleanRole, tenure, domainFocus, kwList };

  if (language === 'cs') {
    return buildCzechSummary(builderProps);
  }

  return buildEnglishSummary(builderProps);
}

/**
 * Generate all three executive summary variants for 1-click switching.
 */
export function generateExecutiveSummaryVariants(
  params: SummarySynthesizerParams
): Record<ExecutiveSummaryStyle, string> {
  return {
    authentic: synthesizeExecutiveSummaryByStyle('authentic', params),
    technical: synthesizeExecutiveSummaryByStyle('technical', params),
    impact: synthesizeExecutiveSummaryByStyle('impact', params)
  };
}

/**
 * Synthesize executive summary with backwards-compatible signature.
 */
export function synthesizeExecutiveSummary(params: {
  cvData: CVData;
  primaryRole?: string;
  jobTitle?: string;
  matchedTags: string[];
  matchedKeywords: string[];
  language?: LanguageCode;
  style?: ExecutiveSummaryStyle;
}): string {
  const effectiveRole = params.jobTitle || params.primaryRole || 'Software Engineer';
  return synthesizeExecutiveSummaryByStyle(params.style || 'authentic', {
    cvData: params.cvData,
    jobTitle: effectiveRole,
    matchedTags: params.matchedTags,
    matchedKeywords: params.matchedKeywords,
    language: params.language
  });
}
