import { exportCVToPDF } from '../../utils/pdfExport';
import { LocalTailorOutput } from '../../utils/localAiEngine';
import { RolePreset, CVData, LanguageCode } from '../../types/cv';

import { saveToCustomDirectoryIfTauri } from '../../utils/tauriFileExport';

interface ExportPdfParams {
  companyName: string;
  activeLanguage: string;
  tailoredOutput: LocalTailorOutput | null;
  activePreset: RolePreset;
  cvData: CVData;
  exportDirectory?: string;
}

export async function downloadTailoredPDF(params: ExportPdfParams): Promise<string> {
  const filename = `${(params.companyName || 'Job').replace(/\s+/g, '_')}_CV_${params.activeLanguage.toUpperCase()}.pdf`;
  await exportCVToPDF({
    elementId: 'tailored-ats-cv-preview',
    filename,
    metadata: params.tailoredOutput?.tailoredMetadata || params.activePreset.metadata,
    data: params.tailoredOutput?.updatedData || params.cvData,
    language: params.activeLanguage as LanguageCode,
    selectedTags: [],
    exportDirectory: params.exportDirectory
  });
  return filename;
}

export async function downloadCoverLetterFile(
  companyName: string, 
  text: string, 
  exportDirectory?: string
): Promise<string> {
  const filename = `Cover_Letter_${(companyName || 'Job').replace(/\s+/g, '_')}.txt`;
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);

  const savedDirectly = await saveToCustomDirectoryIfTauri(exportDirectory, filename, bytes);
  if (savedDirectly) return filename;

  const file = new Blob([text], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
  return filename;
}

