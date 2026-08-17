import React from 'react';
import { useCV } from '../../context/CVContext';
import { FolderGit2, GraduationCap, Globe, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      
      {/* Projects Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-sky-400" />
            <span>Featured Portfolio Projects</span>
          </h3>
          <button
            onClick={addProject}
            className="flex items-center gap-1.5 bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold"
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
                p.enabled ? 'bg-slate-850 border-slate-700' : 'bg-slate-900/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleProjectEnabled(p.id)}
                    className={p.enabled ? 'text-sky-400' : 'text-slate-600'}
                  >
                    {p.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <input
                    type="text"
                    value={p.title}
                    onChange={(e) => updateProject(p.id, { title: e.target.value })}
                    className="bg-transparent font-bold text-sm text-slate-100 focus:outline-none focus:border-b border-sky-500"
                  />
                </div>
                <button onClick={() => deleteProject(p.id)} className="text-slate-500 hover:text-red-400 p-1">
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
                  value={p.description[activeLanguage]}
                  onChange={(e) => updateProject(p.id, {
                    description: { ...p.description, [activeLanguage]: e.target.value }
                  })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500 resize-none"
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-sky-400" />
              <span>Education & Certifications</span>
            </h3>
            <button
              onClick={addEducation}
              className="text-sky-400 hover:text-sky-300 text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="bg-slate-850 border border-slate-750 p-3 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleEducationEnabled(edu.id)} className={edu.enabled ? 'text-sky-400' : 'text-slate-600'}>
                      {edu.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                      className="bg-transparent text-xs font-bold text-slate-100 focus:outline-none focus:border-b border-sky-500"
                    />
                  </div>
                  <button onClick={() => deleteEducation(edu.id)} className="text-slate-500 hover:text-red-400 p-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={edu.program[activeLanguage]}
                    onChange={(e) => updateEducation(edu.id, {
                      program: { ...edu.program, [activeLanguage]: e.target.value }
                    })}
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={edu.dates}
                    onChange={(e) => updateEducation(edu.id, { dates: e.target.value })}
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Languages</span>
            </h3>
            <button
              onClick={addLanguage}
              className="text-sky-400 hover:text-sky-300 text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-3">
            {languages.map((lang) => (
              <div key={lang.id} className="bg-slate-850 border border-slate-750 p-3 rounded-xl flex items-center gap-2">
                <input
                  type="text"
                  value={lang.language[activeLanguage]}
                  onChange={(e) => updateLanguage(lang.id, {
                    language: { ...lang.language, [activeLanguage]: e.target.value }
                  })}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 focus:outline-none"
                />
                <input
                  type="text"
                  value={lang.proficiency[activeLanguage]}
                  onChange={(e) => updateLanguage(lang.id, {
                    proficiency: { ...lang.proficiency, [activeLanguage]: e.target.value }
                  })}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
                />
                <button onClick={() => deleteLanguage(lang.id)} className="text-slate-500 hover:text-red-400 p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
