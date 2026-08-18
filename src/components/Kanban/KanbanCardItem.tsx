import React from 'react';
import { KanbanRole } from '../../types/cv';
import { Building, MapPin, Calendar, ExternalLink, Trash2, Edit3, GripVertical } from 'lucide-react';
import { openExternalUrl } from '../../utils/urlHelper';

export interface KanbanCardItemProps {
  role: KanbanRole;
  isBeingDragged: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onEdit: (role: KanbanRole) => void;
  onDelete: (role: KanbanRole) => void;
}

export const KanbanCardItem: React.FC<KanbanCardItemProps> = ({
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
          <button type="button" onClick={() => onEdit(role)} className="p-1 text-slate-400 hover:text-sky-400 cursor-pointer" title="Edit role">
            <Edit3 className="w-3 h-3" />
          </button>
          <button type="button" onClick={() => onDelete(role)} className="p-1 text-slate-400 hover:text-red-400 cursor-pointer" title="Delete role">
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
