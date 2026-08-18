import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useCV } from '../../context/CVContext';
import { KanbanStatus, KanbanRole } from '../../types/cv';
import { Plus, Building, MapPin, Calendar, ExternalLink, Trash2, Search, Archive, ArchiveRestore, Edit3, GripVertical, X } from 'lucide-react';
import { CustomSelect, SelectOption } from '../Common/CustomSelect';
import { CustomDatePicker } from '../Common/CustomDatePicker';
import { CustomCurrencyInput } from '../Common/CustomCurrencyInput';
import { openExternalUrl } from '../../utils/urlHelper';

interface KanbanCardItemProps {
  role: KanbanRole;
  isBeingDragged: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onEdit: (role: KanbanRole) => void;
  onDelete: (role: KanbanRole) => void;
}

const KanbanCardItem: React.FC<KanbanCardItemProps> = ({
  role,
  isBeingDragged,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete
}) => {
  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, role.id)}
      onDragEnd={onDragEnd}
      className={`rounded-lg p-3 space-y-2 transition-all duration-150 overflow-hidden ${
        isBeingDragged
          ? 'opacity-35 scale-[0.97] border-2 border-dashed border-sky-400 bg-sky-950/20 shadow-none ring-2 ring-sky-500/20 cursor-grabbing'
          : 'bg-slate-850 border border-slate-750 hover:border-sky-600/50 hover:shadow-md shadow-sm group cursor-grab active:cursor-grabbing'
      }`}
    >
      <div className="flex justify-between items-start gap-1">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-slate-600 opacity-40 group-hover:opacity-100 shrink-0" />
          <h4 className="font-bold text-xs text-white truncate">{role.roleTitle}</h4>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button type="button" onClick={() => onEdit(role)} className="p-1 text-slate-400 hover:text-sky-400" title="Edit role">
            <Edit3 className="w-3 h-3" />
          </button>
          <button type="button" onClick={() => onDelete(role)} className="p-1 text-slate-400 hover:text-red-400" title="Delete role">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center text-[11px] text-slate-400">
        <span className="font-medium text-slate-300 flex items-center gap-1 truncate mr-1.5 flex-1 min-w-0">
          <Building className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate">{role.company}</span>
        </span>
        {role.salary && (
          <span 
            className="text-[10px] text-emerald-400 font-mono shrink-0 truncate max-w-[110px]"
            title={role.salary}
          >
            {role.salary}
          </span>
        )}
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400">
        <span className="flex items-center gap-1 truncate mr-1">
          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate">{role.location}</span>
        </span>
        <span className="flex items-center gap-1 font-mono shrink-0">
          <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
          <span>{role.dateApplied}</span>
        </span>
      </div>

      {role.roleUrl && (
        <div className="pt-1">
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); openExternalUrl(role.roleUrl!); }}
            className="text-[10px] text-sky-400 hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
          >
            <span>Link</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>
      )}

      {role.notes && role.notes.trim() !== '' && (
        <p className="text-[10px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800 line-clamp-3">
          {role.notes}
        </p>
      )}
    </div>
  );
};

