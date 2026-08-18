import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import { PDFMetadata } from '../types/cv';

export async function exportCVToPDF(
  elementId: string,
  filename: string,
  metadata: PDFMetadata
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  // 1. Clone target element into unconstrained offscreen container to capture 100% of document height
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.width = '210mm';
  clone.style.height = 'auto';
  clone.style.maxHeight = 'none';
  clone.style.overflow = 'visible';
  document.body.appendChild(clone);

  // 2. Render unconstrained clone to high-res canvas (scale 2 for sharpness)
  const canvas = await html2canvas(clone, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1200
  });

  document.body.removeChild(clone);

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  
  // A4 dimensions in mm
  const pdfWidth = 210;
  const pdfHeight = 297;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const imgHeightInMm = (canvasHeight * pdfWidth) / canvasWidth;

  // 3. Generate jsPDF document
  const pdf = new jsPDF('p', 'mm', 'a4');

  if (imgHeightInMm <= 330) {
    // Standard Single Page ATS Resume: Scale cleanly to 1 A4 page with 0 sliced headers or spillovers
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  } else {
    // Multi-page document: Add pages with clean page break handling
    let heightLeft = imgHeightInMm;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInMm);
    heightLeft -= pdfHeight;

    while (heightLeft > 5) {
      position = heightLeft - imgHeightInMm;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInMm);
      heightLeft -= pdfHeight;
    }
  }

  const pdfArrayBuffer = pdf.output('arraybuffer');

  // 4. Inject Metadata into PDF using pdf-lib (Dublin Core & Content Properties)
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

  // 5. Download file in browser / webview environment
  const blob = new Blob([finalPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
