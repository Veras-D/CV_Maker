import jsPDF from 'jspdf';
import { 
  CVData, 
  LanguageCode, 
  WorkExperience, 
  ProjectItem, 
  SkillCategory, 
  EducationItem, 
  LanguageItem 
} from '../types/cv';
import { 
  CONTENT_WIDTH, 
  MARGIN_LEFT, 
  MARGIN_RIGHT, 
  getPDFContactItems 
} from './pdfHeaderUtils';
import { sanitizePdfText } from './pdfSanitizer';

export const USABLE_PAGE_HEIGHT_MM = 262; // 278 (MAX_PAGE_Y) - 16 (TOP_MARGIN)

let measurementDoc: jsPDF | null = null;

function getMeasurementDoc(): jsPDF {
  if (!measurementDoc) {
    measurementDoc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
  }
  return measurementDoc;
}

export function estimateHeaderHeightMm(profile: CVData['profile']): number {
  const name = (profile.name || '').trim();
  const headline = (profile.headline?.en || '').trim();
  const contactItems = getPDFContactItems(profile);

  if (!name && !headline && contactItems.length === 0) {
    return 18;
  }

  let h = 18;
  if (name) h += 8.5;
  if (headline) h += 4.5;
  if (contactItems.length > 0) h += 5.5;
  return h + 5.5; // Divider line and padding
}

export function estimateSummaryHeightMm(summaryText: string): number {
  const clean = sanitizePdfText(summaryText);
  if (!clean) return 0;
  const doc = getMeasurementDoc();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.2);
  const lines = doc.splitTextToSize(clean, CONTENT_WIDTH);
  return 12 + (lines.length * 4.2) + 2.0; // Section header + lines + padding
}

export function estimateExperienceItemHeightMm(exp: WorkExperience, lang: LanguageCode): number {
  if (!exp.enabled) return 0;
  let h = 7.8; // Role title row + company row

  const rawSummary = exp.summary ? (exp.summary[lang] || exp.summary.en || '') : '';
  const cleanSummary = sanitizePdfText(rawSummary);
  if (cleanSummary) {
    const doc = getMeasurementDoc();
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.4);
    const sLines = doc.splitTextToSize(cleanSummary, CONTENT_WIDTH);
    h += (sLines.length * 3.6) + 1.0;
  }

  const activeBullets = exp.bullets.filter(b => b.enabled);
  if (activeBullets.length > 0) {
    const doc = getMeasurementDoc();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    activeBullets.forEach(b => {
      const rawText = b.text[lang] || b.text.en || '';
      const cleanText = sanitizePdfText(rawText);
      if (cleanText) {
        const bLines = doc.splitTextToSize(cleanText, CONTENT_WIDTH - 6);
        h += (bLines.length * 3.8) + 1.0;
      }
    });
  }

  return h + 1.8; // Inter-experience padding
}

export function estimateExperiencesHeightMm(experiences: WorkExperience[], lang: LanguageCode): number {
  const active = experiences.filter(e => e.enabled);
  if (active.length === 0) return 0;
  let total = 12; // Section header
  active.forEach(exp => {
    total += estimateExperienceItemHeightMm(exp, lang);
  });
  return total + 2.0;
}

export function estimateSkillsHeightMm(categories: SkillCategory[], _lang?: LanguageCode): number {
  const activeCategories = categories.filter(c => c.skills.some(s => s.enabled));
  if (activeCategories.length === 0) return 0;

  let total = 12; // Section header
  const doc = getMeasurementDoc();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);

  activeCategories.forEach(cat => {
    const activeSkills = cat.skills.filter(s => s.enabled);
    if (activeSkills.length === 0) return;
    const skillsString = activeSkills.map(s => sanitizePdfText(s.name)).filter(Boolean).join(', ');
    const lines = doc.splitTextToSize(skillsString, CONTENT_WIDTH - 44);
    total += (lines.length * 3.8) + 0.8;
  });

  return total + 3.0;
}

export function estimateSingleProjectHeightMm(project: ProjectItem, lang: LanguageCode): number {
  if (!project.enabled) return 0;
  let h = 3.8; // Title row
  const cleanDesc = sanitizePdfText(project.description[lang] || project.description.en || '');
  if (cleanDesc) {
    const doc = getMeasurementDoc();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.6);
    const pLines = doc.splitTextToSize(cleanDesc, CONTENT_WIDTH);
    h += (pLines.length * 3.6) + 1.5;
  }
  if (project.techStack && project.techStack.length > 0) {
    let techX = MARGIN_LEFT;
    let badgeH = 5.5;
    const doc = getMeasurementDoc();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    project.techStack.forEach(tech => {
      const cleanTech = sanitizePdfText(tech);
      if (!cleanTech) return;
      const tWidth = doc.getTextWidth(cleanTech) + 4.0;
      if (techX + tWidth > MARGIN_RIGHT) {
        techX = MARGIN_LEFT;
        badgeH += 5.0;
      }
      techX += tWidth + 2.0;
    });
    h += badgeH;
  } else {
    h += 2.0;
  }
  return h;
}

export function estimateProjectsHeightMm(projects: ProjectItem[], lang: LanguageCode): number {
  const active = projects.filter(p => p.enabled);
  if (active.length === 0) return 0;
  let total = 12; // Section header
  active.forEach(p => {
    total += estimateSingleProjectHeightMm(p, lang);
  });
  return total + 2.0;
}

export function estimateEducationAndLanguagesHeightMm(
  education: EducationItem[],
  languages: LanguageItem[]
): number {
  const activeEdu = education.filter(e => e.enabled);
  const activeLang = languages.filter(l => l.enabled);
  if (activeEdu.length === 0 && activeLang.length === 0) return 0;

  let eduH = 0;
  if (activeEdu.length > 0) {
    eduH = 5.3 + (activeEdu.length * 10.6); // Header line + items (3.4 + 3.2 + 4.0)
  }

  let langH = 0;
  if (activeLang.length > 0) {
    langH = 5.3 + (activeLang.length * 9.7); // Header line + items (3.2 + 6.5)
  }

  return Math.max(eduH, langH) + 6.0;
}

export function calculateCvTotalHeightMm(cvData: CVData, language: LanguageCode = 'en'): number {
  let total = estimateHeaderHeightMm(cvData.profile);
  const summaryText = cvData.profile.summary?.[language] || cvData.profile.summary?.en || '';
  total += estimateSummaryHeightMm(summaryText);
  total += estimateExperiencesHeightMm(cvData.experiences, language);
  total += estimateSkillsHeightMm(cvData.skillCategories, language);
  total += estimateProjectsHeightMm(cvData.projects, language);
  total += estimateEducationAndLanguagesHeightMm(cvData.education, cvData.languages);
  return total;
}
