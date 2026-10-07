import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Building2, Search, X, Sparkles, Link as LinkIcon } from 'lucide-react';
import { AtsType, extractAtsAndSlugFromUrl, generateCandidateSlugs } from '../../utils/companyWatchlistService';
import { searchLiveDirectory, LiveDirectoryCompany } from '../../utils/dynamicYcService';

export interface CompanySearchAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelectSuggestion: (slug: string, ats?: AtsType) => void;
  placeholder?: string;
  disabled?: boolean;
}

interface CompanyDropdownMenuProps {
  urlDetection: { slug: string; ats: AtsType } | null;
  liveMatches: LiveDirectoryCompany[];
  candidateSlug: string | null;
  activeIndex: number;
  onSelectSuggestion: (slug: string, ats?: AtsType) => void;
  onClose: () => void;
}

const CompanyDropdownMenu: React.FC<CompanyDropdownMenuProps> = ({
  urlDetection,
  liveMatches,
  candidateSlug,
  activeIndex,
  onSelectSuggestion,
  onClose
}) => (
  <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1 z-50 max-h-60 overflow-y-auto divide-y divide-slate-800/60 text-xs animate-in fade-in zoom-in-95 duration-100">
    {urlDetection && (
      <button
        type="button"
        onClick={() => {
          onSelectSuggestion(urlDetection.slug, urlDetection.ats);
          onClose();
        }}
        className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800/80 text-emerald-300 bg-emerald-950/20 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 truncate">
          <LinkIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-medium truncate">Pasted URL: {urlDetection.slug}</span>
        </div>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-900/60 border border-emerald-700/60 uppercase">
          {urlDetection.ats}
        </span>
      </button>
    )}

    {liveMatches.map((m: LiveDirectoryCompany, i: number) => {
      const itemIdx = (urlDetection ? 1 : 0) + i;
      const isHighlighted = itemIdx === activeIndex;
      return (
        <button
          key={m.slug}
          type="button"
          onClick={() => {
            onSelectSuggestion(m.slug);
            onClose();
          }}
          className={`w-full text-left px-3 py-1.5 flex items-center justify-between transition-colors cursor-pointer ${
            isHighlighted ? 'bg-sky-500/20 text-sky-200' : 'hover:bg-slate-800/60 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium truncate">{m.name}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
            {m.slug}
          </span>
        </button>
      );
    })}

    {candidateSlug && (
      <button
        type="button"
        onClick={() => {
          onSelectSuggestion(candidateSlug);
          onClose();
        }}
        className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-800/60 text-sky-300 bg-sky-950/20 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 truncate">
          <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="truncate">Probe candidate slug: &quot;{candidateSlug}&quot;</span>
        </div>
        <span className="text-[10px] text-sky-400 font-mono">auto-detect</span>
      </button>
    )}
  </div>
);

export const CompanySearchAutocomplete: React.FC<CompanySearchAutocompleteProps> = ({
  value,
  onChange,
  onSelectSuggestion,
  placeholder = 'Search company name, slug, or paste career URL...',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const urlDetection = useMemo(() => extractAtsAndSlugFromUrl(value), [value]);
  const liveMatches = useMemo(() => searchLiveDirectory(value, 6), [value]);
  const candidateSlug = useMemo(() => {
    const candidates = generateCandidateSlugs(value);
    return candidates.length > 0 && candidates[0] !== value.trim().toLowerCase() ? candidates[0] : null;
  }, [value]);

  const totalOptions = (urlDetection ? 1 : 0) + liveMatches.length + (candidateSlug ? 1 : 0);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || totalOptions === 0) {
      if (e.key === 'ArrowDown') setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % totalOptions);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + totalOptions) % totalOptions);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelectIndex(activeIndex);
    }
  };

  const handleSelectIndex = (index: number) => {
    let cursor = 0;
    if (urlDetection) {
      if (index === cursor) {
        onSelectSuggestion(urlDetection.slug, urlDetection.ats);
        setIsOpen(false);
        return;
      }
      cursor++;
    }
    for (const match of liveMatches) {
      if (index === cursor) {
        onSelectSuggestion(match.slug);
        setIsOpen(false);
        return;
      }
      cursor++;
    }
    if (candidateSlug && index === cursor) {
      onSelectSuggestion(candidateSlug);
      setIsOpen(false);
    }
  };

  const shouldShowDropdown = isOpen && (Boolean(urlDetection) || liveMatches.length > 0 || Boolean(candidateSlug));

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-8 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 h-[34px]"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className="absolute right-2.5 p-0.5 text-slate-500 hover:text-slate-300 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {shouldShowDropdown && (
        <CompanyDropdownMenu
          urlDetection={urlDetection}
          liveMatches={liveMatches}
          candidateSlug={candidateSlug}
          activeIndex={activeIndex}
          onSelectSuggestion={onSelectSuggestion}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
