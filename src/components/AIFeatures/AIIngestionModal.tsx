import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { Globe, Github, Linkedin, FileText, CheckCircle2 } from 'lucide-react';

export const AIIngestionModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { cvData, updateProfile, resetToDefaultData } = useCV();
  const [githubUrl, setGithubUrl] = useState(cvData.ingestionSources.githubUrl);
  const [linkedinUrl, setLinkedinUrl] = useState(cvData.ingestionSources.linkedinUrl);
  const [websiteUrl, setWebsiteUrl] = useState(cvData.ingestionSources.websiteUrl);
  const [rawCvText, setRawCvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleRunIngestion = (e: React.FormEvent) => {
    e.preventDefault();
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
      }, 1200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">Import Profile Data</h3>
          <p className="text-xs text-slate-400">Sync profile links or paste raw resume text to update your master database</p>
        </div>

        <form onSubmit={handleRunIngestion} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5 text-slate-400" />
              <span>GitHub Profile URL</span>
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5 text-slate-400" />
              <span>LinkedIn Profile URL</span>
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Portfolio Website URL</span>
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Paste Raw Resume Text</span>
            </label>
            <textarea
              rows={3}
              placeholder="Paste raw CV text..."
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
                  <span>Import Data</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
