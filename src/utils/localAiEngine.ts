import { CVData, LanguageCode, CoverLetter, PDFMetadata } from '../types/cv';
import { performHybridSemanticMatch, ATSMatchResult } from './semanticSearch';

export interface LocalTailorOutput {
  matchResult: ATSMatchResult;
  coverLetter: CoverLetter;
  tailoredSummary: string;
  tailoredMetadata: PDFMetadata;
  updatedData: CVData;
}

/**
 * Synthesize a professional, ATS-optimized Cover Letter locally
 */
export function generateLocalCoverLetter(params: {
  candidateName: string;
  companyName: string;
  jobTitle: string;
  matchedTags: string[];
  matchedKeywords: string[];
  topBullets: string[];
  language?: LanguageCode;
}): { en: string; cs: string } {
  const { candidateName, companyName, jobTitle, matchedTags, matchedKeywords, topBullets } = params;
  const name = candidateName.trim() || 'Candidate';
  const company = companyName.trim() || 'Hiring Team';
  const role = jobTitle.trim() || 'Software Engineer';
  const tagList = matchedTags.map(t => t.toUpperCase()).join(' & ');
  const skillHighlight = matchedKeywords.slice(0, 5).join(', ') || 'modern software engineering best practices';

  const achievementParagraph = topBullets.length > 0
    ? `In my previous roles, I have delivered proven impact, including: ${topBullets.slice(0, 2).join(' Furthermore, ')}`
    : `Throughout my career, I have specialized in building resilient, high-performance web applications and scalable distributed systems using modern cloud tools.`;

  const en = `Dear Hiring Team at ${company},

I am writing to express my strong interest in the ${role} position. With comprehensive expertise in ${tagList} development—specifically leveraging ${skillHighlight}—I am confident in my ability to immediately deliver scalable, high-quality solutions for your engineering organization.

${achievementParagraph}

I am deeply drawn to ${company}'s technical vision and would welcome the opportunity to discuss how my proactive mindset, architectural discipline, and engineering background can contribute to your upcoming product milestones.

Sincerely,
${name}`;

  const cs = `Vážený hiring týme společnosti ${company},

obracím se na Vás s projevem velkého zájmu o pracovní pozici ${role}. Díky rozsáhlým zkušenostem v oblastech ${tagList} a praktickým znalostem ${skillHighlight} jsem připraven okamžitě přispět k úspěchu Vašich projektů.

${topBullets.length > 0 ? `Během své dosavadní praxe jsem dosáhl klíčových výsledků: ${topBullets.slice(0, 2).join(' ')}` : 'Mám za sebou úspěšné projekty zaměřené na vývoj spolehlivých aplikací a moderní cloudovou infrastrukturu.'}

Velmi mě oslovilo směřování společnosti ${company} a rád bych s Vámi osobně probral, jak mohu svými schopnostmi pomoci Vašemu týmu.

S pozdravem,
${name}`;

  return { en, cs };
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
    .flatMap(e => e.bullets.filter(b => b.enabled).map(b => b.text.en || ''))
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
  const kwString = matchResult.matchedKeywords.slice(0, 8).join(', ') || 'Software Development';

  const tailoredMetadata: PDFMetadata = {
    dc_title: `${candidateName} - ${primaryRole} Resume (${primaryCompany})`,
    dc_creator: candidateName,
    cp_keywords: `${kwString}, ${matchResult.matchedTags.join(', ')}`,
    cp_description: `ATS-optimized career portfolio and resume for ${primaryRole} position at ${primaryCompany}.`,
    cp_category: 'Curriculum Vitae / Resume'
  };

  const tailoredSummary = `Results-oriented ${primaryRole} with specialized expertise in ${matchResult.matchedTags.join(' & ')} and hands-on experience in ${kwString}. Proven history of delivering high-quality, scalable applications aligned with ATS standards.`;

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
