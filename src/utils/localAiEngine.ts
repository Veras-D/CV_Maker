import { CVData, LanguageCode, CoverLetter, PDFMetadata } from '../types/cv';
import { performHybridSemanticMatch, ATSMatchResult } from './semanticSearch';
import { formatTechnologyName } from './skillOntology';
import { 
  ExecutiveSummaryStyle,
  cleanJobTitle,
  estimateCareerYears,
  getCandidateMatchedSkills,
  synthesizeExecutiveSummary,
  generateExecutiveSummaryVariants
} from './summarySynthesizer';

export interface LocalTailorOutput {
  matchResult: ATSMatchResult;
  coverLetter: CoverLetter;
  tailoredSummary: string;
  summaryVariants?: Record<ExecutiveSummaryStyle, string>;
  tailoredMetadata: PDFMetadata;
  updatedData: CVData;
}

import { 
  synthesizeCoverLetter, 
  CoverLetterTone, 
  SynthesizerExperience 
} from './coverLetterSynthesizer';

export type { CoverLetterTone, SynthesizerExperience, ExecutiveSummaryStyle };
export { 
  synthesizeCoverLetter,
  cleanJobTitle, 
  estimateCareerYears, 
  getCandidateMatchedSkills, 
  synthesizeExecutiveSummary, 
  generateExecutiveSummaryVariants 
};



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

  // Extract rich experiences for narrative synthesis (English)
  const richExperiences: SynthesizerExperience[] = matchResult.rankedExperiences
    .filter(e => e.enabled)
    .map(e => ({
      role: e.roleTitle.en || e.roleTitle[language] || '',
      company: e.company || '',
      bullets: e.bullets.filter(b => b.enabled).map(b => b.text.en || b.text[language] || '').filter(Boolean)
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
    language: 'en'
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

  const summaryVariants = generateExecutiveSummaryVariants({
    cvData,
    jobTitle: primaryRole,
    matchedTags: matchResult.matchedTags,
    matchedKeywords: matchResult.matchedKeywords,
    language
  });
  const tailoredSummary = summaryVariants.authentic;

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
    summaryVariants,
    tailoredMetadata,
    updatedData
  };
}
