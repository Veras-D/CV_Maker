import { WorkExperience, EducationItem, LanguageItem, SkillCategory, ProjectItem } from '../types/cv';
import { IngestionResult } from './ingestionService';

const TECH_KEYWORD_LIST = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Rust', 'Docker',
  'Kubernetes', 'AWS', 'SQL', 'PostgreSQL', 'MongoDB', 'HTML', 'CSS', 'Tailwind',
  'GraphQL', 'Git', 'Next.js', 'Vue', 'Angular', 'C++', 'Java', 'Linux', 'Figma',
  'Spring Boot', 'DevOps', 'CI/CD', 'Redux', 'Express', 'Django', 'Flask', 'Golang',
  '.NET', 'Terraform', 'Bootstrap', 'MySQL', 'C#', 'ASP.NET', 'Keras', 'scikit-learn'
];

const KNOWN_LANGUAGES = [
  'English', 'Portuguese', 'Spanish', 'French', 'German', 'Czech',
  'Italian', 'Chinese', 'Japanese', 'Russian', 'Arabic', 'Polish', 'Dutch'
];

interface RawSections {
  header: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  languages: string;
  projects: string;
}

const SECTION_PATTERNS = [
  { key: 'summary', regex: /\b(?:about\s+me|sobre\s+mim|professional\s+summary|executive\s+profile|summary|profile|resumo|perfil)\b/i },
  { key: 'experience', regex: /\b(?:work\s+experience|professional\s+experience|employment\s+history|experience|experiência\s+profissional|experiência|histórico\s+profissional)\b/i },
  { key: 'education', regex: /\b(?:academic\s+background|education|formação\s+acadêmica|formação|educação)\b/i },
  { key: 'skills', regex: /\b(?:technical\s+skills|core\s+competencies|skills\s+&\s+expertise|skills|habilidades|competências|tecnologias)\b/i },
  { key: 'languages', regex: /\b(?:language\s+proficiency|languages|idiomas|línguas)\b/i },
  { key: 'projects', regex: /\b(?:key\s+projects|featured\s+projects|projects|projetos)\b/i }
];

function segmentResumeText(rawText: string): RawSections {
  const sections: RawSections = {
    header: '',
    summary: '',
    experience: '',
    education: '',
    languages: '',
    skills: '',
    projects: ''
  };

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let currentKey: keyof RawSections = 'header';
  const headerLines: string[] = [];

  for (const line of lines) {
    let matchedHeader = false;
    for (const { key, regex } of SECTION_PATTERNS) {
      if (line.length <= 45 && regex.test(line)) {
        currentKey = key as keyof RawSections;
        matchedHeader = true;
        break;
      }
    }

    if (!matchedHeader) {
      if (currentKey === 'header') {
        headerLines.push(line);
      } else {
        sections[currentKey] += `\n${line}`;
      }
    }
  }

  sections.header = headerLines.join('\n');
  return sections;
}

function extractContactDetails(rawText: string) {
  const email = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0];
  const phone = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,3}\)?[-.\s]?\d{4,5}[-.\s]?\d{4}/)?.[0];
  const github = rawText.match(/https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i)?.[0];
  const linkedin = rawText.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i)?.[0];
  const portfolio = rawText.match(/https?:\/\/[a-zA-Z0-9.-]+\.(?:dev|app|io|com|org|net|me)\b/i)?.[0];

  return { email, phone, github, linkedin, portfolio };
}

function extractCandidateName(lines: string[]): string | undefined {
  for (const line of lines) {
    if (line.includes('@') || line.startsWith('http') || /^\+?\d/.test(line)) continue;
    
    // If line has name + title separated by bullet/pipe/hyphen, extract first part
    const clean = line.split(/[•|—–\-/:]/)[0].trim();
    if (clean.length >= 3 && clean.length <= 35 && !/^(resume|cv|curriculum|profile)$/i.test(clean)) {
      return clean;
    }
  }
  return undefined;
}

function extractHeaderInfo(headerText: string, fullText: string) {
  const lines = headerText.split('\n').map(l => l.trim()).filter(Boolean);
  const contacts = extractContactDetails(fullText);
  const detectedName = extractCandidateName(lines);

  const headlineCandidate = lines.find(l => 
    l !== detectedName && 
    /(Developer|Engineer|Architect|Designer|Manager|Programmer|Consultant|Scientist|Desenvolvedor)/i.test(l) &&
    l.length <= 70
  );

  return {
    detectedName,
    detectedHeadline: headlineCandidate || undefined,
    contacts
  };
}

const DATE_RANGE_REGEX = /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Ago|Set|Out|Dez|January|February|March|April|June|July|August|September|October|November|December)[a-z]*\.?\s+\d{4}|\b\d{1,2}\/\d{4}|\b\d{4})\s*[-–—to/\s]+\s*(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Ago|Set|Out|Dez|January|February|March|April|June|July|August|September|October|November|December)[a-z]*\.?\s+\d{4}|\b\d{1,2}\/\d{4}|\b\d{4}|Present|Current|Atual|Presente|Now)/i;

