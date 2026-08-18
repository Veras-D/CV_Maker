import React from 'react';
import { CVData, LanguageCode, RolePreset } from '../../types/cv';
import { Mail, Phone, MapPin, Globe, Github, Linkedin } from 'lucide-react';
import { openExternalUrl } from '../../utils/urlHelper';

interface TemplateProps {
  data: CVData;
  language: LanguageCode;
  selectedTags: string[];
  preset: RolePreset;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ data, language, selectedTags, preset }) => {
  const { profile, experiences, skillCategories, projects, education, languages } = data;
  const accentColor = '#0284c7';

  // Filter experiences & bullets by enabled
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
    <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-800 p-6 sm:p-8 font-sans shadow-2xl mx-auto box-border text-[11px] leading-relaxed overflow-hidden">
      
      {/* Header */}
      <header className="border-b-2 pb-5 mb-5 flex justify-between items-start" style={{ borderColor: accentColor }}>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 uppercase">
            {profile.name}
          </h1>
          <p className="text-sm font-semibold mt-0.5 tracking-wide" style={{ color: accentColor }}>
            {profile.headline[language]}
          </p>
          <p className="text-[10.5px] text-slate-600 max-w-xl mt-2 leading-normal">
            {profile.summary[language]}
          </p>
        </div>

        {/* Contact info list */}
        <div className="text-right text-[10px] space-y-1 shrink-0 text-slate-600 font-medium">
          <div className="flex items-center justify-end gap-1.5">
            <span>{profile.email}</span>
            <Mail className="w-3 h-3 text-slate-400" />
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <span>{profile.phone}</span>
            <Phone className="w-3 h-3 text-slate-400" />
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <span>{profile.location}</span>
            <MapPin className="w-3 h-3 text-slate-400" />
          </div>
          {profile.githubUrl && (
            <div className="flex items-center justify-end gap-1.5 text-sky-700">
              <a href={profile.githubUrl} onClick={(e) => { e.preventDefault(); openExternalUrl(profile.githubUrl!); }} className="hover:underline cursor-pointer">
                github.com/Veras-D
              </a>
              <Github className="w-3 h-3 text-slate-400" />
            </div>
          )}
          {profile.linkedinUrl && (
            <div className="flex items-center justify-end gap-1.5 text-sky-700">
              <a href={profile.linkedinUrl} onClick={(e) => { e.preventDefault(); openExternalUrl(profile.linkedinUrl!); }} className="hover:underline cursor-pointer">
                linkedin.com/in/veras-d
              </a>
              <Linkedin className="w-3 h-3 text-slate-400" />
            </div>
          )}
        </div>
      </header>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Core Section (Experience & Projects) */}
        <div className="col-span-8 space-y-5">
          
          {/* Work Experience */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b text-slate-900" style={{ borderColor: accentColor }}>
              {language === 'en' ? 'Professional Experience' : 'Pracovní Zkušenosti'}
            </h2>

            <div className="space-y-4">
              {filteredExperiences.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[11.5px] text-slate-900">
                      {exp.roleTitle[language]}
                    </span>
                    <span className="text-[9.5px] font-mono text-slate-500 font-medium">
                      {exp.startDate} – {exp.endDate}
                    </span>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-600 font-semibold mb-1">
                    <span>{exp.company}</span>
                    <span>{exp.location}</span>
                  </div>

                  {exp.summary && (
                    <p className="text-[10px] italic text-slate-500 mb-1.5">
                      {exp.summary[language]}
                    </p>
                  )}

                  <div className="space-y-1 text-slate-700 pl-1">
                    {exp.activeBullets.map(b => (
                      <div key={b.id} className="flex items-start">
                        <span className="mr-1.5 text-slate-700 font-bold shrink-0">•</span>
                        <span>{b.text[language]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Featured Projects */}
          {activeProjects.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b text-slate-900" style={{ borderColor: accentColor }}>
                {language === 'en' ? 'Key Technical Projects' : 'Klíčové Projekty'}
              </h2>

              <div className="space-y-3">
                {activeProjects.map(p => (
                  <div key={p.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-900">{p.title}</span>
                      {p.url && (
                        <a
                          href={p.url}
                          onClick={(e) => { e.preventDefault(); openExternalUrl(p.url!); }}
                          className="text-[9.5px] text-sky-700 font-mono hover:underline cursor-pointer"
                        >
                          Link ↗
                        </a>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-600 mt-0.5">{p.description[language] || p.description.en}</p>
                    {p.techStack && p.techStack.length > 0 && (
                      <div className="mt-1.5 leading-none">
                        {p.techStack.map((tech, i) => (
                          <span key={i} className="inline-block text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 mr-1 mb-1 leading-tight">
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

        </div>

        {/* Right Sidebar Section (Skills, Education, Languages) */}
        <div className="col-span-4 space-y-5 border-l border-slate-200 pl-5">
          
          {/* Skills Matrix */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b text-slate-900" style={{ borderColor: accentColor }}>
              {language === 'en' ? 'Core Skills' : 'Dovednosti'}
            </h2>

            <div className="space-y-3">
              {skillCategories.map(cat => {
                const activeSkills = cat.skills.filter(s => s.enabled);
                if (activeSkills.length === 0) return null;

                return (
                  <div key={cat.id}>
                    <h3 className="text-[10px] font-bold text-slate-700 mb-1">
                      {cat.categoryName[language]}
                    </h3>
                    <div className="leading-none">
                      {activeSkills.map(s => (
                        <span 
                          key={s.id}
                          className="inline-block text-[9.5px] px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded font-medium border border-slate-200 mr-1 mb-1 leading-tight"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Education */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b text-slate-900" style={{ borderColor: accentColor }}>
              {language === 'en' ? 'Education' : 'Vzdělání'}
            </h2>

            <div className="space-y-3">
              {education.filter(e => e.enabled).map(edu => (
                <div key={edu.id}>
                  <span className="font-bold text-slate-900 block">{edu.institution}</span>
                  <span className="text-[10px] text-slate-700 block">{edu.program[language]}</span>
                  <span className="text-[9.5px] font-mono text-slate-500">{edu.dates}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Languages */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b text-slate-900" style={{ borderColor: accentColor }}>
              {language === 'en' ? 'Languages' : 'Jazyky'}
            </h2>

            <div className="space-y-1.5">
              {languages.filter(l => l.enabled).map(lang => (
                <div key={lang.id} className="flex justify-between text-[10px]">
                  <span className="font-bold text-slate-800">{lang.language[language]}</span>
                  <span className="text-slate-600">{lang.proficiency[language]}</span>
                </div>
              ))}
            </div>
          </section>

        </div>

      </div>

    </div>
  );
};
