import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Initialize PDF.js with local Vite-bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PDFRawTextItem {
  str: string;
  hasEOL?: boolean;
  transform?: number[];
  width?: number;
  height?: number;
}

interface PositionedItem {
  str: string;
  x: number;
  y: number;
  width: number;
  hasEOL: boolean;
}

function extractPositionedItems(items: PDFRawTextItem[]): PositionedItem[] {
  const result: PositionedItem[] = [];
  for (const item of items) {
    if (typeof item?.str !== 'string') continue;
    const str = item.str.trim();
    if (!str) continue;

    const x = item.transform && item.transform.length >= 6 ? item.transform[4] : 0;
    const y = item.transform && item.transform.length >= 6 ? item.transform[5] : 0;
    const width = item.width || str.length * 6;

    result.push({ str, x, y, width, hasEOL: Boolean(item.hasEOL) });
  }
  return result;
}

function evaluateCandidateGutter(cand: number, items: PositionedItem[]): number | null {
  const leftItems = items.filter(i => i.x + i.width <= cand);
  const rightItems = items.filter(i => i.x >= cand);
  const crossingItems = items.filter(i => i.x < cand && i.x + i.width > cand);

  if (leftItems.length < 4 || rightItems.length < 4 || crossingItems.length > 1) {
    return null;
  }

  let rightmostLeft = -Infinity;
  for (const i of leftItems) {
    if (i.x + i.width > rightmostLeft) rightmostLeft = i.x + i.width;
  }

  let leftmostRight = Infinity;
  for (const i of rightItems) {
    if (i.x < leftmostRight) leftmostRight = i.x;
  }

  const gap = leftmostRight - rightmostLeft;
  return gap >= 12 ? (rightmostLeft + leftmostRight) / 2 : null;
}

function findColumnSplitGutter(items: PositionedItem[]): number | null {
  if (items.length < 10) return null;

  let minX = Infinity;
  let maxX = -Infinity;
  for (const item of items) {
    if (item.x < minX) minX = item.x;
    if (item.x + item.width > maxX) maxX = item.x + item.width;
  }

  const pageWidth = maxX - minX;
  if (pageWidth < 200) return null;

  const minGutterX = minX + pageWidth * 0.22;
  const maxGutterX = minX + pageWidth * 0.68;

  for (let cand = minGutterX; cand <= maxGutterX; cand += 6) {
    const splitPoint = evaluateCandidateGutter(cand, items);
    if (splitPoint !== null) return splitPoint;
  }

  return null;
}

function mergeVisualLines(rawLines: string[]): string[] {
  const result: string[] = [];
  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (result.length === 0) {
      result.push(trimmed);
      continue;
    }

    const prev = result[result.length - 1];
    const startsBullet = /^[●•\-*►▸▪▫⁃]/.test(trimmed);
    const startsLower = /^[a-zà-ÿ]/.test(trimmed);
    const prevEndsPunct = /[.!?:]$/.test(prev);

    if (!startsBullet && (startsLower || !prevEndsPunct) && prev.length < 90 && !/^\d{4}/.test(trimmed)) {
      result[result.length - 1] = `${prev} ${trimmed}`;
    } else {
      result.push(trimmed);
    }
  }
  return result;
}

function renderColumnLines(items: PositionedItem[]): string {
  // Sort Y descending (top to bottom), X ascending (left to right)
  const sorted = [...items].sort((a, b) => {
    const yDiff = b.y - a.y;
    if (Math.abs(yDiff) > 3.5) return yDiff;
    return a.x - b.x;
  });

  const lines: string[] = [];
  let currentLine: PositionedItem[] = [];
  let currentY: number | null = null;

  for (const item of sorted) {
    if (currentY === null || Math.abs(item.y - currentY) <= 3.5) {
      currentLine.push(item);
      if (currentY === null) currentY = item.y;
    } else {
      if (currentLine.length > 0) {
        lines.push(currentLine.map(i => i.str).join(' '));
      }
      currentLine = [item];
      currentY = item.y;
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine.map(i => i.str).join(' '));
  }

  return mergeVisualLines(lines).join('\n');
}

function processPageWithLayout(items: PDFRawTextItem[]): string {
  const positioned = extractPositionedItems(items);
  if (positioned.length === 0) return '';

  const splitGutter = findColumnSplitGutter(positioned);
  if (splitGutter !== null) {
    const leftCol = positioned.filter(i => i.x < splitGutter);
    const rightCol = positioned.filter(i => i.x >= splitGutter);
    const leftText = renderColumnLines(leftCol);
    const rightText = renderColumnLines(rightCol);
    return `${leftText}\n\n${rightText}`.trim();
  }

  return renderColumnLines(positioned);
}

/**
 * Extracts all readable Unicode text from an uploaded PDF file with layout & column awareness using PDF.js.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const pageTexts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = processPageWithLayout(textContent.items as PDFRawTextItem[]);
    if (pageText.length > 0) {
      pageTexts.push(pageText);
    }
  }

  return pageTexts.join('\n\n');
}
