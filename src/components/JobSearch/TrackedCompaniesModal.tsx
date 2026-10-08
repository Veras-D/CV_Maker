import React, { useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Search, Check } from 'lucide-react';
import { useBodyScrollLock } from '../../utils/useBodyScrollLock';
import { useTrackedCompaniesWatchlist } from './useTrackedCompaniesWatchlist';
import { 
  CompanyModalHeader, 
  ModalToolbar, 
  AddCompanyForm, 
  CompanyItemRow 
} from './TrackedCompaniesModalComponents';

export interface TrackedCompaniesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompaniesChanged: () => void;
}

export const TrackedCompaniesModal: React.FC<TrackedCompaniesModalProps> = ({
  isOpen,
  onClose,
  onCompaniesChanged
}) => {
  useBodyScrollLock(isOpen);
  const watchlist = useTrackedCompaniesWatchlist(isOpen);

  const handleCloseModal = useCallback(() => {
    onCompaniesChanged();
    onClose();
  }, [onCompaniesChanged, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleCloseModal]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-hidden overscroll-contain"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseModal();
      }}
    >
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in transition-opacity cursor-pointer"
        onClick={handleCloseModal}
        aria-hidden="true"
      />

      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        <CompanyModalHeader 
          totalEnabled={watchlist.totalEnabled} 
          totalCompanies={watchlist.companies.length} 
          onClose={handleCloseModal} 
        />

        <div className="p-3 sm:p-4 bg-slate-950/40 border-b border-slate-800/80 space-y-3">
          <ModalToolbar
            allYcEnabled={watchlist.allYcEnabled}
            ycCount={watchlist.ycCompanies.length}
            onToggleYc={watchlist.handleToggleYc}
            onSyncYc={watchlist.handleSyncYc}
            isSyncingYc={watchlist.isSyncingYc}
            onToggleAll={watchlist.handleToggleAll}
            syncMessage={watchlist.syncMessage}
          />

          <AddCompanyForm
            newSlug={watchlist.newSlug}
            onSlugChange={watchlist.setNewSlug}
            selectedAts={watchlist.selectedAts}
            onAtsChange={watchlist.setSelectedAts}
            isAdding={watchlist.isAdding}
            addError={watchlist.addError}
            onSubmit={watchlist.handleAddCompany}
          />

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={watchlist.searchQuery}
              onChange={(e) => watchlist.setSearchQuery(e.target.value)}
              placeholder="Search watchlist (e.g. Stripe, OpenAI, YC)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-700"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5 divide-y divide-slate-800/40">
          {watchlist.filteredCompanies.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-500">No companies matching &quot;{watchlist.searchQuery}&quot;</p>
          ) : (
            watchlist.filteredCompanies.map((c) => (
              <CompanyItemRow 
                key={c.slug} 
                company={c} 
                onToggle={watchlist.handleToggle} 
                onRemove={watchlist.handleRemove} 
              />
            ))
          )}
        </div>

        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">{watchlist.totalEnabled} companies selected</span>
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
