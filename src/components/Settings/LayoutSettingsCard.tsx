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
        <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
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
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono flex items-center justify-between overflow-hidden min-h-[38px]">
              {exportDirectory ? (
                <span className="text-slate-100 truncate" title={exportDirectory}>
                  {exportDirectory}
                </span>
              ) : (
                <span className="text-slate-500 italic">
                  Default System Downloads Folder
                </span>
              )}
              {exportDirectory && (
                <button
                  type="button"
                  onClick={() => setExportDirectory('')}
                  title="Reset to default downloads folder"
                  className="text-slate-400 hover:text-red-400 p-0.5 ml-2 shrink-0 cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleSelectFolder}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-purple-500 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm"
            >
              <FolderOpen className="w-4 h-4 text-purple-400" />
              <span>{exportDirectory ? 'Change' : 'Browse'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
