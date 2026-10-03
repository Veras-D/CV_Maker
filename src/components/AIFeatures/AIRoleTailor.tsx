import React from 'react';
import { ProModal } from '../Common/ProModal';
import { AIRoleTailorHeader } from './AIRoleTailorHeader';
import { VacancyDetailsForm } from './VacancyDetailsForm';
import { TailoredOutputView } from './TailoredOutputView';
import { useAIRoleTailorState } from './useAIRoleTailorState';

export const AIRoleTailor: React.FC = () => {
  const {
    jobTitle,
    setJobTitle,
    companyName,
    setCompanyName,
    roleUrl,
    setRoleUrl,
    jobDescription,
    setJobDescription,
    isProcessing,
    tailoredOutput,
    coverLetterEditable,
    setCoverLetterEditable,
    summaryEditable,
    isPdfExporting,
    downloadFeedback,
    isProModalOpen,
    setIsProModalOpen,
    handleRunTailor,
    handleSummaryChange,
    handleResetSummaryToMaster,
    handleDownloadPDF,
    handleDownloadCoverLetter,
    isMasterEmpty,
    openIngestionModal,
    cvData,
    activeLanguage,
    activePreset,
  } = useAIRoleTailorState();

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
            summaryEditable={summaryEditable}
            isPdfExporting={isPdfExporting}
            downloadFeedback={downloadFeedback}
            onCoverLetterChange={setCoverLetterEditable}
            onSummaryChange={handleSummaryChange}
            onResetSummaryToMaster={handleResetSummaryToMaster}
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
