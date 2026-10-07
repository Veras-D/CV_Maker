import React from 'react';
import { useCV } from '../../context/CVContext';
import { Layout, FolderOpen, Info, Check } from 'lucide-react';
import { CustomSelect, SelectOption } from '../Common/CustomSelect';

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
      const windowObj = window as unknown as {
        showDirectoryPicker?: () => Promise<{ name: string }>;
      };
      if (typeof windowObj.showDirectoryPicker === 'function') {
        const dirHandle = await windowObj.showDirectoryPicker();
        if (dirHandle && dirHandle.name) {
          setExportDirectory(dirHandle.name);
        }
      } else {
        alert('Directory picker is not supported in this browser. Please type or paste your folder path directly.');
      }
    } catch {
      // User cancelled picker
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
          <Layout className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Document Layout & Page Budget</h2>
          <p className="text-xs text-slate-400">
            Configure how the AI Tailoring engine budgets physical space and where files are saved.
          </p>
        </div>
      </div>

      <div className="bg-slate-850 p-4 rounded-xl border border-slate-750 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-purple-400">
          <Info className="w-4 h-4" />
          <span>ATS 1-Page Rule & Space Budgeting</span>
        </div>
        <p>
          When set to 1 Page, the Local AI Tailor computes physical millimeter heights matching jsPDF. If your career history would overflow onto page 2, the engine prioritizes your most recent and role-relevant experiences, keeping at least 2 bullets per role and preserving your best project.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Target Page Limit
          </label>
          <CustomSelect
            options={PAGE_LIMIT_OPTIONS}
            value={String(targetMaxPages)}
            onChange={(val) => setTargetMaxPages(Number(val))}
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Default is 1 page. The trimmer only activates if your content would spill over.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
            <span>Download Destination Directory</span>
            <span className="text-[10px] text-slate-400">Optional</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. /home/user/Documents/CVs or C:\Resumes"
              value={exportDirectory}
              onChange={(e) => setExportDirectory(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 font-mono text-xs"
            />
            <button
              type="button"
              onClick={handleSelectFolder}
              title="Browse for folder"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FolderOpen className="w-4 h-4 text-purple-400" />
              <span>Browse</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {exportDirectory 
              ? `Files will be saved to: "${exportDirectory}"` 
              : 'Leave empty to save into your default browser/system Downloads folder.'}
          </p>
        </div>
      </div>

      <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
        <Check className="w-4 h-4" />
        <span>Settings are automatically persisted to local preferences.</span>
      </div>
    </div>
  );
};
