import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useCV } from '../../context/CVContext';
import { Globe, Github, Linkedin, FileText, CheckCircle2, Upload, File } from 'lucide-react';

export const AIIngestionModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { cvData, updateProfile, resetToDefaultData } = useCV();
  const [githubUrl, setGithubUrl] = useState(cvData.ingestionSources.githubUrl);
  const [linkedinUrl, setLinkedinUrl] = useState(cvData.ingestionSources.linkedinUrl);
  const [websiteUrl, setWebsiteUrl] = useState(cvData.ingestionSources.websiteUrl);
  const [rawCvText, setRawCvText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setRawCvText(prev => (prev ? prev + '\n' + text : text));
        }
      };
      reader.readAsText(file);
    }
  };

  const handleRunIngestion = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const hasAtLeastOne = 
      uploadedFileName || 
      githubUrl.trim() || 
      linkedinUrl.trim() || 
      websiteUrl.trim() || 
      rawCvText.trim();

    if (!hasAtLeastOne) {
      setErrorMessage('Please provide at least one source (PDF upload, GitHub, LinkedIn, Website, or Text).');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      updateProfile({
        githubUrl: githubUrl.trim() || cvData.profile.githubUrl,
        linkedinUrl: linkedinUrl.trim() || cvData.profile.linkedinUrl,
        portfolioUrl: websiteUrl.trim() || cvData.profile.portfolioUrl
      });

      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1000);
    }, 600);
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Import Profile Data</h3>
          <p className="text-xs text-slate-400 mt-0.5">Provide at least one link or file below (all other fields are optional)</p>
        </div>

        {errorMessage && (
          <div className="text-xs text-red-400 bg-red-950/40 border border-red-800/60 p-2 rounded-lg font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleRunIngestion} className="space-y-3">
          
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Upload Resume File (PDF / Text) <span className="text-slate-500 font-normal">(Optional)</span></span>
            </label>
            <div className="flex items-center gap-2">
              <label className="flex-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 cursor-pointer flex items-center justify-between transition-colors">
                <span className="truncate">
                  {uploadedFileName ? `Attached: ${uploadedFileName}` : 'Choose PDF / Text file...'}
                </span>
                <File className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </label>
              {uploadedFileName && (
                <button
                  type="button"
                  onClick={() => setUploadedFileName('')}
                  className="text-xs text-slate-400 hover:text-red-400 px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5 text-slate-400" />
              <span>GitHub Profile URL <span className="text-slate-500 font-normal">(Optional)</span></span>
            </label>
            <input
              type="url"
              placeholder="https://github.com/username"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5 text-slate-400" />
              <span>LinkedIn Profile URL <span className="text-slate-500 font-normal">(Optional)</span></span>
            </label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Portfolio Website URL <span className="text-slate-500 font-normal">(Optional)</span></span>
            </label>
            <input
              type="url"
              placeholder="https://yourwebsite.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Raw Resume Text <span className="text-slate-500 font-normal">(Optional)</span></span>
            </label>
            <textarea
              rows={3}
              placeholder="Paste text here..."
              value={rawCvText}
              onChange={(e) => setRawCvText(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 resize-none font-mono"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={resetToDefaultData}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline"
            >
              Reset to Defaults
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 border border-slate-750"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 shadow-sm transition-all"
              >
                {isProcessing ? (
                  <span>Importing Data...</span>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Imported!</span>
                  </>
                ) : (
                  <span>Import Profile</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
