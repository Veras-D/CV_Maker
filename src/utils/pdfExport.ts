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

  // Measure clone dimensions for link and text layer calculation
  const cloneRect = clone.getBoundingClientRect();
  const pdfWidth = 210;
  const pdfHeight = 297;

  // Extract clickable links (<a>, <button>, or elements with URL text) before removing clone
  const linkElements = clone.querySelectorAll('a, button, [data-url]');
  const linksToInject: { x: number; y: number; w: number; h: number; url: string }[] = [];

  linkElements.forEach(el => {
    const htmlEl = el as HTMLElement;
    let url = htmlEl.getAttribute('href') || htmlEl.dataset.url;
    
    if (!url) {
      const text = htmlEl.innerText.trim();
      if (text.startsWith('http://') || text.startsWith('https://') || text.includes('github.com') || text.includes('linkedin.com')) {
        url = text;
      }
    }

    if (url) {
      const rect = htmlEl.getBoundingClientRect();
      const targetUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
      
      const x = ((rect.left - cloneRect.left) / cloneRect.width) * pdfWidth;
      const y = ((rect.top - cloneRect.top) / cloneRect.height) * pdfHeight;
      const w = Math.max(2, (rect.width / cloneRect.width) * pdfWidth);
      const h = Math.max(2, (rect.height / cloneRect.height) * pdfHeight);

      linksToInject.push({ x, y, w, h, url: targetUrl });
    }
  });

  // Extract text nodes for vector searchability & ATS selection
  const textNodes: { x: number; y: number; text: string; fontSize: number }[] = [];
  const walk = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT, null);
  let node: Node | null;
  while ((node = walk.nextNode())) {
    const val = node.nodeValue?.trim();
    if (val && node.parentElement) {
      const pEl = node.parentElement;
      const rect = pEl.getBoundingClientRect();
      const x = ((rect.left - cloneRect.left) / cloneRect.width) * pdfWidth;
      const y = ((rect.top - cloneRect.top) / cloneRect.height) * pdfHeight + 2.5;
      const fontSize = Math.max(6, Math.min(14, (parseFloat(window.getComputedStyle(pEl).fontSize) || 10) * 0.75));
      textNodes.push({ x, y, text: val, fontSize });
    }
  }

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
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const imgHeightInMm = (canvasHeight * pdfWidth) / canvasWidth;

  // 3. Generate jsPDF document
  const pdf = new jsPDF('p', 'mm', 'a4');

  if (imgHeightInMm <= 330) {
    // Single page ATS Resume
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    // Inject selectable text layer
    pdf.setTextColor(255, 255, 255);
    (pdf as any).setRenderingMode?.('invisible');
    textNodes.forEach(tn => {
      pdf.setFontSize(tn.fontSize);
      pdf.text(tn.text, tn.x, tn.y);
    });

    // Inject clickable links
    linksToInject.forEach(l => {
      pdf.link(l.x, l.y, l.w, l.h, { url: l.url });
    });
  } else {
    // Multi-page document
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

    // Inject links
    linksToInject.forEach(l => {
      pdf.link(l.x, l.y, l.w, l.h, { url: l.url });
    });
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
