import React from 'react';
import { useCV } from '../../context/CVContext';
import { Layout, FolderOpen, X } from 'lucide-react';
import { CustomSelect, SelectOption } from '../Common/CustomSelect';
import { pickDirectoryFromSystem } from '../../utils/tauriFileExport';

const PAGE_LIMIT_OPTIONS: SelectOption[] = [
  { value: '1', label: '1 Page (Strict ATS Standard - Recommended)' },
  { value: '2', label: '2 Pages (Extended Career History)' }
];

export const LayoutSettingsCard: React.FC = () => {
  const { 
    targetMaxPages, 
    setTargetMaxPages, 
    exportDirectory, 
    setExportDirectory 
  } = useCV();

  const handleSelectFolder = async () => {
    try {
      const selected = await pickDirectoryFromSystem();
      if (selected) {
        setExportDirectory(selected);
      }
    } catch {
      // User cancelled
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
          <Layout className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Document Layout & Export</h2>
          <p className="text-xs text-slate-400">
            Set maximum page limits and download folder for tailored CVs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Target Page Limit
          </label>
          <CustomSelect
            options={PAGE_LIMIT_OPTIONS}
            value={String(targetMaxPages)}
            onChange={(val) => setTargetMaxPages(Number(val))}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Download Destination Directory
          </label>
          <div
            role="button"
            tabIndex={0}
            onClick={handleSelectFolder}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelectFolder();
              }
            }}
            className="group w-full h-9 bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700 hover:border-slate-600 rounded-lg px-2.5 text-xs font-medium flex items-center justify-between gap-2 shadow-sm focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
            title={exportDirectory || 'Default System Downloads Folder'}
          >
            <div className="flex items-center gap-2 min-w-0 truncate">
              <FolderOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className={`truncate ${exportDirectory ? 'text-slate-100 font-medium' : 'text-slate-400'}`}>
                {exportDirectory || 'Default System Downloads'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {exportDirectory && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExportDirectory('');
                  }}
                  title="Reset to default downloads folder"
                  className="p-1 text-slate-400 hover:text-red-400 rounded cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="bg-slate-700 group-hover:bg-slate-650 active:bg-slate-600 text-sky-400 group-hover:text-sky-300 px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm transition-colors border border-slate-600/40">
                Browse
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
