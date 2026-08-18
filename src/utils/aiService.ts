import { CVData, LanguageCode, CoverLetter } from '../types/cv';

export interface AITailorResult {
  matchedTags: string[];
  recommendedPresetName: string;
  coverLetter: CoverLetter;
  updatedData: CVData;
}

export interface TailorJobParams {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  cvData: CVData;
  language?: LanguageCode;
}

const KEYWORD_MAP: Record<string, string[]> = {
  devops: ['devops', 'docker', 'terraform', 'aws', 'kubernetes', 'ci/cd', 'github actions', 'linux', 'bash', 'cloud', 'infrastructure', 'iac'],
  fullstack: ['fullstack', 'full-stack', 'react', 'typescript', 'node', 'express', 'web application', 'api'],
  backend: ['backend', 'node.js', 'spring boot', 'express', 'postgresql', 'mongodb', 'mysql', 'redis', 'java', 'c#', '.net', 'python', 'jwt', 'rest api', 'microservices'],
  frontend: ['frontend', 'react', 'tailwind', 'css', 'html', 'ui', 'ux', 'figma', 'next.js', 'angular', 'javascript', 'jest'],
  management: ['lead', 'manager', 'mentor', 'management', 'agile', 'scrum', 'jira', 'scrum master', 'team lead', 'volunteer']
};

function extractMatchedTags(jdText: string): string[] {
  const jdLower = jdText.toLowerCase();
  const tagScores: Record<string, number> = {};

  Object.entries(KEYWORD_MAP).forEach(([tag, keywords]) => {
    let score = 0;
    keywords.forEach(kw => {
      if (jdLower.includes(kw)) score += 2;
    });
    tagScores[tag] = score;
  });

  const sortedTags = Object.keys(tagScores)
    .filter(tag => tagScores[tag] > 0)
    .sort((a, b) => (tagScores[b] || 0) - (tagScores[a] || 0));

  return sortedTags.length > 0 ? sortedTags : ['fullstack'];
}

async function requestLocalOllama(endpoint: string, model: string, prompt: string): Promise<string | null> {
  try {
    const response = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false })
    });
    if (!response.ok) return null;
    const json = await response.json();
    return json.response || null;
  } catch {
    return null;
  }
}

function buildCoverLetterText(
  companyName: string,
  jobTitle: string,
  matchedTags: string[],
  name: string
): { en: string; cs: string } {
  const en = `Dear Hiring Team at ${companyName || 'the Company'},

I am writing to express my enthusiastic interest in the ${jobTitle || 'Software Engineer'} role. With strong technical expertise in ${matchedTags.map(t => t.toUpperCase()).join(', ')} development and a proven track record of building reliable, scalable systems, I am eager to contribute to your team.

In my recent positions, I have successfully engineered scalable web applications, designed containerized infrastructure pipelines (Docker, GitHub Actions, AWS), and built robust RESTful APIs using TypeScript, React, Node.js, and Python. My background allows me to deliver high-quality code while ensuring operational efficiency.

I would welcome the opportunity to discuss how my technical skills and proactive mindset align with ${companyName || 'your company'}'s engineering goals.

Sincerely,
${name}`;

  const cs = `Vážený hiring týme společnosti ${companyName || 'společnosti'},

píši Vám ohledně svého zájmu o pozici ${jobTitle || 'Software Engineer'}. S rozsáhlými technickými zkušenostmi v oblastech ${matchedTags.map(t => t.toUpperCase()).join(', ')} a prokazatelnými výsledky při tvorbě spolehlivých systémů bych rád přispěl k úspěchu Vašeho týmu.

V předchozích rolích jsem se zaměřoval na vývoj webových aplikací v Reactu, TypeScriptu a Node.js, automatizaci CI/CD pipelines (Docker, GitHub Actions) a vývoj mikroslužeb.

Těším se na možnost osobně projednat mé zapojení do Vašeho týmu.

S pozdravem,
${name}`;

  return { en, cs };
}

export async function processAiJobTailoring(params: TailorJobParams): Promise<AITailorResult> {
  const { jobTitle, companyName, jobDescription, cvData, language = 'en' } = params;
  const matchedTags = extractMatchedTags(`${jobTitle} ${companyName} ${jobDescription}`);

  // Update experiences, skills, and projects
  const updatedExperiences = cvData.experiences.map(exp => ({
    ...exp,
    enabled: exp.tags.some(t => matchedTags.includes(t)) || matchedTags.includes('fullstack'),
    bullets: exp.bullets.map(b => ({
      ...b,
      enabled: b.tags.some(t => matchedTags.includes(t)) || matchedTags.length === 0
    }))
  }));

  const updatedSkills = cvData.skillCategories.map(cat => ({
    ...cat,
    skills: cat.skills.map(s => ({
      ...s,
      enabled: s.tags.some(t => matchedTags.includes(t)) || matchedTags.length === 0
    }))
  }));

  const updatedProjects = cvData.projects.map(p => ({
    ...p,
    enabled: p.tags.some(t => matchedTags.includes(t)) || matchedTags.length === 0
  }));

  let coverLetters = buildCoverLetterText(companyName, jobTitle, matchedTags, cvData.profile.name);

  if (cvData.aiConfig.provider === 'ollama') {
    const prompt = `Write a professional 3-paragraph cover letter for Vivi Veras applying for ${jobTitle} at ${companyName}. Highlight skills in ${matchedTags.join(', ')}. Keep it concise.`;
    const ollamaResponse = await requestLocalOllama(cvData.aiConfig.endpoint, cvData.aiConfig.modelName, prompt);
    if (ollamaResponse) {
      coverLetters = { en: ollamaResponse, cs: ollamaResponse };
    }
  }

  const newCoverLetter: CoverLetter = {
    id: `cl-${Date.now()}`,
    jobTitle: jobTitle || 'Target Role',
    companyName: companyName || 'Target Company',
    date: new Date().toISOString().slice(0, 10),
    language: language,
    content: coverLetters
  };

  const updatedMetadata = {
    dc_title: `${cvData.profile.name} - ${jobTitle || 'Resume'} (${companyName || 'Application'})`,
    dc_creator: cvData.profile.name,
    cp_keywords: `${matchedTags.join(', ')}, TypeScript, React, DevOps, Resume`,
    cp_description: `Tailored application for ${jobTitle} at ${companyName}`,
    cp_category: 'Resume & Cover Letter'
  };

  const updatedData: CVData = {
    ...cvData,
    experiences: updatedExperiences,
    skillCategories: updatedSkills,
    projects: updatedProjects,
    coverLetters: [newCoverLetter, ...cvData.coverLetters],
    presets: cvData.presets.map(p => 
      p.id === cvData.activePresetId ? {
        ...p,
        activeTags: matchedTags,
        metadata: updatedMetadata
      } : p
    )
  };

  return {
    matchedTags,
    recommendedPresetName: `Tailored: ${jobTitle} @ ${companyName}`,
    coverLetter: newCoverLetter,
    updatedData
  };
}
