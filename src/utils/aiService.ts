import { CVData, AiConfig, LanguageCode, CoverLetter } from '../types/cv';

export interface AITailorResult {
  matchedTags: string[];
  recommendedPresetName: string;
  coverLetter: CoverLetter;
  updatedData: CVData;
}

export async function processAiJobTailoring(
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  cvData: CVData,
  language: LanguageCode = 'en'
): Promise<AITailorResult> {
  const jdLower = (jobTitle + ' ' + companyName + ' ' + jobDescription).toLowerCase();

  // Keyword extraction map
  const keywordMap: { [tag: string]: string[] } = {
    devops: ['devops', 'docker', 'terraform', 'aws', 'kubernetes', 'ci/cd', 'github actions', 'linux', 'bash', 'cloud', 'infrastructure', 'iac'],
    fullstack: ['fullstack', 'full-stack', 'react', 'typescript', 'node', 'express', 'web application', 'api'],
    backend: ['backend', 'node.js', 'spring boot', 'express', 'postgresql', 'mongodb', 'mysql', 'redis', 'java', 'c#', '.net', 'python', 'jwt', 'rest api', 'microservices'],
    frontend: ['frontend', 'react', 'tailwind', 'css', 'html', 'ui', 'ux', 'figma', 'next.js', 'angular', 'javascript', 'jest'],
    management: ['lead', 'manager', 'mentor', 'management', 'agile', 'scrum', 'jira', 'scrum master', 'team lead', 'volunteer']
  };

  // Score each tag based on keyword frequency in JD
  const tagScores: { [tag: string]: number } = {};
  Object.keys(keywordMap).forEach(tag => {
    let score = 0;
    keywordMap[tag].forEach(kw => {
      if (jdLower.includes(kw)) {
        score += 2;
      }
    });
    tagScores[tag] = score;
  });

  // Sort tags by relevance
  const sortedTags = Object.keys(tagScores)
    .filter(tag => tagScores[tag] > 0)
    .sort((a, b) => tagScores[b] - a[b]);

  const matchedTags = sortedTags.length > 0 ? sortedTags : ['fullstack'];

  // Update experiences, skills, and projects based on relevance
  const updatedExperiences = cvData.experiences.map(exp => {
    const isRoleMatched = exp.tags.some(t => matchedTags.includes(t));
    return {
      ...exp,
      enabled: isRoleMatched || matchedTags.includes('fullstack'),
      bullets: exp.bullets.map(b => ({
        ...b,
        enabled: b.tags.some(t => matchedTags.includes(t)) || matchedTags.length === 0
      }))
    };
  });

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

  // Generate Cover Letter Content (Local Model / Heuristic)
  let coverLetterTextEn = '';
  let coverLetterTextCs = '';

  // Check if local Ollama endpoint is active
  let usedLocalAI = false;
  if (cvData.aiConfig.provider === 'ollama') {
    try {
      const response = await fetch(`${cvData.aiConfig.endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: cvData.aiConfig.modelName,
          prompt: `Write a professional 3-paragraph cover letter for Vivi Veras applying for ${jobTitle} at ${companyName}. Highlight skills in ${matchedTags.join(', ')}. Keep it concise.`,
          stream: false
        })
      });
      if (response.ok) {
        const json = await response.json();
        if (json.response) {
          coverLetterTextEn = json.response;
          usedLocalAI = true;
        }
      }
    } catch (e) {
      console.log("Local Ollama endpoint offline, falling back to smart heuristic generator.");
    }
  }

  if (!usedLocalAI) {
    coverLetterTextEn = `Dear Hiring Team at ${companyName || 'the Company'},

I am writing to express my enthusiastic interest in the ${jobTitle || 'Software Engineer'} role. With strong technical expertise in ${matchedTags.map(t => t.toUpperCase()).join(', ')} development and a proven track record of building reliable, scalable systems, I am eager to contribute to your team.

In my recent positions, I have successfully engineered scalable web applications, designed containerized infrastructure pipelines (Docker, GitHub Actions, AWS), and built robust RESTful APIs using TypeScript, React, Node.js, and Python. My background allows me to deliver high-quality code while ensuring operational efficiency.

I would welcome the opportunity to discuss how my technical skills and proactive mindset align with ${companyName || 'your company'}'s engineering goals.

Sincerely,
${cvData.profile.name}`;

    coverLetterTextCs = `Vážený hiring týme společnosti ${companyName || 'společnosti'},

píši Vám ohledně svého zájmu o pozici ${jobTitle || 'Software Engineer'}. S rozsáhlými technickými zkušenostmi v oblastech ${matchedTags.map(t => t.toUpperCase()).join(', ')} a prokazatelnými výsledky při tvorbě spolehlivých systémů bych rád přispěl k úspěchu Vašeho týmu.

V předchozích rolích jsem se zaměřoval na vývoj webových aplikací v Reactu, TypeScriptu a Node.js, automatizaci CI/CD pipelines (Docker, GitHub Actions) a vývoj mikroslužeb.

Těším se na možnost osobně projednat mé zapojení do Vašeho týmu.

S pozdravem,
${cvData.profile.name}`;
  } else {
    coverLetterTextCs = coverLetterTextEn; // fallback for Czech if Ollama used English
  }

  const newCoverLetter: CoverLetter = {
    id: `cl-${Date.now()}`,
    jobTitle: jobTitle || 'Target Role',
    companyName: companyName || 'Target Company',
    date: new Date().toISOString().slice(0, 10),
    language: language,
    content: {
      en: coverLetterTextEn,
      cs: coverLetterTextCs
    }
  };

  // Create updated metadata
  const updatedMetadata = {
    dc_title: `${cvData.profile.name} - ${jobTitle || 'Resume'} (${companyName || 'Application'})`,
    dc_creator: cvData.profile.name,
    cp_keywords: matchedTags.join(', ') + ', TypeScript, React, DevOps, Resume',
    cp_description: `Tailored application for ${jobTitle} at ${companyName}`,
    cp_category: "Resume & Cover Letter"
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
