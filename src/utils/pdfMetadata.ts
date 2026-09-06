import { PDFDocument } from 'pdf-lib';
import { PDFMetadata } from '../types/cv';

export async function injectPDFMetadata(pdfBytes: Uint8Array, metadata: PDFMetadata): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  
  if (metadata.dc_title) {
    pdfDoc.setTitle(metadata.dc_title);
  }
  if (metadata.dc_creator) {
    pdfDoc.setAuthor(metadata.dc_creator);
  }
  if (metadata.cp_description) {
    pdfDoc.setSubject(metadata.cp_description);
  }
  
  const kwList = (metadata.cp_keywords || '')
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);

  if (metadata.cp_category && !kwList.includes(metadata.cp_category)) {
    kwList.push(metadata.cp_category);
  }

  if (kwList.length > 0) {
    pdfDoc.setKeywords(kwList);
  }
  
  pdfDoc.setProducer('CV Maker & Role Tracker (PDF Engine)');
  pdfDoc.setCreator('CV Maker Dublin Core / XMP Injector');

  return pdfDoc.save();
}
