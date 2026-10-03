import React from 'react';
import { Briefcase, Building2, Zap } from 'lucide-react';
import { JobSearchSuggestion, SuggestionType } from '../../utils/jobSuggestionEngine';

export interface JobSearchDropdownProps {
  suggestions: JobSearchSuggestion[];
  query: string;
  selectedIndex: number;
  onSelectSuggestion: (term: string) => void;
  onHoverIndex: (index: number) => void;
}

const CATEGORY_CONFIG: Record<
  SuggestionType,
  { label: string; icon: React.ReactNode; badgeClass: string }
> = {
  role: {
    label: 'Role',
    icon: <Briefcase className="w-3 h-3 text-sky-400" />,
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
  },
  company: {
    label: 'Company',
    icon: <Building2 className="w-3 h-3 text-purple-400" />,
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  },
  tech: {
    label: 'Tech',
    icon: <Zap className="w-3 h-3 text-emerald-400" />,
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  }
};

export const HighlightMatch: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  const trimmed = query.trim();
  if (!trimmed) return <span>{text}</span>;

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  return (
    <span>
      {parts.map((part, index) => {
        const isMatch = part.toLowerCase() === trimmed.toLowerCase();
        return isMatch ? (
          <span key={index} className="text-sky-400 font-bold underline decoration-sky-500/40">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
};

export const JobSearchDropdown: React.FC<JobSearchDropdownProps> = ({
  suggestions,
  query,
  selectedIndex,
  onSelectSuggestion,
  onHoverIndex
}) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-30 overflow-hidden divide-y divide-slate-800/60 animate-in fade-in">
      {suggestions.map((sug, index) => {
        const config = CATEGORY_CONFIG[sug.type];
        const isSelected = selectedIndex === index;

        return (
          <div
            key={sug.id}
            onMouseDown={() => onSelectSuggestion(sug.label)}
            onMouseEnter={() => onHoverIndex(index)}
            className={`px-3.5 py-2.5 text-xs cursor-pointer flex items-center justify-between gap-3 transition-colors ${
              isSelected ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${config.badgeClass}`}
              >
                {config.icon}
                <span>{config.label}</span>
              </span>
              <span className="truncate">
                <HighlightMatch text={sug.label} query={query} />
              </span>
            </div>

            {sug.count > 0 && (
              <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-400 border border-slate-700/60 font-medium">
                {sug.count} {sug.count === 1 ? 'job' : 'jobs'}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
