import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { KanbanStatus, KanbanRole } from '../../types/cv';
import { Plus, Search, Archive, ArchiveRestore } from 'lucide-react';
import { KanbanColumn } from './KanbanColumn';
import { ArchivedColumn } from './ArchivedColumn';
import { KanbanRoleModal } from './KanbanRoleModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

const ACTIVE_COLUMNS: { id: KanbanStatus; title: string }[] = [
  { id: 'applied', title: 'Applied' },
  { id: 'hr_call', title: 'HR Screening' },
  { id: 'tech_interview', title: 'Technical Interview' },
  { id: 'manager_interview', title: 'Manager Round' },
  { id: 'hired', title: 'Offer / Hired' }
];

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

  const handleDragStart = (_e: React.DragEvent, id: string) => {
    setDraggedCardId(id);
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, colId: KanbanStatus) => {
    e.preventDefault();
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
    if (draggedCardId) {
      updateKanbanRoleStatus(draggedCardId, targetStatus);
    }
    setDraggedCardId(null);
    setDragOverColumn(null);
  };

  const filteredRoles = kanbanRoles.filter(r => 
    r.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const archivedRoles = filteredRoles.filter(r => r.status === 'archived');
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
              className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 w-36 sm:w-48"
            />
          </div>

          <button
            onClick={() => setShowArchivedKanban(!showArchivedKanban)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              showArchivedKanban 
                ? 'bg-slate-700 text-white border-slate-600' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {showArchivedKanban ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
            <span>{showArchivedKanban ? 'Hide Archive' : `Archive (${archivedCount})`}</span>
          </button>

          <button
            onClick={() => { setEditingRole(null); setShowAddModal(true); }}
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow transition-all cursor-pointer"
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
        {ACTIVE_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            colId={col.id}
            title={col.title}
            roles={filteredRoles.filter(r => r.status === col.id)}
            draggedCardId={draggedCardId}
            dragOverColumn={dragOverColumn}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onEdit={(r) => { setEditingRole(r); setShowAddModal(true); }}
            onDelete={(r) => setRoleToDelete(r)}
          />
        ))}

        {showArchivedKanban && (
          <ArchivedColumn
            title="Archived / Dismissed"
            roles={archivedRoles}
            draggedCardId={draggedCardId}
            dragOverColumn={dragOverColumn}
            onDragOver={(e) => handleDragOver(e, 'archived')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'archived')}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDelete={(r) => setRoleToDelete(r)}
            onRestore={(id) => updateKanbanRoleStatus(id, 'applied')}
          />
        )}
      </div>

      <KanbanRoleModal
        isOpen={showAddModal}
        editingRole={editingRole}
        onClose={() => { setEditingRole(null); setShowAddModal(false); }}
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
