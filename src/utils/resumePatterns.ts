import { LanguageItem, SkillCategory } from '../types/cv';

export const TECH_KEYWORD_LIST = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Rust', 'Docker',
  'Kubernetes', 'AWS', 'SQL', 'PostgreSQL', 'MongoDB', 'HTML', 'CSS', 'Tailwind',
  'GraphQL', 'Git', 'Next.js', 'Vue', 'Angular', 'C++', 'Java', 'Linux', 'Figma',
  'Spring Boot', 'DevOps', 'CI/CD', 'Redux', 'Express', 'Django', 'Flask', 'Golang',
  '.NET', 'Terraform', 'Bootstrap', 'MySQL', 'C#', 'ASP.NET', 'Keras', 'scikit-learn',
  'Prisma', 'Redis', 'JIRA', 'Testing Library', 'Machine Learning', 'Data Science',
  'Pandas', 'Matplotlib', 'Seaborn', 'PyTorch', 'OpenCV', 'NumPy', 'SciPy', 'Bash',
  'Web Scraping', 'Jest', 'Cypress', 'JWT', 'REST API', 'Tkinter'
];

export const KNOWN_LANGUAGES = [
  'English', 'Portuguese', 'Spanish', 'French', 'German', 'Czech',
  'Italian', 'Chinese', 'Japanese', 'Russian', 'Arabic', 'Polish', 'Dutch'
];

export interface SectionPattern {
  key: 'summary' | 'experience' | 'education' | 'skills' | 'languages' | 'projects';
  regex: RegExp;
}

export const SECTION_PATTERNS: SectionPattern[] = [
  { key: 'summary', regex: /\b(?:about\s+me|sobre\s+mim|objetivos?\s+de\s+carreira|objetivos?|professional\s+summary|executive\s+profile|summary|profile|resumo|perfil)\b/i },
  { key: 'experience', regex: /\b(?:work\s+experience|professional\s+experience|employment\s+history|trabalhos?\s+de\s+portfolio|trabalhos|experiência\s+profissional|experiência|histórico\s+profissional|experience)\b/i },
  { key: 'education', regex: /\b(?:academic\s+background|education(?:\s+and\s+training)?|cursos?\s+e\s+escolaridade|cursos?\s+e\s+certificações|escolaridade|formação\s+acadêmica|formação|educação)\b/i },
  { key: 'skills', regex: /\b(?:technical\s+skills|core\s+competencies|expertise\s*&\s*skills?|expertise|skills\s+&\s+expertise|skills|habilidades|competências|tecnologias)\b/i },
  { key: 'languages', regex: /\b(?:language\s+proficiency|language\s+skills|languages|idiomas|línguas)\b/i },
  { key: 'projects', regex: /\b(?:key\s+projects|featured\s+projects|projects|projetos)\b/i }
];

const MONTHS_PT_EN = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Ago|Set|Out|Dez|January|February|March|April|June|July|August|September|October|November|December';
const DATE_TOKEN_START = `(?:(?:${MONTHS_PT_EN})[a-z]*\\.?\\s+\\d{4}|\\b(?:\\d{1,2}[\\/.-])?\\d{1,2}[\\/.-]\\d{4}\\b|\\b\\d{4}\\b)`;
const DATE_TOKEN_END = `(?:(?:${MONTHS_PT_EN})[a-z]*\\.?\\s+\\d{4}|\\b(?:\\d{1,2}[\\/.-])?\\d{1,2}[\\/.-]\\d{4}\\b|\\b\\d{4}\\b|Present|Current|Atual|Atualmente|Presente|Now)`;

export const DATE_RANGE_REGEX = new RegExp(`(${DATE_TOKEN_START})\\s*[-–—to/\\s]+\\s*(${DATE_TOKEN_END})`, 'i');

