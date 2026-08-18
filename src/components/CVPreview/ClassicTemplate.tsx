import React from 'react';
import { CVData, LanguageCode, RolePreset, UserProfile, WorkExperience, ProjectItem, SkillCategory, EducationItem, LanguageItem } from '../../types/cv';
import { openExternalUrl } from '../../utils/urlHelper';
import { Sparkles, FileText } from 'lucide-react';
import { useCV } from '../../context/CVContext';

interface TemplateProps {
  data: CVData;
  language: LanguageCode;
  selectedTags: string[];
  preset: RolePreset;
}

function getContactList(profile: UserProfile): string[] {
  return [profile.email, profile.phone, profile.location]
    .map(s => (s || '').trim())
    .filter(Boolean);
}

function hasAnyContent(data: CVData, language: LanguageCode): boolean {
  const { profile, experiences, skillCategories, projects, education, languages } = data;
  if (profile.name?.trim() || profile.headline?.[language]?.trim() || profile.headline?.en?.trim()) {
    return true;
  }
  if (profile.summary?.[language]?.trim() || profile.summary?.en?.trim()) {
    return true;
  }
  if (experiences.some(e => e.enabled) || projects.some(p => p.enabled)) {
    return true;
  }
  if (skillCategories.some(cat => cat.skills.some(s => s.enabled))) {
    return true;
  }
  return education.some(e => e.enabled) || languages.some(l => l.enabled);
}

const EmptyResumePlaceholder: React.FC = () => {
  const { setActiveTab } = useCV();

  return (
    <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 pt-16 font-sans shadow-2xl mx-auto box-border text-[10.5px] flex flex-col items-center justify-start text-center">
      <div className="max-w-md space-y-4 p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/80">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-sky-500/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Build Your Resume with AI</h3>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Let AI extract and organize your data automatically from your GitHub, LinkedIn, portfolio link, or existing resume file — or add your details manually.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Import Profile with AI</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Add Manually</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ResumeHeader: React.FC<{ profile: UserProfile; language: LanguageCode }> = ({ profile, language }) => {
  const name = profile.name?.trim();
  const headline = profile.headline?.[language]?.trim() || profile.headline?.en?.trim();
  const contactItems = getContactList(profile);
  const portfolio = profile.portfolioUrl?.trim();

  if (!name && !headline && contactItems.length === 0 && !portfolio) {
    return null;
  }

  return (
    <header className="text-center border-b-2 border-slate-900 pb-3 mb-4">
      {name && (
        <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-900">
          {name}
        </h1>
      )}
      {headline && (
        <p className="text-xs italic text-slate-700 font-sans mt-0.5">
          {headline}
        </p>
      )}
      {(contactItems.length > 0 || portfolio) && (
        <div className="text-[9.5px] text-slate-600 font-sans mt-1.5 flex flex-wrap justify-center items-center gap-2">
          {contactItems.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-400 font-bold">•</span>}
              <span>{item}</span>
            </React.Fragment>
          ))}
          {portfolio && (
            <>
              {contactItems.length > 0 && <span className="text-slate-400 font-bold">•</span>}
              <a 
                href={portfolio}
                onClick={(e) => { e.preventDefault(); openExternalUrl(portfolio); }} 
                className="text-sky-700 hover:underline cursor-pointer"
              >
                {portfolio}
              </a>
            </>
          )}
        </div>
      )}
    </header>
  );
};

const ResumeSummary: React.FC<{ summaryText: string; language: LanguageCode }> = ({ summaryText, language }) => {
  if (!summaryText.trim()) return null;
  return (
    <section className="mb-4 font-sans">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 mb-1.5 pb-0.5">
        {language === 'en' ? 'Executive Profile' : 'Profil'}
      </h2>
      <p className="text-slate-800 text-[10px] leading-normal">
        {summaryText}
      </p>
    </section>
  );
};

