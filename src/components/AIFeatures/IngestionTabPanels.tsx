import React, { useRef, useState } from 'react';
import { 
  Github, 
  Globe, 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  FolderGit2, 
  Cpu, 
  FileCheck 
} from 'lucide-react';
import { IngestionResult } from '../../utils/ingestionService';

export const FileUploadTabContent: React.FC<{
  selectedFile: File | null;
  onFileSelect: (f: File) => void;
  onParse: () => void;
  isProcessing: boolean;
}> = ({ selectedFile, onFileSelect, onParse, isProcessing }) => {
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
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-slate-300">
        Upload Resume or CV Document (.pdf, .txt, .md, .json)
      </label>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
          isDragOver 
            ? 'border-sky-500 bg-sky-950/30 ring-2 ring-sky-500/20' 
            : selectedFile 
            ? 'border-emerald-500/60 bg-emerald-950/20' 
            : 'border-slate-700 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md,.json"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onFileSelect(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-200">{selectedFile.name}</p>
            <span className="text-[10px] text-slate-400 font-mono">
              {(selectedFile.size / 1024).toFixed(1)} KB · Ready to parse
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-300">
              Drag and drop your CV file here, or <span className="text-sky-400 underline">browse</span>
            </p>
            <p className="text-[10px] text-slate-500">Supports PDF, Markdown, Plain Text, and JSON Backups</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onParse}
        disabled={!selectedFile || isProcessing}
        className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow"
      >
        {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
        <span>Parse & Extract File Data</span>
      </button>
    </div>
  );
};

export const GitHubTabContent: React.FC<{
  input: string;
  setInput: (v: string) => void;
  onFetch: () => void;
  isProcessing: boolean;
}> = ({ input, setInput, onFetch, isProcessing }) => (
  <div className="space-y-3">
    <label className="block text-xs font-semibold text-slate-300">
      GitHub Username or Profile URL
    </label>
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="e.g. torvalds or https://github.com/username"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onFetch(); }}
        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
      />
      <button
        type="button"
        onClick={onFetch}
        disabled={isProcessing}
        className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow"
      >
        {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Github className="w-3.5 h-3.5" />}
        <span>Fetch Repos</span>
      </button>
    </div>
    <p className="text-[11px] text-slate-500">
      Discovers your top repositories, primary languages, project descriptions, and bio without requiring login.
    </p>
  </div>
);

export const WebsiteTabContent: React.FC<{
  input: string;
  setInput: (v: string) => void;
  onFetch: () => void;
  isProcessing: boolean;
}> = ({ input, setInput, onFetch, isProcessing }) => (
  <div className="space-y-3">
    <label className="block text-xs font-semibold text-slate-300">
      Portfolio or Personal Website URL
    </label>
    <div className="flex gap-2">
      <input
        type="url"
        placeholder="https://yourportfolio.dev"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onFetch(); }}
        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
      />
      <button
        type="button"
        onClick={onFetch}
        disabled={isProcessing}
        className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow"
      >
        {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
        <span>Scrape Web</span>
      </button>
    </div>
    <p className="text-[11px] text-slate-500">
      Parses the website DOM structure to extract bio summaries, portfolio links, and headlines.
    </p>
  </div>
);

export const TextTabContent: React.FC<{
  input: string;
  setInput: (v: string) => void;
  onFetch: () => void;
  isProcessing: boolean;
}> = ({ input, setInput, onFetch, isProcessing }) => (
  <div className="space-y-3">
    <label className="block text-xs font-semibold text-slate-300">
      Paste Resume / LinkedIn Bio Text
    </label>
    <textarea
      rows={4}
      placeholder="Paste your existing resume plain text, contact details, or experience summaries here..."
      value={input}
      onChange={(e) => setInput(e.target.value)}
      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 resize-none font-mono"
    />
    <button
      type="button"
      onClick={onFetch}
      disabled={isProcessing}
      className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow"
    >
      {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
      <span>Extract Resume Sections</span>
    </button>
  </div>
);

export const PreviewCard: React.FC<{
  preview: IngestionResult;
  isSuccess: boolean;
  onApply: () => void;
}> = ({ preview, isSuccess, onApply }) => (
  <div className="bg-slate-950 border border-sky-800/40 rounded-xl p-4 space-y-3">
    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
      <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span>Extracted Data Preview</span>
      </span>
      <span className="text-[10px] text-slate-400 font-mono">
        {preview.projects.length} projects · {preview.skillCategories.flatMap(c => c.skills).length} skills
      </span>
    </div>

    <div className="grid grid-cols-2 gap-2 text-xs">
      {preview.detectedName && (
        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-500 block">Name</span>
          <span className="font-semibold text-slate-200">{preview.detectedName}</span>
        </div>
      )}
      {preview.detectedLocation && (
        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-500 block">Location</span>
          <span className="font-semibold text-slate-200">{preview.detectedLocation}</span>
        </div>
      )}
    </div>

    {preview.projects.length > 0 && (
      <div>
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
          <FolderGit2 className="w-3 h-3 text-sky-400" />
          <span>Projects to Import:</span>
        </span>
        <div className="space-y-1">
          {preview.projects.map(p => (
            <div key={p.id} className="text-xs bg-slate-900 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="font-medium text-slate-200">{p.title}</span>
              <span className="text-[10px] text-sky-400 font-mono">{p.techStack.join(', ')}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {preview.skillCategories.length > 0 && (
      <div>
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
          <Cpu className="w-3 h-3 text-sky-400" />
          <span>Detected Skills:</span>
        </span>
        <div className="flex flex-wrap gap-1">
          {preview.skillCategories.flatMap(c => c.skills).map(s => (
            <span key={s.id} className="text-[10px] bg-slate-900 text-sky-300 border border-slate-800 px-2 py-0.5 rounded-md font-medium">
              {s.name}
            </span>
          ))}
        </div>
      </div>
    )}

    <button
      type="button"
      onClick={onApply}
      disabled={isSuccess}
      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer mt-2"
    >
      {isSuccess ? (
        <>
          <CheckCircle2 className="w-4 h-4" />
          <span>Imported Successfully!</span>
        </>
      ) : (
        <>
          <span>Save & Populate Master Resume</span>
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  </div>
);
