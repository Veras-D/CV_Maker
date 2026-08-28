import { IngestionResult } from './ingestionService';
import { ProjectItem, SkillCategory } from '../types/cv';
import { fetchWebsiteHtml } from './htmlFetchHelper';

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
  if (h1.length > 0 && h1.length < 35 && !/^(home|welcome|portfolio)$/i.test(h1)) return h1;
  return pageTitle.split(/[-|–]|\s:\s/)[0].trim();
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

function extractSkillsFromDOM(doc: Document, jsonLd: JsonLdPerson | null): string[] {
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

  return Array.from(detected);
}

function parseCardProject(card: Element, originUrl: string, idx: number): ProjectItem | null {
  const titleEl = card.querySelector('h1, h2, h3, h4, strong, .title, [class*="title"]');
  const title = titleEl?.textContent?.trim();
  if (!title || title.length > 50 || /^(my skills|about me|contact|projects|home|skills|navigation)$/i.test(title)) {
    return null;
  }

  const desc = card.querySelector('p, .description, [class*="desc"]')?.textContent?.trim();
  const link = card.querySelector('a[href]')?.getAttribute('href') || originUrl;
  const techBadges = Array.from(card.querySelectorAll('.tag, .badge, .tech, [class*="tag"], [class*="chip"]'))
    .map(t => t.textContent?.trim() || '')
    .filter(t => t.length > 1 && t.length < 20);

  return {
    id: `proj-web-${idx}-${Date.now()}`,
    title,
    description: { en: desc || `Featured project on portfolio (${title}).` },
    techStack: techBadges.slice(0, 5),
    url: link.startsWith('http') ? link : `${originUrl.replace(/\/$/, '')}/${link.replace(/^\//, '')}`,
    tags: ['fullstack'],
    enabled: true
  };
}

function extractProjectsFromDOM(doc: Document, originUrl: string): ProjectItem[] {
  const selectors = '.project-card, [class*="project"], article, .portfolio-item, .card, [class*="portfolio"], .grid > div';
  const cards = doc.querySelectorAll(selectors);
  const projects: ProjectItem[] = [];

  cards.forEach((card, idx) => {
    if (projects.length >= 15) return;
    const proj = parseCardProject(card, originUrl, idx);
    if (proj) projects.push(proj);
  });

  return projects;
}

const RELEVANT_SUBPAGE_REGEX = /(?:projects?|portfolio|work|works|about|bio|experience|career|resume|cv|contact|projetos|sobre)/i;

function resolveSubpageUrl(href: string, linkText: string, baseUrl: string, baseDomain: string): string | null {
  if (!href || href.startsWith('#') || /^(mailto|tel|javascript):/i.test(href)) {
    return null;
  }
  try {
    const resolved = new URL(href, baseUrl);
    const path = resolved.pathname.toLowerCase();
    const isTarget = RELEVANT_SUBPAGE_REGEX.test(path) || RELEVANT_SUBPAGE_REGEX.test(linkText);
    if (resolved.hostname === baseDomain && path !== '/' && isTarget) {
      return resolved.href;
    }
  } catch {
    // Ignore invalid URL
  }
  return null;
}

function findInternalSubpageUrls(doc: Document, baseUrl: string): string[] {
  let baseDomain = '';
  try {
    baseDomain = new URL(baseUrl).hostname;
  } catch {
    return [];
  }

  const subpages = new Set<string>();
  const links = doc.querySelectorAll('a[href]');
  for (const a of links) {
    const href = a.getAttribute('href')?.trim() || '';
    const text = (a.textContent || '').trim().toLowerCase();
    const resolved = resolveSubpageUrl(href, text, baseUrl, baseDomain);
    if (resolved) subpages.add(resolved);
  }

  return Array.from(subpages).slice(0, 6);
}

interface AggregateData {
  projects: ProjectItem[];
  skills: Set<string>;
  aboutBio?: string;
}

function processSubpage(doc: Document, subUrl: string, aggregate: AggregateData) {
  extractSkillsFromDOM(doc, null).forEach(s => aggregate.skills.add(s));
  const subProjects = extractProjectsFromDOM(doc, subUrl);
  aggregate.projects.push(...subProjects);

  // If this is an about page, extract clean bio paragraph
  if (/(about|bio|sobre)/i.test(subUrl)) {
    const p = doc.querySelector('main p, article p, .about p, .content p')?.textContent?.trim();
    if (p && p.length > 40 && p.length < 400 && !aggregate.aboutBio) {
      aggregate.aboutBio = p;
    }
  }
}

async function crawlAndAggregateSubpages(doc: Document, url: string): Promise<AggregateData> {
  const subpageUrls = findInternalSubpageUrls(doc, url);
  const aggregate: AggregateData = {
    projects: extractProjectsFromDOM(doc, url),
    skills: new Set(extractSkillsFromDOM(doc, null))
  };

  if (subpageUrls.length > 0) {
    const parser = new DOMParser();
    const settled = await Promise.allSettled(subpageUrls.map(u => fetchWebsiteHtml(u)));

    settled.forEach((result, idx) => {
      if (result.status === 'fulfilled' && result.value) {
        const subDoc = parser.parseFromString(result.value, 'text/html');
        processSubpage(subDoc, subpageUrls[idx], aggregate);
      }
    });
  }

  return aggregate;
}

function finalizeSkills(skillsSet: Set<string>): SkillCategory[] {
  if (skillsSet.size === 0) return [];
  return [{
    id: `cat-web-${Date.now()}`,
    categoryName: { en: 'Skills & Technologies' },
    skills: Array.from(skillsSet).slice(0, 20).map((name, idx) => ({
      id: `skill-web-${idx}`,
      name,
      tags: ['fullstack'],
      enabled: true
    }))
  }];
}

/**
 * Scrapes rich metadata, contact info, skills, and projects by crawling the homepage and all relevant internal subpages
 */
export async function scrapePortfolioFromHTML(html: string, url: string): Promise<IngestionResult> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const jsonLd = parseJsonLd(doc);

  const { detectedName, detectedBio } = extractMetaInfo(doc, jsonLd);
  const { detectedGithubUrl, detectedLinkedinUrl, detectedPhone } = extractSocialLinks(doc, jsonLd);

  const aggregated = await crawlAndAggregateSubpages(doc, url);

  // Deduplicate projects by title
  const seenProj = new Set<string>();
  const deduplicatedProjects = aggregated.projects.filter(p => {
    const key = p.title.toLowerCase();
    if (seenProj.has(key)) return false;
    seenProj.add(key);
    return true;
  });

  return {
    sourceType: 'website',
    detectedName: detectedName || undefined,
    detectedBio: aggregated.aboutBio || detectedBio || undefined,
    detectedPortfolioUrl: url,
    detectedGithubUrl,
    detectedLinkedinUrl,
    detectedPhone,
    experiences: [],
    projects: deduplicatedProjects.slice(0, 12),
    skillCategories: finalizeSkills(aggregated.skills),
    education: [],
    languages: []
  };
}
