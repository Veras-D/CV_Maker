import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { KanbanStatus, KanbanRole } from '../../types/cv';
import { KanbanColumn } from './KanbanColumn';
import { ArchivedColumn } from './ArchivedColumn';
import { KanbanRoleModal } from './KanbanRoleModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { KanbanHeader } from './KanbanHeader';

const INTERVIEW_COLUMNS: { id: KanbanStatus; title: string }[] = [
  { id: 'hr_call', title: 'HR Screening' },
  { id: 'tech_interview', title: 'Tech Interview' },
  { id: 'manager_interview', title: 'Manager Round' },
  { id: 'hired', title: 'Offer / Hired' }
];

export const KanbanBoard: React.FC = () => {
  const { 
    cvData, 
    showAppliedKanban,
    showArchivedKanban,
    setShowAppliedKanban,
    setShowArchivedKanban,
    addKanbanRole, 
    updateKanbanRole, 
    updateKanbanRoleStatus, 
    deleteKanbanRole 
  } = useCV();

  const [searchTerm, setSearchTerm] = useState('');
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
  const searchClean = searchTerm.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const filteredRoles = allRoles.filter(r => {
    if (!searchClean) return true;
    const title = (r.roleTitle || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const company = (r.company || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const location = (r.location || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const notes = (r.notes || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return title.includes(searchClean) || company.includes(searchClean) || location.includes(searchClean) || notes.includes(searchClean);
  });

  const appliedRoles = filteredRoles.filter(r => r.status === 'applied');
  const archivedRoles = filteredRoles.filter(r => r.status === 'archived');

  const isAppliedVisible = showAppliedKanban || (searchClean.length > 0 && appliedRoles.length > 0);
  const isArchivedVisible = showArchivedKanban || (searchClean.length > 0 && archivedRoles.length > 0);

  const columnCount = 4 + (isAppliedVisible ? 1 : 0) + (isArchivedVisible ? 1 : 0);
  const getGridColsClass = (count: number) => {
    if (count === 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    if (count === 5) return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5';
    return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6';
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <KanbanHeader
        searchTerm={searchTerm}
        showAppliedKanban={isAppliedVisible}
        showArchivedKanban={isArchivedVisible}
        appliedCount={appliedRoles.length}
        archivedCount={archivedRoles.length}
        onSearchTermChange={setSearchTerm}
        onToggleShowApplied={() => setShowAppliedKanban(!showAppliedKanban)}
        onToggleShowArchived={() => setShowArchivedKanban(!showArchivedKanban)}
        onOpenAddModal={() => { setEditingRole(null); setShowAddModal(true); }}
      />

      <div className={`grid gap-4 items-start ${getGridColsClass(columnCount)}`}>
        {isAppliedVisible && (
          <KanbanColumn
            colId="applied"
            title="Applied"
            roles={appliedRoles}
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
        )}

        {INTERVIEW_COLUMNS.map((col) => (
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

        {isArchivedVisible && (
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
