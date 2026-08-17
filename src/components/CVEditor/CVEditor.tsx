import React, { useState } from 'react';
import { TagFilterBar } from './TagFilterBar';
import { ProfileEditor } from './ProfileEditor';
import { ExperienceEditor } from './ExperienceEditor';
import { SkillsEditor } from './SkillsEditor';
import { ProjectsEducationEditor } from './ProjectsEducationEditor';
import { Sparkles, Wand2 } from 'lucide-react';
import { AIIngestionModal } from '../AIFeatures/AIIngestionModal';

export const CVEditor: React.FC = () => {
  const [isIngestionOpen, setIsIngestionOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top AI Ingestion Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider">
              Step 1: AI Master Profile Setup
            </span>
            <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30 font-semibold">
              Live Scraped Data
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-0.5">Master CV Database & Information Engine</h2>
          <p className="text-xs text-slate-400">
            Edit your contact info, positions, skill matrix, and projects below or run AI ingestion to extract latest details from LinkedIn, GitHub, or your portfolio website.
          </p>
        </div>

        <button
          onClick={() => setIsIngestionOpen(true)}
          className="shrink-0 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-sky-500/20 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Run AI Scraper & Ingestion</span>
        </button>
      </div>

      {/* Interactive Tag Filter Bar */}
      <TagFilterBar />

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
