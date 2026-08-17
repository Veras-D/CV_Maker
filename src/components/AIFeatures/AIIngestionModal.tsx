import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { Sparkles, Globe, Github, Linkedin, FileText, CheckCircle2, Bot, Link as LinkIcon } from 'lucide-react';

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
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Step 1: AI Master Profile Ingestion</h3>
            <p className="text-xs text-slate-400">Scrape, parse and sync your CV file, LinkedIn, GitHub, and Portfolio website</p>
          </div>
        </div>

        <form onSubmit={handleRunIngestion} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5 text-sky-400" />
              <span>GitHub Profile URL</span>
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5 text-sky-400" />
              <span>LinkedIn Profile URL</span>
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>Personal Website Portfolio URL</span>
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>Paste Raw CV / Extra Experience Text</span>
            </label>
            <textarea
              rows={3}
              placeholder="Paste raw CV text or newly acquired experience/certificates..."
              value={rawCvText}
              onChange={(e) => setRawCvText(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          <div className="bg-slate-850 p-3 rounded-xl border border-slate-750 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <Bot className="w-4 h-4 text-sky-400" />
              Model: {cvData.aiConfig.modelName} ({cvData.aiConfig.provider})
            </span>
            <button
              type="button"
              onClick={resetToDefaultData}
              className="text-sky-400 hover:underline text-[11px]"
            >
              Re-sync Scraped Data
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-sky-500/20"
            >
              {isProcessing ? (
                <span>AI Ingesting & Extracting...</span>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Profile Synced!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Ingestion Pipeline</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
