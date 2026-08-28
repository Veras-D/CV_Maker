import React, { useRef, useState } from 'react';
import { 
  Linkedin, 
  Loader2, 
  UploadCloud, 
  FileCheck, 
  Info, 
  ExternalLink 
} from 'lucide-react';

export interface LinkedinTabContentProps {
  input: string;
  setInput: (v: string) => void;
  onFetchUrl: () => void;
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onParseFile: () => void;
  isProcessing: boolean;
}

export const LinkedinTabContent: React.FC<LinkedinTabContentProps> = ({
  input,
  setInput,
  onFetchUrl,
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
    <div className="space-y-4 text-xs">
      {/* Notice Banner */}
      <div className="bg-sky-950/40 border border-sky-800/60 p-3 rounded-xl flex items-start gap-2.5 text-slate-300">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-sky-300 block text-[11px]">How LinkedIn Import Works</span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            LinkedIn protects personal data behind login authentication and blocks web scrapers (<code className="text-sky-300 font-mono">HTTP 999</code>). To import 100% of your work history, dates, and skills, export your profile PDF or link your URL below.
          </p>
        </div>
      </div>

      {/* Option 1: Drop LinkedIn Export PDF */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-slate-200 flex items-center gap-1.5">
            <span className="bg-sky-900/60 text-sky-400 w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] font-bold">1</span>
            <span>Import Full LinkedIn Profile PDF (Recommended)</span>
          </label>
          <span className="text-[10px] text-emerald-400 font-medium">Extracts 100% of Jobs & Skills</span>
        </div>

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
              <p className="text-slate-300 font-medium">
                Drop your exported LinkedIn PDF here, or <span className="text-sky-400 underline">browse</span>
              </p>
              <p className="text-[10px] text-slate-500">
                On LinkedIn: Go to Profile → <strong>More</strong> (...) → <strong>Save to PDF</strong>
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
            <span>Extract LinkedIn PDF Experiences & Skills</span>
          </button>
        )}
      </div>

      {/* Option 2: Link Profile URL */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <label className="font-semibold text-slate-300 flex items-center gap-1.5">
          <span className="bg-slate-800 text-slate-400 w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] font-bold">2</span>
          <span>Or Attach LinkedIn Profile URL to CV Header</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://www.linkedin.com/in/username or username"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onFetchUrl(); }}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
          <button
            type="button"
            onClick={onFetchUrl}
            disabled={!input.trim() || isProcessing}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-sky-400 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          >
            {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
            <span>Link URL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
