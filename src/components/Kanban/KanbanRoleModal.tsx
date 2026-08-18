import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { KanbanRole, KanbanStatus } from '../../types/cv';
import { CustomSelect, SelectOption } from '../Common/CustomSelect';
import { CustomDatePicker } from '../Common/CustomDatePicker';
import { CustomCurrencyInput } from '../Common/CustomCurrencyInput';

export interface AddEditModalProps {
  isOpen: boolean;
  editingRole: KanbanRole | null;
  onClose: () => void;
  onSave: (data: Omit<KanbanRole, 'id' | 'updatedAt'>) => void;
}

const STAGE_OPTIONS: SelectOption[] = [
  { value: 'applied', label: 'Applied' },
  { value: 'hr_call', label: 'HR Screening' },
  { value: 'tech_interview', label: 'Tech Interview' },
  { value: 'manager_interview', label: 'Manager Round' },
  { value: 'hired', label: 'Offer / Hired' },
  { value: 'archived', label: 'Archive Application' }
];

export const KanbanRoleModal: React.FC<AddEditModalProps> = ({
  isOpen,
  editingRole,
  onClose,
  onSave
}) => {
  const [roleTitle, setRoleTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [status, setStatus] = useState<KanbanStatus>('applied');
  const [dateApplied, setDateApplied] = useState('');
  const [roleUrl, setRoleUrl] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingRole) {
      setRoleTitle(editingRole.roleTitle);
      setCompany(editingRole.company);
      setLocation(editingRole.location || '');
      setSalary(editingRole.salary || '');
      setStatus(editingRole.status);
      setDateApplied(editingRole.dateApplied);
      setRoleUrl(editingRole.roleUrl || '');
      setNotes(editingRole.notes || '');
    } else {
      setRoleTitle('');
      setCompany('');
      setLocation('');
      setSalary('');
      setStatus('applied');
      setDateApplied(new Date().toISOString().slice(0, 10));
      setRoleUrl('');
      setNotes('');
    }
  }, [editingRole, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleTitle.trim() || !company.trim()) return;
    onSave({
      roleTitle: roleTitle.trim(),
      company: company.trim(),
      location: location.trim() || 'Remote',
      salary: salary.trim() || undefined,
      status,
      dateApplied,
      roleUrl: roleUrl.trim() || undefined,
      notes: notes.trim() || undefined
    });
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-5 shadow-2xl">
        <h3 className="text-base font-bold text-white mb-3">
          {editingRole ? 'Edit Application' : 'Add Application'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-slate-300 mb-1 font-medium">Role Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Full-Stack Engineer"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
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
              onChange={(e) => setCompany(e.target.value)}
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
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-medium">Salary</label>
              <CustomCurrencyInput
                value={salary}
                onChange={setSalary}
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
                onChange={(val) => setStatus(val as KanbanStatus)}
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-medium">Date Applied</label>
              <CustomDatePicker
                value={dateApplied}
                onChange={setDateApplied}
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
              onChange={(e) => setRoleUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1 font-medium">Notes</label>
            <textarea
              rows={2}
              placeholder="Notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 resize-none font-sans"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
            >
              {editingRole ? 'Update Card' : 'Save Card'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
