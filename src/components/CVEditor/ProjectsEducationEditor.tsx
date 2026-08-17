import React from 'react';
import { useCV } from '../../context/CVContext';
import { FolderGit2, GraduationCap, Globe, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { CustomSelect, SelectOption } from '../Common/CustomSelect';

export const ProjectsEducationEditor: React.FC = () => {
  const { 
    cvData, 
    activeLanguage, 
    addProject, 
    updateProject, 
    deleteProject, 
    toggleProjectEnabled,
    addEducation,
    updateEducation,
    deleteEducation,
    toggleEducationEnabled,
    addLanguage,
    updateLanguage,
    deleteLanguage
  } = useCV();

  const { projects, education, languages } = cvData;

  const currentYear = new Date().getFullYear();
  const yearOptions: SelectOption[] = Array.from({ length: 30 }, (_, i) => {
    const yr = (currentYear - i).toString();
    return { value: yr, label: yr };
  });

  const proficiencyLevels: SelectOption[] = [
    { value: 'Native / Bilingual', label: 'Native / Bilingual' },
    { value: 'C2 - Full Professional', label: 'C2 - Full Professional' },
    { value: 'C1 - Advanced Professional', label: 'C1 - Advanced Professional' },
    { value: 'B2 - Upper Intermediate', label: 'B2 - Upper Intermediate' },
    { value: 'B1 - Intermediate', label: 'B1 - Intermediate' },
    { value: 'A2 - Elementary', label: 'A2 - Elementary' },
    { value: 'A1 - Beginner', label: 'A1 - Beginner' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Projects Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-sky-400" />
            <span>Featured Portfolio Projects</span>
          </h3>
          <button
            onClick={addProject}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 rounded text-xs font-semibold shadow-sm transition-all"
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
                    onClick={() => toggleProjectEnabled(p.id)}
                    className={p.enabled ? 'text-sky-400 shrink-0' : 'text-slate-600 shrink-0'}
                  >
                    {p.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <input
                    type="text"
                    placeholder="Project Title..."
                    value={p.title}
                    onChange={(e) => updateProject(p.id, { title: e.target.value })}
                    className="flex-1 min-w-0 bg-transparent font-bold text-xs text-slate-100 focus:outline-none focus:border-b border-sky-500"
                  />
                </div>
                <button onClick={() => deleteProject(p.id)} className="text-slate-500 hover:text-red-400 p-1 shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Project URL..."
                  value={p.url || ''}
                  onChange={(e) => updateProject(p.id, { url: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                />

                <textarea
                  rows={2}
                  placeholder={`Description (${activeLanguage.toUpperCase()})...`}
                  value={p.description[activeLanguage] || p.description.en || ''}
                  onChange={(e) => updateProject(p.id, {
                    description: { ...p.description, [activeLanguage]: e.target.value }
                  })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500 resize-none font-sans"
                />

                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-1">Tech Stack (comma separated)</label>
                  <input
                    type="text"
                    value={p.techStack.join(', ')}
                    onChange={(e) => updateProject(p.id, {
                      techStack: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education & Languages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Education */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-sky-400" />
              <span>Education & Certifications</span>
            </h3>
            <button
              onClick={addEducation}
              className="text-sky-400 hover:text-sky-300 text-xs font-semibold flex items-center gap-1"
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
                      <button onClick={() => toggleEducationEnabled(edu.id)} className={edu.enabled ? 'text-sky-400 shrink-0' : 'text-slate-600 shrink-0'}>
                        {edu.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <input
                        type="text"
                        placeholder="Institution / Academy"
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                        className="flex-1 min-w-0 bg-transparent text-xs font-bold text-slate-100 focus:outline-none focus:border-b border-sky-500"
                      />
                    </div>
                    <button onClick={() => deleteEducation(edu.id)} className="text-slate-500 hover:text-red-400 p-1 shrink-0">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Degree / Program Title"
                      value={edu.program[activeLanguage] || edu.program.en || ''}
                      onChange={(e) => updateEducation(edu.id, {
                        program: { ...edu.program, [activeLanguage]: e.target.value }
                      })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>

                  {/* Year Range Pickers */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5 font-medium">Start Year</label>
                      <CustomSelect
                        options={yearOptions}
                        value={startYr}
                        onChange={(val) => updateEducation(edu.id, { dates: `${val} – ${endYr}` })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5 font-medium">End Year</label>
                      <CustomSelect
                        options={[{ value: 'Present', label: 'Present' }, ...yearOptions]}
                        value={endYr}
                        onChange={(val) => updateEducation(edu.id, { dates: `${startYr} – ${val}` })}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Languages */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Languages</span>
            </h3>
            <button
              onClick={addLanguage}
              className="text-sky-400 hover:text-sky-300 text-xs font-semibold flex items-center gap-1"
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
                    placeholder="Language Name (e.g. English, Czech)"
                    value={lang.language[activeLanguage] || lang.language.en || ''}
                    onChange={(e) => updateLanguage(lang.id, {
                      language: { ...lang.language, [activeLanguage]: e.target.value }
                    })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 focus:outline-none"
                  />
                  <button onClick={() => deleteLanguage(lang.id)} className="text-slate-500 hover:text-red-400 p-1 ml-2">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5 font-medium">Proficiency Level</label>
                  <CustomSelect
                    className="w-full"
                    options={proficiencyLevels}
                    value={lang.proficiency[activeLanguage] || lang.proficiency.en || 'B2 - Upper Intermediate'}
                    onChange={(val) => updateLanguage(lang.id, {
                      proficiency: { ...lang.proficiency, [activeLanguage]: val }
                    })}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
