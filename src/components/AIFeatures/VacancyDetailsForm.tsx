import React from 'react';
import { Building, Sparkles } from 'lucide-react';

export interface VacancyDetailsFormProps {
  jobTitle: string;
  companyName: string;
  roleUrl: string;
  jobDescription: string;
  isProcessing: boolean;
  onJobTitleChange: (v: string) => void;
  onCompanyNameChange: (v: string) => void;
  onRoleUrlChange: (v: string) => void;
  onJobDescriptionChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const VacancyDetailsForm: React.FC<VacancyDetailsFormProps> = ({
  jobTitle,
  companyName,
  roleUrl,
  jobDescription,
  isProcessing,
  onJobTitleChange,
  onCompanyNameChange,
  onRoleUrlChange,
  onJobDescriptionChange,
  onSubmit
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Building className="w-4 h-4 text-sky-400" />
        <span>Target Vacancy Details</span>
      </h3>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-slate-300 mb-1 font-medium">Job Title / Role</label>
          <input
            type="text"
            required
            placeholder="e.g. Senior Full-Stack Engineer"
            value={jobTitle}
            onChange={(e) => onJobTitleChange(e.target.value)}
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
              onChange={(e) => onCompanyNameChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1 font-medium">Link (Optional)</label>
            <input
              type="url"
              placeholder="https://..."
              value={roleUrl}
              onChange={(e) => onRoleUrlChange(e.target.value)}
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
            onChange={(e) => onJobDescriptionChange(e.target.value)}
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
  );
};
