import React, { useState } from 'react';
import { useCV } from '../context/CVContext';
import { Sparkles, FileText, Kanban, Sliders, Download, Globe, DownloadCloud, UploadCloud, RotateCcw } from 'lucide-react';
import { exportCVToPDF } from '../utils/pdfExport';
import { CustomSelect, SelectOption } from './Common/CustomSelect';
import { ProModal } from './Common/ProModal';

export const Navbar: React.FC = () => {
  const { 
    cvData, 
    activePreset, 
    activeLanguage, 
    activeTab, 
    setActiveTab, 
    setLanguage,
    exportDataJSON,
    importDataJSON,
    resetToDefaultData
  } = useCV();

  const [isExporting, setIsExporting] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [proFeatureName, setProFeatureName] = useState('');

  const languageOptions: SelectOption[] = [
    { value: 'en', label: 'English (EN)' },
    { value: 'cs', label: 'Čeština (CS)', isPro: true },
    { value: 'de', label: 'Deutsch (DE)', isPro: true },
    { value: 'fr', label: 'Français (FR)', isPro: true },
    { value: 'es', label: 'Español (ES)', isPro: true },
    { value: 'pt', label: 'Português (PT)', isPro: true }
  ];

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportCVToPDF(
        'tailored-ats-cv-preview',
        `${cvData.profile.name.replace(/\s+/g, '_')}_CV_${activeLanguage.toUpperCase()}`,
        activePreset.metadata
      );
    } catch (e) {
      console.error("PDF Export error:", e);
      alert("Error generating PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const success = importDataJSON(content);
          if (success) {
            alert("Data imported successfully!");
          } else {
            alert("Invalid JSON format.");
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded bg-sky-600 flex items-center justify-center text-white font-bold text-xs shadow">
            CV
          </div>
          <span className="font-bold text-xs sm:text-sm text-white tracking-tight hidden sm:inline">
            CV Studio & Kanban
          </span>
        </div>

        {/* Responsive Tab Switcher */}
        <nav className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-lg border border-slate-750 overflow-x-auto">
          <button
            onClick={() => setActiveTab('tailor')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'tailor' 
                ? 'bg-sky-600 text-white shadow-sm font-semibold' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Role AI Tailor</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'editor' 
                ? 'bg-sky-600 text-white shadow-sm font-semibold' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Master Resume</span>
          </button>

          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'kanban' 
                ? 'bg-sky-600 text-white shadow-sm font-semibold' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>

          <button
            onClick={() => setActiveTab('metadata')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'metadata' 
                ? 'bg-sky-600 text-white shadow-sm font-semibold' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>PDF Settings</span>
          </button>
        </nav>

        {/* Right Tools */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Custom Styled Language Dropdown with PRO locks */}
          <div className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <CustomSelect
              options={languageOptions}
              value={activeLanguage}
              onChange={(val) => setLanguage(val)}
              onProClick={(val) => {
                const opt = languageOptions.find(o => o.value === val);
                setProFeatureName(`Export in ${opt?.label || val}`);
                setIsProModalOpen(true);
              }}
            />
          </div>

          {/* Backup / Restore */}
          <button
            onClick={exportDataJSON}
            title="Backup JSON Data"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors hidden md:block"
          >
            <DownloadCloud className="w-3.5 h-3.5" />
          </button>
          <label
            title="Restore JSON Data"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer hidden md:block"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-1 bg-sky-600 hover:bg-sky-500 text-white px-2.5 py-1 rounded text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
          </button>

        </div>
      </div>

      {/* Pro Upgrade Modal */}
      <ProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        featureName={proFeatureName}
      />
    </header>
  );
};
