import { WorkExperience, EducationItem } from '../types/cv';
import { IngestionResult } from './ingestionService';
import { 
  SECTION_PATTERNS, 
  DATE_RANGE_REGEX, 
  ROLE_PREFIX_REGEX, 
  ACADEMIC_KEYWORDS,
  cleanSpecialPunctuation,
  extractHeaderInfo,
  parseLanguages,
  parseSkills,
  parseProjects
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

function inferFromDateText(textWithoutDate: string, prevLines: string[]): { role: string; company: string } | null {
  if (!textWithoutDate || prevLines.length === 0) return null;
  const prev1 = cleanSpecialPunctuation(prevLines[prevLines.length - 1]);
  if (prev1 && !DATE_RANGE_REGEX.test(prev1)) {
    return { role: prev1, company: cleanSpecialPunctuation(textWithoutDate) || 'Software House' };
  }
  return null;
}

function inferFromPrevLines(prevLines: string[]): { role: string; company: string } | null {
  if (prevLines.length < 2) return null;
  const p1 = cleanSpecialPunctuation(prevLines[prevLines.length - 1]);
  const p2 = cleanSpecialPunctuation(prevLines[prevLines.length - 2]);
  if (p1 && p2 && !DATE_RANGE_REGEX.test(p1) && !DATE_RANGE_REGEX.test(p2)) {
    return { role: p1, company: p2 };
  }
  return null;
}

function popTrailingRoleBullet(prev: ExtractedExp | null): string | null {
  if (!prev || prev.bullets.length === 0) return null;
  const lastBullet = prev.bullets[prev.bullets.length - 1];
  if (ROLE_PREFIX_REGEX.test(lastBullet) || (lastBullet.length < 40 && !lastBullet.includes('.'))) {
    prev.bullets.pop();
    return lastBullet;
  }
  return null;
}

function handleDateLine(line: string, dateMatch: RegExpMatchArray, prevLines: string[], prevExp: ExtractedExp | null): ExtractedExp {
  const textWithoutDate = line.replace(DATE_RANGE_REGEX, '').replace(/[()]/g, ' ').trim();
  const startDate = dateMatch[1].trim();
  const endDate = dateMatch[2].trim();

  const poppedRole = popTrailingRoleBullet(prevExp);
  if (poppedRole) {
    return {
      role: poppedRole,
      company: cleanSpecialPunctuation(textWithoutDate) || 'Software House',
      startDate,
      endDate,
      bullets: []
    };
  }

  const fromDateText = inferFromDateText(textWithoutDate, prevLines);
  if (fromDateText) {
    return { ...fromDateText, startDate, endDate, bullets: [] };
  }

  const fromPrev = inferFromPrevLines(prevLines);
  if (!textWithoutDate && fromPrev) {
    return { ...fromPrev, startDate, endDate, bullets: [] };
  }

  const fallback = extractRoleAndCompanyFromLine(textWithoutDate);
  const fallbackRole = fallback.role || (prevLines.length > 0 ? cleanSpecialPunctuation(prevLines[prevLines.length - 1]) : 'Software Professional');
  return { role: fallbackRole, company: fallback.company, startDate, endDate, bullets: [] };
}

function tryAssignMissingRoleOrComp(current: ExtractedExp, line: string, cleaned: string): boolean {
  if (current.role && current.role !== 'Software Professional' && current.company) {
    return false;
  }
  const { role, company } = extractRoleAndCompanyFromLine(line);
  if (role && role !== 'Software Professional') {
    current.role = role;
    if (company) current.company = company;
    return true;
  }
  if (!current.company && cleaned.length < 50 && !/^(about|experience|education|skills)/i.test(cleaned)) {
    current.company = cleaned;
    return true;
  }
  return false;
}

function appendSplitSentences(current: ExtractedExp, cleaned: string): boolean {
  if (!cleaned.includes('. ') || /^[A-Z0-9._%+-]+@/i.test(cleaned)) return false;
  const subSentences = cleaned.split(/\.\s+/).map(s => cleanSpecialPunctuation(s)).filter(s => s.length > 8);
  if (subSentences.length > 1) {
    subSentences.forEach(s => current.bullets.push(s));
    return true;
  }
  return false;
}

function processExpLineItem(line: string, current: ExtractedExp) {
  const cleaned = cleanSpecialPunctuation(line);
  if (!cleaned) return;

  if (/^[●•\-*]/.test(line)) {
    current.bullets.push(cleaned);
    return;
  }

  if (tryAssignMissingRoleOrComp(current, line, cleaned)) {
    return;
  }

  if (appendSplitSentences(current, cleaned)) {
    return;
  }

  current.bullets.push(cleaned);
}

function collectExpEntries(lines: string[]): ExtractedExp[] {
  const exps: ExtractedExp[] = [];
  let current: ExtractedExp | null = null;
  const recentLines: string[] = [];

  for (const line of lines) {
    const dateMatch = line.match(DATE_RANGE_REGEX);
    if (dateMatch) {
      if (current && (current.role || current.company)) exps.push(current);
      current = handleDateLine(line, dateMatch, recentLines, current);
    } else if (current) {
      processExpLineItem(line, current);
      recentLines.push(line);
    } else {
      recentLines.push(line);
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

interface EduState {
  institution: string;
  program: string;
  dates: string;
}

function flushEduState(items: EducationItem[], state: EduState) {
  if (!state.institution && !state.program) return;
  items.push({
    id: `edu-${items.length}`,
    institution: (state.institution || state.program).slice(0, 50),
    program: { en: (state.program || state.institution).slice(0, 60) },
    dates: state.dates || 'Graduated',
    enabled: true
  });
  state.institution = '';
  state.program = '';
  state.dates = '';
}

function processEduLine(line: string, items: EducationItem[], state: EduState, dateRegex: RegExp) {
  const dateMatch = line.match(dateRegex);
  if (dateMatch) {
    flushEduState(items, state);
    state.dates = dateMatch[0];
    const cleanWithoutDate = line.replace(dateRegex, '').replace(/[()]/g, ' ').trim();
    if (cleanWithoutDate) state.institution = cleanWithoutDate;
    return;
  }

  if (ACADEMIC_KEYWORDS.test(line)) {
    if (!state.institution) state.institution = cleanSpecialPunctuation(line);
    else if (!state.program) state.program = cleanSpecialPunctuation(line);
  } else if (state.institution && !state.program && line.length < 70) {
    state.program = cleanSpecialPunctuation(line);
  }
}

function parseEducationEntries(eduText: string): EducationItem[] {
  if (!eduText.trim()) return [];

  const lines = eduText.split('\n').map(l => l.trim()).filter(Boolean);
  const items: EducationItem[] = [];
  const dateRegex = /(\b\d{4}\s*[-–—to/\s]+\s*(\d{4}|Present|Current|Atual)?\b|\b\d{1,2}\/\d{4}\s*[-–—to/\s]+\s*(\d{1,2}\/\d{4}|Present|Current|Atual)?\b)/i;
  const state: EduState = { institution: '', program: '', dates: '' };

  for (const line of lines) {
    if (line.startsWith('●') || line.startsWith('•') || /^(Technologies|Skills|Stack|Courses|MongoDB|HTML|CSS|React|Node)/i.test(line)) {
      continue;
    }
    processEduLine(line, items, state, dateRegex);
  }

  flushEduState(items, state);
  return items.slice(0, 5);
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
    ? cleanSpecialPunctuation(sections.summary.replace(/^[●•\-*]\s*/gm, ''))
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
