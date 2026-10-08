import { useState, useEffect, useMemo } from 'react';
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

function filterWatchlistCompanies(companies: TrackedCompany[], searchQuery: string): TrackedCompany[] {
  const q = searchQuery.toLowerCase().trim();
  if (!q) return companies;
  if (q === 'yc' || q === 'ycombinator') return companies.filter(c => c.isYc);
  return companies.filter(c => 
    c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q) || c.ats.toLowerCase().includes(q)
  );
}

export function useTrackedCompaniesWatchlist(isOpen: boolean) {
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

  return {
    companies,
    searchQuery,
    setSearchQuery,
    newSlug,
    setNewSlug,
    selectedAts,
    setSelectedAts,
    isAdding,
    addError,
    isSyncingYc,
    syncMessage,
    filteredCompanies,
    ycCompanies,
    allYcEnabled,
    totalEnabled,
    handleToggle,
    handleToggleYc,
    handleToggleAll,
    handleRemove,
    handleAddCompany,
    handleSyncYc
  };
}
