import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { processAiJobTailoring } from '../../utils/aiService';
import { Sparkles, FileText, Send, CheckCircle2, Download, Building, Briefcase, ChevronRight, Tag, Settings2 } from 'lucide-react';
import { exportCVToPDF } from '../../utils/pdfExport';

export const AIRoleTailor: React.FC = () => {
  const { cvData, activeLanguage, addKanbanRole, setActiveTab } = useCV();
  
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [roleUrl, setRoleUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tailoredResult, setTailoredResult] = useState<any | null>(null);
  const [coverLetterEditable, setCoverLetterEditable] = useState('');

  const handleRunTailor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;

    setIsProcessing(true);
    try {
      const result = await processAiJobTailoring(
        jobTitle,
        companyName,
        jobDescription,
        cvData,
        activeLanguage
      );
      setTailoredResult(result);
      setCoverLetterEditable(result.coverLetter.content[activeLanguage] || result.coverLetter.content.en);
      
      // Auto add application card to Kanban board
      addKanbanRole({
        roleTitle: jobTitle || 'Tailored Application',
        company: companyName || 'Target Company',
        location: 'Remote / Onsite',
        status: 'applied',
        dateApplied: new Date().toISOString().slice(0, 10),
        roleUrl: roleUrl.trim() || undefined,
        notes: `AI Matched Tags: ${result.matchedTags.join(', ')}. Custom cover letter generated.`
      });
    } catch (e) {
      console.error("AI Tailor Error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadCoverLetter = () => {
    const element = document.createElement("a");
    const file = new Blob([coverLetterEditable], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Cover_Letter_${(companyName || 'Job').replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-sky-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-mono mb-2 border border-sky-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step 2: AI Job Description Auto-Tailor</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Paste Vacancy & Generate Role-Specific CV + Cover Letter</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Paste the job posting requirements below. The AI will extract key stack requirements, rank & filter your master bullet points, update PDF metadata, generate a tailored cover letter, and add it to your Kanban application tracker.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('preview')}
            className="self-start md:self-center shrink-0 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <span>View Current Preview</span>
            <ChevronRight className="w-4 h-4 text-sky-400" />
          </button>
        </div>
      </div>

      {/* Main Input & Result Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form (Job Posting Input) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-sky-400" />
            <span>Target Position Details</span>
          </h3>

          <form onSubmit={handleRunTailor} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Job Role / Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Full-Stack Engineer / DevOps Specialist"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mews / Red Hat"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Job Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={roleUrl}
                  onChange={(e) => setRoleUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Paste Job Description / Vacancy Requirements
              </label>
              <textarea
                required
                rows={9}
                placeholder="Paste the full job posting requirements here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-sky-500 resize-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {isProcessing ? (
                <span>AI Analyzing & Filtering CV...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Tailored CV & Cover Letter</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-7 space-y-6">
          
          {tailoredResult ? (
            <>
              {/* Analysis Summary */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider">
                    AI Matching Breakdown
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Auto-Added to Kanban</span>
                  </span>
                </div>

                <h4 className="text-base font-bold text-white mb-2">{tailoredResult.recommendedPresetName}</h4>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-xs text-slate-400">Matched Core Tags:</span>
                  {tailoredResult.matchedTags.map((tag: string) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className="flex-1 bg-sky-600 hover:bg-sky-500 text-white py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Open Live PDF Preview</span>
                  </button>
                  <button
                    onClick={handleDownloadCoverLetter}
                    className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>Download Cover Letter (.txt)</span>
                  </button>
                </div>
              </div>

              {/* Generated Cover Letter Preview & Editor */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-400" />
                    <span>Tailored Cover Letter ({activeLanguage.toUpperCase()})</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">Editable</span>
                </div>

                <textarea
                  rows={12}
                  value={coverLetterEditable}
                  onChange={(e) => setCoverLetterEditable(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/80 rounded-xl p-4 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-sky-500"
                />
              </div>
            </>
          ) : (
            <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center h-full min-h-[350px]">
              <Sparkles className="w-10 h-10 text-slate-600 mb-3 animate-pulse" />
              <h4 className="text-base font-bold text-slate-200 mb-1">Ready to Tailor Your First Role</h4>
              <p className="text-xs max-w-sm text-slate-500">
                Paste a target job posting on the left. The AI will extract requirements, tailor your resume bullets, generate a cover letter, and sync your application tracker.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
