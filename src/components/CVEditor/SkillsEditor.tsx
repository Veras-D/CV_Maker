import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { Cpu, Plus, Trash2, Eye, EyeOff, Tag } from 'lucide-react';

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
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatNameCs, setNewCatNameCs] = useState('');
  const [newSkillName, setNewSkillName] = useState<{ [catId: string]: string }>({});

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatNameEn.trim()) {
      addSkillCategory(newCatNameEn.trim(), newCatNameCs.trim() || newCatNameEn.trim());
      setNewCatNameEn('');
      setNewCatNameCs('');
    }
  };

  const handleAddSkill = (catId: string) => {
    const name = newSkillName[catId];
    if (name && name.trim()) {
      addSkill(catId, name.trim(), ["fullstack"]);
      setNewSkillName({ ...newSkillName, [catId]: '' });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-400" />
          <span>Core Skills & Technologies Matrix</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skillCategories.map((cat) => (
          <div key={cat.id} className="bg-slate-850 border border-slate-750 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <input
                type="text"
                value={cat.categoryName[activeLanguage]}
                onChange={(e) => updateSkillCategory(
                  cat.id, 
                  activeLanguage === 'en' ? e.target.value : cat.categoryName.en,
                  activeLanguage === 'cs' ? e.target.value : cat.categoryName.cs
                )}
                className="bg-transparent text-sm font-bold text-sky-400 focus:outline-none focus:border-b border-sky-500"
              />
              <button
                onClick={() => deleteSkillCategory(cat.id)}
                className="text-slate-500 hover:text-red-400 p-1"
                title="Delete Skill Category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {cat.skills.map((s) => (
                <div 
                  key={s.id} 
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-all ${
                    s.enabled 
                      ? 'bg-slate-800 border-slate-700 text-slate-200' 
                      : 'bg-slate-900/50 border-slate-800 text-slate-500 line-through'
                  }`}
                >
                  <button 
                    onClick={() => toggleSkillEnabled(cat.id, s.id)}
                    className={s.enabled ? 'text-sky-400' : 'text-slate-600'}
                  >
                    {s.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                  <span>{s.name}</span>
                  <button 
                    onClick={() => deleteSkill(cat.id, s.id)}
                    className="text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Skill Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill (e.g. Terraform)..."
                value={newSkillName[cat.id] || ''}
                onChange={(e) => setNewSkillName({ ...newSkillName, [cat.id]: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(cat.id);
                  }
                }}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={() => handleAddSkill(cat.id)}
                className="bg-slate-800 hover:bg-slate-750 text-sky-400 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Category */}
      <form onSubmit={handleAddCat} className="mt-4 pt-4 border-t border-slate-800 flex gap-2 items-center">
        <input
          type="text"
          placeholder="New Category Name (EN)..."
          value={newCatNameEn}
          onChange={(e) => setNewCatNameEn(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
        />
        <input
          type="text"
          placeholder="New Category Name (CS)..."
          value={newCatNameCs}
          onChange={(e) => setNewCatNameCs(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
        />
        <button
          type="submit"
          className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Category</span>
        </button>
      </form>
    </div>
  );
};
