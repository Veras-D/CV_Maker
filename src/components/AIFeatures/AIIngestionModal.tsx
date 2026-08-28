import React from 'react';
import ReactDOM from 'react-dom';
import { useCV } from '../../context/CVContext';
import { AlertCircle, X } from 'lucide-react';
import { useIngestionState } from './useIngestionState';
import { IngestionSourceTabs } from './IngestionSourceTabs';
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
  const state = useIngestionState();

  if (!isOpen) return null;

  const handleApplyToCV = () => {
    if (!state.previewResult) return;
    applyIngestionResult(state.previewResult);
    state.setIsSuccess(true);
    setTimeout(() => {
      state.setIsSuccess(false);
      state.setPreviewResult(null);
      state.setSelectedFile(null);
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
          activeTab={state.activeTab}
          onTabChange={(tab) => { state.setActiveTab(tab); state.setPreviewResult(null); state.setErrorMessage(''); }}
        />

        {state.errorMessage && (
          <div className="text-xs text-red-400 bg-red-950/40 border border-red-800/60 p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{state.errorMessage}</span>
          </div>
        )}

        {state.activeTab === 'file' && (
          <FileUploadTabContent
            selectedFile={state.selectedFile}
            onFileSelect={(f) => { state.setSelectedFile(f); state.setPreviewResult(null); state.setErrorMessage(''); }}
            onError={(msg) => { state.setSelectedFile(null); state.setPreviewResult(null); state.setErrorMessage(msg); }}
            onParse={state.handleFetch}
            isProcessing={state.isProcessing}
          />
        )}
        {state.activeTab === 'github' && (
          <GitHubTabContent 
            repoList={state.githubRepos}
            currentInput={state.githubInput} 
            setCurrentInput={state.setGithubInput}
            onAddRepo={state.handleAddGitHubRepo}
            onRemoveRepo={state.handleRemoveGitHubRepo}
            onFetch={state.handleFetch} 
            isProcessing={state.isProcessing} 
          />
        )}
        {state.activeTab === 'linkedin' && (
          <LinkedinTabContent
            input={state.linkedinInput}
            setInput={state.setLinkedinInput}
            onFetch={state.handleFetch}
            isProcessing={state.isProcessing}
          />
        )}
        {state.activeTab === 'website' && (
          <WebsiteTabContent 
            input={state.websiteInput} 
            setInput={state.setWebsiteInput} 
            onFetch={state.handleFetch} 
            isProcessing={state.isProcessing} 
          />
        )}
        {state.activeTab === 'text' && (
          <TextTabContent 
            input={state.rawTextInput} 
            setInput={state.setRawTextInput} 
            onFetch={state.handleFetch} 
            isProcessing={state.isProcessing} 
          />
        )}

        {state.previewResult && (
          <PreviewCard 
            preview={state.previewResult} 
            isSuccess={state.isSuccess} 
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
