import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { runLocalAITailor, LocalTailorOutput, ExecutiveSummaryStyle } from '../../utils/localAiEngine';
import { LanguageCode } from '../../types/cv';
import { useTailorAutoApply } from './useTailorAutoApply';
import { downloadTailoredPDF, downloadCoverLetterFile } from './tailorExportHelpers';

export function useAIRoleTailorState() {
  const { 
    cvData, 
    activeLanguage, 
    addKanbanRole, 
    activePreset, 
    openIngestionModal,
    targetMaxPages,
    exportDirectory
  } = useCV();
  
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [roleUrl, setRoleUrl] = useState('');
  const [salary, setSalary] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tailoredOutput, setTailoredOutput] = useState<LocalTailorOutput | null>(null);
  const [coverLetterEditable, setCoverLetterEditable] = useState('');
  const [summaryEditable, setSummaryEditable] = useState('');
  const [summaryStyle, setSummaryStyle] = useState<ExecutiveSummaryStyle>('authentic');
  const [isPdfExporting, setIsPdfExporting] = useState(false);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);
  const [isProModalOpen, setIsProModalOpen] = useState(false);


  useTailorAutoApply({
    setJobTitle,
    setCompanyName,
    setRoleUrl,
    setJobDescription,
    setSalary,
    setTailoredOutput,
    setCoverLetterEditable,
    setSummaryEditable
  });

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
        language: activeLanguage as LanguageCode,
        maxPages: targetMaxPages
      });
      setTailoredOutput(output);
      setCoverLetterEditable(output.coverLetter.content[activeLanguage] || output.coverLetter.content.en || '');
      setSummaryEditable(output.tailoredSummary);
      setSummaryStyle('authentic');
      
      addKanbanRole({
        roleTitle: jobTitle || 'Software Engineer',
        company: companyName || 'Target Company',
        location: 'Remote / Hybrid',
        salary: salary.trim() || undefined,
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

  const handleSummaryChange = (newSummary: string) => {
    setSummaryEditable(newSummary);
    if (!tailoredOutput) return;
    setTailoredOutput({
      ...tailoredOutput,
      tailoredSummary: newSummary,
      updatedData: {
        ...tailoredOutput.updatedData,
        profile: {
          ...tailoredOutput.updatedData.profile,
          summary: {
            ...tailoredOutput.updatedData.profile.summary,
            [activeLanguage]: newSummary,
            en: newSummary
          }
        }
      }
    });
  };

  const handleSelectSummaryStyle = (style: ExecutiveSummaryStyle) => {
    setSummaryStyle(style);
    if (!tailoredOutput) return;
    const variantText = tailoredOutput.summaryVariants?.[style] ?? tailoredOutput.tailoredSummary;
    handleSummaryChange(variantText);
  };

  const handleResetSummaryToMaster = () => {
    setSummaryStyle('authentic');
    const rawMaster = (cvData.profile.summary[activeLanguage] || cvData.profile.summary.en || '').trim();
    const cleanMaster = rawMaster.includes('aligned with ATS standards') ? '' : rawMaster;
    handleSummaryChange(cleanMaster);
  };

  const handleDownloadPDF = async () => {
    setIsPdfExporting(true);
    try {
      const filename = await downloadTailoredPDF({
        companyName,
        activeLanguage,
        tailoredOutput,
        activePreset,
        cvData,
        exportDirectory
      });
      const destText = exportDirectory ? `saved to "${exportDirectory}"` : 'downloaded';
      setDownloadFeedback(`Tailored PDF ${destText}: "${filename}"`);
      setTimeout(() => setDownloadFeedback(null), 5000);
    } catch (e) {
      console.error("PDF export failed", e);
    } finally {
      setIsPdfExporting(false);
    }
  };

  const handleDownloadCoverLetter = async () => {
    const filename = await downloadCoverLetterFile(companyName, coverLetterEditable, exportDirectory);
    const destText = exportDirectory ? `saved to "${exportDirectory}"` : 'downloaded';
    setDownloadFeedback(`Cover Letter ${destText}: "${filename}"`);
    setTimeout(() => setDownloadFeedback(null), 5000);
  };


  const isMasterEmpty = !cvData.profile.name?.trim() && cvData.experiences.length === 0;

  return {
    jobTitle, setJobTitle,
    companyName, setCompanyName,
    roleUrl, setRoleUrl,
    jobDescription, setJobDescription,
    isProcessing,
    tailoredOutput,
    coverLetterEditable, setCoverLetterEditable,
    summaryEditable,
    summaryStyle,
    isPdfExporting,
    downloadFeedback,
    isProModalOpen, setIsProModalOpen,
    handleRunTailor,
    handleSummaryChange,
    handleSelectSummaryStyle,
    handleResetSummaryToMaster,
    handleDownloadPDF,
    handleDownloadCoverLetter,
    isMasterEmpty,
    openIngestionModal,
    cvData,
    activeLanguage,
    activePreset
  };
}
