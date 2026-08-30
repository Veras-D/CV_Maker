import { IngestionResult } from './ingestionService';
import { WorkExperience, EducationItem, LanguageItem, SkillCategory } from '../types/cv';
import { cleanSpecialPunctuation } from './resumePatterns';

export function isLinkedInProfileText(rawText: string): boolean {
  return (
    rawText.includes('(LinkedIn)') ||
    rawText.includes('(Mobile)') ||
    /\bTop Skills\b/i.test(rawText) ||
    /Page \d+ of \d+/i.test(rawText)
  );
}

function cleanLinkedInLine(l: string): string {
  return cleanSpecialPunctuation(l.replace(/^Page \d+ of \d+$/i, '').trim());
}

function extractSidebarInfo(rawText: string) {
  const email = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0];
  const phoneMatch = rawText.match(/(\+?\d[\d\s-]{6,16})\s*\(Mobile\)/i) || rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{4,5}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[1] || phoneMatch[0] : undefined;

  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const linkedinUrl = linkedinMatch ? (linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`) : undefined;

  const portfolioMatch = rawText.match(/(?:https?:\/\/)?github\.com\/[a-zA-Z0-9_-]+/i) || rawText.match(/(?:https?:\/\/)?\S+\.(?:dev|app|io|me)\b/i);
  const portfolioUrl = portfolioMatch ? (portfolioMatch[0].startsWith('http') ? portfolioMatch[0] : `https://${portfolioMatch[0]}`) : undefined;

  return { email, phone, linkedinUrl, portfolioUrl };
}

function parseLinkedInSkills(rawText: string): SkillCategory[] {
  const match = rawText.match(/Top Skills\s+([\s\S]*?)(?=Languages|Certifications|Summary|Experience|Education|$)/i);
  if (!match) return [];

  const lines = match[1].split('\n').map(cleanLinkedInLine).filter(l => l && l.length < 40);
  if (lines.length === 0) return [];

  return [{
    id: `cat-linkedin-skills`,
    categoryName: { en: 'Top Skills' },
    skills: lines.map((name, idx) => ({
      id: `skill-li-${idx}`,
      name,
      tags: ['fullstack'],
      enabled: true
    }))
  }];
}

function parseLinkedInLanguages(rawText: string): LanguageItem[] {
  const match = rawText.match(/Languages\s+([\s\S]*?)(?=Certifications|Summary|Experience|Education|Top Skills|$)/i);
  if (!match) return [];

  const lines = match[1].split('\n').map(cleanLinkedInLine).filter(Boolean);
  const items: LanguageItem[] = [];

  for (const line of lines) {
    const langMatch = line.match(/^([A-Za-zÀ-ÿ]+)\s*\(([^)]+)\)$/);
    if (langMatch) {
      items.push({
        id: `lang-li-${items.length}`,
        language: { en: langMatch[1] },
        proficiency: { en: langMatch[2] },
        enabled: true
      });
    }
  }
  return items;
}

function extractLinkedInHeader(mainText: string) {
  const lines = mainText.split('\n').map(cleanLinkedInLine).filter(Boolean);
  const forbidden = /^(Contact|Top Skills|Languages|Certifications|Summary|Experience|Education)$/i;
  const filtered = lines.filter(l => !forbidden.test(l) && !l.includes('@') && !/^\d+$/.test(l));

  const name = filtered[0] || 'Vivi Veras';
  const headline = filtered[1] && filtered[1].length <= 80 ? filtered[1] : undefined;
  const location = filtered[2] && filtered[2].length <= 60 && !filtered[2].startsWith('Developer') ? filtered[2] : undefined;

  return { name, headline, location };
}

function extractLinkedInSummary(mainText: string): string | undefined {
  const match = mainText.match(/Summary\s+([\s\S]*?)(?=Experience|Education|$)/i);
  if (!match) return undefined;
  return match[1].split('\n').map(cleanLinkedInLine).filter(Boolean).join(' ').trim() || undefined;
}

const LI_DATE_REGEX = /\b([A-Za-z]+(?:\s+\d{4})?|\d{4})\s*[-–—]\s*(Present|\d{4}|[A-Za-z]+(?:\s+\d{4})?)\s*(?:\([^)]+\))?/i;

