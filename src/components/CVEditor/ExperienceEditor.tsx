import React from 'react';
import { useCV } from '../../context/CVContext';
import { Briefcase, Plus, Trash2, Eye, EyeOff, Calendar } from 'lucide-react';
import { CustomSelect, SelectOption } from '../Common/CustomSelect';
import { WorkExperience, WorkBullet, LanguageCode } from '../../types/cv';

interface BulletRowProps {
  bullet: WorkBullet;
  activeLanguage: LanguageCode;
  onToggle: () => void;
  onUpdateText: (text: string) => void;
  onDelete: () => void;
}

const BulletItemRow: React.FC<BulletRowProps> = ({
  bullet,
  activeLanguage,
  onToggle,
  onUpdateText,
  onDelete
}) => {
  const currentText = bullet.text[activeLanguage] || bullet.text.en || '';

  return (
    <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg space-y-2">
      <div className="flex items-start gap-2">
        <button
          onClick={onToggle}
          className={bullet.enabled ? 'text-sky-400 mt-1' : 'text-slate-600 mt-1'}
        >
          {bullet.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        <textarea
          rows={2}
          placeholder="e.g. Architected and deployed microservices reducing API latency by 45%..."
          value={currentText}
          onChange={(e) => onUpdateText(e.target.value)}
          className={`flex-1 bg-slate-800 border border-slate-700 rounded p-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 resize-none ${
            !bullet.enabled ? 'line-through text-slate-500' : ''
          }`}
        />

        <button
          onClick={onDelete}
          className="text-slate-500 hover:text-red-400 p-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

interface DateSelectorsProps {
  startDate: string;
  endDate: string;
  months: SelectOption[];
  years: SelectOption[];
  currentYear: number;
  onUpdateDates: (updates: { startDate?: string; endDate?: string }) => void;
}

const DateSelectors: React.FC<DateSelectorsProps> = ({
  startDate,
  endDate,
  months,
  years,
  currentYear,
  onUpdateDates
}) => {
  const parseMonthYear = (dateStr: string) => {
    const parts = dateStr.split(' ');
    return parts.length === 2 ? { month: parts[0], year: parts[1] } : { month: 'Jan', year: currentYear.toString() };
  };

  const start = parseMonthYear(startDate);
  const isPresent = endDate.toLowerCase() === 'present';
  const end = isPresent ? { month: 'Present', year: 'Present' } : parseMonthYear(endDate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
      <div>
        <label className="block text-[10px] font-medium text-slate-400 mb-1 flex items-center gap-1">
          <Calendar className="w-3 h-3 text-sky-400" />
          <span>Start Date (Month / Year)</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <CustomSelect
            options={months}
            value={start.month}
            onChange={(val) => onUpdateDates({ startDate: `${val} ${start.year}` })}
          />
          <CustomSelect
            options={years}
            value={start.year}
            onChange={(val) => onUpdateDates({ startDate: `${start.month} ${val}` })}
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-medium text-slate-400 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-sky-400" />
            <span>End Date</span>
          </span>
          <label className="flex items-center gap-1 cursor-pointer text-[10px] text-sky-400 font-semibold">
            <input
              type="checkbox"
              checked={isPresent}
              onChange={(e) => onUpdateDates({ endDate: e.target.checked ? 'Present' : `Dec ${currentYear}` })}
              className="rounded bg-slate-800 border-slate-700"
            />
            <span>Current Position</span>
          </label>
        </label>

        {isPresent ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-semibold text-center">
            Present
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            <CustomSelect
              options={months}
              value={end.month}
              onChange={(val) => onUpdateDates({ endDate: `${val} ${end.year}` })}
            />
            <CustomSelect
              options={years}
              value={end.year}
              onChange={(val) => onUpdateDates({ endDate: `${end.month} ${val}` })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

interface ExperienceCardProps {
  exp: WorkExperience;
  index: number;
  activeLanguage: LanguageCode;
  months: SelectOption[];
  years: SelectOption[];
  currentYear: number;
  onToggleEnabled: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<WorkExperience>) => void;
  onAddBullet: (expId: string) => void;
  onUpdateBullet: (expId: string, bulletId: string, updates: Partial<WorkBullet>) => void;
  onDeleteBullet: (expId: string, bulletId: string) => void;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  exp,
  index,
  activeLanguage,
  months,
  years,
  currentYear,
  onToggleEnabled,
  onDelete,
  onUpdate,
  onAddBullet,
  onUpdateBullet,
  onDeleteBullet,
}) => {
  const currentRoleTitle = exp.roleTitle[activeLanguage] || exp.roleTitle.en || '';
  const currentSummary = exp.summary ? (exp.summary[activeLanguage] || exp.summary.en || '') : '';

  return (
    <div 
      className={`border rounded-xl p-4 transition-all space-y-3 ${
        exp.enabled ? 'bg-slate-850 border-slate-750' : 'bg-slate-900/40 border-slate-800 opacity-60'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleEnabled(exp.id)}
            className={exp.enabled ? 'text-sky-400' : 'text-slate-600'}
            title={exp.enabled ? 'Enabled in CV' : 'Disabled'}
          >
            {exp.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <span className="text-xs font-mono font-bold text-slate-400">#{index + 1}</span>
          <span className="text-xs font-bold text-slate-200">{exp.company}</span>
        </div>

        <button
          onClick={() => onDelete(exp.id)}
          className="text-slate-500 hover:text-red-400 p-1"
          title="Delete Position"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Company Name</label>
          <input
            type="text"
            placeholder="e.g. Stripe / Google"
            value={exp.company}
            onChange={(e) => onUpdate(exp.id, { company: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Role Title ({activeLanguage.toUpperCase()})
          </label>
          <input
            type="text"
            placeholder="e.g. Senior Full-Stack Engineer"
            value={currentRoleTitle}
            onChange={(e) => onUpdate(exp.id, {
              roleTitle: { ...exp.roleTitle, [activeLanguage]: e.target.value }
            })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Location / Remote</label>
          <input
            type="text"
            placeholder="e.g. San Francisco, CA (Hybrid)"
            value={exp.location || ''}
            onChange={(e) => onUpdate(exp.id, { location: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Structured Date Selectors */}
      <DateSelectors
        startDate={exp.startDate}
        endDate={exp.endDate}
        months={months}
        years={years}
        currentYear={currentYear}
        onUpdateDates={(updates) => onUpdate(exp.id, updates)}
      />

      {/* Summary */}
      <div>
        <label className="block text-[11px] font-medium text-slate-400 mb-1">
          Position Executive Summary ({activeLanguage.toUpperCase()})
        </label>
        <textarea
          rows={2}
          placeholder="e.g. Spearheaded core platform infrastructure, delivering scalable microservices and leading sprint planning..."
          value={currentSummary}
          onChange={(e) => onUpdate(exp.id, {
            summary: { ...exp.summary, [activeLanguage]: e.target.value }
          })}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 resize-none font-sans"
        />
      </div>

      {/* Bullet Points */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">Key Achievements</span>
          <button
            onClick={() => onAddBullet(exp.id)}
            className="text-sky-400 hover:text-sky-300 text-xs font-semibold flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Add Bullet</span>
          </button>
        </div>

        <div className="space-y-2">
          {exp.bullets.map((b) => (
            <BulletItemRow
              key={b.id}
              bullet={b}
              activeLanguage={activeLanguage}
              onToggle={() => onUpdateBullet(exp.id, b.id, { enabled: !b.enabled })}
              onUpdateText={(text) => onUpdateBullet(exp.id, b.id, { text: { ...b.text, [activeLanguage]: text } })}
              onDelete={() => onDeleteBullet(exp.id, b.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const ExperienceEditor: React.FC = () => {
  const { 
    cvData, 
    addExperience, 
    updateExperience, 
    deleteExperience, 
    toggleExperienceEnabled,
    addBullet, 
    updateBullet, 
    deleteBullet,
    activeLanguage 
  } = useCV();
  
  const { experiences } = cvData;

  const months: SelectOption[] = [
    { value: 'Jan', label: 'Jan' },
    { value: 'Feb', label: 'Feb' },
    { value: 'Mar', label: 'Mar' },
    { value: 'Apr', label: 'Apr' },
    { value: 'May', label: 'May' },
    { value: 'Jun', label: 'Jun' },
    { value: 'Jul', label: 'Jul' },
    { value: 'Aug', label: 'Aug' },
    { value: 'Sep', label: 'Sep' },
    { value: 'Oct', label: 'Oct' },
    { value: 'Nov', label: 'Nov' },
    { value: 'Dec', label: 'Dec' },
  ];

  const currentYear = new Date().getFullYear();
  const years: SelectOption[] = Array.from({ length: 25 }, (_, i) => {
    const yr = (currentYear - i).toString();
    return { value: yr, label: yr };
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-sky-400" />
          <span>Work Experience & Achievements</span>
        </h3>
        <button
          onClick={addExperience}
          className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Position</span>
        </button>
      </div>

      <div className="space-y-4">
        {experiences.map((exp, index) => (
          <ExperienceCard
            key={exp.id}
            exp={exp}
            index={index}
            activeLanguage={activeLanguage}
            months={months}
            years={years}
            currentYear={currentYear}
            onToggleEnabled={toggleExperienceEnabled}
            onDelete={deleteExperience}
            onUpdate={updateExperience}
            onAddBullet={addBullet}
            onUpdateBullet={updateBullet}
            onDeleteBullet={deleteBullet}
          />
        ))}
      </div>
    </div>
  );
};
