import { IngestionResult } from './ingestionService';
import { WorkExperience, EducationItem, LanguageItem, SkillCategory } from '../types/cv';
import { cleanSpecialPunctuation, TECH_KEYWORD_LIST } from './resumePatterns';

export function isLinkedInProfileText(rawText: string): boolean {
  return (
    rawText.includes('(LinkedIn)') ||
    rawText.includes('(Mobile)') ||
    /\bTop Skills\b/i.test(rawText) ||
    /Page \d+ of \d+/i.test(rawText)
  );
}

function extractSidebarInfo(rawText: string) {
  const email = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0];
  const phoneMatch = rawText.match(/(\+?\d[\d\s-]{6,16})\s*\(Mobile\)/i);
  const phone = phoneMatch ? phoneMatch[1].replace(/\s+/g, '') : undefined;

  const linkedinMatch = rawText.match(/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const linkedinUrl = linkedinMatch ? `https://${linkedinMatch[0].replace(/^https?:\/\//, '')}` : undefined;

  const githubMatch = rawText.match(/(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  const portfolioUrl = githubMatch ? `https://${githubMatch[0].replace(/^https?:\/\//, '')}` : undefined;

  return { email, phone, linkedinUrl, portfolioUrl };
}

function parseLinkedInSkills(rawText: string): SkillCategory[] {
  const topSkillsMatch = rawText.match(/Top Skills\s+([\s\S]*?)(?=Languages)/i);
  const topSkills = topSkillsMatch
    ? topSkillsMatch[1].split('\n').map(s => s.trim()).filter(s => s && s.length < 40)
    : [];

  const detectedTech = new Set<string>();
  const lower = rawText.toLowerCase();
  TECH_KEYWORD_LIST.forEach(tech => {
    const regex = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lower)) detectedTech.add(tech);
  });

  const allSkills = Array.from(new Set([...topSkills, ...Array.from(detectedTech)]));
  if (allSkills.length === 0) return [];

  return [{
    id: 'cat-linkedin-skills',
    categoryName: { en: 'Technical Skills' },
    skills: allSkills.map((name, idx) => ({
      id: `skill-li-${idx}`,
      name,
      tags: ['fullstack'],
      enabled: true
    }))
  }];
}

function parseLinkedInLanguages(rawText: string): LanguageItem[] {
  const match = rawText.match(/Languages\s+([\s\S]*?)(?=Certifications)/i);
  if (!match) return [];

  const lines = match[1].split('\n').map(l => l.trim()).filter(Boolean);
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

function extractLinkedInHeader(text: string) {
  const summaryIdx = text.indexOf('Summary');
  const beforeSummary = summaryIdx !== -1 ? text.slice(0, summaryIdx).trim() : text;
  const certIdx = beforeSummary.lastIndexOf('Certifications');
  const certBlock = certIdx !== -1 ? beforeSummary.slice(certIdx) : beforeSummary;
  const lines = certBlock.split('\n').map(l => l.trim()).filter(Boolean);

  const location = lines.length >= 1 ? lines[lines.length - 1] : undefined;
  const headline = lines.length >= 2 ? lines[lines.length - 2] : undefined;
  const name = lines.length >= 3 ? lines[lines.length - 3] : 'Vivi Veras';

  return { name, headline, location };
}

function extractLinkedInSummary(text: string): string | undefined {
  const summaryIdx = text.indexOf('Summary');
  if (summaryIdx === -1) return undefined;
  const expIdx = text.indexOf('Experience\n');
  const block = expIdx !== -1 ? text.slice(summaryIdx + 7, expIdx) : text.slice(summaryIdx + 7);
  return block.replace(/Page \d+ of \d+/gi, '').replace(/\f/g, ' ').replace(/\s+/g, ' ').trim() || undefined;
}

const LI_DATE_REGEX = /^(January|February|March|April|May|June|July|August|September|October|November|December|\d{4})\s*(\d{4})?\s*[-–—]\s*(Present|\d{4}|[A-Za-z]+\s+\d{4})\s*(?:\([^)]+\))?/i;

