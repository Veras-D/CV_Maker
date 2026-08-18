import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { Sparkles, Globe, Zap } from 'lucide-react';
import { exportCVToPDF } from '../../utils/pdfExport';
import { CustomSelect, SelectOption } from '../Common/CustomSelect';
import { ProModal } from '../Common/ProModal';
import { runLocalAITailor, LocalTailorOutput } from '../../utils/localAiEngine';
import { LanguageCode } from '../../types/cv';
import { VacancyDetailsForm } from './VacancyDetailsForm';
import { TailoredOutputView } from './TailoredOutputView';

const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: 'en', label: 'English (EN)' },
  { value: 'cs', label: 'Čeština (CS)', isPro: true },
  { value: 'de', label: 'Deutsch (DE)', isPro: true },
  { value: 'fr', label: 'Français (FR)', isPro: true },
  { value: 'es', label: 'Español (ES)', isPro: true },
  { value: 'pt', label: 'Português (PT)', isPro: true }
];

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
            options={LANGUAGE_OPTIONS}
            value={activeLanguage}
            onChange={(val) => setLanguage(val)}
            onProClick={() => setIsProModalOpen(true)}
            className="min-w-[130px]"
          />
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5">
          <VacancyDetailsForm
            jobTitle={jobTitle}
            companyName={companyName}
            roleUrl={roleUrl}
            jobDescription={jobDescription}
            isProcessing={isProcessing}
            onJobTitleChange={setJobTitle}
            onCompanyNameChange={setCompanyName}
            onRoleUrlChange={setRoleUrl}
            onJobDescriptionChange={setJobDescription}
            onSubmit={handleRunTailor}
          />
        </div>

        <div className="lg:col-span-7 space-y-4 overflow-hidden">
          <TailoredOutputView
            tailoredOutput={tailoredOutput}
            cvData={cvData}
            activeLanguage={activeLanguage}
            activePreset={activePreset}
            coverLetterEditable={coverLetterEditable}
            isPdfExporting={isPdfExporting}
            onCoverLetterChange={setCoverLetterEditable}
            onDownloadCoverLetter={handleDownloadCoverLetter}
            onDownloadPDF={handleDownloadPDF}
          />
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
