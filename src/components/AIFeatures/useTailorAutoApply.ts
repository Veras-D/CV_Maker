import { useEffect } from 'react';
import { useCV } from '../../context/CVContext';
import { runLocalAITailor, LocalTailorOutput } from '../../utils/localAiEngine';
import { LanguageCode } from '../../types/cv';

interface AutoApplyParams {
  setJobTitle: (v: string) => void;
  setCompanyName: (v: string) => void;
  setRoleUrl: (v: string) => void;
  setJobDescription: (v: string) => void;
  setSalary?: (v: string) => void;
  setTailoredOutput: (output: LocalTailorOutput) => void;
  setCoverLetterEditable: (v: string) => void;
  setSummaryEditable: (v: string) => void;
}

export function useTailorAutoApply(params: AutoApplyParams) {
  const { cvData, activeLanguage, pendingTailorJob, setPendingTailorJob } = useCV();

  useEffect(() => {
    if (!pendingTailorJob) return;
    params.setJobTitle(pendingTailorJob.jobTitle);
    params.setCompanyName(pendingTailorJob.companyName);
    params.setRoleUrl(pendingTailorJob.roleUrl || '');
    params.setJobDescription(pendingTailorJob.jobDescription);
    if (pendingTailorJob.salary && params.setSalary) {
      params.setSalary(pendingTailorJob.salary);
    }

    if (pendingTailorJob.jobDescription) {
      try {
        const output = runLocalAITailor({
          jobTitle: pendingTailorJob.jobTitle,
          companyName: pendingTailorJob.companyName,
          jobDescription: pendingTailorJob.jobDescription,
          cvData,
          language: activeLanguage as LanguageCode
        });
        params.setTailoredOutput(output);
        params.setCoverLetterEditable(output.coverLetter.content.en || '');
        params.setSummaryEditable(output.tailoredSummary);
      } catch (err) {
        console.error("Auto-tailoring error:", err);
      }
    }
    setPendingTailorJob(null);
  }, [pendingTailorJob, cvData, activeLanguage, setPendingTailorJob, params]);
}
