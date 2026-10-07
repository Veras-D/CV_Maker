import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { KanbanRole, KanbanStatus } from '../../types/cv';
import { KanbanRoleFormFields } from './KanbanRoleFormFields';
import { normalizeRoleUrl, formatStageLabel } from '../../utils/kanbanUtils';

export interface AddEditModalProps {
  isOpen: boolean;
  editingRole: KanbanRole | null;
  onClose: () => void;
  onSave: (data: Omit<KanbanRole, 'id' | 'updatedAt'>) => void;
  allRoles?: KanbanRole[];
}

interface CollisionInfo {
  matchingRole: KanbanRole | null;
  isDuplicateError: boolean;
  isExistingMatch: boolean;
  urlError: string | null;
  urlNotice: string | null;
}

function getCollisionInfo(
  roleUrl: string, 
  allRoles: KanbanRole[], 
  editingRoleId?: string
): CollisionInfo {
  const norm = normalizeRoleUrl(roleUrl);
  if (!norm || allRoles.length === 0) {
    return { matchingRole: null, isDuplicateError: false, isExistingMatch: false, urlError: null, urlNotice: null };
  }

  const match = allRoles.find(r => 
    normalizeRoleUrl(r.roleUrl) === norm && (!editingRoleId || r.id !== editingRoleId)
  ) || null;

  const isDuplicateError = Boolean(editingRoleId && match);
  const isExistingMatch = Boolean(!editingRoleId && match);

  const urlError = isDuplicateError && match
    ? `This link is already assigned to "${match.company} - ${match.roleTitle}". Application links must be unique.`
    : null;

  const urlNotice = isExistingMatch && match
    ? `Matches existing card "${match.company} - ${match.roleTitle}" (${formatStageLabel(match.status)}). Saving will update it while preserving its pipeline stage, date applied, and notes.`
    : null;

  return { matchingRole: match, isDuplicateError, isExistingMatch, urlError, urlNotice };
}

function getSubmitButtonProps(isDuplicate: boolean, isMatch: boolean, isEditing: boolean) {
  if (isDuplicate) {
    return {
      label: 'Duplicate Link',
      className: 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
    };
  }
  if (isMatch) {
    return {
      label: 'Update Application',
      className: 'bg-amber-600 hover:bg-amber-500 text-white'
    };
  }
  return {
    label: isEditing ? 'Save Application' : 'Add Application',
    className: 'bg-sky-600 hover:bg-sky-500 text-white'
  };
}

function getModalHeading(isEditing: boolean, isMatch: boolean): string {
  if (isEditing) return 'Edit Application';
  if (isMatch) return 'Update Existing Application';
  return 'Add Application';
}

export const KanbanRoleModal: React.FC<AddEditModalProps> = ({
  isOpen,
  editingRole,
  onClose,
  onSave,
  allRoles = []
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

  const { isDuplicateError, isExistingMatch, urlError, urlNotice } = getCollisionInfo(
    roleUrl, 
    allRoles, 
    editingRole?.id
  );

  const buttonProps = getSubmitButtonProps(isDuplicateError, isExistingMatch, Boolean(editingRole));
  const modalHeading = getModalHeading(Boolean(editingRole), isExistingMatch);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleTitle.trim() || !company.trim()) return;
    if (isDuplicateError) return;

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
          {modalHeading}
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
            urlError={urlError}
            urlNotice={urlNotice}
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
              disabled={isDuplicateError}
              className={`font-semibold px-4 py-1.5 rounded-lg text-xs shadow transition-all cursor-pointer ${buttonProps.className}`}
            >
              {buttonProps.label}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