export const ROLE_PREFIX_REGEX = /^(?:Senior|Junior|Lead|Principal|Chief|Undergraduate|Graduate|Staff|Full-Stack|Frontend|Backend|Software|Web|Mobile|DevOps|Data|QA)?\s*(?:Engineer|Developer|Architect|Designer|Manager|Programmer|Researcher|Scientist|Analyst|Consultant|Specialist|Intern|Fellow|Desenvolvedor|Gerente|Engenheiro|Programador|Analista|Membro)(?:\s+(?:Team|Lead|Manager|Autônomo|Voluntário|Voluntario))?/i;

export const ACADEMIC_KEYWORDS = /(?:University|College|School|Academy|Program|Degree|Bachelor|Master|B\.S|B\.Sc|M\.S|Ph\.D|Faculty|Faculdade|Universidade|Instituto|Recode|Bootcamp|Curso|Técnico|Graduado|Graduação|Engenharia|Bolsista|Bacharelado|Licenciatura|Ensino|Mestrado|Doutorado|SECTI|Trilhas)/i;

export const FORBIDDEN_NAME_PATTERNS = /^(?:resume|cv|curriculum|profile|sobre|sobre\s+mim|experiência|experience|education|educação|habilidades|skills|contato|contact|cursos|objetivos)$/i;

export function cleanSpecialPunctuation(str: string): string {
  return str
    .replace(/^[\s•●○*·▪▫►▸⁃\u2013\u2014\u002D\u2212|:;,\-_/]+/u, '')
    .replace(/[\s•●○*·▪▫►▸⁃\u2013\u2014\u002D\u2212|:;,\-_/]+$/u, '')
    .trim();
}

export function extractCandidateName(lines: string[]): string | undefined {
  const candidates: string[] = [];
  for (const line of lines) {
    if (line.includes('@') || line.startsWith('http') || /^\+?\d/.test(line)) continue;
    const clean = cleanSpecialPunctuation(line.split(/[•|—–\-/:]/)[0]);
    if (clean.length >= 2 && clean.length <= 40 && !FORBIDDEN_NAME_PATTERNS.test(clean)) {
      candidates.push(clean);
    }
  }
  if (candidates.length >= 2 && candidates[0].split(/\s+/).length === 1 && candidates[1].split(/\s+/).length === 1) {
    return `${candidates[0]} ${candidates[1]}`;
  }
  return candidates[0];
}

export function extractContactDetails(rawText: string) {
  const email = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0];
  const phone = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,3}\)?[-.\s]?\d{4,5}[-.\s]?\d{4}/)?.[0];
  const github = rawText.match(/https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i)?.[0];
  const linkedin = rawText.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i)?.[0];
  const portfolio = rawText.match(/https?:\/\/[a-zA-Z0-9.-]+\.(?:dev|app|io|com|org|net|me)\b/i)?.[0];

  return { email, phone, github, linkedin, portfolio };
}

export function parseLanguages(rawText: string): LanguageItem[] {
  const detected: LanguageItem[] = [];
  const profRegex = /(Native|Fluent|Bilingual|Professional|Intermediate|Elementary|Natívo|Nativo|Fluente|Avançado|Intermediário|Intermediario|Básico|Basico|C2|C1|B2|B1|A2|A1)/i;

  const langMap: Record<string, string> = {
    english: 'English', inglês: 'English', ingles: 'English',
    portuguese: 'Portuguese', português: 'Portuguese', portugues: 'Portuguese',
    spanish: 'Spanish', espanhol: 'Spanish',
    french: 'French', francês: 'French', frances: 'French',
    german: 'German', alemão: 'German', alemao: 'German'
  };

  for (const [key, normName] of Object.entries(langMap)) {
    const regex = new RegExp(`\\b${key}\\b(?:[:\\s–-]+(${profRegex.source}))?`, 'i');
    const match = rawText.match(regex);
    if (match && !detected.some(d => d.language.en === normName)) {
      detected.push({
        id: `lang-${detected.length}`,
        language: { en: normName },
        proficiency: { en: match[1] || 'Professional Working' },
        enabled: true
      });
    }
  }
  return detected;
}

export function parseSkills(rawText: string): SkillCategory[] {
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
