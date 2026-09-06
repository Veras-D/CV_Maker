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

/**
 * Format bullet list cleanly for cover letters
 */
function formatBulletList(bullets: string[]): string {
  if (bullets.length === 0) return '';
  return bullets.map(b => `• ${b}`).join('\n');
}

/**
 * Synthesize a professional, ATS-optimized Cover Letter locally in English
 */
export function generateLocalCoverLetter(params: {
  candidateName: string;
  companyName: string;
  jobTitle: string;
  matchedTags: string[];
  matchedKeywords: string[];
  topBullets: string[];
  language?: LanguageCode;
}): Record<string, string> {
  const { candidateName, companyName, jobTitle, matchedTags, matchedKeywords, topBullets } = params;
  const name = candidateName.trim() || 'Candidate';
  const company = companyName.trim() || 'Hiring Team';
  const role = jobTitle.trim() || 'Software Engineer';
  
  const domainText = matchedTags.slice(0, 2).map(getDomainLabel).join(' & ') || 'Software Engineering';
  const skillHighlight = matchedKeywords.slice(0, 5).map(formatTechnologyName).join(', ') || 'modern software engineering practices';
  const validBullets = topBullets.filter(Boolean).slice(0, 2);

  const impactSection = validBullets.length > 0
    ? `Key achievements and technical contributions relevant to this role:\n${formatBulletList(validBullets)}`
    : `Throughout my career, I have specialized in building resilient, high-performance applications and scalable distributed systems using modern industry standards.`;

  const letterText = `Dear Hiring Team at ${company},

I am writing to express my strong interest in the ${role} position. With comprehensive expertise in ${domainText}—specifically leveraging ${skillHighlight}—I am confident in my ability to immediately deliver scalable, high-quality solutions for your team.

${impactSection}

I am deeply drawn to ${company}'s technical vision and would welcome the opportunity to discuss how my engineering background, proactive mindset, and architectural discipline can contribute to your upcoming product milestones.

Sincerely,
${name}`;

  return {
    en: letterText,
    [params.language || 'en']: letterText
  };
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

  // Extract top matching bullets for cover letter synthesis
  const topBullets = matchResult.rankedExperiences
    .filter(e => e.enabled)
    .flatMap(e => e.bullets.filter(b => b.enabled).map(b => b.text[language] || b.text.en || ''))
    .filter(Boolean)
    .slice(0, 3);

  // 2. Stage 3: Local Synthesis
  const candidateName = cvData.profile.name || 'Candidate';
  const coverLetters = generateLocalCoverLetter({
    candidateName,
    companyName,
    jobTitle,
    matchedTags: matchResult.matchedTags,
    matchedKeywords: matchResult.matchedKeywords,
    topBullets,
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
  const domainString = matchResult.matchedTags.map(getDomainLabel).join(' & ');

  const tailoredMetadata: PDFMetadata = {
    dc_title: `${candidateName} - ${primaryRole} Resume (${primaryCompany})`,
    dc_creator: candidateName,
    cp_keywords: `${kwString}, ${matchResult.matchedTags.join(', ')}`,
    cp_description: `ATS-optimized career portfolio and resume for ${primaryRole} position at ${primaryCompany}.`,
    cp_category: 'Curriculum Vitae / Resume'
  };

  const tailoredSummary = `Results-oriented ${primaryRole} with specialized expertise in ${domainString} and hands-on experience in ${kwString}. Proven history of delivering high-quality, scalable applications aligned with ATS standards.`;

  const updatedData: CVData = {
    ...cvData,
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
