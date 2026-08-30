import React, { useRef, useState } from 'react';
import { 
  Linkedin, 
  Loader2, 
  UploadCloud, 
  FileCheck, 
  ExternalLink,
  MousePointerClick,
  FileDown
} from 'lucide-react';

import { openExternalUrl } from '../../utils/urlHelper';

export interface LinkedinTabContentProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onParseFile: () => void;
  isProcessing: boolean;
}

const TutorialSteps: React.FC = () => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
        <FileDown className="w-3.5 h-3.5 text-sky-400" />
        <span>How to Export Your Complete LinkedIn Data (3 Clicks):</span>
      </span>
      <button
        type="button"
        onClick={() => openExternalUrl('https://www.linkedin.com/in/me/')}
        className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold underline cursor-pointer"
      >
        <span>Open LinkedIn</span>
        <ExternalLink className="w-2.5 h-2.5" />
      </button>
    </div>

    <div className="grid grid-cols-3 gap-2 text-[11px]">
      <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <span className="w-4 h-4 rounded-full bg-sky-900/60 text-sky-400 flex items-center justify-center text-[10px] font-bold shrink-0">
            1
          </span>
          <span>Open Profile</span>
        </div>
        <p className="text-[10px] text-slate-400">
          Go to your LinkedIn profile page (<code className="text-sky-300 font-mono text-[9px]">/in/me</code>).
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <span className="w-4 h-4 rounded-full bg-sky-900/60 text-sky-400 flex items-center justify-center text-[10px] font-bold shrink-0">
            2
          </span>
          <span>Click &quot;Resources&quot;</span>
        </div>
        <p className="text-[10px] text-slate-400">
          Under your headline, click the <strong>Resources</strong> (<MousePointerClick className="w-2.5 h-2.5 inline" />) button.
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <span className="w-4 h-4 rounded-full bg-emerald-900/60 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">
            3
          </span>
          <span>Save to PDF</span>
        </div>
        <p className="text-[10px] text-slate-400">
          Click <strong>&quot;Save to PDF&quot;</strong> in the dropdown menu to download your complete profile PDF.
        </p>
      </div>
    </div>
  </div>
);

export const LinkedinTabContent: React.FC<LinkedinTabContentProps> = ({
  onFileSelect,
  selectedFile,
  onParseFile,
  isProcessing
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3.5 text-xs">
      {/* Visual Step-by-Step Tutorial */}
      <TutorialSteps />

      {/* PDF Dropzone */}
      <div className="space-y-2">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            isDragOver 
              ? 'border-sky-500 bg-sky-950/30' 
              : selectedFile 
                ? 'border-emerald-700 bg-emerald-950/20' 
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
            }}
            accept=".pdf"
            className="hidden"
          />

          {selectedFile ? (
            <div className="space-y-1">
              <FileCheck className="w-6 h-6 text-emerald-400 mx-auto" />
              <p className="font-semibold text-slate-200">{selectedFile.name}</p>
              <p className="text-[10px] text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB · Ready to parse</p>
            </div>
          ) : (
            <div className="space-y-1">
              <UploadCloud className="w-6 h-6 text-sky-400 mx-auto" />
              <p className="text-slate-300 font-medium text-[11px]">
                Drop your downloaded <code className="text-sky-300 font-mono">Profile.pdf</code> here, or <span className="text-sky-400 underline">browse</span>
              </p>
              <p className="text-[10px] text-slate-500">
                Extracts 100% of your work experiences, dates, bullets, education, and skills.
              </p>
            </div>
          )}
        </div>

        {selectedFile && (
          <button
            type="button"
            onClick={onParseFile}
            disabled={isProcessing}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow"
          >
            {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Linkedin className="w-3.5 h-3.5" />}
            <span>Extract LinkedIn Experiences &amp; Skills</span>
          </button>
        )}
      </div>
    </div>
  );
};
