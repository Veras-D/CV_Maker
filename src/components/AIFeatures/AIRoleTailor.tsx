import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { exportCVToPDF } from '../../utils/pdfExport';
import { ProModal } from '../Common/ProModal';
import { runLocalAITailor, LocalTailorOutput } from '../../utils/localAiEngine';
import { LanguageCode } from '../../types/cv';
import { AIRoleTailorHeader } from './AIRoleTailorHeader';
import { VacancyDetailsForm } from './VacancyDetailsForm';
import { TailoredOutputView } from './TailoredOutputView';

export const AIRoleTailor: React.FC = () => {
  const { cvData, activeLanguage, addKanbanRole, activePreset, openIngestionModal } = useCV();
  
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
      <AIRoleTailorHeader
        isMasterEmpty={isMasterEmpty}
        onOpenIngestionModal={openIngestionModal}
      />

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
