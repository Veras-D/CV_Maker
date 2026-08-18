import React, { useState } from 'react';
import { SkillCategory, LanguageCode } from '../../types/cv';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';

export interface SkillCategoryCardProps {
  cat: SkillCategory;
  activeLanguage: LanguageCode;
  onUpdateCategoryName: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onToggleSkillEnabled: (catId: string, skillId: string) => void;
  onDeleteSkill: (catId: string, skillId: string) => void;
  onAddSkill: (catId: string, name: string) => void;
}

export const SkillCategoryCard: React.FC<SkillCategoryCardProps> = ({
  cat,
  activeLanguage,
  onUpdateCategoryName,
  onDeleteCategory,
  onToggleSkillEnabled,
  onDeleteSkill,
  onAddSkill
}) => {
  const [skillInput, setSkillInput] = useState('');

  const handleAdd = () => {
    if (skillInput.trim()) {
      onAddSkill(cat.id, skillInput.trim());
      setSkillInput('');
    }
  };

  return (
    <div className="bg-slate-850 border border-slate-750 p-4 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Category Name (e.g. Frontend)..."
          value={cat.categoryName[activeLanguage] || cat.categoryName.en || ''}
          onChange={(e) => onUpdateCategoryName(cat.id, e.target.value)}
          className="bg-transparent text-xs font-bold text-sky-400 placeholder:text-sky-400/50 focus:outline-none focus:border-b border-sky-500"
        />
        <button
          type="button"
          onClick={() => onDeleteCategory(cat.id)}
          className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
          title="Delete Skill Category"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {cat.skills.map((s) => (
          <div 
            key={s.id} 
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs border transition-all ${
              s.enabled 
                ? 'bg-slate-800 border-slate-700 text-slate-200' 
                : 'bg-slate-900/50 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <button 
              type="button"
              onClick={() => onToggleSkillEnabled(cat.id, s.id)}
              className={`cursor-pointer ${s.enabled ? 'text-sky-400' : 'text-slate-600'}`}
            >
              {s.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
            <span>{s.name}</span>
            <button 
              type="button"
              onClick={() => onDeleteSkill(cat.id, s.id)}
              className="text-slate-500 hover:text-red-400 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <input
          type="text"
          placeholder="Add skill (e.g. Terraform)..."
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="bg-slate-800 hover:bg-slate-750 text-sky-400 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
