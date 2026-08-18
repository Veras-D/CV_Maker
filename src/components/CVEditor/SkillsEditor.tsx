import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { Cpu, Plus } from 'lucide-react';
import { LanguageCode } from '../../types/cv';
import { SkillCategoryCard } from './SkillCategoryCard';

export const SkillsEditor: React.FC = () => {
  const { 
    cvData, 
    activeLanguage, 
    addSkillCategory, 
    updateSkillCategory, 
    deleteSkillCategory,
    addSkill,
    toggleSkillEnabled,
    deleteSkill
  } = useCV();

  const { skillCategories } = cvData;
  const [newCatName, setNewCatName] = useState('');

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addSkillCategory(newCatName.trim(), newCatName.trim());
      setNewCatName('');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-400" />
          <span>Core Skills & Technologies Matrix</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skillCategories.map((cat) => (
          <SkillCategoryCard
            key={cat.id}
            cat={cat}
            activeLanguage={activeLanguage as LanguageCode}
            onUpdateCategoryName={(id, name) => updateSkillCategory(id, name, name)}
            onDeleteCategory={deleteSkillCategory}
            onToggleSkillEnabled={toggleSkillEnabled}
            onDeleteSkill={deleteSkill}
            onAddSkill={(catId, name) => addSkill(catId, name, ['fullstack'])}
          />
        ))}
      </div>

      <form onSubmit={handleAddCat} className="mt-4 pt-4 border-t border-slate-800 flex gap-2 items-center">
        <input
          type="text"
          placeholder="New Category Name (e.g. Cloud & DevOps)..."
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
        />
        <button
          type="submit"
          className="bg-sky-600 hover:bg-sky-500 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Category</span>
        </button>
      </form>
    </div>
  );
};
