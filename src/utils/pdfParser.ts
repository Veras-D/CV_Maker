import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Initialize PDF.js with local Vite-bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PDFTextItem {
  str: string;
  hasEOL?: boolean;
  transform?: number[];
}

function processPageItems(items: PDFTextItem[]): string {
  let pageText = '';
  let lastY: number | null = null;

  for (const item of items) {
    if (typeof item?.str !== 'string') continue;
    
    const str = item.str.trim();
    if (!str) continue;

    const currentY = item.transform && item.transform.length >= 6 ? item.transform[5] : null;

    if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 4) {
      pageText += '\n' + str;
    } else if (item.hasEOL) {
      pageText += (pageText.endsWith('\n') ? '' : ' ') + str + '\n';
    } else {
      pageText += (pageText.length === 0 || pageText.endsWith('\n') ? '' : ' ') + str;
    }

    if (currentY !== null) {
      lastY = currentY;
    }
  }

  return pageText.trim();
}

/**
 * Extracts all readable Unicode text from an uploaded PDF file with line layout awareness using PDF.js.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const pageTexts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = processPageItems(textContent.items as PDFTextItem[]);
    if (pageText.length > 0) {
      pageTexts.push(pageText);
    }
  }

  return pageTexts.join('\n\n');
}
