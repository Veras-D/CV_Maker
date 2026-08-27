import React from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Briefcase, 
  GraduationCap, 
  Languages, 
  Cpu, 
  FolderGit2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  Github 
} from 'lucide-react';
import { IngestionResult } from '../../utils/ingestionService';
import { WorkExperience, EducationItem, LanguageItem, SkillCategory, ProjectItem } from '../../types/cv';

export const ContactPills: React.FC<{ preview: IngestionResult }> = ({ preview }) => (
  <div className="flex flex-wrap gap-2 text-[10px] text-slate-300 pt-1">
    {preview.detectedEmail && (
      <span className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
        <Mail className="w-3 h-3 text-sky-400" /> {preview.detectedEmail}
      </span>
    )}
    {preview.detectedPhone && (
      <span className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
        <Phone className="w-3 h-3 text-sky-400" /> {preview.detectedPhone}
      </span>
    )}
    {preview.detectedLocation && (
      <span className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
        <MapPin className="w-3 h-3 text-sky-400" /> {preview.detectedLocation}
      </span>
    )}
    {preview.detectedLinkedinUrl && (
      <span className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
        <Linkedin className="w-3 h-3 text-sky-400" /> LinkedIn
      </span>
    )}
    {preview.detectedGithubUrl && (
      <span className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
        <Github className="w-3 h-3 text-sky-400" /> GitHub
      </span>
    )}
    {preview.detectedPortfolioUrl && (
      <span className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
        <Globe className="w-3 h-3 text-sky-400" /> Portfolio
      </span>
    )}
  </div>
);

export const ExperienceList: React.FC<{ experiences: WorkExperience[] }> = ({ experiences }) => (
  <div className="space-y-1.5">
    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
      <Briefcase className="w-3.5 h-3.5 text-sky-400" />
      <span>Work Experience ({experiences.length}):</span>
    </span>
    <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
      {experiences.map((exp, idx) => (
        <div key={exp.id || idx} className="bg-slate-900 p-2 rounded-lg border border-slate-800 space-y-0.5">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-200">{exp.company}</span>
            <span className="text-[10px] text-slate-500">{exp.startDate} - {exp.endDate}</span>
          </div>
          <span className="text-[11px] text-sky-400 block">{exp.roleTitle.en || exp.roleTitle.cs}</span>
          {exp.bullets.length > 0 && (
            <p className="text-[10px] text-slate-400 line-clamp-1">{exp.bullets[0].text.en || exp.bullets[0].text.cs}</p>
          )}
        </div>
      ))}
    </div>
  </div>
);

export const EducationAndLanguages: React.FC<{ education: EducationItem[]; languages: LanguageItem[] }> = ({ education, languages }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
    {education.length > 0 && (
      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
          <span>Education:</span>
        </span>
        <div className="space-y-1">
          {education.map(edu => (
            <div key={edu.id} className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="font-semibold text-slate-200 block truncate">{edu.institution}</span>
              <span className="text-[10px] text-slate-400">{edu.program.en || edu.program.cs} ({edu.dates})</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {languages.length > 0 && (
      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <Languages className="w-3.5 h-3.5 text-sky-400" />
          <span>Languages:</span>
        </span>
        <div className="flex flex-wrap gap-1">
          {languages.map(lang => (
            <span key={lang.id} className="bg-slate-900 border border-slate-800 px-2 py-1 rounded-md text-[10px] flex items-center gap-1">
              <span className="font-semibold text-slate-200">{lang.language.en || lang.language.cs}</span>
              <span className="text-slate-500">({lang.proficiency.en || lang.proficiency.cs})</span>
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

export const SkillsAndProjects: React.FC<{ skillCategories: SkillCategory[]; projects: ProjectItem[] }> = ({ skillCategories, projects }) => {
  const totalSkills = skillCategories.flatMap(c => c.skills).length;
  return (
    <div className="space-y-2">
      {projects.length > 0 && (
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <FolderGit2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Projects ({projects.length}):</span>
          </span>
          <div className="space-y-1">
            {projects.map(p => (
              <div key={p.id} className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="font-medium text-slate-200">{p.title}</span>
                {p.techStack.length > 0 && (
                  <span className="text-[10px] text-sky-400 font-mono">{p.techStack.join(', ')}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {totalSkills > 0 && (
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>Extracted Skills ({totalSkills}):</span>
          </span>
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
            {skillCategories.flatMap(c => c.skills).map(s => (
              <span key={s.id} className="text-[10px] bg-slate-900 text-sky-300 border border-slate-800 px-2 py-0.5 rounded-md font-medium">
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const IngestionPreviewCard: React.FC<{
  preview: IngestionResult;
  isSuccess: boolean;
  onApply: () => void;
}> = ({ preview, isSuccess, onApply }) => {
  const totalSkills = preview.skillCategories.flatMap(c => c.skills).length;

  return (
    <div className="bg-slate-950 border border-sky-800/40 rounded-xl p-4 space-y-3 text-xs text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="font-bold text-sky-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Extracted Resume Content</span>
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          {preview.experiences.length} exp · {preview.education.length} edu · {preview.languages.length} lang · {totalSkills} skills
        </span>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-2">
        <span className="text-sm font-bold text-white block">{preview.detectedName || 'Profile Contact'}</span>
        {preview.detectedBio && (
          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{preview.detectedBio}</p>
        )}
        <ContactPills preview={preview} />
      </div>

      {preview.experiences.length > 0 && <ExperienceList experiences={preview.experiences} />}
      <EducationAndLanguages education={preview.education} languages={preview.languages} />
      <SkillsAndProjects skillCategories={preview.skillCategories} projects={preview.projects} />

      <button
        type="button"
        onClick={onApply}
        disabled={isSuccess}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer mt-2"
      >
        {isSuccess ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>Populated Master CV Successfully!</span>
          </>
        ) : (
          <>
            <span>Save & Populate Master CV</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};
