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
  LanguageItem 
} from '../types/cv';

export async function exportCVToPDF(
  _elementId: string,
  filename: string,
  metadata: PDFMetadata,
  data?: CVData,
  language: LanguageCode = 'en',
  selectedTags: string[] = []
): Promise<void> {
  const cv: CVData = data || (window as any).__CV_DATA__;
  const lang: LanguageCode = language || (window as any).__CV_LANGUAGE__ || 'en';
  const tags: string[] = selectedTags || (window as any).__CV_TAGS__ || [];

  if (!cv) {
    throw new Error('CV Data not found for vector PDF generation');
  }

  const { profile, experiences, skillCategories, projects, education, languages } = cv;

  // A4 dimensions: 210mm x 297mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const PAGE_WIDTH = 210;
  const MARGIN_LEFT = 14;
  const MARGIN_RIGHT = 196;
  const CONTENT_WIDTH = MARGIN_RIGHT - MARGIN_LEFT; // 182mm

  let y = 16;

  // 1. Header: Candidate Name (Times Bold 22pt)
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(profile.name.toUpperCase(), PAGE_WIDTH / 2, y, { align: 'center' });
  y += 6.0;

  // Headline (Helvetica Italic 10pt)
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85); // slate-700
  doc.text(profile.headline[lang] || profile.headline.en, PAGE_WIDTH / 2, y, { align: 'center' });
  y += 4.8;

  // Contact info row (clean ASCII dots and clickable hyperlinks)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const contactItems: { text: string; url?: string }[] = [
    { text: profile.email, url: `mailto:${profile.email}` },
    { text: '|' },
    { text: profile.phone, url: `tel:${profile.phone.replace(/\s+/g, '')}` },
    { text: '|' },
    { text: profile.location }
  ];

  if (profile.portfolioUrl) {
    contactItems.push({ text: '|' });
    contactItems.push({ text: profile.portfolioUrl, url: profile.portfolioUrl });
  }

  // Center the contact info row
  let totalRowWidth = 0;
  const itemWidths = contactItems.map(item => {
    const w = doc.getTextWidth(item.text);
    totalRowWidth += w + 3;
    return w;
  });
  totalRowWidth -= 3;

  let contactX = (PAGE_WIDTH - totalRowWidth) / 2;
  contactItems.forEach((item, idx) => {
    if (item.url) {
      doc.setTextColor(3, 105, 161); // sky-700
      (doc as any).textWithLink(item.text, contactX, y, { url: item.url });
    } else {
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(item.text, contactX, y);
    }
    contactX += itemWidths[idx] + 3;
  });

  y += 3.2;

  // Header bottom border
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.6);
  doc.line(MARGIN_LEFT, y, MARGIN_RIGHT, y);
  y += 5.2;

  // Section Header Helper
  const drawSectionHeader = (title: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.0);
    doc.setTextColor(15, 23, 42);
    doc.text(title.toUpperCase(), MARGIN_LEFT, y);
    y += 1.4;
    doc.setDrawColor(148, 163, 184); // slate-400
    doc.setLineWidth(0.25);
    doc.line(MARGIN_LEFT, y, MARGIN_RIGHT, y);
    y += 4.0;
  };

  // 2. Executive Profile
  drawSectionHeader(lang === 'en' ? 'Executive Profile' : 'Profil');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.6);
  doc.setTextColor(30, 41, 59); // slate-800
  const summaryText = profile.summary[lang] || profile.summary.en;
  const summaryLines = doc.splitTextToSize(summaryText, CONTENT_WIDTH);
  doc.text(summaryLines, MARGIN_LEFT, y);
  y += (summaryLines.length * 3.8) + 3.5;

  // 3. Professional Experience
  const filteredExperiences = experiences
    .filter((e: WorkExperience) => e.enabled)
    .map((e: WorkExperience) => {
      const activeBullets = e.bullets.filter((b: WorkBullet) => 
        b.enabled && (tags.length === 0 || b.tags.some((t: string) => tags.includes(t)))
      );
      return { ...e, activeBullets };
    })
    .filter((e: WorkExperience & { activeBullets: WorkBullet[] }) => e.activeBullets.length > 0 || tags.length === 0);

  if (filteredExperiences.length > 0) {
    drawSectionHeader(lang === 'en' ? 'Professional Experience' : 'Pracovní Zkušenosti');

    filteredExperiences.forEach((exp: WorkExperience & { activeBullets: WorkBullet[] }) => {
      // Role Title (left) & Dates (right)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.2);
      doc.setTextColor(15, 23, 42);
      doc.text(exp.roleTitle[lang] || exp.roleTitle.en, MARGIN_LEFT, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.2);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`${exp.startDate} – ${exp.endDate}`, MARGIN_RIGHT, y, { align: 'right' });
      y += 3.6;

      // Company | Location
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.4);
      doc.setTextColor(51, 65, 85); // slate-700
      doc.text(`${exp.company} | ${exp.location || 'Remote'}`, MARGIN_LEFT, y);
      y += 3.4;

      // Bullets (with vector dot)
      exp.activeBullets.forEach((b: WorkBullet) => {
        doc.setFillColor(30, 41, 59);
        doc.circle(MARGIN_LEFT + 2.0, y - 1.0, 0.45, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.4);
        doc.setTextColor(30, 41, 59);
        const bulletText = b.text[lang] || b.text.en;
        const bLines = doc.splitTextToSize(bulletText, CONTENT_WIDTH - 6);
        doc.text(bLines, MARGIN_LEFT + 5.0, y);
        y += (bLines.length * 3.4) + 0.8;
      });

      y += 1.6;
    });

    y += 1.8;
  }

  // 4. Featured Portfolio Projects
  const activeProjects = projects.filter((p: ProjectItem) => p.enabled);
  if (activeProjects.length > 0) {
    drawSectionHeader(lang === 'en' ? 'Featured Portfolio Projects' : 'Projekty');

    activeProjects.forEach((p: ProjectItem) => {
      // Title (left) & Link (right)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.0);
      doc.setTextColor(15, 23, 42);
      doc.text(p.title, MARGIN_LEFT, y);

      if (p.url) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.0);
        doc.setTextColor(3, 105, 161); // sky-700
        const linkLabel = `${p.url} ->`;
        const linkW = doc.getTextWidth(linkLabel);
        const linkX = MARGIN_RIGHT - linkW;
        (doc as any).textWithLink(linkLabel, linkX, y, { url: p.url });
      }

      y += 3.4;

      // Description
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.0);
      doc.setTextColor(51, 65, 85);
      const descText = p.description[lang] || p.description.en;
      const pLines = doc.splitTextToSize(descText, CONTENT_WIDTH);
      doc.text(pLines, MARGIN_LEFT, y);
      y += (pLines.length * 3.2) + 1.2;

      // Tech Stack Badges
      if (p.techStack && p.techStack.length > 0) {
        let techX = MARGIN_LEFT;
        p.techStack.forEach((tech: string) => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.2);
          const tWidth = doc.getTextWidth(tech) + 3.5;

          // Pill Background & Border
          doc.setFillColor(241, 245, 249); // slate-100
          doc.setDrawColor(226, 232, 240); // slate-200
          doc.setLineWidth(0.2);
          doc.roundedRect(techX, y - 2.6, tWidth, 3.8, 0.8, 0.8, 'FD');

          // Pill Text
          doc.setTextColor(71, 85, 105);
          doc.text(tech, techX + 1.8, y);
          techX += tWidth + 1.8;
        });

        y += 5.0;
      } else {
        y += 1.8;
      }
    });

    y += 1.8;
  }

  // 5. Technical Competencies
  if (skillCategories.length > 0) {
    drawSectionHeader(lang === 'en' ? 'Technical Competencies' : 'Technické Kompetence');

    skillCategories.forEach((cat: SkillCategory) => {
      const activeSkills = cat.skills.filter((s: SkillItem) => s.enabled);
      if (activeSkills.length === 0) return;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.4);
      doc.setTextColor(15, 23, 42);
      const catLabel = `${cat.categoryName[lang] || cat.categoryName.en}:`;
      doc.text(catLabel, MARGIN_LEFT, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.4);
      doc.setTextColor(30, 41, 59);
      const skillsString = activeSkills.map((s: SkillItem) => s.name).join(', ');
      const skillLines = doc.splitTextToSize(skillsString, CONTENT_WIDTH - 44);
      doc.text(skillLines, MARGIN_LEFT + 44, y);
      y += (skillLines.length * 3.4) + 0.6;
    });

    y += 2.8;
  }

  // 6. Education & Languages (2 Columns)
  const activeEdu = education.filter((e: EducationItem) => e.enabled);
  const activeLang = languages.filter((l: LanguageItem) => l.enabled);

  if (activeEdu.length > 0 || activeLang.length > 0) {
    const COL1_X = MARGIN_LEFT;
    const COL2_X = 110;
    const COL_WIDTH = 86;

    const initialTwoColY = y;

    // Left Column: Education
    if (activeEdu.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.8);
      doc.setTextColor(15, 23, 42);
      doc.text(lang === 'en' ? 'EDUCATION' : 'VZDĚLÁNÍ', COL1_X, y);
      y += 1.4;
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.2);
      doc.line(COL1_X, y, COL1_X + COL_WIDTH, y);
      y += 3.4;

      activeEdu.forEach((edu: EducationItem) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.2);
        doc.setTextColor(15, 23, 42);
        doc.text(edu.institution, COL1_X, y);
        y += 3.2;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.8);
        doc.setTextColor(71, 85, 105);
        doc.text(edu.program[lang] || edu.program.en, COL1_X, y);
        y += 3.0;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.4);
        doc.setTextColor(100, 116, 139);
        doc.text(edu.dates, COL1_X, y);
        y += 3.8;
      });
    }

    const col1EndY = y;
    y = initialTwoColY;

    // Right Column: Languages
    if (activeLang.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.8);
      doc.setTextColor(15, 23, 42);
      doc.text(lang === 'en' ? 'LANGUAGES' : 'JAZYKY', COL2_X, y);
      y += 1.4;
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.2);
      doc.line(COL2_X, y, MARGIN_RIGHT, y);
      y += 3.4;

      activeLang.forEach((l: LanguageItem) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.2);
        doc.setTextColor(15, 23, 42);
        doc.text(l.language[lang] || l.language.en, COL2_X, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.2);
        doc.setTextColor(71, 85, 105);
        doc.text(l.proficiency[lang] || l.proficiency.en, MARGIN_RIGHT, y, { align: 'right' });
        y += 3.4;
      });
    }

    y = Math.max(col1EndY, y);
  }

  // 7. Inject Dublin Core & PDF Metadata using pdf-lib
  const pdfArrayBuffer = doc.output('arraybuffer');
  const pdfDoc = await PDFDocument.load(pdfArrayBuffer);

  if (metadata.dc_title) {
    pdfDoc.setTitle(metadata.dc_title);
  }
  if (metadata.dc_creator) {
    pdfDoc.setAuthor(metadata.dc_creator);
  }
  if (metadata.cp_keywords) {
    const keywordsArray = metadata.cp_keywords.split(',').map(k => k.trim());
    pdfDoc.setKeywords(keywordsArray);
  }
  if (metadata.cp_description) {
    pdfDoc.setSubject(metadata.cp_description);
  }
  if (metadata.cp_category) {
    pdfDoc.setProducer(`CV Maker & Role Tracker (${metadata.cp_category})`);
  }

  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());

  const finalPdfBytes = await pdfDoc.save();

  // 8. Download PDF file in browser / desktop app
  const blob = new Blob([finalPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
