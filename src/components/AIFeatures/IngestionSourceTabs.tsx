import React from 'react';
import { UploadCloud, Github, Linkedin, Globe, FileText } from 'lucide-react';

export type IngestionSourceType = 'file' | 'github' | 'linkedin' | 'website' | 'text';

export interface IngestionSourceTabsProps {
  activeTab: IngestionSourceType;
  onTabChange: (tab: IngestionSourceType) => void;
}

export const IngestionSourceTabs: React.FC<IngestionSourceTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-[11px] sm:text-xs font-semibold overflow-x-auto gap-1">
      <button
        type="button"
        onClick={() => onTabChange('file')}
        className={`flex-1 py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
          activeTab === 'file' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <UploadCloud className="w-3.5 h-3.5 shrink-0" />
        <span>Upload CV</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('github')}
        className={`flex-1 py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
          activeTab === 'github' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Github className="w-3.5 h-3.5 shrink-0" />
        <span>GitHub</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('linkedin')}
        className={`flex-1 py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
          activeTab === 'linkedin' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Linkedin className="w-3.5 h-3.5 shrink-0" />
        <span>LinkedIn</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('website')}
        className={`flex-1 py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
          activeTab === 'website' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Globe className="w-3.5 h-3.5 shrink-0" />
        <span>Portfolio</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('text')}
        className={`flex-1 py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
          activeTab === 'text' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <FileText className="w-3.5 h-3.5 shrink-0" />
        <span>Text</span>
      </button>
    </div>
  );
};
