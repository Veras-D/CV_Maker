import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { processAiJobTailoring } from '../../utils/aiService';
import { Sparkles, Download, FileText, CheckCircle, Globe, Building } from 'lucide-react';
import { exportCVToPDF } from '../../utils/pdfExport';
import { ClassicTemplate } from '../CVPreview/ClassicTemplate';

export const AIRoleTailor: React.FC = () => {
  const { cvData, activeLanguage, setLanguage, addKanbanRole, activePreset } = useCV();
  
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [roleUrl, setRoleUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tailoredResult, setTailoredResult] = useState<any | null>(null);
  const [coverLetterEditable, setCoverLetterEditable] = useState('');
  const [isPdfExporting, setIsPdfExporting] = useState(false);

  const availableLanguages = [
    { code: 'cs', label: 'Čeština' },
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
    { code: 'pt', label: 'Português' }
  ];

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
      setCoverLetterEditable(result.coverLetter.content[activeLanguage] || result.coverLetter.content.en || '');
      
      // Auto add card to Kanban board under "Applied"
      addKanbanRole({
        roleTitle: jobTitle || 'Software Engineer',
        company: companyName || 'Target Company',
        location: 'Remote / Hybrid',
        status: 'applied',
        dateApplied: new Date().toISOString().slice(0, 10),
        roleUrl: roleUrl.trim() || undefined,
        notes: `AI Matched Tags: ${result.matchedTags.join(', ')}`
      });
    } catch (e) {
      console.error("AI Tailor Error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsPdfExporting(true);
    try {
      await exportCVToPDF(
        'tailored-ats-cv-preview',
        `${(companyName || 'Job').replace(/\s+/g, '_')}_CV_${activeLanguage.toUpperCase()}`,
        activePreset.metadata
      );
    } catch (e) {
      console.error("PDF export failed", e);
    } finally {
      setIsPdfExporting(false);
    }
  };

  const handleDownloadCoverLetter = () => {
    const file = new Blob([coverLetterEditable], {type: 'text/plain'});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = `Cover_Letter_${(companyName || 'Job').replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Workspace Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Target Job Vacancy Tailor</h1>
          <p className="text-xs text-slate-400">Paste job requirements to generate an ATS-optimized CV and Cover Letter</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" />
            <span>Target Language:</span>
          </span>
          <select
            value={activeLanguage}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none font-medium cursor-pointer"
          >
            {availableLanguages.map(l => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Vacancy Input */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-sky-400" />
            <span>Job Details</span>
          </h3>

          <form onSubmit={handleRunTailor} className="space-y-3">
            <div>
              <label className="block text-xs text-slate-300 mb-1 font-medium">Job Title / Role</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Full-Stack Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-medium">Company</label>
                <input
                  type="text"
                  placeholder="e.g. Mews"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 font-medium">Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={roleUrl}
                  onChange={(e) => setRoleUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-medium">
                Paste Job Description / Vacancy Requirements
              </label>
              <textarea
                required
                rows={10}
                placeholder="Paste vacancy text here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {isProcessing ? (
                <span>Filtering Data & Tailoring...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Tailored CV & Cover Letter</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output: CV Preview & Cover Letter */}
        <div className="lg:col-span-7 space-y-6">
          
          {tailoredResult ? (
            <div className="space-y-5">
              
              {/* Actions Header */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  <span>Tailored CV Ready & Added to Kanban</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadCoverLetter}
                    className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Cover Letter (.txt)</span>
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    disabled={isPdfExporting}
                    className="bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isPdfExporting ? 'Exporting...' : 'Download PDF'}</span>
                  </button>
                </div>
              </div>

              {/* Cover Letter Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-300 mb-2">Tailored Cover Letter ({activeLanguage.toUpperCase()})</h4>
                <textarea
                  rows={8}
                  value={coverLetterEditable}
                  onChange={(e) => setCoverLetterEditable(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-750 rounded-lg p-3 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none"
                />
              </div>

              {/* Live Classic ATS CV Preview */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-x-auto">
                <h4 className="text-xs font-bold text-slate-300 mb-3">Live Tailored Classic ATS Resume</h4>
                <div className="bg-slate-950 p-2 rounded flex justify-center">
                  <div id="tailored-ats-cv-preview" className="scale-[0.85] origin-top">
                    <ClassicTemplate 
                      data={cvData} 
                      language={activeLanguage} 
                      selectedTags={tailoredResult.matchedTags} 
                      preset={activePreset} 
                    />
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Initial Workspace View */
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 overflow-x-auto">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Live Master ATS Classic Resume Preview
                </h3>
                <span className="text-xs text-slate-400">Default Classic Corporate Layout</span>
              </div>

              <div className="bg-slate-950 p-2 rounded flex justify-center">
                <div id="tailored-ats-cv-preview" className="scale-[0.85] origin-top">
                  <ClassicTemplate 
                    data={cvData} 
                    language={activeLanguage} 
                    selectedTags={[]} 
                    preset={activePreset} 
                  />
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
