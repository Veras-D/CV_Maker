import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { KanbanStatus, KanbanRole } from '../../types/cv';
import { Plus, Building, MapPin, DollarSign, Calendar, ExternalLink, Trash2, FileText, Search, Sparkles } from 'lucide-react';

export const KanbanBoard: React.FC = () => {
  const { cvData, addKanbanRole, updateKanbanRoleStatus, deleteKanbanRole, selectPreset, setActiveTab } = useCV();
  const { kanbanRoles, presets } = cvData;

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [roleTitle, setRoleTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [status, setStatus] = useState<KanbanStatus>('wishlist');
  const [dateApplied, setDateApplied] = useState(new Date().toISOString().slice(0, 10));
  const [roleUrl, setRoleUrl] = useState('');
  const [presetId, setPresetId] = useState(cvData.activePresetId);
  const [notes, setNotes] = useState('');

  const columns: { id: KanbanStatus; title: string; color: string; badge: string }[] = [
    { id: 'wishlist', title: 'Wishlist / Backlog', color: 'border-t-slate-500', badge: 'bg-slate-800 text-slate-300' },
    { id: 'applied', title: 'Applied', color: 'border-t-sky-500', badge: 'bg-sky-500/20 text-sky-300' },
    { id: 'screening', title: 'Screening / HR', color: 'border-t-purple-500', badge: 'bg-purple-500/20 text-purple-300' },
    { id: 'interview', title: 'Technical Interview', color: 'border-t-amber-500', badge: 'bg-amber-500/20 text-amber-300' },
    { id: 'offer', title: 'Offer Received', color: 'border-t-emerald-500', badge: 'bg-emerald-500/20 text-emerald-300' },
    { id: 'rejected', title: 'Archived', color: 'border-t-rose-500', badge: 'bg-rose-500/20 text-rose-300' }
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roleTitle.trim() && company.trim()) {
      addKanbanRole({
        roleTitle: roleTitle.trim(),
        company: company.trim(),
        location: location.trim() || 'Remote',
        salary: salary.trim() || undefined,
        status,
        dateApplied,
        roleUrl: roleUrl.trim() || undefined,
        presetId,
        notes: notes.trim() || undefined
      });
      setRoleTitle('');
      setCompany('');
      setLocation('');
      setSalary('');
      setNotes('');
      setShowAddModal(false);
    }
  };

  const filteredRoles = kanbanRoles.filter(r => 
    r.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Kanban Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Job Application Kanban Tracker</span>
          </h2>
          <p className="text-xs text-slate-400">
            Track active role submissions, application dates, target salary ranges, and linked CV versions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search company or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 w-48"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Track New Application</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-start">
        {columns.map((col) => {
          const colRoles = filteredRoles.filter(r => r.status === col.id);
          return (
            <div key={col.id} className={`bg-slate-900/90 border border-slate-800 rounded-2xl border-t-4 ${col.color} p-3 min-h-[500px]`}>
              
              {/* Column Title */}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-slate-200">{col.title}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${col.badge}`}>
                  {colRoles.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-3">
                {colRoles.map((role) => {
                  const linkedPreset = presets.find(p => p.id === role.presetId);
                  return (
                    <div 
                      key={role.id}
                      className="bg-slate-850 border border-slate-750 hover:border-slate-650 rounded-xl p-3 shadow-md space-y-2 transition-all"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">{role.roleTitle}</h4>
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-400 mt-0.5">
                            <Building className="w-3 h-3 text-slate-500" />
                            <span>{role.company}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteKanbanRole(role.id)}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-[10px] text-slate-400 space-y-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{role.location}</span>
                        </div>

                        {role.salary && (
                          <div className="flex items-center gap-1 text-emerald-400 font-mono">
                            <DollarSign className="w-3 h-3 text-emerald-500" />
                            <span>{role.salary}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{role.dateApplied}</span>
                        </div>
                      </div>

                      {role.notes && (
                        <p className="text-[10px] text-slate-300 bg-slate-800 p-2 rounded border border-slate-750 line-clamp-2">
                          {role.notes}
                        </p>
                      )}

                      {/* Linked Preset Badge & Role URL */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        {linkedPreset ? (
                          <button
                            onClick={() => {
                              selectPreset(linkedPreset.id);
                              setActiveTab('preview');
                            }}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono hover:underline"
                            title="Click to load this linked CV preset"
                          >
                            CV: {linkedPreset.name.split(' ')[0]}
                          </button>
                        ) : <span />}

                        {role.roleUrl && (
                          <a
                            href={role.roleUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-sky-400 p-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {/* Move status select */}
                      <select
                        value={role.status}
                        onChange={(e) => updateKanbanRoleStatus(role.id, e.target.value as KanbanStatus)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-300 focus:outline-none"
                      >
                        {columns.map(c => (
                          <option key={c.id} value={c.id}>
                            Move to: {c.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal Add Role */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Track New Job Application</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full-Stack Developer"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mews"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="Prague / Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. 120k CZK / mo"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as KanbanStatus)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  >
                    {columns.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date Applied</label>
                  <input
                    type="date"
                    value={dateApplied}
                    onChange={(e) => setDateApplied(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Job Link</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={roleUrl}
                  onChange={(e) => setRoleUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Linked CV Preset</label>
                <select
                  value={presetId}
                  onChange={(e) => setPresetId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                >
                  {presets.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Interview notes, contacts, or steps..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white"
                >
                  Track Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
