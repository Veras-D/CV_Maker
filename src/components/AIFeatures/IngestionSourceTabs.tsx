import React from 'react';
import { UploadCloud, Github, Linkedin, Globe, FileText } from 'lucide-react';

export type IngestionSourceType = 'file' | 'github' | 'linkedin' | 'website' | 'text';

export interface IngestionSourceTabsProps {
  activeTab: IngestionSourceType;
  onTabChange: (tab: IngestionSourceType) => void;
}

const TABS: { id: IngestionSourceType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'file', label: 'Upload CV', icon: UploadCloud },
  { id: 'github', label: 'GitHub', icon: Github },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'website', label: 'Portfolio', icon: Globe },
  { id: 'text', label: 'Text', icon: FileText }
];

export const IngestionSourceTabs: React.FC<IngestionSourceTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="grid grid-cols-5 rounded-xl bg-slate-950 p-1 border border-slate-800 text-[11px] sm:text-xs font-semibold gap-1">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-slate-800 text-sky-400 border border-slate-700/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
