import React from 'react';
import { UploadCloud, Github, Globe, FileText } from 'lucide-react';

export type IngestionSourceType = 'file' | 'github' | 'website' | 'text';

export interface IngestionSourceTabsProps {
  activeTab: IngestionSourceType;
  onTabChange: (tab: IngestionSourceType) => void;
}

export const IngestionSourceTabs: React.FC<IngestionSourceTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
      <button
        type="button"
        onClick={() => onTabChange('file')}
        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
          activeTab === 'file' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <UploadCloud className="w-3.5 h-3.5" />
        <span>Upload CV File</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('github')}
        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
          activeTab === 'github' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Github className="w-3.5 h-3.5" />
        <span>GitHub</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('website')}
        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
          activeTab === 'website' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Globe className="w-3.5 h-3.5" />
        <span>Portfolio</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('text')}
        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
          activeTab === 'text' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <FileText className="w-3.5 h-3.5" />
        <span>Text</span>
      </button>
    </div>
  );
};
