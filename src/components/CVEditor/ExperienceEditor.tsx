import React from 'react';
import { useCV } from '../../context/CVContext';
import { Briefcase, Plus } from 'lucide-react';
import { SelectOption } from '../Common/CustomSelect';
import { LanguageCode } from '../../types/cv';
import { ExperienceItemCard } from './ExperienceItemCard';

const MONTH_OPTIONS: SelectOption[] = [
  { value: 'Jan', label: 'January' },
  { value: 'Feb', label: 'February' },
  { value: 'Mar', label: 'March' },
  { value: 'Apr', label: 'April' },
  { value: 'May', label: 'May' },
  { value: 'Jun', label: 'June' },
  { value: 'Jul', label: 'July' },
  { value: 'Aug', label: 'August' },
  { value: 'Sep', label: 'September' },
  { value: 'Oct', label: 'October' },
  { value: 'Nov', label: 'November' },
  { value: 'Dec', label: 'December' }
];

export const ExperienceEditor: React.FC = () => {
  const { 
    cvData, 
    activeLanguage, 
    addExperience, 
    updateExperience, 
    deleteExperience, 
    toggleExperienceEnabled,
    addBullet,
    updateBullet,
    deleteBullet
  } = useCV();

  const { experiences } = cvData;
  const currentYear = new Date().getFullYear();
  const yearOptions: SelectOption[] = Array.from({ length: 30 }, (_, i) => {
    const y = (currentYear - i).toString();
    return { value: y, label: y };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-sky-400" />
            <span>Work Experience & Roles</span>
          </h3>
          <p className="text-xs text-slate-400">Manage employment history, key responsibilities, and achievements</p>
        </div>

        <button
          type="button"
          onClick={addExperience}
          className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Position</span>
        </button>
      </div>

      <div className="space-y-3">
        {experiences.map((exp, idx) => (
          <ExperienceItemCard
            key={exp.id}
            exp={exp}
            index={idx}
            activeLanguage={activeLanguage as LanguageCode}
            months={MONTH_OPTIONS}
            years={yearOptions}
            currentYear={currentYear}
            onToggleEnabled={toggleExperienceEnabled}
            onDelete={deleteExperience}
            onUpdate={updateExperience}
            onAddBullet={addBullet}
            onUpdateBullet={updateBullet}
            onDeleteBullet={deleteBullet}
          />
        ))}

        {experiences.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 border-dashed rounded-xl p-8 text-center space-y-2">
            <p className="text-xs text-slate-400 font-medium">No experience entries recorded yet.</p>
            <button
              type="button"
              onClick={addExperience}
              className="text-xs text-sky-400 hover:underline font-semibold cursor-pointer"
            >
              Add your first work experience
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
