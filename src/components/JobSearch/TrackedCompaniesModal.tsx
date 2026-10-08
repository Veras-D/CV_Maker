import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { X, Search, Plus, Check, Loader2, Sparkles, Building2, RefreshCw } from 'lucide-react';
import { CustomSelect, SelectOption } from '../Common/CustomSelect';
import { 
  TrackedCompany, 
  AtsType, 
  getSavedTrackedCompanies, 
  saveTrackedCompanies,
  toggleCompanyEnabled,
  setYcCompaniesEnabled,
  setAllCompaniesEnabled,
  removeTrackedCompany,
  addCustomTrackedCompany
} from '../../utils/companyWatchlistService';
import { fetchLiveYcDirectory, isDynamicYcBusiness } from '../../utils/dynamicYcService';
import { CompanySearchAutocomplete } from './CompanySearchAutocomplete';
import { useBodyScrollLock } from '../../utils/useBodyScrollLock';

export interface TrackedCompaniesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompaniesChanged: () => void;
}

const ATS_BADGE_COLORS: Record<AtsType, string> = {
  ashby: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
  greenhouse: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
  lever: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
  smartrecruiters: 'bg-blue-950/80 text-blue-300 border-blue-800/60'
};

const ATS_OPTIONS: SelectOption[] = [
  { value: 'auto', label: 'Auto-Detect' },
  { value: 'ashby', label: 'Ashby' },
  { value: 'greenhouse', label: 'Greenhouse' },
  { value: 'lever', label: 'Lever' },
  { value: 'smartrecruiters', label: 'SmartRecruiters' }
];

const CompanyModalHeader: React.FC<{
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

const ModalToolbar: React.FC<{
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

const AddCompanyForm: React.FC<{
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

const CompanyItemRow: React.FC<{
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

function filterWatchlistCompanies(companies: TrackedCompany[], searchQuery: string): TrackedCompany[] {
  const q = searchQuery.toLowerCase().trim();
  if (!q) return companies;
  if (q === 'yc' || q === 'ycombinator') return companies.filter(c => c.isYc);
  return companies.filter(c => 
    c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q) || c.ats.toLowerCase().includes(q)
  );
}

export const TrackedCompaniesModal: React.FC<TrackedCompaniesModalProps> = ({
  isOpen,
  onClose,
  onCompaniesChanged
}) => {
  useBodyScrollLock(isOpen);
  const [companies, setCompanies] = useState<TrackedCompany[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [selectedAts, setSelectedAts] = useState<AtsType | 'auto'>('auto');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [isSyncingYc, setIsSyncingYc] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const saved = getSavedTrackedCompanies();
      const synchronized = saved.map(c => ({
        ...c,
        isYc: isDynamicYcBusiness(c.name, c.slug)
      }));
      setCompanies(synchronized);
      setSearchQuery('');
      setAddError('');
      setSyncMessage('');
    }
  }, [isOpen]);

  const filteredCompanies = useMemo(
    () => filterWatchlistCompanies(companies, searchQuery),
    [companies, searchQuery]
  );

  const ycCompanies = useMemo(() => companies.filter(c => c.isYc), [companies]);
  const allYcEnabled = useMemo(() => ycCompanies.length > 0 && ycCompanies.every(c => c.enabled), [ycCompanies]);
  const totalEnabled = useMemo(() => companies.filter(c => c.enabled).length, [companies]);

  const handleToggle = (slug: string) => setCompanies(toggleCompanyEnabled(companies, slug));
  const handleToggleYc = () => setCompanies(setYcCompaniesEnabled(companies, !allYcEnabled));
  const handleToggleAll = (enabled: boolean) => setCompanies(setAllCompaniesEnabled(companies, enabled));
  const handleRemove = (slug: string) => setCompanies(removeTrackedCompany(companies, slug));

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlug.trim()) return;
    setIsAdding(true);
    setAddError('');
    const ats = selectedAts === 'auto' ? undefined : selectedAts;
    const res = await addCustomTrackedCompany(companies, newSlug, ats);
    setIsAdding(false);
    if (res.success) {
      setCompanies(res.list);
      setNewSlug('');
    } else if (res.error) {
      setAddError(res.error);
    }
  };

  const handleSyncYc = async () => {
    setIsSyncingYc(true);
    setSyncMessage('');
    const liveKeys = await fetchLiveYcDirectory(true);
    setIsSyncingYc(false);
    if (!liveKeys || liveKeys.size === 0) {
      setSyncMessage('YC feed reached, all companies are up-to-date.');
      return;
    }
    const updated = companies.map(c => ({
      ...c,
      isYc: isDynamicYcBusiness(c.name, c.slug)
    }));
    saveTrackedCompanies(updated);
    setCompanies(updated);
    const matchedCount = updated.filter(c => c.isYc).length;
    setSyncMessage(`✓ Verified ${matchedCount} Y Combinator companies in your watchlist from live YC feed.`);
  };

  const handleCloseModal = () => {
    onCompaniesChanged();
    onClose();
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-hidden overscroll-contain"
      role="dialog"
      aria-modal="true"
    >
      {/* Full-screen backdrop covering everything including navbar */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in transition-opacity cursor-pointer"
        onClick={handleCloseModal}
        aria-hidden="true"
      />

      <div 
        className="relative z-10 w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        <CompanyModalHeader totalEnabled={totalEnabled} totalCompanies={companies.length} onClose={handleCloseModal} />

        <div className="p-3 sm:p-4 bg-slate-950/40 border-b border-slate-800/80 space-y-3">
          <ModalToolbar
            allYcEnabled={allYcEnabled}
            ycCount={ycCompanies.length}
            onToggleYc={handleToggleYc}
            onSyncYc={handleSyncYc}
            isSyncingYc={isSyncingYc}
            onToggleAll={handleToggleAll}
            syncMessage={syncMessage}
          />

          <AddCompanyForm
            newSlug={newSlug}
            onSlugChange={setNewSlug}
            selectedAts={selectedAts}
            onAtsChange={setSelectedAts}
            isAdding={isAdding}
            addError={addError}
            onSubmit={handleAddCompany}
          />

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search watchlist (e.g. Stripe, OpenAI, YC)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-700"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5 divide-y divide-slate-800/40">
          {filteredCompanies.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-500">No companies matching &quot;{searchQuery}&quot;</p>
          ) : (
            filteredCompanies.map((c) => (
              <CompanyItemRow key={c.slug} company={c} onToggle={handleToggle} onRemove={handleRemove} />
            ))
          )}
        </div>

        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">{totalEnabled} companies selected</span>
          <button
            type="button"
            onClick={handleCloseModal}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-sky-600/20 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save & Apply</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
