import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useCV } from '../../context/CVContext';
import { AlertCircle, X } from 'lucide-react';
import { 
  ingestFromLinkedin,
  ingestFromWebsite, 
  parseRawResumeText,
  ingestFromFile, 
  IngestionResult 
} from '../../utils/ingestionService';
import { ingestFromGitHubRepos } from '../../utils/githubScraper';
import { IngestionSourceTabs, IngestionSourceType } from './IngestionSourceTabs';
import { 
  FileUploadTabContent,
  GitHubTabContent, 
  LinkedinTabContent,
  WebsiteTabContent, 
  TextTabContent, 
  PreviewCard 
} from './IngestionTabPanels';

export const AIIngestionModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { applyIngestionResult, resetToDefaultData } = useCV();
  
  const [activeTab, setActiveTab] = useState<IngestionSourceType>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [githubRepos, setGithubRepos] = useState<string[]>([]);
  const [githubInput, setGithubInput] = useState('');
  const [linkedinInput, setLinkedinInput] = useState('');
  const [websiteInput, setWebsiteInput] = useState('');
  const [rawTextInput, setRawTextInput] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewResult, setPreviewResult] = useState<IngestionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddGitHubRepo = () => {
    const trimmed = githubInput.trim();
    if (trimmed && !githubRepos.includes(trimmed)) {
      setGithubRepos(prev => [...prev, trimmed]);
      setGithubInput('');
      setErrorMessage('');
    }
  };

  const handleRemoveGitHubRepo = (idx: number) => {
    setGithubRepos(prev => prev.filter((_, i) => i !== idx));
  };

  const executeTabFetch = async (): Promise<IngestionResult> => {
    if (activeTab === 'file') {
      if (!selectedFile) throw new Error('Please select or drop a CV file first.');
      return ingestFromFile(selectedFile);
    }
    if (activeTab === 'github') {
      const trimmed = githubInput.trim();
      const reposToFetch = trimmed && !githubRepos.includes(trimmed) ? [...githubRepos, trimmed] : githubRepos;
      if (reposToFetch.length === 0) {
        throw new Error('Please add at least one GitHub project repository (e.g. owner/repo).');
      }
      return ingestFromGitHubRepos(reposToFetch);
    }
    if (activeTab === 'linkedin') {
      return ingestFromLinkedin(linkedinInput.trim());
    }
    if (activeTab === 'website') {
      return ingestFromWebsite(websiteInput.trim());
    }
    return parseRawResumeText(rawTextInput.trim());
  };

  const handleFetch = async () => {
    setErrorMessage('');
    setPreviewResult(null);
    setIsProcessing(true);

    try {
      setPreviewResult(await executeTabFetch());
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
      setSelectedFile(null);
      onClose();
    }, 900);
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Import & Scrape Profile Data</h3>
            <p className="text-xs text-slate-400 mt-0.5">Extract projects, skills, and bio locally from files, LinkedIn, GitHub, web, or text</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-500 hover:text-slate-300 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <IngestionSourceTabs
          activeTab={activeTab}
          onTabChange={(tab) => { setActiveTab(tab); setPreviewResult(null); setErrorMessage(''); }}
        />

        {errorMessage && (
          <div className="text-xs text-red-400 bg-red-950/40 border border-red-800/60 p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {activeTab === 'file' && (
          <FileUploadTabContent
            selectedFile={selectedFile}
            onFileSelect={(f) => { setSelectedFile(f); setPreviewResult(null); setErrorMessage(''); }}
            onError={(msg) => { setSelectedFile(null); setPreviewResult(null); setErrorMessage(msg); }}
            onParse={handleFetch}
            isProcessing={isProcessing}
          />
        )}
        {activeTab === 'github' && (
          <GitHubTabContent 
            repoList={githubRepos}
            currentInput={githubInput} 
            setCurrentInput={setGithubInput}
            onAddRepo={handleAddGitHubRepo}
            onRemoveRepo={handleRemoveGitHubRepo}
            onFetch={handleFetch} 
            isProcessing={isProcessing} 
          />
        )}
        {activeTab === 'linkedin' && (
          <LinkedinTabContent
            input={linkedinInput}
            setInput={setLinkedinInput}
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

        {previewResult && (
          <PreviewCard 
            preview={previewResult} 
            isSuccess={isSuccess} 
            onApply={handleApplyToCV} 
          />
        )}

        <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <button
            type="button"
            onClick={resetToDefaultData}
            className="text-slate-500 hover:text-red-400 underline transition-colors cursor-pointer"
          >
            Clear / Reset Master Data
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
