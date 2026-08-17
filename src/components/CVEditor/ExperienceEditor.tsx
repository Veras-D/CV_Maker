import React from 'react';
import { useCV } from '../../context/CVContext';
import { Briefcase, Plus, Trash2, Eye, EyeOff, Tag, MoveUp, MoveDown } from 'lucide-react';

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

  const tagOptions = ['fullstack', 'devops', 'backend', 'frontend', 'management'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-sky-400" />
          <span>Work Experience & Roles</span>
        </h3>
        <button
          onClick={addExperience}
          className="flex items-center gap-1.5 bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Position</span>
        </button>
      </div>

      <div className="space-y-6">
        {experiences.map((exp, index) => (
          <div 
            key={exp.id}
            className={`border rounded-xl p-4 transition-all ${
              exp.enabled 
                ? 'bg-slate-850 border-slate-700/80 shadow-md' 
                : 'bg-slate-900/40 border-slate-800 opacity-60'
            }`}
          >
            {/* Header / Controls */}
            <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-750">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleExperienceEnabled(exp.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    exp.enabled ? 'text-sky-400 hover:bg-sky-950' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title={exp.enabled ? "Disable this role in CV export" : "Enable this role in CV export"}
                >
                  {exp.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <span className="text-xs font-mono font-bold text-slate-400">#{index + 1}</span>
                <span className="text-sm font-bold text-slate-200">
                  {exp.company} - {exp.roleTitle[activeLanguage]}
                </span>
              </div>
              <button
                onClick={() => deleteExperience(exp.id)}
                className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg transition-colors"
                title="Delete Experience"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Company</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Role Title ({activeLanguage.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={exp.roleTitle[activeLanguage]}
                  onChange={(e) => updateExperience(exp.id, {
                    roleTitle: { ...exp.roleTitle, [activeLanguage]: e.target.value }
                  })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Location / Remote</label>
                <input
                  type="text"
                  value={exp.location || ''}
                  onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Start Date</label>
                <input
                  type="text"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">End Date</label>
                <input
                  type="text"
                  value={exp.endDate}
                  onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Role Tags</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {tagOptions.map(t => {
                    const hasTag = exp.tags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          const newTags = hasTag 
                            ? exp.tags.filter(x => x !== t) 
                            : [...exp.tags, t];
                          updateExperience(exp.id, { tags: newTags });
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                          hasTag 
                            ? 'bg-sky-600 text-white border-sky-500' 
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-3">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Company / Context Summary ({activeLanguage.toUpperCase()})
              </label>
              <input
                type="text"
                value={exp.summary ? exp.summary[activeLanguage] : ''}
                onChange={(e) => updateExperience(exp.id, {
                  summary: { 
                    en: exp.summary?.en || '', 
                    cs: exp.summary?.cs || '', 
                    [activeLanguage]: e.target.value 
                  }
                })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Bullets Sub-section */}
            <div className="mt-4 pt-3 border-t border-slate-750">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">
                  Achievement Bullets ({exp.bullets.length})
                </span>
                <button
                  type="button"
                  onClick={() => addBullet(exp.id)}
                  className="text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Bullet Point</span>
                </button>
              </div>

              <div className="space-y-2">
                {exp.bullets.map((b) => (
                  <div key={b.id} className="flex items-start gap-2 bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => updateBullet(exp.id, b.id, { enabled: !b.enabled })}
                      className={`mt-1 p-1 rounded transition-colors ${
                        b.enabled ? 'text-sky-400' : 'text-slate-600'
                      }`}
                      title={b.enabled ? "Disable bullet" : "Enable bullet"}
                    >
                      {b.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex-1">
                      <input
                        type="text"
                        value={b.text[activeLanguage]}
                        onChange={(e) => updateBullet(exp.id, b.id, {
                          text: { ...b.text, [activeLanguage]: e.target.value }
                        })}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                      <div className="flex items-center gap-1 mt-1">
                        <Tag className="w-3 h-3 text-slate-500" />
                        {tagOptions.map(t => {
                          const isTagged = b.tags.includes(t);
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                const newTags = isTagged 
                                  ? b.tags.filter(x => x !== t) 
                                  : [...b.tags, t];
                                updateBullet(exp.id, b.id, { tags: newTags });
                              }}
                              className={`text-[9px] px-1.5 py-0.2 rounded ${
                                isTagged ? 'bg-sky-500/30 text-sky-300 font-semibold' : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteBullet(exp.id, b.id)}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
