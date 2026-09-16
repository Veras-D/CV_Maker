import React from 'react';
import { Kanban, Search, Plus, Archive, ArchiveRestore, Inbox, X } from 'lucide-react';

export interface KanbanHeaderProps {
  searchTerm: string;
  showAppliedKanban: boolean;
  showArchivedKanban: boolean;
  appliedCount: number;
  archivedCount: number;
  onSearchTermChange: (v: string) => void;
  onToggleShowApplied: () => void;
  onToggleShowArchived: () => void;
  onOpenAddModal: () => void;
}

export const KanbanHeader: React.FC<KanbanHeaderProps> = ({
  searchTerm,
  showAppliedKanban,
  showArchivedKanban,
  appliedCount,
  archivedCount,
  onSearchTermChange,
  onToggleShowApplied,
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
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by role title, company..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 w-56 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchTermChange('')}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-200 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleShowApplied}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
            showAppliedKanban 
              ? 'bg-sky-950/60 border-sky-800 text-sky-300' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>{showAppliedKanban ? 'Hide Applied' : 'Show Applied'}</span>
          {!showAppliedKanban && appliedCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
              {appliedCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onToggleShowArchived}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
            showArchivedKanban 
              ? 'bg-rose-950/60 border-rose-800 text-rose-300' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {showArchivedKanban ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
          <span>{showArchivedKanban ? 'Hide Archive' : 'Show Archive'}</span>
          {!showArchivedKanban && archivedCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 font-bold border border-rose-800/40">
              {archivedCount}
            </span>
          )}
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
