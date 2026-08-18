import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useCV } from '../../context/CVContext';
import { Github, Globe, FileText, AlertCircle, X } from 'lucide-react';
import { 
  ingestFromGitHub, 
  ingestFromWebsite, 
  parseRawResumeText, 
  IngestionResult 
} from '../../utils/ingestionService';
import { 
  GitHubTabContent, 
  WebsiteTabContent, 
  TextTabContent, 
  PreviewCard 
} from './IngestionTabPanels';

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
      if (activeTab === 'github') {
        setPreviewResult(await ingestFromGitHub(githubInput.trim()));
      } else if (activeTab === 'website') {
        setPreviewResult(await ingestFromWebsite(websiteInput.trim()));
      } else {
        setPreviewResult(parseRawResumeText(rawTextInput.trim()));
      }
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
            <h3 className="text-base font-bold text-white">Import & Scrape Profile Data</h3>
            <p className="text-xs text-slate-400 mt-0.5">Extract projects, skills, and bio locally without manual typing</p>
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

        {/* Tab Inputs */}
        {activeTab === 'github' && (
          <GitHubTabContent 
            input={githubInput} 
            setInput={setGithubInput} 
            onFetch={handleFetch} 
            isProcessing={isProcessing} 
          />
        )}
        {activeTab === 'website' && (
          <WebsiteTabContent 
            input={websiteInput} 
            setInput={setWebsiteInput} 
            onFetch={handleFetch} 
            isProcessing={isProcessing} 
          />
        )}
        {activeTab === 'text' && (
          <TextTabContent 
            input={rawTextInput} 
            setInput={setRawTextInput} 
            onFetch={handleFetch} 
            isProcessing={isProcessing} 
          />
        )}

        {/* Preview of Extracted Data */}
        {previewResult && (
          <PreviewCard 
            preview={previewResult} 
            isSuccess={isSuccess} 
            onApply={handleApplyToCV} 
          />
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