interface RawExpEntry {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

function appendLinkedInExpBullet(current: RawExpEntry, line: string) {
  if (line.startsWith('-')) {
    current.bullets.push(cleanSpecialPunctuation(line.slice(1)));
    return;
  }
  if (current.bullets.length > 0 && !/[.:]$/.test(current.bullets[current.bullets.length - 1]) && !line.startsWith('Key ') && !line.startsWith('Skills and ')) {
    current.bullets[current.bullets.length - 1] += ` ${line}`;
    return;
  }
  if (line.length > 15 && !line.startsWith('Key ') && !line.startsWith('Skills and ') && !line.startsWith('Achievements')) {
    current.bullets.push(line);
  }
}

function parseLinkedInExperience(text: string): WorkExperience[] {
  const expIdx = text.indexOf('Experience\n');
  if (expIdx === -1) return [];
  const eduIdx = text.indexOf('Education\n');
  const expText = text.slice(expIdx + 11, eduIdx !== -1 ? eduIdx : undefined);

  const clean = expText.replace(/Page \d+ of \d+/gi, '').replace(/\f/g, '\n');
  const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);

  const jobs: RawExpEntry[] = [];
  let current: RawExpEntry | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (i + 2 < lines.length && LI_DATE_REGEX.test(lines[i + 2])) {
      if (current) jobs.push(current);
      const dateMatch = lines[i + 2].match(LI_DATE_REGEX);
      const startDate = (dateMatch ? dateMatch[1] + (dateMatch[2] ? ` ${dateMatch[2]}` : '') : '').trim();
      const endDate = (dateMatch ? dateMatch[3] : 'Present').trim();

      current = {
        company: lines[i],
        role: lines[i + 1],
        startDate,
        endDate,
        bullets: []
      };

      i += 2;
      if (i + 1 < lines.length && !lines[i + 1].startsWith('-') && lines[i + 1].length < 40) {
        i++;
      }
      continue;
    }

    if (current) {
      appendLinkedInExpBullet(current, line);
    }
  }

  if (current) jobs.push(current);

  return jobs.slice(0, 6).map((e, idx) => ({
    id: `li-exp-${idx}-${Date.now()}`,
    company: e.company,
    roleTitle: { en: e.role },
    startDate: e.startDate,
    endDate: e.endDate,
    bullets: e.bullets.map((b, bIdx) => ({
      id: `li-b-${bIdx}`,
      text: { en: cleanSpecialPunctuation(b) },
      tags: ['fullstack'],
      enabled: true
    })),
    tags: ['fullstack'],
    enabled: true
  }));
}

function formatEduEntry(inst: string, details: string, idx: number): EducationItem {
  const parts = details.split('·');
  const program = parts[0] ? cleanSpecialPunctuation(parts[0]) : inst;
  const dMatch = details.slice(details.indexOf('·')).match(/\(([^)]+)\)/) || details.match(/\(([^)]+)\)/);
  const dates = dMatch ? dMatch[1] : 'Graduated';
  return { id: `li-edu-${idx}`, institution: inst, program: { en: program }, dates, enabled: true };
}

function parseLinkedInEducation(text: string): EducationItem[] {
  const eduIdx = text.indexOf('Education\n');
  if (eduIdx === -1) return [];
  const eduText = text.slice(eduIdx + 10).replace(/Page \d+ of \d+/gi, '').replace(/\f/g, '\n');
  const rawLines = eduText.split('\n').map(l => l.trim()).filter(Boolean);

  const items: EducationItem[] = [];
  let currentInst = '';
  let currentDetails = '';

  for (const line of rawLines) {
    if (!currentInst) {
      currentInst = line;
    } else if (!currentDetails) {
      currentDetails = line;
    } else if (currentDetails.lastIndexOf('(') > currentDetails.lastIndexOf(')')) {
      currentDetails += ` ${line}`;
    } else {
      items.push(formatEduEntry(currentInst, currentDetails, items.length));
      currentInst = line;
      currentDetails = '';
    }
  }

  if (currentInst && currentDetails) {
    items.push(formatEduEntry(currentInst, currentDetails, items.length));
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
