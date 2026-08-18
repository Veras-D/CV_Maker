import React from 'react';
import { CVData, LanguageCode, RolePreset } from '../../types/cv';
import { openExternalUrl } from '../../utils/urlHelper';

interface TemplateProps {
  data: CVData;
  language: LanguageCode;
  selectedTags: string[];
  preset: RolePreset;
}

export const ClassicTemplate: React.FC<TemplateProps> = ({ data, language, selectedTags, preset }) => {
  const { profile, experiences, skillCategories, projects, education, languages } = data;

  const filteredExperiences = experiences
    .filter(e => e.enabled)
    .map(e => {
      const activeBullets = e.bullets.filter(b => 
        b.enabled && (selectedTags.length === 0 || b.tags.some(t => selectedTags.includes(t)))
      );
      return { ...e, activeBullets };
    })
    .filter(e => e.activeBullets.length > 0 || selectedTags.length === 0);

  const activeProjects = projects.filter(p => p.enabled);

  return (
    <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-6 sm:p-8 font-serif shadow-2xl mx-auto box-border text-[10.5px] leading-relaxed overflow-hidden">
      
      {/* Header */}
      <header className="text-center border-b-2 border-slate-900 pb-3 mb-4">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-900">
          {profile.name}
        </h1>
        <p className="text-xs italic text-slate-700 font-sans mt-0.5">
          {profile.headline[language]}
        </p>

        <div className="text-[9.5px] text-slate-600 font-sans mt-1.5 flex flex-wrap justify-center gap-2.5">
          <span>{profile.email}</span>
          <span>•</span>
          <span>{profile.phone}</span>
          <span>•</span>
          <span>{profile.location}</span>
          {profile.portfolioUrl && (
            <>
              <span>•</span>
              <a 
                href={profile.portfolioUrl}
                onClick={(e) => { e.preventDefault(); openExternalUrl(profile.portfolioUrl!); }} 
                className="text-sky-700 hover:underline cursor-pointer"
              >
                {profile.portfolioUrl}
              </a>
            </>
          )}
        </div>
      </header>

      {/* Executive Summary */}
      <section className="mb-4 font-sans">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 mb-1.5 pb-0.5">
          {language === 'en' ? 'Executive Profile' : 'Profil'}
        </h2>
        <p className="text-slate-800 text-[10px] leading-normal">
          {profile.summary[language]}
        </p>
      </section>

      {/* Experience */}
      <section className="mb-4 font-sans">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 mb-2 pb-0.5">
          {language === 'en' ? 'Professional Experience' : 'Pracovní Zkušenosti'}
        </h2>

        <div className="space-y-3">
          {filteredExperiences.map(exp => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline font-bold">
                <span className="text-slate-900 text-[11px]">{exp.roleTitle[language]}</span>
                <span className="text-[9.5px] text-slate-600 font-normal">{exp.startDate} – {exp.endDate}</span>
              </div>
              <div className="text-[10px] font-semibold text-slate-700 mb-1">
                {exp.company} | {exp.location}
              </div>

              <div className="space-y-0.5 text-slate-800 text-[10px] pl-1 leading-normal">
                {exp.activeBullets.map(b => (
                  <div key={b.id} className="flex items-start">
                    <span className="mr-1.5 text-slate-800 font-bold shrink-0">•</span>
                    <span>{b.text[language]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Projects */}
      {activeProjects.length > 0 && (
        <section className="mb-4 font-sans">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 mb-2 pb-0.5">
            {language === 'en' ? 'Featured Portfolio Projects' : 'Projekty'}
          </h2>

          <div className="space-y-3">
            {activeProjects.map(p => (
              <div key={p.id}>
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span className="text-[10.5px]">{p.title}</span>
                  {p.url && (
                    <a
                      href={p.url}
                      onClick={(e) => { e.preventDefault(); openExternalUrl(p.url!); }}
                      className="text-[9px] text-sky-700 font-mono hover:underline cursor-pointer"
                    >
                      {p.url} ↗
                    </a>
                  )}
                </div>
                <p className="text-[9.5px] text-slate-700 mt-0.5 mb-1.5 leading-normal">{p.description[language] || p.description.en}</p>
                {p.techStack && p.techStack.length > 0 && (
                  <div className="pt-0.5">
                    {p.techStack.map((tech, idx) => (
                      <span key={idx} className="inline-block text-[8.5px] px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 mr-1 mb-1 leading-tight">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      <section className="mb-4 font-sans">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 mb-1.5 pb-0.5">
          {language === 'en' ? 'Technical Competencies' : 'Technické Kompetence'}
        </h2>
        <div className="space-y-1 text-[10px]">
          {skillCategories.map(cat => (
            <div key={cat.id} className="flex">
              <span className="font-bold text-slate-900 w-40 shrink-0">
                {cat.categoryName[language]}:
              </span>
              <span className="text-slate-800">
                {cat.skills.filter(s => s.enabled).map(s => s.name).join(', ')}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Education & Languages */}
      <section className="grid grid-cols-2 gap-5 font-sans">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 mb-1.5 pb-0.5">
            {language === 'en' ? 'Education' : 'Vzdělání'}
          </h2>
          {education.filter(e => e.enabled).map(edu => (
            <div key={edu.id} className="text-[10px] mb-1">
              <span className="font-bold block">{edu.institution}</span>
              <span className="text-slate-700 block">{edu.program[language]}</span>
              <span className="text-slate-500 text-[9.5px] block">{edu.dates}</span>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 mb-1.5 pb-0.5">
            {language === 'en' ? 'Languages' : 'Jazyky'}
          </h2>
          {languages.filter(l => l.enabled).map(lang => (
            <div key={lang.id} className="flex justify-between text-[10px]">
              <span className="font-bold text-slate-900">{lang.language[language]}</span>
              <span className="text-slate-700">{lang.proficiency[language]}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
