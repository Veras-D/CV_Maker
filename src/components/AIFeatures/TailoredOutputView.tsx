import React from 'react';
import { Download, FileText, CheckCircle2 } from 'lucide-react';
import { ClassicTemplate } from '../CVPreview/ClassicTemplate';
import { LocalTailorOutput } from '../../utils/localAiEngine';
import { CVData, LanguageCode, RolePreset } from '../../types/cv';
import { ATSScoreCard } from './ATSScoreCard';

export interface TailoredOutputViewProps {
  tailoredOutput: LocalTailorOutput | null;
  cvData: CVData;
  activeLanguage: string;
  activePreset: RolePreset;
  coverLetterEditable: string;
  isPdfExporting: boolean;
  onCoverLetterChange: (v: string) => void;
  onDownloadCoverLetter: () => void;
  onDownloadPDF: () => void;
}

export const TailoredOutputView: React.FC<TailoredOutputViewProps> = ({
  tailoredOutput,
  cvData,
  activeLanguage,
  activePreset,
  coverLetterEditable,
  isPdfExporting,
  onCoverLetterChange,
  onDownloadCoverLetter,
  onDownloadPDF
}) => {
  if (tailoredOutput) {
    return (
      <div className="space-y-4">
        <ATSScoreCard output={tailoredOutput} />

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Resume & Cover Letter Tailored</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDownloadCoverLetter}
              className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Cover Letter</span>
            </button>

            <button
              type="button"
              onClick={onDownloadPDF}
              disabled={isPdfExporting}
              className="bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isPdfExporting ? 'Exporting...' : 'Export PDF'}</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h4 className="text-xs font-bold text-slate-300 mb-2">Tailored Cover Letter ({activeLanguage.toUpperCase()})</h4>
          <textarea
            rows={7}
            value={coverLetterEditable}
            onChange={(e) => onCoverLetterChange(e.target.value)}
            className="w-full bg-slate-850 border border-slate-750 rounded-lg p-3 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 overflow-x-auto">
          <h4 className="text-xs font-bold text-slate-300 mb-2">ATS Tailored Resume Preview</h4>
          <div className="bg-slate-950 p-2 rounded flex justify-center overflow-auto max-h-[600px]">
            <div id="tailored-ats-cv-preview" className="bg-white text-slate-900 shadow-xl max-w-full">
              <ClassicTemplate 
                data={tailoredOutput.updatedData} 
                language={activeLanguage as LanguageCode} 
                selectedTags={tailoredOutput.matchResult.matchedTags} 
                preset={activePreset} 
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-x-auto">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Master ATS Resume Preview
        </h3>
        <span className="text-xs text-slate-400">Default Baseline</span>
      </div>

      <div className="bg-slate-950 p-2 rounded flex justify-center overflow-auto max-h-[700px]">
        <div id="tailored-ats-cv-preview" className="bg-white text-slate-900 shadow-xl max-w-full">
          <ClassicTemplate 
            data={cvData} 
            language={activeLanguage as LanguageCode} 
            selectedTags={[]} 
            preset={activePreset} 
          />
        </div>
      </div>
    </div>
  );
};
