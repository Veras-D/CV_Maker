import { WorkExperience, EducationItem, LanguageItem, SkillCategory, ProjectItem } from '../types/cv';
import { IngestionResult } from './ingestionService';

const TECH_KEYWORD_LIST = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Rust', 'Docker',
  'Kubernetes', 'AWS', 'SQL', 'PostgreSQL', 'MongoDB', 'HTML', 'CSS', 'Tailwind',
  'GraphQL', 'Git', 'Next.js', 'Vue', 'Angular', 'C++', 'Java', 'Linux', 'Figma',
  'Spring Boot', 'DevOps', 'CI/CD', 'Redux', 'Express', 'Django', 'Flask', 'Golang'
];

const KNOWN_LANGUAGES = [
  'English', 'Portuguese', 'Spanish', 'French', 'German', 'Czech',
  'Italian', 'Chinese', 'Japanese', 'Russian', 'Arabic', 'Polish', 'Dutch'
];

function extractContactDetails(rawText: string) {
  const email = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0];
  const phone = rawText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)?.[0];
  const github = rawText.match(/https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+/i)?.[0];
  const linkedin = rawText.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i)?.[0];
  const portfolio = rawText.match(/https?:\/\/[a-zA-Z0-9.-]+\.(?:dev|app|io|com|org|net|me)\b/i)?.[0];

  return { email, phone, github, linkedin, portfolio };
}

function parseExperiences(lines: string[]): WorkExperience[] {
  const experiences: WorkExperience[] = [];
  let current: Partial<WorkExperience> | null = null;
  const dateRegex = /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\b\d{4})\s*[-–—to]+\s*(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\b\d{4}|Present|Current|Now)/i;

  for (const line of lines) {
    const dateMatch = line.match(dateRegex);
    if (dateMatch) {
      if (current?.company) {
        experiences.push(finalizeExperience(current, experiences.length));
      }
      const beforeDate = line.slice(0, dateMatch.index).trim().replace(/[-|·,]$/, '').trim();
      current = {
        startDate: dateMatch[1].trim(),
        endDate: dateMatch[2].trim(),
        company: beforeDate || 'Company',
        roleTitle: { en: 'Software Professional' },
        bullets: []
      };
    } else if (current) {
      processExpLine(current, line);
    }
  }

  if (current?.company) {
    experiences.push(finalizeExperience(current, experiences.length));
  }

  return experiences.slice(0, 8);
}

function processExpLine(current: Partial<WorkExperience>, line: string) {
  if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
    const text = line.replace(/^[•\-*]\s*/, '').trim();
    if (text) {
      current.bullets = current.bullets || [];
      current.bullets.push({
        id: `b-${current.bullets.length}`,
        text: { en: text },
        tags: ['fullstack'],
        enabled: true
      });
    }
  } else if (!current.roleTitle || current.roleTitle.en === 'Software Professional') {
    if (line.length < 50) current.roleTitle = { en: line };
  }
}

function finalizeExperience(curr: Partial<WorkExperience>, idx: number): WorkExperience {
  return {
    id: `exp-parsed-${idx}-${Date.now()}`,
    company: curr.company || 'Company',
    roleTitle: curr.roleTitle || { en: 'Software Developer' },
    startDate: curr.startDate || '2020',
    endDate: curr.endDate || 'Present',
    bullets: curr.bullets || [],
    tags: ['fullstack'],
    enabled: true
  };
}

function parseEducation(lines: string[]): EducationItem[] {
  const education: EducationItem[] = [];
  const degreeKeywords = /(Bachelor|Master|B\.S|B\.Sc|M\.S|Ph\.D|Associate|Diploma|Degree|Engineer|Faculty|University|College|School|Academy)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (degreeKeywords.test(line)) {
      const dates = line.match(/\b\d{4}\s*[-–—to]+\s*(\d{4}|Present|Current)?\b/)?.[0] || 'Graduated';
      const cleanTitle = line.replace(/\b\d{4}.*$/, '').replace(/[-|·,]$/, '').trim();
      education.push({
        id: `edu-parsed-${education.length}`,
        institution: cleanTitle || 'Academic Institution',
        program: { en: cleanTitle || 'Degree Program' },
        dates,
        enabled: true
      });
    }
  }
  return education.slice(0, 4);
}

function parseLanguages(rawText: string): LanguageItem[] {
  const detected: LanguageItem[] = [];
  const proficiencyRegex = /(Native|Fluent|Bilingual|Professional|Intermediate|Elementary|C2|C1|B2|B1|A2|A1)/i;

  for (const lang of KNOWN_LANGUAGES) {
    const regex = new RegExp(`\\b${lang}\\b(?:[:\\s–-]+(${proficiencyRegex.source}))?`, 'i');
    const match = rawText.match(regex);
    if (match) {
      detected.push({
        id: `lang-${detected.length}`,
        language: { en: lang },
        proficiency: { en: match[1] || 'Professional Working' },
        enabled: true
      });
    }
  }
  return detected;
}

function parseSkills(rawText: string): SkillCategory[] {
  const detected = new Set<string>();
  const lower = rawText.toLowerCase();

  TECH_KEYWORD_LIST.forEach(tech => {
    const regex = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lower)) detected.add(tech);
  });

  if (detected.size === 0) return [];
  return [{
    id: `cat-skills-${Date.now()}`,
    categoryName: { en: 'Technical Skills' },
    skills: Array.from(detected).map((name, idx) => ({
      id: `skill-${idx}`,
      name,
      tags: ['fullstack'],
      enabled: true
    }))
  }];
}

function parseProjects(lines: string[]): ProjectItem[] {
  return lines
    .filter(l => l.length > 15 && l.length < 80 && !l.startsWith('•'))
    .slice(0, 4)
    .map((line, idx) => ({
      id: `proj-parsed-${idx}`,
      title: line.split(/[-:|]/)[0].trim(),
      description: { en: line },
      techStack: [],
      tags: ['fullstack'],
      enabled: true
    }));
}

/**
 * Full semantic parser that extracts profiles, experiences, education, languages, and skills from resume text.
 */
export function parseFullResumeContent(rawText: string, sourceType: 'file' | 'text' = 'file'): IngestionResult {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const contacts = extractContactDetails(rawText);

  // Extract name & role headline from top lines
  const nameLine = lines.find(l => 
    !l.startsWith('%') && !l.startsWith('/') && !l.startsWith('http') && 
    !l.includes('@') && !/\b(?:resume|cv|curriculum|page)\b/i.test(l) &&
    l.length >= 2 && l.length <= 40
  );

  const headlineCandidate = lines.find(l => 
    l !== nameLine && l.length >= 5 && l.length <= 50 &&
    /(Developer|Engineer|Architect|Designer|Manager|Consultant|Scientist|Specialist|Analyst)/i.test(l)
  );

  const bioCandidate = lines.find(l => 
    l.length > 50 && !l.includes('@') && !l.startsWith('http') &&
    !/(Experience|Education|Skills|Languages|Projects|Graduated)/i.test(l.slice(0, 15))
  );

  return {
    sourceType,
    detectedName: nameLine || undefined,
    detectedBio: bioCandidate || undefined,
    detectedEmail: contacts.email,
    detectedPhone: contacts.phone,
    detectedGithubUrl: contacts.github,
    detectedLinkedinUrl: contacts.linkedin,
    detectedPortfolioUrl: contacts.portfolio,
    experiences: parseExperiences(lines),
    education: parseEducation(lines),
    languages: parseLanguages(rawText),
    skillCategories: parseSkills(rawText),
    projects: parseProjects(lines)
  };
}
