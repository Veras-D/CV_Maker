import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, X } from 'lucide-react';

export interface JobSearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  googleAtsUrl: string;
}

const COMMON_ROLE_SUGGESTIONS = [
  'Forward Deployed Engineer',
  'Software Engineer',
  'QA Automation Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Full-Stack Developer',
  'DevOps Engineer',
  'Site Reliability Engineer',
  'Data Engineer',
  'Machine Learning Engineer',
  'Product Manager'
];

const PAST_SEARCHES_KEY = 'cv_maker_past_job_searches_v1';

export const JobSearchBar: React.FC<JobSearchBarProps> = ({
  query,
  onQueryChange,
  googleAtsUrl
}) => {
  const [pastSearches, setPastSearches] = useState<string[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PAST_SEARCHES_KEY);
      if (stored) setPastSearches(JSON.parse(stored));
    } catch {
      // Ignore localStorage parse error
    }
  }, []);

  const saveSearchTerm = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...pastSearches.filter(s => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
    setPastSearches(updated);
    try {
      localStorage.setItem(PAST_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore quota
    }
  };

  const removePastSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = pastSearches.filter(s => s !== term);
    setPastSearches(updated);
    try {
      localStorage.setItem(PAST_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleQueryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveSearchTerm(query);
      setIsInputFocused(false);
    }
  };

  const handleSelectSuggestion = (term: string) => {
    saveSearchTerm(term);
    onQueryChange(term);
    setIsInputFocused(false);
  };

  const filteredSuggestions = COMMON_ROLE_SUGGESTIONS.filter(s => 
    query && s.toLowerCase().includes(query.toLowerCase()) && s.toLowerCase() !== query.toLowerCase()
  ).slice(0, 5);

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
            onKeyDown={handleQueryKeyDown}
            placeholder="Search role title (e.g. Forward Deployed Engineer, QA Tester, Python)..."
            className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 focus:border-sky-500 rounded-xl pl-10 pr-28 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors shadow-inner"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              className="absolute right-24 text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <a
            href={googleAtsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Search this query directly on Google across all Ashby, Greenhouse, and Lever boards"
            className="absolute right-2 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 border border-slate-700 text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <span>Google ATS</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {isInputFocused && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-30 overflow-hidden divide-y divide-slate-800/60 animate-in fade-in">
            {filteredSuggestions.map(sug => (
              <div
                key={sug}
                onMouseDown={() => handleSelectSuggestion(sug)}
                className="px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer flex items-center justify-between"
              >
                <span>{sug}</span>
                <span className="text-[10px] text-slate-500">Suggestion</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {pastSearches.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-slate-400 mr-1">Recent:</span>
          {pastSearches.map(term => (
            <button
              key={term}
              type="button"
              onClick={() => handleSelectSuggestion(term)}
              className="px-2.5 py-0.5 rounded-full text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{term}</span>
              <span 
                onClick={(e) => removePastSearch(e, term)} 
                className="text-slate-500 hover:text-slate-300"
              >
                ×
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
