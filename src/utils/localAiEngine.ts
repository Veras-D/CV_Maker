import { CVData, LanguageCode, CoverLetter, PDFMetadata } from '../types/cv';
import { performHybridSemanticMatch, ATSMatchResult } from './semanticSearch';
import { formatTechnologyName, getDomainLabel } from './skillOntology';

export interface LocalTailorOutput {
  matchResult: ATSMatchResult;
  coverLetter: CoverLetter;
  tailoredSummary: string;
  tailoredMetadata: PDFMetadata;
  updatedData: CVData;
}

import { 
  synthesizeCoverLetter, 
  CoverLetterTone, 
  SynthesizerExperience 
} from './coverLetterSynthesizer';

export type { CoverLetterTone, SynthesizerExperience };
export { synthesizeCoverLetter };

/**
 * Synthesize a professional, ATS-optimized Cover Letter locally with dynamic narrative prose
 */
export function generateLocalCoverLetter(params: {
  candidateName: string;
  companyName: string;
  jobTitle: string;
  matchedTags: string[];
  matchedKeywords: string[];
  topBullets: string[];
  language?: LanguageCode;
  tone?: CoverLetterTone;
  seed?: number;
}): Record<string, string> {
  return synthesizeCoverLetter({
    candidateName: params.candidateName,
    companyName: params.companyName,
    jobTitle: params.jobTitle,
    matchedTags: params.matchedTags,
    matchedKeywords: params.matchedKeywords,
    experiences: [{
      role: params.jobTitle,
      company: params.companyName,
      bullets: params.topBullets
    }],
    tone: params.tone || 'professional',
    seed: params.seed ?? 0,
    language: params.language
  });
}

/**
 * Extract distinct, non-redundant technology keywords, avoiding terms that duplicate the role title.
 */
function extractDistinctKeywords(keywords: string[], primaryRole: string): string[] {
  const roleTokens = new Set(primaryRole.toLowerCase().split(/[\s/,-]+/).filter(w => w.length > 2));
  const genericTerms = new Set(['test', 'tester', 'testing', 'qa', 'quality', 'engineer', 'engineering', 'developer', 'development', 'software', 'lead']);
  
  const distinct: string[] = [];
  const seen = new Set<string>();

  for (const raw of keywords) {
    const formatted = formatTechnologyName(raw).trim();
    const lower = formatted.toLowerCase();
    
    if (seen.has(lower) || roleTokens.has(lower)) continue;
    if (genericTerms.has(lower) && distinct.length >= 3) continue;

    seen.add(lower);
    distinct.push(formatted);
    if (distinct.length >= 4) break;
  }

  return distinct;
}

/**
 * Format a list of items into natural language ("A, B, and C").
 */
function formatNaturalList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/**
 * Format domain labels into a natural phrase without chained ampersands.
 */
function formatDomainFocus(matchedTags: string[]): string {
  const validTags = matchedTags.slice(0, 2);
  if (validTags.length === 0) return 'software engineering';
  const labels = validTags.map(getDomainLabel);
  if (labels.length === 1) return labels[0];
  return `${labels[0]} and ${labels[1]}`;
}

/**
 * Synthesizes a natural, high-impact executive summary without ATS jargon or keyword stuffing.
 */
export function synthesizeExecutiveSummary(params: {
  cvData: CVData;
  primaryRole: string;
  matchedTags: string[];
  matchedKeywords: string[];
  language?: LanguageCode;
}): string {
  const { cvData, primaryRole, matchedTags, matchedKeywords, language = 'en' } = params;

  // Retrieve existing master summary
  const rawMaster = (cvData.profile.summary[language] || cvData.profile.summary.en || '').trim();
  // If the stored summary was contaminated by the old robotic template, ignore it
  const masterSummary = rawMaster.includes('aligned with ATS standards') ? '' : rawMaster;

  // If candidate has a genuine master summary, preserve their authentic experience and align the title
  if (masterSummary.length > 30) {
    const roleRegex = /^(Results-driven|Results-oriented|Experienced|Dedicated|Passionate|Senior|Junior|Lead)?\s*(Software Engineer|Full-Stack Engineer|Developer|Backend Engineer|Frontend Engineer|DevOps Engineer|QA Engineer|Software Tester|Specialist|Vývojář|Inženýr)\b/i;
    if (roleRegex.test(masterSummary)) {
      return masterSummary.replace(roleRegex, (_m, prefix) => prefix ? `${prefix} ${primaryRole}` : primaryRole);
    }
    return masterSummary;
  }

  const distinctKws = extractDistinctKeywords(matchedKeywords, primaryRole);
  const domainFocus = formatDomainFocus(matchedTags);
  const kwList = distinctKws.length > 0 ? formatNaturalList(distinctKws) : '';

  if (language === 'cs') {
    if (kwList) {
      return `${primaryRole} se specializací na ${domainFocus} a praktickými zkušenostmi s technologiemi ${kwList}. Zaměření na čistý kód, spolehlivost systémů a efektivní týmovou spolupráci.`;
    }
    return `${primaryRole} se specializací na ${domainFocus}. Prokazatelné výsledky při vývoji spolehlivých, škálovatelných aplikací a efektivní spolupráci v agilních týmech.`;
  }

  if (kwList) {
    return `Results-driven ${primaryRole} with specialized focus in ${domainFocus} and hands-on experience in ${kwList}. Proven track record of delivering resilient, high-quality software solutions and driving continuous improvement across engineering teams.`;
  }

  return `Results-driven ${primaryRole} with specialized focus in ${domainFocus}. Proven track record of delivering resilient, high-quality software solutions and driving continuous improvement across engineering teams.`;
}

