import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Initialize PDF.js with local Vite-bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PDFTextItem {
  str: string;
}

/**
 * Extracts all readable Unicode text from an uploaded PDF file using PDF.js.
 * Handles embedded font subsets, ToUnicode CMaps, Identity-H encodings, and layout strings.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const pageTexts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    const pageLines = (textContent.items as PDFTextItem[])
      .filter((item: PDFTextItem): boolean => typeof item?.str === 'string')
      .map((item: PDFTextItem): string => item.str)
      .join(' ');

    if (pageLines.trim().length > 0) {
      pageTexts.push(pageLines.trim());
    }
  }

  return pageTexts.join('\n');
}
