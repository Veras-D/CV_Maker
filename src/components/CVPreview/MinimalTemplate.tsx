import React from 'react';
import { CVData, LanguageCode, RolePreset } from '../../types/cv';

interface TemplateProps {
  data: CVData;
  language: LanguageCode;
  selectedTags: string[];
  preset: RolePreset;
}

export const MinimalTemplate: React.FC<TemplateProps> = ({ data, language, selectedTags, preset }) => {
  const { profile, experiences, skillCategories, projects, education, languages } = data;
  const accentColor = '#0d9488';

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
    <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-6 sm:p-10 font-mono shadow-2xl mx-auto box-border text-[10.5px] leading-relaxed overflow-hidden">
      
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-black tracking-tighter uppercase" style={{ color: accentColor }}>
          {profile.name}
        </h1>
        <p className="text-xs font-bold text-slate-700 tracking-wider uppercase mt-1">
          // {profile.headline[language]}
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9.5px] text-slate-600 mt-3 font-mono border-y py-2 border-slate-200">
          <span>EMAIL: {profile.email}</span>
          <span>TEL: {profile.phone}</span>
          <span>LOC: {profile.location}</span>
          <span>WEB: {profile.portfolioUrl}</span>
          <span>GH: github.com/Veras-D</span>
        </div>
      </header>

      {/* Summary */}
      <section className="mb-6">
        <p className="text-slate-700 font-sans leading-normal">
          {profile.summary[language]}
        </p>
      </section>

      {/* Experience */}
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 pb-1 mb-3" style={{ borderColor: accentColor }}>
          [01] EXPERIENCE
        </h2>

        <div className="space-y-4">
          {filteredExperiences.map(exp => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline font-bold">
                <span className="text-slate-900 text-[11px]">{exp.roleTitle[language]} @ {exp.company}</span>
                <span className="text-[9.5px] text-slate-500">{exp.startDate} - {exp.endDate}</span>
              </div>
              <ul className="list-square list-inside space-y-1 text-slate-700 font-sans mt-1.5">
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

      {/* Skills Matrix */}
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 pb-1 mb-3" style={{ borderColor: accentColor }}>
          [02] TECHNICAL SKILLS
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {skillCategories.map(cat => (
            <div key={cat.id}>
              <span className="font-bold text-slate-900 text-[10px] block mb-1">
                &gt; {cat.categoryName[language]}
              </span>
              <p className="text-slate-700 font-sans text-[10px]">
                {cat.skills.filter(s => s.enabled).map(s => s.name).join(' • ')}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Education & Languages */}
      <section className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 pb-1 mb-2" style={{ borderColor: accentColor }}>
            [03] EDUCATION
          </h2>
          {education.filter(e => e.enabled).map(edu => (
            <div key={edu.id} className="text-[10px] mb-2">
              <span className="font-bold block">{edu.institution}</span>
              <span className="text-slate-600 block">{edu.program[language]} ({edu.dates})</span>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 pb-1 mb-2" style={{ borderColor: accentColor }}>
            [04] LANGUAGES
          </h2>
          {languages.filter(l => l.enabled).map(lang => (
            <div key={lang.id} className="text-[10px] flex justify-between">
              <span>{lang.language[language]}</span>
              <span className="text-slate-500">{lang.proficiency[language]}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
