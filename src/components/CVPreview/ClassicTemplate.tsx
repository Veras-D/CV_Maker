import React from 'react';
import { CVData, LanguageCode, RolePreset } from '../../types/cv';
import { openExternalUrl } from '../../utils/urlHelper';
import { FileText } from 'lucide-react';

interface TemplateProps {
  data: CVData;
  language: LanguageCode;
  selectedTags: string[];
  preset: RolePreset;
}

export const ClassicTemplate: React.FC<TemplateProps> = ({ data, language, selectedTags, preset: _preset }) => {
  const { profile, experiences, skillCategories, projects, education, languages } = data;

  const filteredExperiences = experiences
    .filter(e => e.enabled)
    .map(e => ({
      ...e,
      activeBullets: e.bullets.filter(b => 
        b.enabled && (selectedTags.length === 0 || b.tags.some(t => selectedTags.includes(t)))
      )
    }))
    .filter(e => e.activeBullets.length > 0 || selectedTags.length === 0);

  const activeProjects = projects.filter(p => p.enabled);
  const activeCategories = skillCategories.filter(cat => cat.skills.some(s => s.enabled));
  const activeEdu = education.filter(e => e.enabled);
  const activeLang = languages.filter(l => l.enabled);

  const hasName = Boolean(profile.name && profile.name.trim());
  const hasHeadline = Boolean(profile.headline?.[language]?.trim() || profile.headline?.en?.trim());
  const summaryText = profile.summary?.[language]?.trim() || profile.summary?.en?.trim() || '';
  const hasSummary = Boolean(summaryText);
  const hasExperiences = filteredExperiences.length > 0;
  const hasProjects = activeProjects.length > 0;
  const hasSkills = activeCategories.length > 0;
  const hasEducationOrLanguages = activeEdu.length > 0 || activeLang.length > 0;

  const isCompletelyEmpty = !hasName && !hasHeadline && !hasSummary && !hasExperiences && !hasProjects && !hasSkills && !hasEducationOrLanguages;

  if (isCompletelyEmpty) {
    return (
      <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 font-sans shadow-2xl mx-auto box-border text-[10.5px] flex flex-col items-center justify-center text-center">
        <div className="max-w-sm space-y-4 p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/70">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto shadow-sm">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Resume Preview</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              No details added yet. Go to the <strong className="text-slate-700">CV Editor</strong> tab to add your profile, work experiences, and skills.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const contactItems = [profile.email, profile.phone, profile.location]
    .map(s => (s || '').trim())
    .filter(Boolean);

  const hasHeader = hasName || hasHeadline || contactItems.length > 0 || Boolean(profile.portfolioUrl);

  return (
    <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 font-serif shadow-2xl mx-auto box-border text-[10.5px] leading-relaxed overflow-hidden">
      
      {/* Header */}
      {hasHeader && (
        <header className="text-center border-b-2 border-slate-900 pb-3 mb-4">
          {hasName && (
            <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-900">
              {profile.name}
            </h1>
          )}
          {hasHeadline && (
            <p className="text-xs italic text-slate-700 font-sans mt-0.5">
              {profile.headline[language] || profile.headline.en}
            </p>
          )}

          {(contactItems.length > 0 || profile.portfolioUrl) && (
            <div className="text-[9.5px] text-slate-600 font-sans mt-1.5 flex flex-wrap justify-center items-center gap-2">
              {contactItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-slate-400 font-bold">•</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
              {profile.portfolioUrl && (
                <>
                  {contactItems.length > 0 && <span className="text-slate-400 font-bold">•</span>}
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
          )}
        </header>
      )}

      {/* Executive Summary */}
      {hasSummary && (
        <section className="mb-4 font-sans">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 mb-1.5 pb-0.5">
            {language === 'en' ? 'Executive Profile' : 'Profil'}
          </h2>
          <p className="text-slate-800 text-[10px] leading-normal">
            {summaryText}
          </p>
        </section>
      )}

      {/* Experience */}
      {hasExperiences && (
        <section className="mb-4 font-sans">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 mb-2 pb-0.5">
            {language === 'en' ? 'Professional Experience' : 'Pracovní Zkušenosti'}
          </h2>

          <div className="space-y-3">
            {filteredExperiences.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline font-bold">
                  <span className="text-slate-900 text-[11px]">{exp.roleTitle[language] || exp.roleTitle.en}</span>
                  <span className="text-[9.5px] text-slate-600 font-normal">{exp.startDate} – {exp.endDate}</span>
                </div>
                <div className="text-[10px] font-semibold text-slate-700 mb-1">
                  {exp.company} {exp.location && `| ${exp.location}`}
                </div>

                {exp.activeBullets.length > 0 && (
                  <div className="space-y-0.5 text-slate-800 text-[10px] pl-1 leading-normal">
                    {exp.activeBullets.map(b => (
                      <div key={b.id} className="flex items-start">
                        <span className="mr-1.5 text-slate-800 font-bold shrink-0">•</span>
                        <span>{b.text[language] || b.text.en}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Technical Projects */}
      {hasProjects && (
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
      {hasSkills && (
        <section className="mb-4 font-sans">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 mb-1.5 pb-0.5">
            {language === 'en' ? 'Technical Competencies' : 'Technické Kompetence'}
          </h2>
          <div className="space-y-1 text-[10px]">
            {activeCategories.map(cat => (
              <div key={cat.id} className="flex">
                <span className="font-bold text-slate-900 w-40 shrink-0">
                  {cat.categoryName[language] || cat.categoryName.en}:
                </span>
                <span className="text-slate-800">
                  {cat.skills.filter(s => s.enabled).map(s => s.name).join(', ')}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education & Languages */}
      {hasEducationOrLanguages && (
        <section className={`grid gap-5 font-sans ${activeEdu.length > 0 && activeLang.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {activeEdu.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 mb-1.5 pb-0.5">
                {language === 'en' ? 'Education' : 'Vzdělání'}
              </h2>
              {activeEdu.map(edu => (
                <div key={edu.id} className="text-[10px] mb-1">
                  <span className="font-bold block">{edu.institution}</span>
                  <span className="text-slate-700 block">{edu.program[language] || edu.program.en}</span>
                  <span className="text-slate-500 text-[9.5px] block">{edu.dates}</span>
                </div>
              ))}
            </div>
          )}

          {activeLang.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 mb-1.5 pb-0.5">
                {language === 'en' ? 'Languages' : 'Jazyky'}
              </h2>
              {activeLang.map(lang => (
                <div key={lang.id} className="flex justify-between text-[10px]">
                  <span className="font-bold text-slate-900">{lang.language[language] || lang.language.en}</span>
                  <span className="text-slate-700">{lang.proficiency[language] || lang.proficiency.en}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

    </div>
  );
};
