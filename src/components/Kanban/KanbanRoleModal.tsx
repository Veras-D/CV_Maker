import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { KanbanRole, KanbanStatus } from '../../types/cv';
import { KanbanRoleFormFields } from './KanbanRoleFormFields';

export interface AddEditModalProps {
  isOpen: boolean;
  editingRole: KanbanRole | null;
  onClose: () => void;
  onSave: (data: Omit<KanbanRole, 'id' | 'updatedAt'>) => void;
}

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
        <form onSubmit={handleSubmit} className="space-y-4">
          <KanbanRoleFormFields
            roleTitle={roleTitle}
            company={company}
            location={location}
            salary={salary}
            status={status}
            dateApplied={dateApplied}
            roleUrl={roleUrl}
            notes={notes}
            onRoleTitleChange={setRoleTitle}
            onCompanyChange={setCompany}
            onLocationChange={setLocation}
            onSalaryChange={setSalary}
            onStatusChange={setStatus}
            onDateAppliedChange={setDateApplied}
            onRoleUrlChange={setRoleUrl}
            onNotesChange={setNotes}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4 py-1.5 rounded-lg text-xs shadow transition-all cursor-pointer"
            >
              Save Application
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
