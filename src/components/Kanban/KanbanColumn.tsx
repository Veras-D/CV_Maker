import React from 'react';
import { KanbanRole, KanbanStatus } from '../../types/cv';
import { KanbanCardItem } from './KanbanCardItem';
import { Trash2 } from 'lucide-react';

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
  onRestore?: (id: string) => void;
  isArchived?: boolean;
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
  onDelete,
  onRestore,
  isArchived
}) => {
  const isDropTarget = dragOverColumn === colId && draggedCardId !== null;

  if (isArchived) {
    return (
      <div 
        onDragOver={(e) => onDragOver(e, 'archived')}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, 'archived')}
        className={`border rounded-xl p-3 min-h-[480px] transition-all duration-200 flex flex-col justify-between ${
          isDropTarget
            ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30 shadow-lg shadow-rose-950/50'
            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800 text-rose-400">
            <span className="text-xs font-bold">{title}</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
              {roles.length}
            </span>
          </div>

          <div className="space-y-2.5">
            {roles.map((role) => (
              <div 
                key={role.id} 
                draggable
                onDragStart={(e) => onDragStart(e, role.id)}
                onDragEnd={onDragEnd}
                className={`rounded-lg p-2.5 text-xs space-y-1 transition-all duration-150 ${
                  draggedCardId === role.id
                    ? 'opacity-35 scale-[0.97] border-2 border-dashed border-rose-400 bg-rose-950/20'
                    : 'bg-slate-850 border border-slate-750 opacity-75 hover:opacity-100 cursor-grab active:cursor-grabbing'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-300 truncate">{role.roleTitle}</span>
                  <button onClick={() => onDelete(role)} className="text-slate-500 hover:text-red-400 p-1 cursor-pointer" title="Delete permanently">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 block truncate">{role.company}</span>
                {onRestore && (
                  <button
                    onClick={() => onRestore(role.id)}
                    className="mt-1 text-[10px] text-sky-400 hover:underline block cursor-pointer"
                  >
                    Restore to Applied
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
