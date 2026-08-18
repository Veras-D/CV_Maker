import React from 'react';
import { useCV } from '../../context/CVContext';
import { SelectOption } from '../Common/CustomSelect';
import { LanguageCode } from '../../types/cv';
import { ProjectsSection } from './ProjectsSection';
import { EducationSection } from './EducationSection';
import { LanguagesSection } from './LanguagesSection';

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

  return (
    <div className="space-y-6">
      <ProjectsSection
        projects={projects}
        activeLanguage={activeLanguage as LanguageCode}
        onAdd={addProject}
        onUpdate={updateProject}
        onDelete={deleteProject}
        onToggleEnabled={toggleProjectEnabled}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EducationSection
          education={education}
          activeLanguage={activeLanguage as LanguageCode}
          yearOptions={yearOptions}
          onAdd={addEducation}
          onUpdate={updateEducation}
          onDelete={deleteEducation}
          onToggleEnabled={toggleEducationEnabled}
        />

        <LanguagesSection
          languages={languages}
          activeLanguage={activeLanguage as LanguageCode}
          onAdd={addLanguage}
          onUpdate={updateLanguage}
          onDelete={deleteLanguage}
        />
      </div>
    </div>
  );
};
