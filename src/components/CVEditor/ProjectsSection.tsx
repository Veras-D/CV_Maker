import React from 'react';
import { ProjectItem, LanguageCode } from '../../types/cv';
import { FolderGit2, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

export interface ProjectsSectionProps {
  projects: ProjectItem[];
  activeLanguage: LanguageCode;
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<ProjectItem>) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  activeLanguage,
  onAdd,
  onUpdate,
  onDelete,
  onToggleEnabled
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-sky-400" />
          <span>Featured Portfolio Projects</span>
        </h3>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 rounded text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((p) => (
          <div 
            key={p.id} 
            className={`border p-4 rounded-xl transition-all ${
              p.enabled ? 'bg-slate-850 border-slate-750' : 'bg-slate-900/40 border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button 
                  type="button"
                  onClick={() => onToggleEnabled(p.id)}
                  className={`shrink-0 cursor-pointer ${p.enabled ? 'text-sky-400' : 'text-slate-600'}`}
                >
                  {p.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <input
                  type="text"
                  placeholder="e.g. AI Workflow Engine"
                  value={p.title}
                  onChange={(e) => onUpdate(p.id, { title: e.target.value })}
                  className="flex-1 min-w-0 bg-transparent font-bold text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-b border-sky-500"
                />
              </div>
              <button type="button" onClick={() => onDelete(p.id)} className="text-slate-500 hover:text-red-400 p-1 shrink-0 cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="e.g. https://github.com/janedoe/workflow-engine"
                value={p.url || ''}
                onChange={(e) => onUpdate(p.id, { url: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />

              <textarea
                rows={2}
                placeholder={`e.g. Real-time distributed task orchestrator built with React and Rust (${activeLanguage.toUpperCase()})...`}
                value={p.description[activeLanguage] || p.description.en || ''}
                onChange={(e) => onUpdate(p.id, {
                  description: { ...p.description, [activeLanguage]: e.target.value }
                })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 resize-none font-sans"
              />

              <div>
                <label className="block text-[10px] text-slate-400 font-medium mb-1">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, TypeScript, Rust, Tailwind CSS"
                  value={p.techStack.join(', ')}
                  onChange={(e) => onUpdate(p.id, {
                    techStack: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
