import React from 'react';
import { LanguageItem, LanguageCode } from '../../types/cv';
import { Globe, Plus, Trash2 } from 'lucide-react';
import { CustomSelect, SelectOption } from '../Common/CustomSelect';

const PROFICIENCY_LEVELS: SelectOption[] = [
  { value: 'Native / Bilingual', label: 'Native / Bilingual' },
  { value: 'C2 - Full Professional', label: 'C2 - Full Professional' },
  { value: 'C1 - Advanced Professional', label: 'C1 - Advanced Professional' },
  { value: 'B2 - Upper Intermediate', label: 'B2 - Upper Intermediate' },
  { value: 'B1 - Intermediate', label: 'B1 - Intermediate' },
  { value: 'A2 - Elementary', label: 'A2 - Elementary' },
  { value: 'A1 - Beginner', label: 'A1 - Beginner' }
];

export interface LanguagesSectionProps {
  languages: LanguageItem[];
  activeLanguage: LanguageCode;
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<LanguageItem>) => void;
  onDelete: (id: string) => void;
}

export const LanguagesSection: React.FC<LanguagesSectionProps> = ({
  languages,
  activeLanguage,
  onAdd,
  onUpdate,
  onDelete
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-400" />
          <span>Languages</span>
        </h3>
        <button
          type="button"
          onClick={onAdd}
          className="text-sky-400 hover:text-sky-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Language</span>
        </button>
      </div>

      <div className="space-y-3">
        {languages.map((lang) => (
          <div key={lang.id} className="bg-slate-850 border border-slate-750 p-3 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <input
                type="text"
                placeholder="e.g. English, French, Czech"
                value={lang.language[activeLanguage] || lang.language.en || ''}
                onChange={(e) => onUpdate(lang.id, {
                  language: { ...lang.language, [activeLanguage]: e.target.value }
                })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
              <button type="button" onClick={() => onDelete(lang.id)} className="text-slate-500 hover:text-red-400 p-1 ml-2 cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5 font-medium">Proficiency Level</label>
              <CustomSelect
                className="w-full"
                options={PROFICIENCY_LEVELS}
                value={lang.proficiency[activeLanguage] || lang.proficiency.en || 'B2 - Upper Intermediate'}
                onChange={(val) => onUpdate(lang.id, {
                  proficiency: { ...lang.proficiency, [activeLanguage]: val }
                })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
