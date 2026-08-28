import { WorkExperience, EducationItem, LanguageItem, SkillCategory, ProjectItem } from '../types/cv';
import { IngestionResult } from './ingestionService';

const TECH_KEYWORD_LIST = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Rust', 'Docker',
  'Kubernetes', 'AWS', 'SQL', 'PostgreSQL', 'MongoDB', 'HTML', 'CSS', 'Tailwind',
  'GraphQL', 'Git', 'Next.js', 'Vue', 'Angular', 'C++', 'Java', 'Linux', 'Figma',
  'Spring Boot', 'DevOps', 'CI/CD', 'Redux', 'Express', 'Django', 'Flask', 'Golang',
  '.NET', 'Terraform', 'Bootstrap', 'MySQL', 'C#', 'ASP.NET'
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
      if (line.length <= 40 && regex.test(line)) {
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

function extractHeaderInfo(headerText: string, fullText: string) {
  const lines = headerText.split('\n').map(l => l.trim()).filter(Boolean);
  const contacts = extractContactDetails(fullText);

  // Find candidate name (first non-URL line under 35 chars without email)
  const nameLine = lines.find(l => 
    !l.includes('@') && !l.startsWith('http') && !l.includes('.com') &&
    !/\b(?:resume|cv|curriculum|developer|engineer|software)\b/i.test(l) &&
    l.length >= 3 && l.length <= 35
  ) || lines.find(l => !l.includes('@') && !l.startsWith('http') && l.length <= 35) || '';

  const headlineCandidate = lines.find(l => 
    l !== nameLine && 
    /(Developer|Engineer|Architect|Designer|Manager|Programmer|Consultant|Scientist)/i.test(l) &&
    l.length <= 70
  );

  return {
    detectedName: nameLine || undefined,
    detectedHeadline: headlineCandidate || undefined,
    contacts
  };
}

function extractJobRoleAndCompany(line: string): { role?: string; company?: string } {
  if (!/(?:Engineer|Developer|Researcher|Manager|Programmer|Analyst|Consultant|Desenvolvedor|Engenheiro|Gerente)/i.test(line)) {
    return {};
  }
  const parts = line.split(/(?:\bat\b|@|\||—|–)/i).map(p => p.trim());
  return {
    role: parts[0].slice(0, 50),
    company: parts[1] ? parts[1].slice(0, 45) : undefined
  };
}

function extractRoleOrCompany(line: string, currentRole: string, currentCompany: string, dateRegex: RegExp) {
  let role = currentRole;
  let company = currentCompany;

  const parsed = extractJobRoleAndCompany(line);
  if (!role && parsed.role) {
    role = parsed.role;
    if (parsed.company) company = parsed.company;
    return { role, company };
  }

  if (!company && line.length < 45 && !dateRegex.test(line) && !line.includes('@')) {
    company = line;
  }

  return { role, company };
}

function extractBlockDetails(lines: string[], dateRegex: RegExp) {
  const bullets: string[] = [];
  let role = '';
  let company = '';

  for (const line of lines) {
    if (/^[●•\-*]/.test(line)) {
      bullets.push(line.replace(/^[●•\-*]\s*/, '').trim());
      continue;
    }
    const updated = extractRoleOrCompany(line, role, company, dateRegex);
    role = updated.role;
    company = updated.company;
  }

  return { role, company, bullets };
}

function parseSingleExpBlock(block: string, dateRegex: RegExp, index: number): WorkExperience | null {
  const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  const dateMatch = block.match(dateRegex);
  const { role, company, bullets } = extractBlockDetails(lines, dateRegex);

  if (!role && !company) return null;

  return {
    id: `exp-${index}-${Date.now()}`,
    company: (company || 'Company').replace(/\s*[-–—|].*$/, '').trim(),
    roleTitle: { en: role || 'Software Developer' },
    startDate: dateMatch ? dateMatch[1].trim() : '2022',
    endDate: dateMatch ? dateMatch[2].trim() : 'Present',
    bullets: bullets.map((b, idx) => ({
      id: `b-${idx}`,
      text: { en: b },
      tags: ['fullstack'],
      enabled: true
    })),
    tags: ['fullstack'],
    enabled: true
  };
}

function parseExperienceEntries(expText: string): WorkExperience[] {
  if (!expText.trim()) return [];

  const rawBlocks = expText.split(/(?=\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Ago|Set|Out|Dez)[a-z]*\s+\d{4}|\b\d{4}\s*[-–—])/i);
  const dateRegex = /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Ago|Set|Out|Dez)[a-z]*\s+\d{4}|\b\d{4})\s*[-–—to]+\s*(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Ago|Set|Out|Dez)[a-z]*\s+\d{4}|\b\d{4}|Present|Current|Atual|Presente)/i;

  const experiences: WorkExperience[] = [];
  rawBlocks.forEach((block, idx) => {
    const exp = parseSingleExpBlock(block, dateRegex, idx);
    if (exp) experiences.push(exp);
  });

  const seen = new Set<string>();
  return experiences.filter(exp => {
    const key = `${exp.company.toLowerCase()}-${exp.roleTitle.en.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 6);
}

function parseEducationEntries(eduText: string): EducationItem[] {
  if (!eduText.trim()) return [];

  const lines = eduText.split('\n').map(l => l.trim()).filter(Boolean);
  const items: EducationItem[] = [];
  const dateRegex = /\b\d{4}\s*[-–—to]+\s*(\d{4}|Present|Current|Atual)?\b/i;

  for (const line of lines) {
    if (line.length > 5 && !line.startsWith('●') && !line.startsWith('•')) {
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
    .filter(l => l.length > 10 && l.length < 80 && !l.startsWith('●') && !l.startsWith('•'))
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
export function parseFullResumeContent(rawText: string, sourceType: 'file' | 'text' = 'file'): IngestionResult {
  const sections = segmentResumeText(rawText);
  const { detectedName, detectedHeadline, contacts } = extractHeaderInfo(sections.header, rawText);

  // Clean bio summary from the summary section or first descriptive sentence
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
