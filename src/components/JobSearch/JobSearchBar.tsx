import React, { useState, useEffect, useMemo } from 'react';
import { Search, ExternalLink, X } from 'lucide-react';
import { RemoteJob } from '../../types/jobSearch';
import { getJobSearchSuggestions } from '../../utils/jobSuggestionEngine';
import { openExternalUrl } from '../../utils/urlHelper';
import { JobSearchDropdown } from './JobSearchDropdown';

export interface JobSearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  googleAtsUrl: string;
  jobs?: RemoteJob[];
}

const PAST_SEARCHES_KEY = 'cv_maker_past_job_searches_v1';

export const JobSearchBar: React.FC<JobSearchBarProps> = ({
  query,
  onQueryChange,
  googleAtsUrl,
  jobs = []
}) => {
  const [pastSearches, setPastSearches] = useState<string[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PAST_SEARCHES_KEY);
      if (stored) setPastSearches(JSON.parse(stored));
    } catch {
      // Ignore localStorage parse error
    }
  }, []);

  const suggestions = useMemo(() => getJobSearchSuggestions(query, jobs), [query, jobs]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

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

  const handleSelectSuggestion = (term: string) => {
    saveSearchTerm(term);
    onQueryChange(term);
    setIsInputFocused(false);
  };

  const handleKeyDownNavigation = (key: string): boolean => {
    if (key === 'ArrowDown' && suggestions.length > 0) {
      setSelectedIndex(prev => (prev + 1) % suggestions.length);
      return true;
    }
    if (key === 'ArrowUp' && suggestions.length > 0) {
      setSelectedIndex(prev => (prev <= 0 ? suggestions.length - 1 : prev - 1));
      return true;
    }
    return false;
  };

  const handleQueryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (handleKeyDownNavigation(e.key)) {
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex].label);
      } else {
        saveSearchTerm(query);
        setIsInputFocused(false);
      }
    } else if (e.key === 'Escape') {
      setIsInputFocused(false);
    }
  };

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
            placeholder="Search role title, company, or tech stack (e.g. Distributed, Stripe, Go, React)..."
            className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 focus:border-sky-500 rounded-xl pl-10 pr-36 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors shadow-inner"
          />
          <div className="absolute right-2 flex items-center gap-2.5">
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange('')}
                className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <a
              href={googleAtsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                openExternalUrl(googleAtsUrl);
              }}
              title="Search this query directly on Google across all Ashby, Greenhouse, and Lever boards"
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 border border-slate-700 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Google ATS</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {isInputFocused && suggestions.length > 0 && (
          <JobSearchDropdown
            suggestions={suggestions}
            query={query}
            selectedIndex={selectedIndex}
            onSelectSuggestion={handleSelectSuggestion}
            onHoverIndex={setSelectedIndex}
          />
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
