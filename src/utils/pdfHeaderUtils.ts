import jsPDF from 'jspdf';
import { UserProfile } from '../types/cv';
import { sanitizePdfText } from './pdfSanitizer';

export const PAGE_WIDTH = 210;
export const PAGE_HEIGHT = 297;
export const MARGIN_LEFT = 14;
export const MARGIN_RIGHT = 196;
export const CONTENT_WIDTH = MARGIN_RIGHT - MARGIN_LEFT; // 182mm
export const TOP_MARGIN = 16;
export const MAX_PAGE_Y = 278;

/**
 * Checks if the required vertical space exceeds page boundary; if so, adds a new page.
 */
export function ensurePageSpace(doc: jsPDF, currentY: number, requiredSpace: number): number {
  if (currentY + requiredSpace > MAX_PAGE_Y) {
    doc.addPage();
    return TOP_MARGIN;
  }
  return currentY;
}

export function drawSectionHeader(doc: jsPDF, title: string, startY: number): number {
  const y = ensurePageSpace(doc, startY, 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(sanitizePdfText(title).toUpperCase(), MARGIN_LEFT, y);
  const nextY = y + 1.5;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.25);
  doc.line(MARGIN_LEFT, nextY, MARGIN_RIGHT, nextY);
  return nextY + 4.2;
}

export function drawContactRow(doc: jsPDF, contactItems: { text: string; url?: string }[], startY: number): number {
  if (contactItems.length === 0) return startY;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);

  const dotWidth = 5.2;
  let totalWidth = 0;
  const itemWidths = contactItems.map(item => {
    const clean = sanitizePdfText(item.text);
    const w = doc.getTextWidth(clean);
    totalWidth += w;
    return w;
  });
  totalWidth += (contactItems.length - 1) * dotWidth;

  let startX = (PAGE_WIDTH - totalWidth) / 2;
  const y = startY;

  contactItems.forEach((item, idx) => {
    const cleanText = sanitizePdfText(item.text);
    if (item.url) {
      doc.setTextColor(3, 105, 161);
      doc.textWithLink(cleanText, startX, y, { url: item.url });
    } else {
      doc.setTextColor(71, 85, 105);
      doc.text(cleanText, startX, y);
    }
    startX += itemWidths[idx];

    if (idx < contactItems.length - 1) {
      doc.setFillColor(100, 116, 139);
      doc.circle(startX + (dotWidth / 2), y - 0.7, 0.4, 'F');
      startX += dotWidth;
    }
  });

  return y + 3.8;
}

function tryPushLink(items: { text: string; url?: string }[], label: string, rawUrl?: string) {
  if (!rawUrl || !rawUrl.trim()) return;
  const url = rawUrl.trim();
  items.push({ text: label, url: url.startsWith('http') ? url : `https://${url}` });
}

export function getPDFContactItems(profile: UserProfile): { text: string; url?: string }[] {
  const items: { text: string; url?: string }[] = [
    { text: (profile.email || '').trim() },
    { text: (profile.phone || '').trim() },
    { text: (profile.location || '').trim() }
  ].filter(item => Boolean(item.text));

  tryPushLink(items, 'GitHub', profile.githubUrl);
  tryPushLink(items, 'LinkedIn', profile.linkedinUrl);
  tryPushLink(items, 'Portfolio', profile.portfolioUrl);

  return items;
}

export function drawTitleAndHeadline(doc: jsPDF, name: string, headline: string, startY: number): number {
  let y = startY;
  const cleanName = sanitizePdfText(name);
  const cleanHeadline = sanitizePdfText(headline);

  if (cleanName) {
    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text(cleanName.toUpperCase(), PAGE_WIDTH / 2, y, { align: 'center' });
    y += 6.2;
  }

  if (cleanHeadline) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(cleanHeadline, PAGE_WIDTH / 2, y, { align: 'center' });
    y += 5.0;
  }
  return y;
}
