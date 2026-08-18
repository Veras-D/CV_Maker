import React from 'react';
import { KanbanStatus } from '../../types/cv';
import { CustomSelect, SelectOption } from '../Common/CustomSelect';
import { CustomDatePicker } from '../Common/CustomDatePicker';
import { CustomCurrencyInput } from '../Common/CustomCurrencyInput';

const STAGE_OPTIONS: SelectOption[] = [
  { value: 'applied', label: 'Applied' },
  { value: 'hr_call', label: 'HR Screening' },
  { value: 'tech_interview', label: 'Tech Interview' },
  { value: 'manager_interview', label: 'Manager Round' },
  { value: 'hired', label: 'Offer / Hired' },
  { value: 'archived', label: 'Archive Application' }
];

export interface KanbanRoleFormFieldsProps {
  roleTitle: string;
  company: string;
  location: string;
  salary: string;
  status: KanbanStatus;
  dateApplied: string;
  roleUrl: string;
  notes: string;
  onRoleTitleChange: (v: string) => void;
  onCompanyChange: (v: string) => void;
  onLocationChange: (v: string) => void;
  onSalaryChange: (v: string) => void;
  onStatusChange: (v: KanbanStatus) => void;
  onDateAppliedChange: (v: string) => void;
  onRoleUrlChange: (v: string) => void;
  onNotesChange: (v: string) => void;
}

export const KanbanRoleFormFields: React.FC<KanbanRoleFormFieldsProps> = ({
  roleTitle,
  company,
  location,
  salary,
  status,
  dateApplied,
  roleUrl,
  notes,
  onRoleTitleChange,
  onCompanyChange,
  onLocationChange,
  onSalaryChange,
  onStatusChange,
  onDateAppliedChange,
  onRoleUrlChange,
  onNotesChange
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-slate-300 mb-1 font-medium">Role Title</label>
        <input
          type="text"
          required
          placeholder="e.g. Senior Full-Stack Engineer"
          value={roleTitle}
          onChange={(e) => onRoleTitleChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-300 mb-1 font-medium">Company</label>
        <input
          type="text"
          required
          placeholder="e.g. Stripe"
          value={company}
          onChange={(e) => onCompanyChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-slate-300 mb-1 font-medium">Location</label>
          <input
            type="text"
            placeholder="San Francisco, CA / Remote"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-medium">Salary</label>
          <CustomCurrencyInput
            value={salary}
            onChange={onSalaryChange}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-slate-300 mb-1 font-medium">Pipeline Stage</label>
          <CustomSelect
            className="w-full"
            options={STAGE_OPTIONS}
            value={status}
            onChange={(val) => onStatusChange(val as KanbanStatus)}
          />
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-medium">Date Applied</label>
          <CustomDatePicker
            value={dateApplied}
            onChange={onDateAppliedChange}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-300 mb-1 font-medium">Role Link (Optional)</label>
        <input
          type="url"
          placeholder="https://..."
          value={roleUrl}
          onChange={(e) => onRoleUrlChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-300 mb-1 font-medium">Notes</label>
        <textarea
          rows={2}
          placeholder="Recruiter contact, interview feedback..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 resize-none"
        />
      </div>
    </div>
  );
};