interface RawExpEntry {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

function tryCreateNewLinkedInExp(lines: string[], i: number, dateMatch: RegExpMatchArray): RawExpEntry | null {
  if (i < 2) return null;
  const role = lines[i - 1];
  const comp = lines[i - 2];
  return {
    company: comp || 'Software Company',
    role: role || 'Software Engineer',
    startDate: dateMatch[1].trim(),
    endDate: dateMatch[2].trim(),
    bullets: []
  };
}

function appendLinkedInBullet(current: RawExpEntry, line: string) {
  if (line.startsWith('-')) {
    current.bullets.push(cleanSpecialPunctuation(line.slice(1)));
    return;
  }
  if (current.bullets.length > 0 && !/[.!?:]$/.test(current.bullets[current.bullets.length - 1])) {
    current.bullets[current.bullets.length - 1] += ` ${line}`;
    return;
  }
  if (line.length > 20 && !line.startsWith('Key ') && !line.startsWith('Skills and ')) {
    current.bullets.push(line);
  }
}

function shouldSkipLocation(lines: string[], nextIdx: number): boolean {
  return nextIdx < lines.length && !lines[nextIdx].startsWith('-') && lines[nextIdx].length < 40;
}

function processLinkedInExpLines(lines: string[]): RawExpEntry[] {
  const entries: RawExpEntry[] = [];
  let current: RawExpEntry | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateMatch = line.match(LI_DATE_REGEX);
    const created = dateMatch ? tryCreateNewLinkedInExp(lines, i, dateMatch) : null;

    if (created) {
      if (current) entries.push(current);
      current = created;
      if (shouldSkipLocation(lines, i + 1)) i++;
    } else if (current) {
      appendLinkedInBullet(current, line);
    }
  }

  if (current) entries.push(current);
  return entries;
}

function parseLinkedInExperience(mainText: string): WorkExperience[] {
  const match = mainText.match(/Experience\s+([\s\S]*?)(?=Education|$)/i);
  if (!match) return [];

  const lines = match[1].split('\n').map(cleanLinkedInLine).filter(Boolean);
  const rawEntries = processLinkedInExpLines(lines);

  return rawEntries.slice(0, 6).map((e, idx) => ({
    id: `li-exp-${idx}-${Date.now()}`,
    company: e.company,
    roleTitle: { en: e.role },
    startDate: e.startDate,
    endDate: e.endDate,
    bullets: e.bullets.map((b, bIdx) => ({
      id: `li-b-${bIdx}`,
      text: { en: b },
      tags: ['fullstack'],
      enabled: true
    })),
    tags: ['fullstack'],
    enabled: true
  }));
}

function parseLinkedInEducation(mainText: string): EducationItem[] {
  const match = mainText.match(/Education\s+([\s\S]*)/i);
  if (!match) return [];

  const lines = match[1].split('\n').map(cleanLinkedInLine).filter(Boolean);
  const items: EducationItem[] = [];

  for (let i = 0; i < lines.length; i += 2) {
    const institution = lines[i];
    const details = lines[i + 1] || '';
    if (!institution) continue;

    const parts = details.split('·');
    const program = parts[0] ? cleanSpecialPunctuation(parts[0]) : institution;
    const datesMatch = details.match(/\(([^)]+)\)/);
    const dates = datesMatch ? datesMatch[1] : 'Graduated';

    items.push({
      id: `li-edu-${items.length}`,
      institution: institution.slice(0, 50),
      program: { en: program.slice(0, 60) },
      dates,
      enabled: true
    });
  }

  return items.slice(0, 5);
}

/**
 * Dedicated parser for LinkedIn official Profile PDF exports.
 */
export function parseLinkedInPdfContent(rawText: string): IngestionResult {
  const contacts = extractSidebarInfo(rawText);
  const skills = parseLinkedInSkills(rawText);
  const languages = parseLinkedInLanguages(rawText);
  const header = extractLinkedInHeader(rawText);
  const bio = extractLinkedInSummary(rawText);
  const experiences = parseLinkedInExperience(rawText);
  const education = parseLinkedInEducation(rawText);

  return {
    sourceType: 'linkedin',
    detectedName: header.name,
    detectedHeadline: header.headline,
    detectedBio: bio,
    detectedEmail: contacts.email,
    detectedPhone: contacts.phone,
    detectedLocation: header.location,
    detectedGithubUrl: contacts.portfolioUrl,
    detectedLinkedinUrl: contacts.linkedinUrl,
    detectedPortfolioUrl: contacts.portfolioUrl,
    experiences,
    education,
    languages,
    skillCategories: skills,
    projects: []
  };
}