/**
 * Execute 100% Local Multi-Stage AI Tailoring Engine
 */
export function runLocalAITailor(params: {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  cvData: CVData;
  language?: LanguageCode;
}): LocalTailorOutput {
  const { jobTitle, companyName, jobDescription, cvData, language = 'en' } = params;

  // 1. Stage 2: Semantic Hybrid RAG Match
  const matchResult = performHybridSemanticMatch({
    jobTitle,
    companyName,
    jobDescription,
    cvData
  });

  // Extract rich experiences for narrative synthesis
  const richExperiences: SynthesizerExperience[] = matchResult.rankedExperiences
    .filter(e => e.enabled)
    .map(e => ({
      role: e.roleTitle[language] || e.roleTitle.en || '',
      company: e.company || '',
      bullets: e.bullets.filter(b => b.enabled).map(b => b.text[language] || b.text.en || '').filter(Boolean)
    }))
    .filter(e => e.bullets.length > 0 || e.company);

  // 2. Stage 3: Local Synthesis
  const candidateName = cvData.profile.name || 'Candidate';
  const coverLetters = synthesizeCoverLetter({
    candidateName,
    companyName,
    jobTitle,
    matchedTags: matchResult.matchedTags,
    matchedKeywords: matchResult.matchedKeywords,
    experiences: richExperiences,
    tone: 'professional',
    seed: 0,
    language
  });

  const newCoverLetter: CoverLetter = {
    id: `cl-${Date.now()}`,
    jobTitle: jobTitle || 'Target Role',
    companyName: companyName || 'Target Company',
    date: new Date().toISOString().slice(0, 10),
    language,
    content: coverLetters
  };
  const primaryRole = jobTitle || 'Software Engineer';
  const primaryCompany = companyName || 'Application';
  const kwString = matchResult.matchedKeywords.slice(0, 8).map(formatTechnologyName).join(', ') || 'Software Development';

  const tailoredMetadata: PDFMetadata = {
    dc_title: `${candidateName} - ${primaryRole} Resume (${primaryCompany})`,
    dc_creator: candidateName,
    cp_keywords: `${kwString}, ${matchResult.matchedTags.join(', ')}`,
    cp_description: `Professional career portfolio and resume for ${primaryRole} position at ${primaryCompany}.`,
    cp_category: 'Curriculum Vitae / Resume'
  };

  const tailoredSummary = synthesizeExecutiveSummary({
    cvData,
    primaryRole,
    matchedTags: matchResult.matchedTags,
    matchedKeywords: matchResult.matchedKeywords,
    language
  });

  const tailoredHeadline = primaryRole;
  const updatedData: CVData = {
    ...cvData,
    profile: {
      ...cvData.profile,
      headline: {
        ...cvData.profile.headline,
        [language]: tailoredHeadline,
        en: tailoredHeadline
      },
      summary: {
        ...cvData.profile.summary,
        [language]: tailoredSummary,
        en: tailoredSummary
      }
    },
    experiences: matchResult.rankedExperiences,
    skillCategories: matchResult.rankedSkills,
    projects: matchResult.rankedProjects,
    coverLetters: [newCoverLetter, ...cvData.coverLetters]
  };

  return {
    matchResult,
    coverLetter: newCoverLetter,
    tailoredSummary,
    tailoredMetadata,
    updatedData
  };
}
