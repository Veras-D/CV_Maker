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

  // 1. Clone target element into a fixed-width A4 container (794px = 210mm at 96 DPI)
  // Matching width identically between DOM measurement and html2canvas guarantees 1:1 pixel alignment
  const A4_WIDTH_PX = 794;
  const PDF_WIDTH_MM = 210;
  const PDF_PAGE_HEIGHT_MM = 297;

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.position = 'fixed';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.width = `${A4_WIDTH_PX}px`;
  clone.style.maxWidth = `${A4_WIDTH_PX}px`;
  clone.style.height = 'auto';
  clone.style.maxHeight = 'none';
  clone.style.overflow = 'visible';
  clone.style.boxSizing = 'border-box';
  document.body.appendChild(clone);

  // Measure exact clone dimensions
  const cloneRect = clone.getBoundingClientRect();
  const cloneWidth = clone.offsetWidth || A4_WIDTH_PX;
  const cloneHeight = clone.offsetHeight || cloneRect.height;

  // 2. Render high-res canvas (scale 2 for crisp 192 DPI output) with matching viewport width
  const canvas = await html2canvas(clone, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: cloneWidth,
    height: cloneHeight,
    windowWidth: cloneWidth,
    windowHeight: cloneHeight
  });

  // Calculate exact millimeter height of the rendered canvas on A4 width (210mm)
  const imgHeightInMm = (cloneHeight / cloneWidth) * PDF_WIDTH_MM;

  // Extract clickable links (<a>, <button>, or elements with URL text) with exact scale
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
      
      const x = ((rect.left - cloneRect.left) / cloneWidth) * PDF_WIDTH_MM;
      const y = ((rect.top - cloneRect.top) / cloneHeight) * imgHeightInMm;
      const w = Math.max(2, (rect.width / cloneWidth) * PDF_WIDTH_MM);
      const h = Math.max(2, (rect.height / cloneHeight) * imgHeightInMm);

      linksToInject.push({ x, y, w, h, url: targetUrl });
    }
  });

  // Extract word-level text items via Range API with exact scale
  const textLayerItems: { x: number; y: number; text: string; fontSize: number }[] = [];
  const walk = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT, null);
  let textNode: Node | null;

  while ((textNode = walk.nextNode())) {
    const textContent = textNode.nodeValue;
    if (!textContent || !textContent.trim() || !textNode.parentElement) continue;

    const pEl = textNode.parentElement;
    const computedStyle = window.getComputedStyle(pEl);
    const rawFontSize = parseFloat(computedStyle.fontSize) || 10;
    // 1 CSS px = 0.75 pt in PDF
    const fontSizeInPt = Math.max(5, Math.min(18, rawFontSize * 0.75));

    let charIndex = 0;
    const tokens = textContent.split(/(\s+)/);

    for (const token of tokens) {
      if (!token) continue;
      const wordStart = charIndex;
      const wordEnd = charIndex + token.length;
      charIndex = wordEnd;

      if (!token.trim()) continue;

      try {
        const range = document.createRange();
        range.setStart(textNode, wordStart);
        range.setEnd(textNode, wordEnd);

        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const x = ((rect.left - cloneRect.left) / cloneWidth) * PDF_WIDTH_MM;
          const y = ((rect.top - cloneRect.top) / cloneHeight) * imgHeightInMm;

          textLayerItems.push({
            x,
            y,
            text: token,
            fontSize: fontSizeInPt
          });
        }
      } catch {
        // Safe fallback for unselectable nodes
      }
    }
  }

  document.body.removeChild(clone);

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  // 3. Generate jsPDF document
  const pdf = new jsPDF('p', 'mm', 'a4');

  if (imgHeightInMm <= 315) {
    // Single page document: Fit perfectly on 1 A4 page (297mm)
    const scaleFactor = imgHeightInMm > PDF_PAGE_HEIGHT_MM ? (PDF_PAGE_HEIGHT_MM / imgHeightInMm) : 1;
    const finalRenderHeightMm = imgHeightInMm * scaleFactor;

    pdf.addImage(imgData, 'JPEG', 0, 0, PDF_WIDTH_MM, finalRenderHeightMm);

    // Inject selectable text layer with baseline: top alignment
    pdf.setTextColor(255, 255, 255);
    (pdf as any).setRenderingMode?.('invisible');
    textLayerItems.forEach(item => {
      pdf.setFontSize(item.fontSize * scaleFactor);
      pdf.text(item.text, item.x, item.y * scaleFactor, { baseline: 'top' });
    });

    // Inject clickable links
    linksToInject.forEach(l => {
      pdf.link(l.x, l.y * scaleFactor, l.w, l.h * scaleFactor, { url: l.url });
    });
  } else {
    // Multi-page document
    let heightLeft = imgHeightInMm;
    let pageIndex = 0;

    const renderPageLayers = (pIdx: number) => {
      const pageTopMm = pIdx * PDF_PAGE_HEIGHT_MM;
      const pageBottomMm = pageTopMm + PDF_PAGE_HEIGHT_MM;

      pdf.setTextColor(255, 255, 255);
      (pdf as any).setRenderingMode?.('invisible');

      textLayerItems
        .filter(item => item.y >= pageTopMm && item.y < pageBottomMm)
        .forEach(item => {
          pdf.setFontSize(item.fontSize);
          pdf.text(item.text, item.x, item.y - pageTopMm, { baseline: 'top' });
        });

      linksToInject
        .filter(l => l.y >= pageTopMm && l.y < pageBottomMm)
        .forEach(l => {
          pdf.link(l.x, l.y - pageTopMm, l.w, l.h, { url: l.url });
        });
    };

    // Page 1
    pdf.addImage(imgData, 'JPEG', 0, 0, PDF_WIDTH_MM, imgHeightInMm);
    renderPageLayers(0);
    heightLeft -= PDF_PAGE_HEIGHT_MM;

    while (heightLeft > 5) {
      pageIndex++;
      const position = -pageIndex * PDF_PAGE_HEIGHT_MM;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, PDF_WIDTH_MM, imgHeightInMm);
      renderPageLayers(pageIndex);
      heightLeft -= PDF_PAGE_HEIGHT_MM;
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
