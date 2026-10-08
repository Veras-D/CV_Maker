import React from 'react';
import { X, Plus, Loader2, Sparkles, Building2, RefreshCw } from 'lucide-react';
import { CustomSelect, SelectOption } from '../Common/CustomSelect';
import { TrackedCompany, AtsType } from '../../utils/companyWatchlistService';
import { CompanySearchAutocomplete } from './CompanySearchAutocomplete';

export const ATS_BADGE_COLORS: Record<AtsType, string> = {
  ashby: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
  greenhouse: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
  lever: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
  smartrecruiters: 'bg-blue-950/80 text-blue-300 border-blue-800/60'
};

export const ATS_OPTIONS: SelectOption[] = [
  { value: 'auto', label: 'Auto-Detect' },
  { value: 'ashby', label: 'Ashby' },
  { value: 'greenhouse', label: 'Greenhouse' },
  { value: 'lever', label: 'Lever' },
  { value: 'smartrecruiters', label: 'SmartRecruiters' }
];

export const CompanyModalHeader: React.FC<{
  totalEnabled: number;
  totalCompanies: number;
  onClose: () => void;
}> = ({ totalEnabled, totalCompanies, onClose }) => (
  <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
        <Building2 className="w-4 h-4" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <span>Company Watchlist</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
            {totalEnabled} of {totalCompanies} active
          </span>
        </h2>
        <p className="text-xs text-slate-400">Manage tracked companies across Ashby, Greenhouse, Lever, and SmartRecruiters</p>
      </div>
    </div>
    <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
      <X className="w-5 h-5" />
    </button>
  </div>
);

export const ModalToolbar: React.FC<{
  allYcEnabled: boolean;
  ycCount: number;
  onToggleYc: () => void;
  onSyncYc: () => void;
  isSyncingYc: boolean;
  onToggleAll: (enabled: boolean) => void;
  syncMessage: string;
}> = ({ allYcEnabled, ycCount, onToggleYc, onSyncYc, isSyncingYc, onToggleAll, syncMessage }) => (
  <>
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleYc}
          className={`px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            allYcEnabled
              ? 'bg-orange-950/70 border-orange-700/80 text-orange-300 hover:bg-orange-900/80'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span>{allYcEnabled ? 'Exclude Y Combinator' : 'Include Y Combinator'}</span>
          <span className="text-[10px] opacity-75">({ycCount})</span>
        </button>

        <button
          type="button"
          onClick={onSyncYc}
          disabled={isSyncingYc}
          title="Fetch live active hiring startups from Y Combinator directory"
          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncingYc ? 'animate-spin' : ''}`} />
          <span>Sync YC Live</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-slate-400">
        <button type="button" onClick={() => onToggleAll(true)} className="px-2 py-0.5 rounded hover:bg-slate-800 hover:text-slate-200 cursor-pointer">
          Select All
        </button>
        <span>•</span>
        <button type="button" onClick={() => onToggleAll(false)} className="px-2 py-0.5 rounded hover:bg-slate-800 hover:text-slate-200 cursor-pointer">
          Deselect All
        </button>
      </div>
    </div>

    {syncMessage && (
      <p className="text-[11px] text-emerald-400 flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        <span>{syncMessage}</span>
      </p>
    )}
  </>
);

export const AddCompanyForm: React.FC<{
  newSlug: string;
  onSlugChange: (val: string) => void;
  selectedAts: AtsType | 'auto';
  onAtsChange: (val: AtsType | 'auto') => void;
  isAdding: boolean;
  addError: string;
  onSubmit: (e: React.FormEvent) => void;
}> = ({ newSlug, onSlugChange, selectedAts, onAtsChange, isAdding, addError, onSubmit }) => (
  <form onSubmit={onSubmit} className="space-y-1.5 pt-1">
    <div className="flex items-center gap-2">
      <CompanySearchAutocomplete
        value={newSlug}
        onChange={onSlugChange}
        onSelectSuggestion={(slug, ats) => {
          onSlugChange(slug);
          if (ats) onAtsChange(ats);
        }}
        disabled={isAdding}
      />
      <div className="w-36 shrink-0">
        <CustomSelect options={ATS_OPTIONS} value={selectedAts} onChange={(val) => onAtsChange(val as AtsType | 'auto')} />
      </div>
      <button
        type="submit"
        disabled={isAdding || !newSlug.trim()}
        className="px-3 py-1.5 h-[34px] rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
      >
        {isAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
        <span>Add</span>
      </button>
    </div>
    {addError && <p className="text-[11px] text-rose-400 pl-1">{addError}</p>}
  </form>
);

export const CompanyItemRow: React.FC<{
  company: TrackedCompany;
  onToggle: (slug: string) => void;
  onRemove: (slug: string) => void;
}> = ({ company: c, onToggle, onRemove }) => (
  <div className="flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-slate-800/40 transition-colors group">
    <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0 select-none">
      <input
        type="checkbox"
        checked={c.enabled}
        onChange={() => onToggle(c.slug)}
        className="rounded bg-slate-950 border-slate-700 text-sky-600 focus:ring-0 cursor-pointer"
      />
      <div className="truncate">
        <span className={`text-xs font-medium ${c.enabled ? 'text-slate-100' : 'text-slate-500 line-through'}`}>
          {c.name}
        </span>
        <span className="text-[10px] text-slate-500 ml-1.5 font-mono">({c.slug})</span>
      </div>
    </label>

    <div className="flex items-center gap-1.5 pl-2">
      {c.isYc && (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-950/70 border border-orange-800/60 text-orange-400">
          YC
        </span>
      )}
      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider ${ATS_BADGE_COLORS[c.ats]}`}>
        {c.ats}
      </span>
      {c.isCustom && (
        <button
          type="button"
          onClick={() => onRemove(c.slug)}
          title="Remove custom company"
          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors ml-1 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  </div>
);
