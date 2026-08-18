import React from 'react';
import { Sparkles, FileText, Kanban, Sliders } from 'lucide-react';

export type WorkspaceTab = 'tailor' | 'editor' | 'kanban' | 'metadata';

export interface NavWorkspaceTabsProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
}

export const NavWorkspaceTabs: React.FC<NavWorkspaceTabsProps> = ({ activeTab, onSelectTab }) => {
  return (
    <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
      <button
        type="button"
        onClick={() => onSelectTab('tailor')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
          activeTab === 'tailor' 
            ? 'bg-sky-600 text-white shadow-sm font-semibold' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Role AI Tailor</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('editor')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
          activeTab === 'editor' 
            ? 'bg-sky-600 text-white shadow-sm font-semibold' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
        <FileText className="w-3.5 h-3.5" />
        <span>Master Resume</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('kanban')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
          activeTab === 'kanban' 
            ? 'bg-sky-600 text-white shadow-sm font-semibold' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
        <Kanban className="w-3.5 h-3.5" />
        <span>Kanban</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('metadata')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
          activeTab === 'metadata' 
            ? 'bg-sky-600 text-white shadow-sm font-semibold' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
        <Sliders className="w-3.5 h-3.5" />
        <span>Settings</span>
      </button>
    </nav>
  );
};
