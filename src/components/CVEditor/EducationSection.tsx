import React from 'react';
import { EducationItem, LanguageCode } from '../../types/cv';
import { GraduationCap, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { CustomSelect, SelectOption } from '../Common/CustomSelect';

export interface EducationSectionProps {
  education: EducationItem[];
  activeLanguage: LanguageCode;
  yearOptions: SelectOption[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<EducationItem>) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  education,
  activeLanguage,
  yearOptions,
  onAdd,
  onUpdate,
  onDelete,
  onToggleEnabled
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-sky-400" />
          <span>Education & Certifications</span>
        </h3>
        <button
          type="button"
          onClick={onAdd}
          className="text-sky-400 hover:text-sky-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Degree</span>
        </button>
      </div>

      <div className="space-y-3">
        {education.map((edu) => {
          const dateParts = edu.dates.split('–').map(s => s.trim());
          const startYr = dateParts[0] || '2023';
          const endYr = dateParts[1] || '2024';

          return (
            <div key={edu.id} className="bg-slate-850 border border-slate-750 p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <button 
                    type="button"
                    onClick={() => onToggleEnabled(edu.id)} 
                    className={`shrink-0 cursor-pointer ${edu.enabled ? 'text-sky-400' : 'text-slate-600'}`}
                  >
                    {edu.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <input
                    type="text"
                    placeholder="e.g. Stanford University / MIT"
                    value={edu.institution}
                    onChange={(e) => onUpdate(edu.id, { institution: e.target.value })}
                    className="flex-1 min-w-0 bg-transparent text-xs font-bold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-b border-sky-500"
                  />
                </div>
                <button type="button" onClick={() => onDelete(edu.id)} className="text-slate-500 hover:text-red-400 p-1 shrink-0 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="e.g. B.S. in Computer Science & Engineering"
                  value={edu.program[activeLanguage] || edu.program.en || ''}
                  onChange={(e) => onUpdate(edu.id, {
                    program: { ...edu.program, [activeLanguage]: e.target.value }
                  })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5 font-medium">Start Year</label>
                  <CustomSelect
                    options={yearOptions}
                    value={startYr}
                    onChange={(val) => onUpdate(edu.id, { dates: `${val} – ${endYr}` })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5 font-medium">End Year</label>
                  <CustomSelect
                    options={[{ value: 'Present', label: 'Present' }, ...yearOptions]}
                    value={endYr}
                    onChange={(val) => onUpdate(edu.id, { dates: `${startYr} – ${val}` })}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
