import jsPDF from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import { 
  CVData, 
  LanguageCode, 
  PDFMetadata, 
  WorkExperience, 
  WorkBullet, 
  ProjectItem, 
  SkillCategory, 
  SkillItem, 
  EducationItem, 
  LanguageItem,
  UserProfile 
} from '../types/cv';

export interface PDFExportParams {
  elementId?: string;
  filename: string;
  metadata: PDFMetadata;
  data?: CVData;
  language?: LanguageCode;
  selectedTags?: string[];
}

const PAGE_WIDTH = 210;
const MARGIN_LEFT = 14;
const MARGIN_RIGHT = 196;
const CONTENT_WIDTH = MARGIN_RIGHT - MARGIN_LEFT; // 182mm

function drawSectionHeader(doc: jsPDF, title: string, y: number): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(title.toUpperCase(), MARGIN_LEFT, y);
  const nextY = y + 1.5;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.25);
  doc.line(MARGIN_LEFT, nextY, MARGIN_RIGHT, nextY);
  return nextY + 4.2;
}

function drawHeader(doc: jsPDF, profile: UserProfile, lang: LanguageCode): number {
  let y = 18;

  // Name
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text(profile.name.toUpperCase(), PAGE_WIDTH / 2, y, { align: 'center' });
  y += 6.2;

  // Headline
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(profile.headline[lang] || profile.headline.en, PAGE_WIDTH / 2, y, { align: 'center' });
  y += 5.0;

  // Contact info row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);

  const contactItems: { text: string; url?: string }[] = [
    { text: profile.email },
    { text: profile.phone },
    { text: profile.location }
  ];

  if (profile.portfolioUrl) {
    contactItems.push({ text: profile.portfolioUrl, url: profile.portfolioUrl });
  }

  const dotWidth = 5.2;
  let totalWidth = 0;
  const itemWidths = contactItems.map(item => {
    const w = doc.getTextWidth(item.text);
    totalWidth += w;
    return w;
  });
  totalWidth += (contactItems.length - 1) * dotWidth;

  let startX = (PAGE_WIDTH - totalWidth) / 2;
  contactItems.forEach((item, idx) => {
    if (item.url) {
      doc.setTextColor(3, 105, 161);
      doc.textWithLink(item.text, startX, y, { url: item.url });
    } else {
      doc.setTextColor(71, 85, 105);
      doc.text(item.text, startX, y);
    }
    startX += itemWidths[idx];

    if (idx < contactItems.length - 1) {
      doc.setFillColor(100, 116, 139);
      doc.circle(startX + (dotWidth / 2), y - 0.7, 0.4, 'F');
      startX += dotWidth;
    }
  });

  y += 3.8;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.65);
  doc.line(MARGIN_LEFT, y, MARGIN_RIGHT, y);
  return y + 5.5;
}

function drawSummary(doc: jsPDF, profile: UserProfile, lang: LanguageCode, startY: number): number {
  let y = drawSectionHeader(doc, lang === 'en' ? 'Executive Profile' : 'Profil', startY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.2);
  doc.setTextColor(30, 41, 59);
  const summaryText = profile.summary[lang] || profile.summary.en;
  const summaryLines = doc.splitTextToSize(summaryText, CONTENT_WIDTH);
  doc.text(summaryLines, MARGIN_LEFT, y);
  y += (summaryLines.length * 4.2) + 4.0;
  return y;
}

