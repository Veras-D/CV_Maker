import React from 'react';
import { CVData, LanguageCode, RolePreset } from '../../types/cv';

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

  return (
    <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-6 sm:p-10 font-serif shadow-2xl mx-auto box-border text-[11px] leading-relaxed overflow-hidden">
      
      {/* Header */}
      <header className="text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-slate-900">
          {profile.name}
        </h1>
        <p className="text-xs italic text-slate-700 font-sans mt-1">
          {profile.headline[language]}
        </p>

        <div className="text-[10px] text-slate-600 font-sans mt-2 flex flex-wrap justify-center gap-3">
          <span>{profile.email}</span>
          <span>•</span>
          <span>{profile.phone}</span>
          <span>•</span>
          <span>{profile.location}</span>
          <span>•</span>
          <span>{profile.portfolioUrl}</span>
        </div>
      </header>

      {/* Summary */}
      <section className="mb-6 font-sans">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 mb-2 pb-0.5">
          {language === 'en' ? 'Executive Profile' : 'Profil'}
        </h2>
        <p className="text-slate-800 text-[10.5px]">
          {profile.summary[language]}
        </p>
      </section>

      {/* Experience */}
      <section className="mb-6 font-sans">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 mb-3 pb-0.5">
          {language === 'en' ? 'Professional Experience' : 'Pracovní Zkušenosti'}
        </h2>

        <div className="space-y-4">
          {filteredExperiences.map(exp => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline font-bold">
                <span className="text-slate-900 text-[11.5px]">{exp.roleTitle[language]}</span>
                <span className="text-[10px] text-slate-600">{exp.startDate} – {exp.endDate}</span>
              </div>
              <div className="text-[10.5px] font-semibold text-slate-700 mb-1">
                {exp.company} | {exp.location}
              </div>

              <ul className="list-disc list-outside ml-4 space-y-1 text-slate-800 text-[10.5px]">
                {exp.activeBullets.map(b => (
                  <li key={b.id}>
                    {b.text[language]}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mb-6 font-sans">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 mb-2 pb-0.5">
          {language === 'en' ? 'Technical Competencies' : 'Technické Kompetence'}
        </h2>
        <div className="space-y-1 text-[10.5px]">
          {skillCategories.map(cat => (
            <div key={cat.id} className="flex">
              <span className="font-bold text-slate-900 w-44 shrink-0">
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
      <section className="grid grid-cols-2 gap-6 font-sans">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 mb-2 pb-0.5">
            {language === 'en' ? 'Education' : 'Vzdělání'}
          </h2>
          {education.filter(e => e.enabled).map(edu => (
            <div key={edu.id} className="text-[10.5px]">
              <span className="font-bold block">{edu.institution}</span>
              <span className="text-slate-700 block">{edu.program[language]}</span>
              <span className="text-slate-500 text-[10px] block">{edu.dates}</span>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 mb-2 pb-0.5">
            {language === 'en' ? 'Languages' : 'Jazyky'}
          </h2>
          {languages.filter(l => l.enabled).map(lang => (
            <div key={lang.id} className="flex justify-between text-[10.5px]">
              <span className="font-bold text-slate-900">{lang.language[language]}</span>
              <span className="text-slate-700">{lang.proficiency[language]}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
