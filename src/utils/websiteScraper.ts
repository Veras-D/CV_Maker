import { IngestionResult } from './ingestionService';
import { ProjectItem, SkillCategory } from '../types/cv';

interface JsonLdPerson {
  '@type'?: string;
  name?: string;
  jobTitle?: string;
  description?: string;
  sameAs?: string[] | string;
  knowsAbout?: string[] | string;
}

function parseJsonLd(doc: Document): JsonLdPerson | null {
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
  for (const s of scripts) {
    try {
      const data = JSON.parse(s.textContent || '');
      if (data['@type'] === 'Person' || data.name || data.knowsAbout) {
        return data as JsonLdPerson;
      }
    } catch {
      // Continue
    }
  }
  return null;
}

function getMetaContent(doc: Document, prop: string): string {
  const byProp = doc.querySelector(`meta[property="${prop}"]`)?.getAttribute('content');
  if (byProp) return byProp;
  const byName = doc.querySelector(`meta[name="${prop}"]`)?.getAttribute('content');
  return byName || '';
}

function resolvePageTitle(doc: Document): string {
  const ogTitle = getMetaContent(doc, 'og:title');
  if (ogTitle) return ogTitle;
  const twTitle = getMetaContent(doc, 'twitter:title');
  if (twTitle) return twTitle;
  return doc.querySelector('title')?.textContent || '';
}

function resolvePageBio(doc: Document, jsonLd: JsonLdPerson | null): string {
  if (jsonLd?.description) return jsonLd.description;
  const ogDesc = getMetaContent(doc, 'og:description');
  if (ogDesc) return ogDesc;
  const metaDesc = getMetaContent(doc, 'description');
  if (metaDesc) return metaDesc;
  return doc.querySelector('p')?.textContent?.trim() || '';
}

function resolvePageName(doc: Document, jsonLd: JsonLdPerson | null, pageTitle: string): string {
  if (jsonLd?.name) return jsonLd.name;
  const h1 = doc.querySelector('h1')?.textContent?.trim() || '';
  if (h1.length > 0 && h1.length < 35) return h1;
  return pageTitle.split(/[-|–:]/)[0].trim();
}

function extractMetaInfo(doc: Document, jsonLd: JsonLdPerson | null) {
  const pageTitle = resolvePageTitle(doc);
  const detectedName = resolvePageName(doc, jsonLd, pageTitle);
  const detectedBio = resolvePageBio(doc, jsonLd);
  return { detectedName, detectedBio };
}

function extractSocialLinks(doc: Document, jsonLd: JsonLdPerson | null) {
  const sameAsList: string[] = [];
  if (jsonLd?.sameAs) {
    const list = Array.isArray(jsonLd.sameAs) ? jsonLd.sameAs : [jsonLd.sameAs];
    sameAsList.push(...list);
  }

  const links = Array.from(doc.querySelectorAll('a[href]')).map(a => a.getAttribute('href') || '');
  const allUrls = [...sameAsList, ...links];

  const githubUrl = allUrls.find(u => /github\.com\/[a-zA-Z0-9_-]+/i.test(u));
  const linkedinUrl = allUrls.find(u => /linkedin\.com\/in\/[a-zA-Z0-9_-]+/i.test(u));
  const phoneMatch = allUrls.find(u => /(?:tel:|wa\.me\/)(\+?\d+)/i.test(u));
  const detectedPhone = phoneMatch ? phoneMatch.replace(/^(?:tel:|https?:\/\/wa\.me\/)/i, '') : undefined;

  return { detectedGithubUrl: githubUrl, detectedLinkedinUrl: linkedinUrl, detectedPhone };
}

const TECH_KEYWORDS = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Rust', 'Docker',
  'Kubernetes', 'AWS', 'SQL', 'PostgreSQL', 'MongoDB', 'HTML', 'CSS', 'Tailwind',
  'GraphQL', 'Git', 'Next.js', 'Vue', 'Angular', 'C++', 'Java', 'Linux', 'Figma',
  'Spring Boot', 'DevOps', 'QA', 'Data Science', 'UI Design', 'Frontend', 'Backend'
];

function extractSkillsFromDOM(doc: Document, jsonLd: JsonLdPerson | null): SkillCategory[] {
  const detected = new Set<string>();

  if (jsonLd?.knowsAbout) {
    const list = Array.isArray(jsonLd.knowsAbout) ? jsonLd.knowsAbout : [jsonLd.knowsAbout];
    list.forEach(k => detected.add(k.trim()));
  }

  const cards = doc.querySelectorAll('.skill-card, [class*="skill"], [class*="badge"], [class*="chip"]');
  cards.forEach(card => {
    const title = card.querySelector('h3, h4, strong, span')?.textContent?.trim();
    if (title && title.length < 30) detected.add(title);
  });

  const fullText = (doc.body?.textContent || '').toLowerCase();
  TECH_KEYWORDS.forEach(tech => {
    const regex = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(fullText)) {
      detected.add(tech);
    }
  });

  if (detected.size === 0) return [];
  return [{
    id: `cat-web-${Date.now()}`,
    categoryName: { en: 'Skills & Technologies' },
    skills: Array.from(detected).slice(0, 16).map((name, idx) => ({
      id: `skill-web-${idx}`,
      name,
      tags: ['fullstack'],
      enabled: true
    }))
  }];
}

function extractProjectsFromDOM(doc: Document, originUrl: string): ProjectItem[] {
  const cards = doc.querySelectorAll('.project-card, [class*="project"], article, .portfolio-item');
  const projects: ProjectItem[] = [];

  cards.forEach((card, idx) => {
    if (idx >= 6) return;
    const title = card.querySelector('h3, h4, h2, strong')?.textContent?.trim();
    const desc = card.querySelector('p')?.textContent?.trim();
    const link = card.querySelector('a[href]')?.getAttribute('href') || originUrl;
    
    if (title && title.length < 50 && !/^(my skills|about me|contact|projects)$/i.test(title)) {
      projects.push({
        id: `proj-web-${idx}-${Date.now()}`,
        title,
        description: { en: desc || `Featured project on portfolio (${title}).` },
        techStack: [],
        url: link.startsWith('http') ? link : `${originUrl.replace(/\/$/, '')}/${link.replace(/^\//, '')}`,
        tags: ['fullstack'],
        enabled: true
      });
    }
  });

  return projects;
}

/**
 * Scrapes rich metadata, contact info, skills, and projects from a website's HTML DOM
 */
export function scrapePortfolioFromHTML(html: string, url: string): IngestionResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const jsonLd = parseJsonLd(doc);

  const { detectedName, detectedBio } = extractMetaInfo(doc, jsonLd);
  const { detectedGithubUrl, detectedLinkedinUrl, detectedPhone } = extractSocialLinks(doc, jsonLd);
  const skillCategories = extractSkillsFromDOM(doc, jsonLd);
  const projects = extractProjectsFromDOM(doc, url);

  return {
    sourceType: 'website',
    detectedName: detectedName || undefined,
    detectedBio: detectedBio || undefined,
    detectedPortfolioUrl: url,
    detectedGithubUrl,
    detectedLinkedinUrl,
    detectedPhone,
    experiences: [],
    projects,
    skillCategories,
    education: [],
    languages: []
  };
}
