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
