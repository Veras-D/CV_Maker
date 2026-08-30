import { WorkExperience } from '../types/cv';
import { IngestionResult } from './ingestionService';
import { 
  SECTION_PATTERNS, 
  DATE_RANGE_REGEX, 
  ROLE_PREFIX_REGEX, 
  cleanSpecialPunctuation,
  extractHeaderInfo,
  parseLanguages,
  parseSkills,
  parseProjects,
  parseEducationEntries
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
  const clean = cleanSpecialPunctuation(lineWithoutDate);
  if (!clean) return { role: '', company: '' };

  const sepMatch = clean.split(/\s+(?:at|@|—|–|\||\/|,|\s-\s)\s+/i).map(p => cleanSpecialPunctuation(p)).filter(Boolean);
  if (sepMatch.length >= 2) {
    return { role: sepMatch[0], company: sepMatch[1] };
  }

  const roleMatch = clean.match(ROLE_PREFIX_REGEX);
  if (roleMatch && roleMatch[0]) {
    const matchedRole = cleanSpecialPunctuation(roleMatch[0]);
    const rawComp = clean.slice(roleMatch[0].length);
    const company = cleanSpecialPunctuation(rawComp);
    return { role: matchedRole, company: company || '' };
  }

  return { role: clean, company: '' };
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

function tryMatchInferredRole(textWithoutDate: string, prevLines: string[], prevExp: ExtractedExp | null): { role: string; company: string } | null {
  const fromDateText = inferFromDateText(textWithoutDate, prevLines);
  if (fromDateText && ROLE_PREFIX_REGEX.test(fromDateText.role)) {
    if (prevExp && prevExp.bullets.length > 0 && prevExp.bullets[prevExp.bullets.length - 1] === fromDateText.role) {
      prevExp.bullets.pop();
    }
    return fromDateText;
  }
  return null;
}

function handleDateWithText(textWithoutDate: string, prevLines: string[], prevExp: ExtractedExp | null): { role: string; company: string } {
  const parsed = extractRoleAndCompanyFromLine(textWithoutDate);
  if (parsed.role && (parsed.company || ROLE_PREFIX_REGEX.test(parsed.role))) {
    return { role: parsed.role, company: parsed.company || 'Software House' };
  }

  const matchedInferred = tryMatchInferredRole(textWithoutDate, prevLines, prevExp);
  if (matchedInferred) {
    return matchedInferred;
  }

  return { role: parsed.role || 'Software Professional', company: parsed.company || 'Software House' };
}

function handleDateLine(line: string, dateMatch: RegExpMatchArray, prevLines: string[], prevExp: ExtractedExp | null): ExtractedExp {
  const textWithoutDate = line.replace(DATE_RANGE_REGEX, '').replace(/[()]/g, ' ').trim();
  const startDate = dateMatch[1].trim();
  const endDate = dateMatch[2].trim();

  if (textWithoutDate) {
    const bound = handleDateWithText(textWithoutDate, prevLines, prevExp);
    return { ...bound, startDate, endDate, bullets: [] };
  }

  const fromPrev = inferFromPrevLines(prevLines);
  if (fromPrev && (ROLE_PREFIX_REGEX.test(fromPrev.role) || ROLE_PREFIX_REGEX.test(fromPrev.company))) {
    if (prevExp && prevExp.bullets.length > 0 && prevExp.bullets[prevExp.bullets.length - 1] === fromPrev.role) {
      prevExp.bullets.pop();
    }
    return { ...fromPrev, startDate, endDate, bullets: [] };
  }

  return { role: 'Software Professional', company: 'Software House', startDate, endDate, bullets: [] };
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

const BULLET_START_REGEX = /^[\s•●○*·▪▫►▸⁃\u2013\u2014\u002D\u2212]+/u;

function tryAppendToPreviousBullet(current: ExtractedExp, cleaned: string): boolean {
  if (current.bullets.length === 0) return false;
  const lastIdx = current.bullets.length - 1;
  const lastBullet = current.bullets[lastIdx];
  const shouldAppend = !/[.!?]$/.test(lastBullet) || /^[a-zà-ÿ]/.test(cleaned) || cleaned.length < 35;
  if (shouldAppend) {
    current.bullets[lastIdx] = `${lastBullet} ${cleaned}`;
    return true;
  }
  return false;
}

function processExpLineItem(line: string, current: ExtractedExp) {
  const isBulletLine = BULLET_START_REGEX.test(line);
  const cleaned = cleanSpecialPunctuation(line);
  if (!cleaned) return;

  if (isBulletLine) {
    current.bullets.push(cleaned);
    return;
  }

  if (tryAssignMissingRoleOrComp(current, line, cleaned)) {
    return;
  }

  if (tryAppendToPreviousBullet(current, cleaned)) {
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
