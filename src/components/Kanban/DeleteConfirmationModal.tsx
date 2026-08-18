import React from 'react';
import ReactDOM from 'react-dom';
import { KanbanRole } from '../../types/cv';
import { Trash2, Building, X } from 'lucide-react';

export interface DeleteModalProps {
  role: KanbanRole | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({ role, onClose, onConfirm }) => {
  if (!role) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-600 flex items-center justify-center text-white font-bold shadow-lg shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Delete Application</h3>
            <p className="text-xs text-rose-400 font-medium">Permanent removal</p>
          </div>
        </div>

        <div className="bg-slate-850 border border-slate-750 p-4 rounded-xl space-y-2.5 mb-5 text-xs text-slate-300">
          <p className="text-slate-300">Are you sure you want to permanently delete this application card?</p>
          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg space-y-1">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="text-sky-400 font-mono">Role:</span>
              <span>{role.roleTitle}</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{role.company}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-0.5">This action cannot be undone.</p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(role.id)}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Role</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
