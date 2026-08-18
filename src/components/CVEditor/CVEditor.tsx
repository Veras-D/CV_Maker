import React, { useState } from 'react';
import { ProfileEditor } from './ProfileEditor';
import { ExperienceEditor } from './ExperienceEditor';
import { SkillsEditor } from './SkillsEditor';
import { ProjectsEducationEditor } from './ProjectsEducationEditor';
import { DownloadCloud } from 'lucide-react';
import { AIIngestionModal } from '../AIFeatures/AIIngestionModal';

export const CVEditor: React.FC = () => {
  const [isIngestionOpen, setIsIngestionOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Master Resume Database</h1>
          <p className="text-xs text-slate-400">Manage your master experiences, skills matrix, projects, and contact info</p>
        </div>

        <button
          onClick={() => setIsIngestionOpen(true)}
          className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-medium px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <DownloadCloud className="w-3.5 h-3.5 text-sky-400" />
          <span>Import / Scrape Master Data</span>
        </button>
      </div>

      {/* Editors */}
      <ProfileEditor />
      <ExperienceEditor />
      <SkillsEditor />
      <ProjectsEducationEditor />

      {/* Ingestion Modal */}
      <AIIngestionModal isOpen={isIngestionOpen} onClose={() => setIsIngestionOpen(false)} />
    </div>
  );
};
