import React from 'react';
import { KanbanRole, KanbanStatus } from '../../types/cv';
import { KanbanCardItem } from './KanbanCardItem';

export interface KanbanColumnProps {
  colId: KanbanStatus;
  title: string;
  roles: KanbanRole[];
  draggedCardId: string | null;
  dragOverColumn: KanbanStatus | null;
  onDragOver: (e: React.DragEvent, colId: KanbanStatus) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, colId: KanbanStatus) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onEdit: (role: KanbanRole) => void;
  onDelete: (role: KanbanRole) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  colId,
  title,
  roles,
  draggedCardId,
  dragOverColumn,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete
}) => {
  const isDropTarget = dragOverColumn === colId && draggedCardId !== null;

  return (
    <div 
      onDragOver={(e) => onDragOver(e, colId)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, colId)}
      className={`border rounded-xl p-3 min-h-[480px] transition-all duration-200 flex flex-col justify-between ${
        isDropTarget
          ? 'bg-slate-850/90 border-sky-500 ring-2 ring-sky-500/30 shadow-lg shadow-sky-950/50'
          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-200">{title}</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
            {roles.length}
          </span>
        </div>

        <div className="space-y-2.5">
          {roles.map((role) => (
            <KanbanCardItem
              key={role.id}
              role={role}
              isBeingDragged={draggedCardId === role.id}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
