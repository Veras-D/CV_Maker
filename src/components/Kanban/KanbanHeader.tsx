import React from 'react';
import { Kanban, Search, Plus, Archive, ArchiveRestore } from 'lucide-react';

export interface KanbanHeaderProps {
  searchTerm: string;
  showArchivedKanban: boolean;
  onSearchTermChange: (v: string) => void;
  onToggleShowArchived: () => void;
  onOpenAddModal: () => void;
}

export const KanbanHeader: React.FC<KanbanHeaderProps> = ({
  searchTerm,
  showArchivedKanban,
  onSearchTermChange,
  onToggleShowArchived,
  onOpenAddModal
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Kanban className="w-5 h-5 text-sky-400" />
          <span>Job Application Pipeline</span>
        </h2>
        <p className="text-xs text-slate-400">Track stages, interviews, salary targets, and notes</p>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search company or role..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <button
          type="button"
          onClick={onToggleShowArchived}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
            showArchivedKanban 
              ? 'bg-rose-950/60 border-rose-800 text-rose-300' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {showArchivedKanban ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
          <span>{showArchivedKanban ? 'Hide Archive' : 'Show Archive'}</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Role</span>
        </button>
      </div>
    </div>
  );
};