interface ExtractedExp {
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

function parseExperienceEntries(expText: string): WorkExperience[] {
  if (!expText.trim()) return [];

  const lines = expText.split('\n').map(l => l.trim()).filter(Boolean);
  const exps: ExtractedExp[] = [];
  let current: ExtractedExp | null = null;

  for (const line of lines) {
    const dateMatch = line.match(DATE_RANGE_REGEX);
    const isBullet = /^[●•\-*]/.test(line);

    if (dateMatch) {
      if (current && (current.role || current.company)) exps.push(current);
      const textWithoutDate = line.replace(DATE_RANGE_REGEX, '').replace(/[()—–|]/g, ' ').trim();
      const parts = textWithoutDate.split(/(?:\bat\b|@|\||—|–|-)/i).map(p => p.trim()).filter(Boolean);
      
      current = {
        role: parts[0] || 'Software Professional',
        company: parts[1] || 'Company',
        startDate: dateMatch[1].trim(),
        endDate: dateMatch[2].trim(),
        bullets: []
      };
    } else if (isBullet && current) {
      current.bullets.push(line.replace(/^[●•\-*]\s*/, '').trim());
    } else if (current && line.length > 20 && !current.role.includes(line)) {
      current.bullets.push(line);
    }
  }

  if (current && (current.role || current.company)) exps.push(current);

  const seen = new Set<string>();
  return exps
    .filter(e => {
      const key = `${e.company.toLowerCase()}-${e.role.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 6)
    .map((e, idx) => ({
      id: `exp-${idx}-${Date.now()}`,
      company: e.company.slice(0, 45),
      roleTitle: { en: e.role.slice(0, 50) },
      startDate: e.startDate,
      endDate: e.endDate,
      bullets: e.bullets.map((b, bIdx) => ({
        id: `b-${bIdx}`,
        text: { en: b },
        tags: ['fullstack'],
        enabled: true
      })),
      tags: ['fullstack'],
      enabled: true
    }));
}

function parseEducationEntries(eduText: string): EducationItem[] {
  if (!eduText.trim()) return [];

  const lines = eduText.split('\n').map(l => l.trim()).filter(Boolean);
  const items: EducationItem[] = [];
  const dateRegex = /\b\d{4}\s*[-–—to]+\s*(\d{4}|Present|Current|Atual)?\b/i;

  for (const line of lines) {
    if (line.length > 5 && !/^[●•\-*]/.test(line)) {
      const dates = line.match(dateRegex)?.[0] || 'Graduated';
      const cleanLine = line.replace(dateRegex, '').replace(/[()—–-]/g, ' ').trim();
      const parts = cleanLine.split(/(?:\||—|–|-)/).map(p => p.trim()).filter(Boolean);
      const institution = parts[0] || 'Academic Institution';
      const program = parts[1] || parts[0] || 'Degree Program';

      items.push({
        id: `edu-${items.length}`,
        institution: institution.slice(0, 50),
        program: { en: program.slice(0, 60) },
        dates,
        enabled: true
      });
    }
  }
  return items.slice(0, 4);
}

function parseLanguages(rawText: string): LanguageItem[] {
  const detected: LanguageItem[] = [];
  const proficiencyRegex = /(Native|Fluent|Bilingual|Professional|Intermediate|Elementary|Natívo|Fluente|Avançado|C2|C1|B2|B1|A2|A1)/i;

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

function parseProjects(projText: string): ProjectItem[] {
  if (!projText.trim()) return [];
  const lines = projText.split('\n').map(l => l.trim()).filter(Boolean);
  const titleSeparator = /[-|]|\s:\s/;

  return lines
    .filter(l => l.length > 10 && l.length < 80 && !/^[●•\-*]/.test(l))
    .slice(0, 4)
    .map((line, idx) => ({
      id: `proj-parsed-${idx}`,
      title: line.split(titleSeparator)[0].trim(),
      description: { en: line },
      techStack: [],
      tags: ['fullstack'],
      enabled: true
    }));
}

/**
 * Full semantic parser that cleanly segments resumes and extracts structured profile and experiences.
 */
export function parseFullResumeContent(
  rawText: string, 
  sourceType: IngestionResult['sourceType'] = 'file'
): IngestionResult {
  const sections = segmentResumeText(rawText);
  const { detectedName, detectedHeadline, contacts } = extractHeaderInfo(sections.header, rawText);

  const bioClean = sections.summary.trim()
    ? sections.summary.replace(/^[●•\-*]\s*/gm, '').trim().slice(0, 350)
    : undefined;

  return {
    sourceType,
    detectedName,
    detectedHeadline,
    detectedBio: bioClean,
    detectedEmail: contacts.email,
    detectedPhone: contacts.phone,
    detectedGithubUrl: contacts.github,
    detectedLinkedinUrl: contacts.linkedin,
    detectedPortfolioUrl: contacts.portfolio,
    experiences: parseExperienceEntries(sections.experience || rawText),
    education: parseEducationEntries(sections.education),
    languages: parseLanguages(sections.languages || rawText),
    skillCategories: parseSkills(sections.skills || rawText),
    projects: parseProjects(sections.projects)
  };
}
