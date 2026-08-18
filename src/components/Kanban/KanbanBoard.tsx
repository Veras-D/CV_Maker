import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useCV } from '../../context/CVContext';
import { KanbanStatus, KanbanRole } from '../../types/cv';
import { Plus, Building, MapPin, DollarSign, Calendar, ExternalLink, Trash2, Search, Archive, ArchiveRestore, Edit3, GripVertical } from 'lucide-react';
import { CustomSelect, SelectOption } from '../Common/CustomSelect';
import { openExternalUrl } from '../../utils/urlHelper';

export const KanbanBoard: React.FC = () => {
  const { cvData, addKanbanRole, updateKanbanRoleStatus, updateKanbanRole, deleteKanbanRole, showArchivedKanban, setShowArchivedKanban } = useCV();
  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRole, setEditingRole] = useState<KanbanRole | null>(null);

  // Form state
  const [roleTitle, setRoleTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [status, setStatus] = useState<KanbanStatus>('applied');
  const [dateApplied, setDateApplied] = useState(new Date().toISOString().split('T')[0]);
  const [roleUrl, setRoleUrl] = useState('');
  const [notes, setNotes] = useState('');

  const columns: { id: KanbanStatus; title: string }[] = [
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
    if (!roleTitle || !company) return;

    if (editingRole) {
      updateKanbanRole(editingRole.id, {
        roleTitle,
        company,
        location,
        salary,
        status,
        dateApplied,
        roleUrl,
        notes
      });
    } else {
      addKanbanRole({
        roleTitle,
        company,
        location,
        salary,
        status,
        dateApplied,
        roleUrl,
        notes
      });
    }

    closeModal();
  };

  const openAddModal = () => {
    setEditingRole(null);
    setRoleTitle('');
    setCompany('');
    setLocation('');
    setSalary('');
    setStatus('applied');
    setDateApplied(new Date().toISOString().split('T')[0]);
    setRoleUrl('');
    setNotes('');
    setShowAddModal(true);
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
    setShowAddModal(false);
    setEditingRole(null);
  };

  const filteredRoles = cvData.kanbanRoles.filter(role => {
    const isArchived = role.status === 'archived';
    if (showArchivedKanban) {
      if (!isArchived) return false;
    } else {
      if (isArchived) return false;
    }

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      role.roleTitle.toLowerCase().includes(term) ||
      role.company.toLowerCase().includes(term) ||
      (role.location && role.location.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Job Application Kanban Pipeline</span>
          </h1>
          <p className="text-xs text-slate-400">Track active applications, interviews, and offer stages</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Toggle Archived */}
          <button
            onClick={() => setShowArchivedKanban(!showArchivedKanban)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              showArchivedKanban 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            {showArchivedKanban ? (
              <>
                <ArchiveRestore className="w-3.5 h-3.5" />
                <span>Show Active ({cvData.kanbanRoles.filter(r => r.status !== 'archived').length})</span>
              </>
            ) : (
              <>
                <Archive className="w-3.5 h-3.5" />
                <span>Archived ({cvData.kanbanRoles.filter(r => r.status === 'archived').length})</span>
              </>
            )}
          </button>

          {/* Add New Application */}
          <button
            onClick={openAddModal}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 shadow-md shadow-sky-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Role</span>
          </button>
        </div>
      </div>

      {/* Main Kanban Board View */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {columns.map(col => {
          const colRoles = filteredRoles.filter(r => r.status === col.id);

          return (
            <div 
              key={col.id}
              className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <h3 className="text-xs font-bold text-slate-200 tracking-wide">
                  {col.title}
                </h3>
                <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-750">
                  {colRoles.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colRoles.map(role => (
                  <div
                    key={role.id}
                    className="bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-slate-700 p-3 rounded-xl shadow-sm transition-all group relative"
                  >
                    {/* Top card bar */}
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors leading-tight">
                        {role.roleTitle}
                      </h4>
                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(role)}
                          className="text-slate-400 hover:text-sky-400 p-1"
                          title="Edit role"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteKanbanRole(role.id)}
                          className="text-slate-400 hover:text-red-400 p-1"
                          title="Delete role"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 mb-2">
                      <Building className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{role.company}</span>
                    </div>

                    {/* Details tags */}
                    <div className="space-y-1 text-[10px] text-slate-400 mb-3">
                      {role.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{role.location}</span>
                        </div>
                      )}
                      {role.salary && (
                        <div className="flex items-center gap-1 text-emerald-400 font-mono">
                          <DollarSign className="w-3 h-3 shrink-0" />
                          <span>{role.salary}</span>
                        </div>
                      )}
                    </div>

                    {/* Date Applied & External Link Row */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{role.dateApplied}</span>
                      </div>

                      {role.roleUrl && (
                        <button 
                          type="button"
                          onClick={(e) => { e.preventDefault(); openExternalUrl(role.roleUrl!); }}
                          className="text-sky-400 hover:text-sky-300 hover:underline cursor-pointer flex items-center gap-1 font-medium shrink-0"
                        >
                          <span>Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Full-Width Stage Selector */}
                    <div className="w-full">
                      <CustomSelect
                        className="w-full"
                        options={stageOptions}
                        value={role.status}
                        onChange={(newStatus) => updateKanbanRoleStatus(role.id, newStatus as KanbanStatus)}
                      />
                    </div>

                    {/* Optional Custom Notes */}
                    {role.notes && role.notes.trim() !== '' && role.notes.trim().toLowerCase() !== 'application submitted.' && (
                      <p className="text-[10px] text-slate-300 bg-slate-800/80 p-1.5 rounded-lg border border-slate-750 font-sans line-clamp-2 mt-2">
                        {role.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Archived Roles List View if active */}
        {showArchivedKanban && filteredRoles.length > 0 && (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Archive className="w-4 h-4 text-amber-400" />
              <span>Archived Application Records</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredRoles.map(role => (
                <div key={role.id} className="bg-slate-850 border border-slate-750 p-3 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-white">{role.roleTitle}</h4>
                    <p className="text-slate-400">{role.company} • {role.dateApplied}</p>
                  </div>
                  <button
                    onClick={() => updateKanbanRoleStatus(role.id, 'applied')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-[11px] font-medium border border-slate-700"
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
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 shadow-2xl">
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
                  <input
                    type="text"
                    placeholder="120,000 CZK / mo"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
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
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={dateApplied}
                    onChange={(e) => setDateApplied(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
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

    </div>
  );
};
