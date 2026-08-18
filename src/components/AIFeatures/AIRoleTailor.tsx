import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { processAiJobTailoring, AITailorResult } from '../../utils/aiService';
import { Sparkles, Download, FileText, CheckCircle, Globe, Building } from 'lucide-react';
import { exportCVToPDF } from '../../utils/pdfExport';
import { ClassicTemplate } from '../CVPreview/ClassicTemplate';
import { CustomSelect, SelectOption } from '../Common/CustomSelect';
import { ProModal } from '../Common/ProModal';

export const AIRoleTailor: React.FC = () => {
  const { cvData, activeLanguage, setLanguage, addKanbanRole, activePreset } = useCV();
  
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [roleUrl, setRoleUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tailoredResult, setTailoredResult] = useState<AITailorResult | null>(null);
  const [coverLetterEditable, setCoverLetterEditable] = useState('');
  const [isPdfExporting, setIsPdfExporting] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const languageOptions: SelectOption[] = [
    { value: 'en', label: 'English (EN)' },
    { value: 'cs', label: 'Čeština (CS)', isPro: true },
    { value: 'de', label: 'Deutsch (DE)', isPro: true },
    { value: 'fr', label: 'Français (FR)', isPro: true },
    { value: 'es', label: 'Español (ES)', isPro: true },
    { value: 'pt', label: 'Português (PT)', isPro: true }
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
        activePreset.metadata,
        cvData,
        activeLanguage,
        tailoredResult?.matchedTags || []
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-[200px]">
          <h1 className="text-lg font-bold text-white">Target Job Vacancy Auto-Tailor</h1>
          <p className="text-xs text-slate-400">Paste job requirements to generate an ATS-optimized CV and Cover Letter</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <span className="text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap">
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span>Target Language:</span>
          </span>
          <CustomSelect
            options={languageOptions}
            value={activeLanguage}
            onChange={(val) => setLanguage(val)}
            onProClick={() => setIsProModalOpen(true)}
            className="min-w-[130px]"
          />
        </div>
      </div>

      {/* Main Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form Column */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-sky-400" />
            <span>Vacancy Details</span>
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
                  placeholder="e.g. Stripe"
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
                Paste Job Description / Requirements
              </label>
              <textarea
                required
                rows={9}
                placeholder="Paste vacancy requirements text here..."
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
                <span>AI Filtering & Tailoring...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Tailored CV & Cover Letter</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output Column */}
        <div className="lg:col-span-7 space-y-5 overflow-hidden">
          
          {tailoredResult ? (
            <div className="space-y-4">
              
              {/* Output Actions */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  <span>CV & Cover Letter Tailored</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadCoverLetter}
                    className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Cover Letter</span>
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    disabled={isPdfExporting}
                    className="bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isPdfExporting ? 'Exporting...' : 'Export PDF'}</span>
                  </button>
                </div>
              </div>

              {/* Cover Letter Edit Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-300 mb-2">Tailored Cover Letter ({activeLanguage.toUpperCase()})</h4>
                <textarea
                  rows={7}
                  value={coverLetterEditable}
                  onChange={(e) => setCoverLetterEditable(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-750 rounded-lg p-3 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none"
                />
              </div>

              {/* CV Document Container - Scaled cleanly */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 overflow-x-auto">
                <h4 className="text-xs font-bold text-slate-300 mb-2">ATS Classic Resume Preview</h4>
                <div className="bg-slate-950 p-2 rounded flex justify-center overflow-auto max-h-[600px]">
                  <div id="tailored-ats-cv-preview" className="bg-white text-slate-900 shadow-xl max-w-full">
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
            /* Initial Master Preview */
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-x-auto">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Classic Corporate ATS Resume Preview
                </h3>
                <span className="text-xs text-slate-400">Master Document Format</span>
              </div>

              <div className="bg-slate-950 p-2 rounded flex justify-center overflow-auto max-h-[700px]">
                <div id="tailored-ats-cv-preview" className="bg-white text-slate-900 shadow-xl max-w-full">
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

      <ProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        featureName="Multi-Language Export"
      />
    </div>
  );
};
