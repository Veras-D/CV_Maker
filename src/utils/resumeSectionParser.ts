import { WorkExperience, EducationItem, ProjectItem } from '../types/cv';
import { IngestionResult } from './ingestionService';
import { 
  SECTION_PATTERNS, 
  DATE_RANGE_REGEX, 
  ROLE_PREFIX_REGEX, 
  ACADEMIC_KEYWORDS,
  cleanSpecialPunctuation,
  extractContactDetails,
  parseLanguages,
  parseSkills
} from './resumePatterns';

export { cleanSpecialPunctuation };

interface RawSections {
  header: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  languages: string;
  projects: string;
}

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
    let matched = false;
    for (const { key, regex } of SECTION_PATTERNS) {
      if (line.length <= 45 && regex.test(line)) {
        currentKey = key as keyof RawSections;
        matched = true;
        break;
      }
    }

    if (!matched) {
      if (currentKey === 'header') headerLines.push(line);
      else sections[currentKey] += `\n${line}`;
    }
  }

  sections.header = headerLines.join('\n');
  return sections;
}

function extractCandidateName(lines: string[]): string | undefined {
  for (const line of lines) {
    if (line.includes('@') || line.startsWith('http') || /^\+?\d/.test(line)) continue;
    const clean = cleanSpecialPunctuation(line.split(/[•|—–\-/:]/)[0]);
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
    detectedHeadline: headlineCandidate ? cleanSpecialPunctuation(headlineCandidate) : undefined,
    contacts
  };
}

interface ExtractedExp {
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

function extractRoleAndCompanyFromLine(lineWithoutDate: string): { role: string; company: string } {
  const sepMatch = lineWithoutDate.split(/\s+(?:at|@|—|–|\||\/|,|\s-\s)\s+/i).map(p => cleanSpecialPunctuation(p)).filter(Boolean);
  if (sepMatch.length >= 2) {
    return { role: sepMatch[0], company: sepMatch[1] };
  }

  const roleMatch = lineWithoutDate.match(ROLE_PREFIX_REGEX);
  if (roleMatch && roleMatch[0]) {
    const matchedRole = cleanSpecialPunctuation(roleMatch[0]);
    const rawComp = lineWithoutDate.slice(roleMatch[0].length);
    const company = cleanSpecialPunctuation(rawComp);
    return { role: matchedRole, company };
  }

  return { role: cleanSpecialPunctuation(lineWithoutDate) || 'Software Professional', company: '' };
}

function createNewExpEntry(line: string, dateMatch: RegExpMatchArray): ExtractedExp {
  const textWithoutDate = line.replace(DATE_RANGE_REGEX, '').replace(/[()]/g, ' ').trim();
  const { role, company } = extractRoleAndCompanyFromLine(textWithoutDate);
  return {
    role: role || 'Software Professional',
    company,
    startDate: dateMatch[1].trim(),
    endDate: dateMatch[2].trim(),
    bullets: []
  };
}

function processExpLineItem(line: string, current: ExtractedExp) {
  const cleaned = cleanSpecialPunctuation(line);
  if (!cleaned) return;

  if (/^[●•\-*]/.test(line)) {
    current.bullets.push(cleaned);
  } else if (!current.company && cleaned.length < 50 && !/^(about|experience|education|skills)/i.test(cleaned)) {
    current.company = cleaned;
  } else if (cleaned.length > 20 && !current.role.includes(cleaned)) {
    current.bullets.push(cleaned);
  }
}

function collectExpEntries(lines: string[]): ExtractedExp[] {
  const exps: ExtractedExp[] = [];
  let current: ExtractedExp | null = null;
  let lastNonDateLine = '';

  for (const line of lines) {
    const dateMatch = line.match(DATE_RANGE_REGEX);
    if (dateMatch) {
      if (current && (current.role || current.company)) exps.push(current);
      current = createNewExpEntry(line, dateMatch);
      if ((!current.role || current.role === 'Software Professional') && lastNonDateLine) {
        const { role, company } = extractRoleAndCompanyFromLine(lastNonDateLine);
        if (role && role !== 'Software Professional') {
          current.role = role;
          if (company) current.company = company;
        }
      }
    } else if (current) {
      if ((!current.role || current.role === 'Software Professional' || !current.company) && !/^[●•\-*]/.test(line)) {
        const { role, company } = extractRoleAndCompanyFromLine(line);
        if (role && role !== 'Software Professional') {
          current.role = role;
          if (company) current.company = company;
        } else {
          processExpLineItem(line, current);
        }
      } else {
        processExpLineItem(line, current);
      }
      lastNonDateLine = line;
    } else {
      lastNonDateLine = line;
    }
  }

  if (current && (current.role || current.company)) exps.push(current);
  return exps;
}

function parseExperienceEntries(expText: string): WorkExperience[] {
  if (!expText.trim()) return [];

  const lines = expText.split('\n').map(l => l.trim()).filter(Boolean);
  const exps = collectExpEntries(lines);

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
      company: cleanSpecialPunctuation(e.company) || 'Software House',
      roleTitle: { en: cleanSpecialPunctuation(e.role).slice(0, 50) },
      startDate: e.startDate,
      endDate: e.endDate,
      bullets: e.bullets.map((b, bIdx) => ({
        id: `b-${bIdx}`,
        text: { en: cleanSpecialPunctuation(b) },
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
  const dateRegex = /(\b\d{4}\s*[-–—to/\s]+\s*(\d{4}|Present|Current|Atual)?\b|\b\d{1,2}\/\d{4}\s*[-–—to/\s]+\s*(\d{1,2}\/\d{4}|Present|Current|Atual)?\b)/i;

  let currentInstitution = '';
  let currentProgram = '';
  let currentDates = '';

  for (const line of lines) {
    if (line.startsWith('●') || line.startsWith('•') || /^(Technologies|Skills|Stack|Courses|MongoDB|HTML|CSS|React|Node)/i.test(line)) {
      continue;
    }

    const dateMatch = line.match(dateRegex);
    const hasAcademic = ACADEMIC_KEYWORDS.test(line);

    if (dateMatch) {
      if (currentInstitution || currentProgram) {
        items.push({
          id: `edu-${items.length}`,
          institution: (currentInstitution || currentProgram).slice(0, 50),
          program: { en: (currentProgram || currentInstitution).slice(0, 60) },
          dates: currentDates || 'Graduated',
          enabled: true
        });
        currentInstitution = '';
        currentProgram = '';
      }
      currentDates = dateMatch[0];
      const cleanWithoutDate = line.replace(dateRegex, '').replace(/[()]/g, ' ').trim();
      if (cleanWithoutDate) currentInstitution = cleanWithoutDate;
    } else if (hasAcademic) {
      if (!currentInstitution) currentInstitution = cleanSpecialPunctuation(line);
      else if (!currentProgram) currentProgram = cleanSpecialPunctuation(line);
    } else if (currentInstitution && !currentProgram && line.length < 70) {
      currentProgram = cleanSpecialPunctuation(line);
    }
  }

  if (currentInstitution || currentProgram) {
    items.push({
      id: `edu-${items.length}`,
      institution: (currentInstitution || currentProgram).slice(0, 50),
      program: { en: (currentProgram || currentInstitution).slice(0, 60) },
      dates: currentDates || 'Graduated',
      enabled: true
    });
  }

  return items.slice(0, 5);
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
      title: cleanSpecialPunctuation(line.split(titleSeparator)[0]),
      description: { en: cleanSpecialPunctuation(line) },
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
    ? cleanSpecialPunctuation(sections.summary.replace(/^[●•\-*]\s*/gm, '')).slice(0, 350)
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
