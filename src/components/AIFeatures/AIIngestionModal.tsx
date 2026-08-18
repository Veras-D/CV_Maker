import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useCV } from '../../context/CVContext';
import { 
  Github, 
  Globe, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X, 
  ArrowRight, 
  FolderGit2, 
  Cpu
} from 'lucide-react';
import { 
  ingestFromGitHub, 
  ingestFromWebsite, 
  parseRawResumeText, 
  IngestionResult 
} from '../../utils/ingestionService';

export const AIIngestionModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { applyIngestionResult, resetToDefaultData } = useCV();
  
  const [activeTab, setActiveTab] = useState<'github' | 'website' | 'text'>('github');
  const [githubInput, setGithubInput] = useState('');
  const [websiteInput, setWebsiteInput] = useState('');
  const [rawTextInput, setRawTextInput] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewResult, setPreviewResult] = useState<IngestionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFetch = async () => {
    setErrorMessage('');
    setPreviewResult(null);
    setIsProcessing(true);

    try {
      let result: IngestionResult;
      if (activeTab === 'github') {
        if (!githubInput.trim()) throw new Error('Please enter a GitHub username or URL.');
        result = await ingestFromGitHub(githubInput.trim());
      } else if (activeTab === 'website') {
        if (!websiteInput.trim()) throw new Error('Please enter a portfolio or website URL.');
        result = await ingestFromWebsite(websiteInput.trim());
      } else {
        if (!rawTextInput.trim()) throw new Error('Please paste your resume or CV text.');
        result = parseRawResumeText(rawTextInput.trim());
      }
      setPreviewResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during ingestion.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyToCV = () => {
    if (!previewResult) return;
    applyIngestionResult(previewResult);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setPreviewResult(null);
      onClose();
    }, 900);
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Import & Scrape Profile Data</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Extract projects, skills, and bio locally without manual typing
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-slate-300 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Switcher Tabs */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setActiveTab('github'); setPreviewResult(null); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'github' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Repos</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('website'); setPreviewResult(null); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'website' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Portfolio / Web</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('text'); setPreviewResult(null); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'text' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Resume Text</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="text-xs text-red-400 bg-red-950/40 border border-red-800/60 p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab 1: GitHub Input */}
        {activeTab === 'github' && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              GitHub Username or Profile URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. torvalds or https://github.com/username"
                value={githubInput}
                onChange={(e) => setGithubInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleFetch(); }}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleFetch}
                disabled={isProcessing}
                className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow"
              >
                {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Github className="w-3.5 h-3.5" />}
                <span>Fetch Repos</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Automatically discovers your top repositories, primary languages, project descriptions, and bio without requiring login.
            </p>
          </div>
        )}

        {/* Tab 2: Website Input */}
        {activeTab === 'website' && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Portfolio or Personal Website URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://yourportfolio.dev"
                value={websiteInput}
                onChange={(e) => setWebsiteInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleFetch(); }}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleFetch}
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
        )}

        {/* Tab 3: Raw Text Input */}
        {activeTab === 'text' && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Paste Resume / LinkedIn Bio Text
            </label>
            <textarea
              rows={4}
              placeholder="Paste your existing resume plain text, contact details, or experience summaries here..."
              value={rawTextInput}
              onChange={(e) => setRawTextInput(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 resize-none font-mono"
            />
            <button
              type="button"
              onClick={handleFetch}
              disabled={isProcessing}
              className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow"
            >
              {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              <span>Extract Resume Sections</span>
            </button>
          </div>
        )}

        {/* Preview of Extracted Data */}
        {previewResult && (
          <div className="bg-slate-950 border border-sky-800/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Extracted Data Preview</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {previewResult.projects.length} projects · {previewResult.skillCategories.flatMap(c => c.skills).length} skills
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {previewResult.detectedName && (
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Name</span>
                  <span className="font-semibold text-slate-200">{previewResult.detectedName}</span>
                </div>
              )}
              {previewResult.detectedLocation && (
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Location</span>
                  <span className="font-semibold text-slate-200">{previewResult.detectedLocation}</span>
                </div>
              )}
            </div>

            {previewResult.projects.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                  <FolderGit2 className="w-3 h-3 text-sky-400" />
                  <span>Projects to Import:</span>
                </span>
                <div className="space-y-1">
                  {previewResult.projects.map(p => (
                    <div key={p.id} className="text-xs bg-slate-900 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
                      <span className="font-medium text-slate-200">{p.title}</span>
                      <span className="text-[10px] text-sky-400 font-mono">{p.techStack.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {previewResult.skillCategories.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                  <Cpu className="w-3 h-3 text-sky-400" />
                  <span>Detected Skills:</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {previewResult.skillCategories.flatMap(c => c.skills).map(s => (
                    <span key={s.id} className="text-[10px] bg-slate-900 text-sky-300 border border-slate-800 px-2 py-0.5 rounded-md font-medium">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleApplyToCV}
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
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <button
            type="button"
            onClick={resetToDefaultData}
            className="hover:text-slate-300 underline cursor-pointer text-[11px]"
          >
            Clear / Reset Master Data
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
