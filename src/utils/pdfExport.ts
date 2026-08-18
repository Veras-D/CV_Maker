import jsPDF from 'jspdf';
import { CVData, LanguageCode, PDFMetadata } from '../types/cv';
import { injectPDFMetadata } from './pdfMetadata';
import { 
  drawHeader, 
  drawSummary, 
  drawExperiences, 
  drawSkills, 
  drawProjects, 
  drawEducationAndLanguages 
} from './pdfDrawSections';

export interface PDFExportParams {
  elementId?: string;
  filename: string;
  metadata: PDFMetadata;
  data?: CVData;
  language?: LanguageCode;
  selectedTags?: string[];
}

export async function exportCVToPDF(params: PDFExportParams): Promise<void> {
  const { filename, metadata, data, language = 'en', selectedTags = [] } = params;

  if (!data) {
    throw new Error('No CV data provided for PDF export');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  let currentY = drawHeader(doc, data.profile, language);
  currentY = drawSummary(doc, data.profile, language, currentY);
  currentY = drawExperiences(doc, data.experiences, { tags: selectedTags, lang: language, startY: currentY });
  currentY = drawSkills(doc, data.skillCategories, language, currentY);
  currentY = drawProjects(doc, data.projects, language, currentY);
  drawEducationAndLanguages(doc, data.education, data.languages, { lang: language, startY: currentY });

  const rawBytes = doc.output('arraybuffer');
  const enrichedBytes = await injectPDFMetadata(new Uint8Array(rawBytes), metadata);

  const blob = new Blob([enrichedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