interface DeleteModalProps {
  role: KanbanRole | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({ role, onClose, onConfirm }) => {
  if (!role) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 transition-colors"
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
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(role.id)}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Application</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

interface AddEditModalProps {
  isOpen: boolean;
  editingRole: KanbanRole | null;
  onClose: () => void;
  onSave: (data: Omit<KanbanRole, 'id' | 'updatedAt'>) => void;
}

const AddEditRoleModal: React.FC<AddEditModalProps> = ({
  isOpen,
  editingRole,
  onClose,
  onSave
}) => {
  const [roleTitle, setRoleTitle] = useState(editingRole?.roleTitle || '');
  const [company, setCompany] = useState(editingRole?.company || '');
  const [location, setLocation] = useState(editingRole?.location || '');
  const [salary, setSalary] = useState(editingRole?.salary || '');
  const [status, setStatus] = useState<KanbanStatus>(editingRole?.status || 'applied');
  const [dateApplied, setDateApplied] = useState(editingRole?.dateApplied || new Date().toISOString().slice(0, 10));
  const [roleUrl, setRoleUrl] = useState(editingRole?.roleUrl || '');
  const [notes, setNotes] = useState(editingRole?.notes || '');

  React.useEffect(() => {
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

  const stageOptions: SelectOption[] = [
    { value: 'applied', label: 'Applied' },
    { value: 'hr_call', label: 'HR Screening' },
    { value: 'tech_interview', label: 'Tech Interview' },
    { value: 'manager_interview', label: 'Manager Round' },
    { value: 'hired', label: 'Offer / Hired' },
    { value: 'archived', label: 'Archive Application' }
  ];

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
                options={stageOptions}
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
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white"
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

export const KanbanBoard: React.FC = () => {
  const { 
    cvData, 
    addKanbanRole, 
    updateKanbanRoleStatus, 
    updateKanbanRole, 
    deleteKanbanRole, 
    showArchivedKanban, 
    setShowArchivedKanban 
  } = useCV();

  const { kanbanRoles } = cvData;

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRole, setEditingRole] = useState<KanbanRole | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<KanbanRole | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<KanbanStatus | null>(null);

  const activeColumns: { id: KanbanStatus; title: string }[] = [
    { id: 'applied', title: 'Applied' },
    { id: 'hr_call', title: 'HR Screening' },
    { id: 'tech_interview', title: 'Technical Interview' },
    { id: 'manager_interview', title: 'Manager Round' },
    { id: 'hired', title: 'Offer / Hired' }
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCardId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, colId: KanbanStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: KanbanStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedCardId;
    if (id) {
      updateKanbanRoleStatus(id, targetStatus);
    }
    setDraggedCardId(null);
    setDragOverColumn(null);
  };

  const filteredRoles = kanbanRoles.filter(r => 
    r.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const archivedCount = kanbanRoles.filter(r => r.status === 'archived').length;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-5">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-white">Application Pipeline</h2>
          <p className="text-xs text-slate-400">Drag & drop cards or select stage to move applications</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 w-36 sm:w-48"
            />
          </div>

          <button
            onClick={() => setShowArchivedKanban(!showArchivedKanban)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              showArchivedKanban 
                ? 'bg-slate-700 text-white border-slate-600' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {showArchivedKanban ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
            <span>{showArchivedKanban ? 'Hide Archive' : `Archive (${archivedCount})`}</span>
          </button>

          <button
            onClick={() => {
              setEditingRole(null);
              setShowAddModal(true);
            }}
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Role</span>
          </button>
        </div>
      </div>

      {/* Main Board Columns */}
      <div className={`grid gap-4 items-start ${
        showArchivedKanban ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6' : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5'
      }`}>
        
        {activeColumns.map((col) => {
          const colRoles = filteredRoles.filter(r => r.status === col.id);
          const isDropTarget = dragOverColumn === col.id && draggedCardId !== null;

          return (
            <div 
              key={col.id} 
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`border rounded-xl p-3 min-h-[480px] transition-all duration-200 flex flex-col justify-between ${
                isDropTarget
                  ? 'bg-slate-850/90 border-sky-500 ring-2 ring-sky-500/30 shadow-lg shadow-sky-950/50'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-200">{col.title}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
                    {colRoles.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {colRoles.map((role) => (
                    <KanbanCardItem
                      key={role.id}
                      role={role}
                      isBeingDragged={draggedCardId === role.id}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onEdit={(r) => {
                        setEditingRole(r);
                        setShowAddModal(true);
                      }}
                      onDelete={(r) => setRoleToDelete(r)}
                    />
                  ))}

                  {isDropTarget && (
                    <div className="border-2 border-dashed border-sky-400/80 bg-sky-500/10 rounded-lg p-3 text-center text-sky-300 text-xs font-semibold animate-pulse flex items-center justify-center gap-1.5 shadow-inner">
                      <GripVertical className="w-3.5 h-3.5" />
                      <span>Drop into {col.title}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Hidden Archive Column */}
        {showArchivedKanban && (
          <div 
            onDragOver={(e) => handleDragOver(e, 'archived')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'archived')}
            className={`border rounded-xl p-3 min-h-[480px] transition-all duration-200 flex flex-col justify-between ${
              dragOverColumn === 'archived' && draggedCardId !== null
                ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30 shadow-lg shadow-rose-950/50'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800 text-rose-400">
                <span className="text-xs font-bold">Archived / Dismissed</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                  {archivedCount}
                </span>
              </div>

              <div className="space-y-2.5">
                {filteredRoles.filter(r => r.status === 'archived').map((role) => (
                  <div 
                    key={role.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, role.id)}
                    onDragEnd={handleDragEnd}
                    className={`rounded-lg p-2.5 text-xs space-y-1 transition-all duration-150 ${
                      draggedCardId === role.id
                        ? 'opacity-35 scale-[0.97] border-2 border-dashed border-rose-400 bg-rose-950/20'
                        : 'bg-slate-850 border border-slate-750 opacity-75 hover:opacity-100 cursor-grab active:cursor-grabbing'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-300 truncate">{role.roleTitle}</span>
                      <button onClick={() => setRoleToDelete(role)} className="text-slate-500 hover:text-red-400 p-1" title="Delete permanently">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">{role.company}</span>
                    <button
                      onClick={() => updateKanbanRoleStatus(role.id, 'applied')}
                      className="mt-1 text-[10px] text-sky-400 hover:underline block"
                    >
                      Restore to Applied
                    </button>
                  </div>
                ))}

                {dragOverColumn === 'archived' && draggedCardId !== null && (
                  <div className="border-2 border-dashed border-rose-400/80 bg-rose-500/10 rounded-lg p-3 text-center text-rose-300 text-xs font-semibold animate-pulse flex items-center justify-center gap-1.5 shadow-inner">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Archive role</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      <AddEditRoleModal
        isOpen={showAddModal}
        editingRole={editingRole}
        onClose={() => {
          setEditingRole(null);
          setShowAddModal(false);
        }}
        onSave={(data) => {
          if (editingRole) {
            updateKanbanRole(editingRole.id, data);
          } else {
            addKanbanRole(data);
          }
        }}
      />

      <DeleteConfirmationModal
        role={roleToDelete}
        onClose={() => setRoleToDelete(null)}
        onConfirm={(id) => {
          deleteKanbanRole(id);
          setRoleToDelete(null);
        }}
      />

    </div>
  );
};