const ResumeExperience: React.FC<{ experiences: WorkExperience[]; language: LanguageCode }> = ({ experiences, language }) => {
  if (experiences.length === 0) return null;
  return (
    <section className="mb-4 font-sans">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 mb-2 pb-0.5">
        {language === 'en' ? 'Professional Experience' : 'Pracovní Zkušenosti'}
      </h2>
      <div className="space-y-3">
        {experiences.map(exp => (
          <div key={exp.id}>
            <div className="flex justify-between items-baseline font-bold">
              <span className="text-slate-900 text-[11px]">{exp.roleTitle[language] || exp.roleTitle.en}</span>
              <span className="text-[9.5px] text-slate-600 font-normal">{exp.startDate} – {exp.endDate}</span>
            </div>
            <div className="text-[10px] font-semibold text-slate-700 mb-1">
              {exp.company} {exp.location && `| ${exp.location}`}
            </div>
            {exp.bullets.length > 0 && (
              <div className="space-y-0.5 text-slate-800 text-[10px] pl-1 leading-normal">
                {exp.bullets.map(b => (
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
  );
};

const ResumeProjects: React.FC<{ projects: ProjectItem[]; language: LanguageCode }> = ({ projects, language }) => {
  if (projects.length === 0) return null;
  return (
    <section className="mb-4 font-sans">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 mb-2 pb-0.5">
        {language === 'en' ? 'Featured Portfolio Projects' : 'Projekty'}
      </h2>
      <div className="space-y-3">
        {projects.map(p => (
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
  );
};

const ResumeSkills: React.FC<{ categories: SkillCategory[]; language: LanguageCode }> = ({ categories, language }) => {
  if (categories.length === 0) return null;
  return (
    <section className="mb-4 font-sans">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 mb-1.5 pb-0.5">
        {language === 'en' ? 'Technical Competencies' : 'Technické Kompetence'}
      </h2>
      <div className="space-y-1 text-[10px]">
        {categories.map(cat => (
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
  );
};

const ResumeEducationLanguages: React.FC<{ education: EducationItem[]; languages: LanguageItem[]; language: LanguageCode }> = ({
  education,
  languages,
  language
}) => {
  if (education.length === 0 && languages.length === 0) return null;

  return (
    <section className={`grid gap-5 font-sans ${education.length > 0 && languages.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {education.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 mb-1.5 pb-0.5">
            {language === 'en' ? 'Education' : 'Vzdělání'}
          </h2>
          {education.map(edu => (
            <div key={edu.id} className="text-[10px] mb-1">
              <span className="font-bold block">{edu.institution}</span>
              <span className="text-slate-700 block">{edu.program[language] || edu.program.en}</span>
              <span className="text-slate-500 text-[9.5px] block">{edu.dates}</span>
            </div>
          ))}
        </div>
      )}

      {languages.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 mb-1.5 pb-0.5">
            {language === 'en' ? 'Languages' : 'Jazyky'}
          </h2>
          {languages.map(lang => (
            <div key={lang.id} className="flex justify-between text-[10px]">
              <span className="font-bold text-slate-900">{lang.language[language] || lang.language.en}</span>
              <span className="text-slate-700">{lang.proficiency[language] || lang.proficiency.en}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export const ClassicTemplate: React.FC<TemplateProps> = ({ data, language, selectedTags, preset: _preset }) => {
  if (!hasAnyContent(data, language)) {
    return <EmptyResumePlaceholder />;
  }

  const { profile, experiences, skillCategories, projects, education, languages } = data;

  const filteredExperiences = experiences
    .filter(e => e.enabled)
    .map(e => ({
      ...e,
      bullets: e.bullets.filter(b => 
        b.enabled && (selectedTags.length === 0 || b.tags.some(t => selectedTags.includes(t)))
      )
    }))
    .filter(e => e.bullets.length > 0 || selectedTags.length === 0);

  const activeProjects = projects.filter(p => p.enabled);
  const activeCategories = skillCategories.filter(cat => cat.skills.some(s => s.enabled));
  const activeEdu = education.filter(e => e.enabled);
  const activeLang = languages.filter(l => l.enabled);
  const summaryText = profile.summary?.[language]?.trim() || profile.summary?.en?.trim() || '';

  return (
    <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 font-serif shadow-2xl mx-auto box-border text-[10.5px] leading-relaxed overflow-hidden">
      <ResumeHeader profile={profile} language={language} />
      <ResumeSummary summaryText={summaryText} language={language} />
      <ResumeExperience experiences={filteredExperiences} language={language} />
      <ResumeProjects projects={activeProjects} language={language} />
      <ResumeSkills categories={activeCategories} language={language} />
      <ResumeEducationLanguages education={activeEdu} languages={activeLang} language={language} />
    </div>
  );
};
