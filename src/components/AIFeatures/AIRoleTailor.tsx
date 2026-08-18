import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { Sparkles, Download, FileText, CheckCircle2, Globe, Building, Target, Zap } from 'lucide-react';
import { exportCVToPDF } from '../../utils/pdfExport';
import { ClassicTemplate } from '../CVPreview/ClassicTemplate';
import { CustomSelect, SelectOption } from '../Common/CustomSelect';
import { ProModal } from '../Common/ProModal';
import { runLocalAITailor, LocalTailorOutput } from '../../utils/localAiEngine';
import { LanguageCode } from '../../types/cv';

const ATSScoreCard: React.FC<{ output: LocalTailorOutput }> = ({ output }) => {
  const { atsScore, matchedKeywords, missingKeywords } = output.matchResult;

  const scoreColor = atsScore >= 80 
    ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' 
    : 'text-amber-400 border-amber-500/40 bg-amber-950/40';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-white">Local ATS Semantic Match</span>
        </div>
        <div className={`text-xs font-bold px-2.5 py-1 rounded-full border ${scoreColor}`}>
          {atsScore}% Match
        </div>
      </div>

      {matchedKeywords.length > 0 && (
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Matched Skills & Keywords ({matchedKeywords.length})
          </span>
          <div className="flex flex-wrap gap-1">
            {matchedKeywords.slice(0, 10).map((kw, idx) => (
              <span key={idx} className="text-[10px] bg-sky-950/80 text-sky-300 border border-sky-800/60 px-2 py-0.5 rounded font-medium">
                ✓ {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {missingKeywords.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Job Keywords to Consider Adding:
          </span>
          <div className="flex flex-wrap gap-1">
            {missingKeywords.map((kw, idx) => (
              <span key={idx} className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded">
                + {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const AIRoleTailor: React.FC = () => {
  const { cvData, activeLanguage, setLanguage, addKanbanRole, activePreset, openIngestionModal } = useCV();
  
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [roleUrl, setRoleUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tailoredOutput, setTailoredOutput] = useState<LocalTailorOutput | null>(null);
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

  const handleRunTailor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;

    setIsProcessing(true);
    try {
      const output = runLocalAITailor({
        jobTitle,
        companyName,
        jobDescription,
        cvData,
        language: activeLanguage as LanguageCode
      });
      setTailoredOutput(output);
      setCoverLetterEditable(output.coverLetter.content[activeLanguage] || output.coverLetter.content.en || '');
      
      addKanbanRole({
        roleTitle: jobTitle || 'Software Engineer',
        company: companyName || 'Target Company',
        location: 'Remote / Hybrid',
        status: 'applied',
        dateApplied: new Date().toISOString().slice(0, 10),
        roleUrl: roleUrl.trim() || undefined,
        notes: `Local ATS Match: ${output.matchResult.atsScore}% | Matched: ${output.matchResult.matchedKeywords.slice(0, 3).join(', ')}`
      });
    } catch (err) {
      console.error("Local Tailor Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsPdfExporting(true);
    try {
      await exportCVToPDF({
        elementId: 'tailored-ats-cv-preview',
        filename: `${(companyName || 'Job').replace(/\s+/g, '_')}_CV_${activeLanguage.toUpperCase()}`,
        metadata: tailoredOutput?.tailoredMetadata || activePreset.metadata,
        data: tailoredOutput?.updatedData || cvData,
        language: activeLanguage as LanguageCode,
        selectedTags: tailoredOutput?.matchResult.matchedTags || []
      });
    } catch (e) {
      console.error("PDF export failed", e);
    } finally {
      setIsPdfExporting(false);
    }
  };

  const handleDownloadCoverLetter = () => {
    const file = new Blob([coverLetterEditable], { type: 'text/plain' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = `Cover_Letter_${(companyName || 'Job').replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isMasterEmpty = !cvData.profile.name?.trim() && cvData.experiences.length === 0;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-[200px]">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-sky-400" />
            <span>Target Vacancy Auto-Tailor (100% Local RAG)</span>
          </h1>
          <p className="text-xs text-slate-400">
            Semantic ATS matching, bullet re-ranking, and cover letter synthesis
          </p>
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

      {/* AI Import Recommendation Banner when empty */}
      {isMasterEmpty && (
        <div className="bg-gradient-to-r from-sky-950/80 to-slate-900 border border-sky-800/60 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">Fast Track: Import Your Profile Data</p>
              <p className="text-slate-400 text-[11px]">Auto-import repositories, skills, and bio from GitHub, website, or resume text.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={openIngestionModal}
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs shrink-0 transition-all cursor-pointer flex items-center gap-1.5 shadow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Importer</span>
          </button>
        </div>
      )}

      {/* Main Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form Column */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-sky-400" />
            <span>Target Vacancy Details</span>
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
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 font-medium">Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={roleUrl}
                  onChange={(e) => setRoleUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
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
                placeholder="Paste vacancy requirements text here to extract keywords and rank your resume bullets..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 font-mono resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run Local Semantic Tailor</span>
            </button>
          </form>
        </div>

        {/* Right Output Column */}
        <div className="lg:col-span-7 space-y-4 overflow-hidden">
          
          {tailoredOutput ? (
            <div className="space-y-4">
              
              {/* ATS Match Scorecard */}
              <ATSScoreCard output={tailoredOutput} />

              {/* Action Toolbar */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Resume & Cover Letter Tailored</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadCoverLetter}
                    className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Cover Letter</span>
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    disabled={isPdfExporting}
                    className="bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isPdfExporting ? 'Exporting...' : 'Export PDF'}</span>
                  </button>
                </div>
              </div>

              {/* Cover Letter Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-300 mb-2">Tailored Cover Letter ({activeLanguage.toUpperCase()})</h4>
                <textarea
                  rows={7}
                  value={coverLetterEditable}
                  onChange={(e) => setCoverLetterEditable(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-750 rounded-lg p-3 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none"
                />
              </div>

              {/* CV Preview */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 overflow-x-auto">
                <h4 className="text-xs font-bold text-slate-300 mb-2">ATS Tailored Resume Preview</h4>
                <div className="bg-slate-950 p-2 rounded flex justify-center overflow-auto max-h-[600px]">
                  <div id="tailored-ats-cv-preview" className="bg-white text-slate-900 shadow-xl max-w-full">
                    <ClassicTemplate 
                      data={tailoredOutput.updatedData} 
                      language={activeLanguage as LanguageCode} 
                      selectedTags={tailoredOutput.matchResult.matchedTags} 
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
                  Master ATS Resume Preview
                </h3>
                <span className="text-xs text-slate-400">Default Baseline</span>
              </div>

              <div className="bg-slate-950 p-2 rounded flex justify-center overflow-auto max-h-[700px]">
                <div id="tailored-ats-cv-preview" className="bg-white text-slate-900 shadow-xl max-w-full">
                  <ClassicTemplate 
                    data={cvData} 
                    language={activeLanguage as LanguageCode} 
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
