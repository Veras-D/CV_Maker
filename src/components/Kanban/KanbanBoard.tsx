import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { KanbanStatus, KanbanRole } from '../../types/cv';
import { KanbanColumn } from './KanbanColumn';
import { ArchivedColumn } from './ArchivedColumn';
import { KanbanRoleModal } from './KanbanRoleModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { KanbanHeader } from './KanbanHeader';

const ACTIVE_COLUMNS: { id: KanbanStatus; title: string }[] = [
  { id: 'applied', title: 'Applied' },
  { id: 'hr_call', title: 'HR Screening' },
  { id: 'tech_interview', title: 'Tech Interview' },
  { id: 'manager_interview', title: 'Manager Round' },
  { id: 'hired', title: 'Offer / Hired' }
];

export const KanbanBoard: React.FC = () => {
  const { 
    cvData, 
    addKanbanRole, 
    updateKanbanRole, 
    updateKanbanRoleStatus, 
    deleteKanbanRole 
  } = useCV();

  const [searchTerm, setSearchTerm] = useState('');
  const [showArchivedKanban, setShowArchivedKanban] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRole, setEditingRole] = useState<KanbanRole | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<KanbanRole | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<KanbanStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedCardId(id);
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, colId: KanbanStatus) => {
    e.preventDefault();
    if (dragOverColumn !== colId) setDragOverColumn(colId);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: KanbanStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedCardId;
    if (id) updateKanbanRoleStatus(id, targetStatus);
    setDraggedCardId(null);
    setDragOverColumn(null);
  };

  const handleSaveRole = (data: Omit<KanbanRole, 'id' | 'updatedAt'>) => {
    if (editingRole) {
      updateKanbanRole(editingRole.id, data);
    } else {
      addKanbanRole(data);
    }
  };

  const allRoles = cvData.kanbanRoles || [];
  const filteredRoles = allRoles.filter(r => 
    r.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.roleTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const archivedRoles = filteredRoles.filter(r => r.status === 'archived');

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <KanbanHeader
        searchTerm={searchTerm}
        showArchivedKanban={showArchivedKanban}
        onSearchTermChange={setSearchTerm}
        onToggleShowArchived={() => setShowArchivedKanban(!showArchivedKanban)}
        onOpenAddModal={() => { setEditingRole(null); setShowAddModal(true); }}
      />

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
            onDragLeave={() => setDragOverColumn(null)}
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
            onDragLeave={() => setDragOverColumn(null)}
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
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveRole}
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