function drawExperiences(
  doc: jsPDF, 
  experiences: WorkExperience[], 
  options: { tags: string[]; lang: LanguageCode; startY: number }
): number {
  const { tags, lang, startY } = options;
  const filtered = experiences
    .filter(e => e.enabled)
    .map(e => ({
      ...e,
      activeBullets: e.bullets.filter(b => b.enabled && (tags.length === 0 || b.tags.some(t => tags.includes(t))))
    }))
    .filter(e => e.activeBullets.length > 0 || tags.length === 0);

  if (filtered.length === 0) return startY;

  let y = drawSectionHeader(doc, lang === 'en' ? 'Professional Experience' : 'Pracovní Zkušenosti', startY);

  filtered.forEach(exp => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.8);
    doc.setTextColor(15, 23, 42);
    doc.text(exp.roleTitle[lang] || exp.roleTitle.en, MARGIN_LEFT, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${exp.startDate} – ${exp.endDate}`, MARGIN_RIGHT, y, { align: 'right' });
    y += 4.0;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(51, 65, 85);
    doc.text(`${exp.company} | ${exp.location || 'Remote'}`, MARGIN_LEFT, y);
    y += 3.8;

    exp.activeBullets.forEach((b: WorkBullet) => {
      doc.setFillColor(30, 41, 59);
      doc.circle(MARGIN_LEFT + 2.0, y - 1.0, 0.45, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.8);
      doc.setTextColor(30, 41, 59);
      const bulletText = b.text[lang] || b.text.en;
      const bLines = doc.splitTextToSize(bulletText, CONTENT_WIDTH - 6);
      doc.text(bLines, MARGIN_LEFT + 5.0, y);
      y += (bLines.length * 3.8) + 1.0;
    });

    y += 1.8;
  });

  return y + 2.0;
}

function drawProjects(doc: jsPDF, projects: ProjectItem[], lang: LanguageCode, startY: number): number {
  const activeProjects = projects.filter(p => p.enabled);
  if (activeProjects.length === 0) return startY;

  let y = drawSectionHeader(doc, lang === 'en' ? 'Featured Portfolio Projects' : 'Projekty', startY);

  activeProjects.forEach(p => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.6);
    doc.setTextColor(15, 23, 42);
    doc.text(p.title, MARGIN_LEFT, y);

    if (p.url) {
      doc.setFont('courier', 'normal');
      doc.setFontSize(8.0);
      doc.setTextColor(3, 105, 161);
      const linkW = doc.getTextWidth(p.url) + 3.5;
      const linkX = MARGIN_RIGHT - linkW;
      doc.textWithLink(p.url, linkX, y, { url: p.url });

      const arrowX = MARGIN_RIGHT - 1.2;
      const arrowY = y - 2.0;
      doc.setDrawColor(3, 105, 161);
      doc.setLineWidth(0.22);
      doc.line(arrowX - 1.6, arrowY + 1.6, arrowX, arrowY);
      doc.line(arrowX - 1.1, arrowY, arrowX, arrowY);
      doc.line(arrowX, arrowY + 1.1, arrowX, arrowY);
    }

    y += 3.8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.6);
    doc.setTextColor(51, 65, 85);
    const descText = p.description[lang] || p.description.en;
    const pLines = doc.splitTextToSize(descText, CONTENT_WIDTH);
    doc.text(pLines, MARGIN_LEFT, y);
    y += (pLines.length * 3.6) + 1.5;

    if (p.techStack && p.techStack.length > 0) {
      let techX = MARGIN_LEFT;
      p.techStack.forEach(tech => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.6);
        const tWidth = doc.getTextWidth(tech) + 4.0;
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.roundedRect(techX, y - 2.8, tWidth, 4.0, 0.8, 0.8, 'FD');
        doc.setTextColor(71, 85, 105);
        doc.text(tech, techX + 2.0, y);
        techX += tWidth + 2.0;
      });
      y += 5.5;
    } else {
      y += 2.0;
    }
  });

  return y + 2.0;
}

function drawSkills(doc: jsPDF, skillCategories: SkillCategory[], lang: LanguageCode, startY: number): number {
  if (skillCategories.length === 0) return startY;

  let y = drawSectionHeader(doc, lang === 'en' ? 'Technical Competencies' : 'Technické Kompetence', startY);

  skillCategories.forEach(cat => {
    const activeSkills = cat.skills.filter((s: SkillItem) => s.enabled);
    if (activeSkills.length === 0) return;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(15, 23, 42);
    const catLabel = `${cat.categoryName[lang] || cat.categoryName.en}:`;
    doc.text(catLabel, MARGIN_LEFT, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(30, 41, 59);
    const skillsString = activeSkills.map((s: SkillItem) => s.name).join(', ');
    const skillLines = doc.splitTextToSize(skillsString, CONTENT_WIDTH - 44);
    doc.text(skillLines, MARGIN_LEFT + 44, y);
    y += (skillLines.length * 3.8) + 0.8;
  });

  return y + 3.0;
}

function drawEducationAndLanguages(
  doc: jsPDF, 
  education: EducationItem[], 
  languages: LanguageItem[], 
  options: { lang: LanguageCode; startY: number }
): number {
  const { lang, startY } = options;
  const activeEdu = education.filter(e => e.enabled);
  const activeLang = languages.filter(l => l.enabled);
  if (activeEdu.length === 0 && activeLang.length === 0) return startY;

  const COL1_X = MARGIN_LEFT;
  const COL2_X = 110;
  const COL_WIDTH = 86;
  let y = startY;

  if (activeEdu.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.setTextColor(15, 23, 42);
    doc.text(lang === 'en' ? 'EDUCATION' : 'VZDĚLÁNÍ', COL1_X, y);
    const nextY = y + 1.5;
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.2);
    doc.line(COL1_X, nextY, COL1_X + COL_WIDTH, nextY);
    y = nextY + 3.8;

    activeEdu.forEach(edu => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.6);
      doc.setTextColor(15, 23, 42);
      doc.text(edu.institution, COL1_X, y);
      y += 3.4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.0);
      doc.setTextColor(71, 85, 105);
      doc.text(edu.program[lang] || edu.program.en, COL1_X, y);
      y += 3.2;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.6);
      doc.setTextColor(100, 116, 139);
      doc.text(edu.dates, COL1_X, y);
      y += 4.0;
    });
  }

  const col1EndY = y;
  y = startY;

  if (activeLang.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.setTextColor(15, 23, 42);
    doc.text(lang === 'en' ? 'LANGUAGES' : 'JAZYKY', COL2_X, y);
    const nextY = y + 1.5;
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.2);
    doc.line(COL2_X, nextY, MARGIN_RIGHT, nextY);
    y = nextY + 3.8;

    activeLang.forEach(l => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.6);
      doc.setTextColor(15, 23, 42);
      doc.text(l.language[lang] || l.language.en, COL2_X, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.6);
      doc.setTextColor(71, 85, 105);
      doc.text(l.proficiency[lang] || l.proficiency.en, MARGIN_RIGHT, y, { align: 'right' });
      y += 3.6;
    });
  }

  return Math.max(col1EndY, y);
}

async function injectMetadataAndDownload(doc: jsPDF, metadata: PDFMetadata, filename: string): Promise<void> {
  const pdfArrayBuffer = doc.output('arraybuffer');
  const pdfDoc = await PDFDocument.load(pdfArrayBuffer);

  if (metadata.dc_title) pdfDoc.setTitle(metadata.dc_title);
  if (metadata.dc_creator) pdfDoc.setAuthor(metadata.dc_creator);
  if (metadata.cp_keywords) {
    const keywordsArray = metadata.cp_keywords.split(',').map(k => k.trim());
    pdfDoc.setKeywords(keywordsArray);
  }
  if (metadata.cp_description) pdfDoc.setSubject(metadata.cp_description);
  if (metadata.cp_category) pdfDoc.setProducer(`CV Maker & Role Tracker (${metadata.cp_category})`);

  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());

  const finalPdfBytes = await pdfDoc.save();
  const blob = new Blob([finalPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportCVToPDF(params: PDFExportParams): Promise<void> {
  const { filename, metadata, data, language = 'en', selectedTags = [] } = params;
  if (!data) {
    throw new Error('CV Data not found for vector PDF generation');
  }

  const { profile, experiences, skillCategories, projects, education, languages } = data;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  let y = drawHeader(doc, profile, language);
  y = drawSummary(doc, profile, language, y);
  y = drawExperiences(doc, experiences, { tags: selectedTags, lang: language, startY: y });
  y = drawProjects(doc, projects, language, y);
  y = drawSkills(doc, skillCategories, language, y);
  drawEducationAndLanguages(doc, education, languages, { lang: language, startY: y });

  await injectMetadataAndDownload(doc, metadata, filename);
}
