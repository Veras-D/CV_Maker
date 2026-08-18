import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useCV } from '../../context/CVContext';
import { KanbanStatus, KanbanRole } from '../../types/cv';
import { Plus, Building, MapPin, DollarSign, Calendar, ExternalLink, Trash2, Search, Archive, ArchiveRestore, Edit3, GripVertical, X } from 'lucide-react';
import { CustomSelect, SelectOption } from '../Common/CustomSelect';
import { CustomDatePicker } from '../Common/CustomDatePicker';
import { CustomCurrencyInput } from '../Common/CustomCurrencyInput';
import { openExternalUrl } from '../../utils/urlHelper';

export const KanbanBoard: React.FC = () => {
  const { cvData, addKanbanRole, updateKanbanRoleStatus, updateKanbanRole, deleteKanbanRole, showArchivedKanban, setShowArchivedKanban } = useCV();
  const { kanbanRoles } = cvData;

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRole, setEditingRole] = useState<KanbanRole | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<KanbanRole | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  // Form state
  const [roleTitle, setRoleTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [status, setStatus] = useState<KanbanStatus>('applied');
  const [dateApplied, setDateApplied] = useState(new Date().toISOString().slice(0, 10));
  const [roleUrl, setRoleUrl] = useState('');
  const [notes, setNotes] = useState('');

  const activeColumns: { id: KanbanStatus; title: string }[] = [
    { id: 'applied', title: 'Applied' },
    { id: 'hr_call', title: 'HR Screening' },
    { id: 'tech_interview', title: 'Technical Interview' },
    { id: 'manager_interview', title: 'Manager Round' },
    { id: 'hired', title: 'Offer / Hired' }
  ];

  const stageOptions: SelectOption[] = [
    { value: 'applied', label: 'Applied' },
    { value: 'hr_call', label: 'HR Screening' },
    { value: 'tech_interview', label: 'Tech Interview' },
    { value: 'manager_interview', label: 'Manager Round' },
    { value: 'hired', label: 'Offer / Hired' },
    { value: 'archived', label: 'Archive Application' }
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roleTitle.trim() && company.trim()) {
      if (editingRole) {
        updateKanbanRole(editingRole.id, {
          roleTitle: roleTitle.trim(),
          company: company.trim(),
          location: location.trim() || 'Remote',
          salary: salary.trim() || undefined,
          status,
          dateApplied,
          roleUrl: roleUrl.trim() || undefined,
          notes: notes.trim() || undefined
        });
      } else {
        addKanbanRole({
          roleTitle: roleTitle.trim(),
          company: company.trim(),
          location: location.trim() || 'Remote',
          salary: salary.trim() || undefined,
          status,
          dateApplied,
          roleUrl: roleUrl.trim() || undefined,
          notes: notes.trim() || undefined
        });
      }
      closeModal();
    }
  };

  const openEditModal = (role: KanbanRole) => {
    setEditingRole(role);
    setRoleTitle(role.roleTitle);
    setCompany(role.company);
    setLocation(role.location || '');
    setSalary(role.salary || '');
    setStatus(role.status);
    setDateApplied(role.dateApplied);
    setRoleUrl(role.roleUrl || '');
    setNotes(role.notes || '');
    setShowAddModal(true);
  };

  const closeModal = () => {
    setEditingRole(null);
    setRoleTitle('');
    setCompany('');
    setLocation('');
    setSalary('');
    setNotes('');
    setShowAddModal(false);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCardId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: KanbanStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedCardId;
    if (id) {
      updateKanbanRoleStatus(id, targetStatus);
      setDraggedCardId(null);
    }
  };

  const filteredRoles = kanbanRoles.filter(r => 
    r.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const archivedCount = filteredRoles.filter(r => r.status === 'archived').length;

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
              setRoleTitle('');
              setCompany('');
              setLocation('');
              setSalary('');
              setStatus('applied');
              setDateApplied(new Date().toISOString().slice(0, 10));
              setRoleUrl('');
              setNotes('');
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
          return (
            <div 
              key={col.id} 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3 min-h-[480px] transition-colors hover:border-slate-700 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-200">{col.title}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
                    {colRoles.length}
                  </span>
                </div>

                {/* Cards list */}
                <div className="space-y-2.5">
                  {colRoles.map((role) => (
                    <div 
                      key={role.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, role.id)}
                      className="bg-slate-850 border border-slate-750 hover:border-sky-600/50 rounded-lg p-3 space-y-2 transition-all shadow-sm group cursor-grab active:cursor-grabbing overflow-hidden"
                    >
                      <div className="flex justify-between items-start gap-1">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <GripVertical className="w-3.5 h-3.5 text-slate-600 opacity-40 group-hover:opacity-100 shrink-0" />
                          <h4 className="font-bold text-xs text-white truncate">{role.roleTitle}</h4>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => openEditModal(role)} className="p-1 text-slate-400 hover:text-sky-400" title="Edit role">
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button onClick={() => setRoleToDelete(role)} className="p-1 text-slate-400 hover:text-red-400" title="Delete role">
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
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Hidden Archive Column */}
        {showArchivedKanban && (
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'archived')}
            className="bg-slate-900 border border-slate-800 rounded-xl p-3 min-h-[480px] bg-slate-950/40"
          >
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
                  className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-xs opacity-75 space-y-1 cursor-grab"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-300">{role.roleTitle}</span>
                    <button onClick={() => setRoleToDelete(role)} className="text-slate-500 hover:text-red-400 p-1" title="Delete permanently">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 block">{role.company}</span>
                  <button
                    onClick={() => updateKanbanRoleStatus(role.id, 'applied')}
                    className="mt-1 text-[10px] text-sky-400 hover:underline block"
                  >
                    Restore to Applied
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Add / Edit Modal - Rendered via ReactDOM.createPortal to cover top bar 100% */}
      {showAddModal && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">
              {editingRole ? 'Edit Application' : 'Add Application'}
            </h3>
            <form onSubmit={handleAddSubmit} className="space-y-3">
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
                  placeholder="e.g. Mews"
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
                    placeholder="Prague / Remote"
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
                  onClick={closeModal}
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
      )}

      {/* Delete Confirmation Modal - Rendered via ReactDOM.createPortal */}
      {roleToDelete && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setRoleToDelete(null)}
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
                  <span>{roleToDelete.roleTitle}</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{roleToDelete.company}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 pt-0.5">This action cannot be undone.</p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRoleToDelete(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteKanbanRole(roleToDelete.id);
                  setRoleToDelete(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Application</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
