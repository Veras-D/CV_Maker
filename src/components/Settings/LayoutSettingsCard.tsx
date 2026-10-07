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
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={handleSelectFolder}
              className="w-full bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700 hover:border-slate-600 rounded-lg pl-3 pr-20 py-1.5 text-xs font-medium flex items-center gap-2 shadow-sm focus:outline-none focus:border-sky-500 transition-colors cursor-pointer text-left overflow-hidden h-[34px]"
              title={exportDirectory || 'Default System Downloads'}
            >
              <FolderOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className={`truncate text-xs ${exportDirectory ? 'text-slate-100' : 'text-slate-400'}`}>
                {exportDirectory || 'Default System Downloads'}
              </span>
            </button>
            <div className="absolute right-1.5 flex items-center gap-1">
              {exportDirectory && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExportDirectory('');
                  }}
                  title="Reset to default downloads folder"
                  className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <button
                type="button"
                onClick={handleSelectFolder}
                className="bg-slate-700 hover:bg-slate-650 text-sky-400 hover:text-sky-300 px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Browse
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
