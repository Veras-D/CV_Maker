import React from 'react';
import { useCV } from '../../context/CVContext';
import { Tag, Filter, X, Plus } from 'lucide-react';

export const TagFilterBar: React.FC = () => {
  const { selectedTags, toggleTagFilter, clearTagFilters } = useCV();

  const availableTags = [
    { id: 'fullstack', label: 'Full-Stack', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
    { id: 'devops', label: 'DevOps & IaC', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
    { id: 'backend', label: 'Backend APIs', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
    { id: 'frontend', label: 'Frontend UI', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    { id: 'management', label: 'Team Leadership', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
          <Filter className="w-4 h-4 text-sky-400" />
          <span>Interactive Role Tag Filter</span>
        </div>
        {selectedTags.length > 0 && (
          <button
            onClick={clearTagFilters}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Show All ({selectedTags.length} active)</span>
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400 mb-3">
        Click tags to filter experience bullets, skills, and projects dynamically for specific role applications.
      </p>

      <div className="flex flex-wrap gap-2">
        {availableTags.map(t => {
          const isSelected = selectedTags.includes(t.id);
          return (
            <button
              key={t.id}
              onClick={() => toggleTagFilter(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isSelected 
                  ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-600/30 ring-2 ring-sky-400/50' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600 hover:bg-slate-750'
              }`}
            >
              <Tag className="w-3 h-3" />
              <span>#{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
