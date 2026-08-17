import React, { useState } from 'react';
import { useCV } from '../context/CVContext';
import { Sparkles, FileText, Kanban, Sliders, Download, Globe, DownloadCloud, UploadCloud, RotateCcw } from 'lucide-react';
import { exportCVToPDF } from '../utils/pdfExport';

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

  const availableLanguages = [
    { code: 'cs', label: 'Čeština (CS)' },
    { code: 'en', label: 'English (EN)' },
    { code: 'de', label: 'Deutsch (DE)' },
    { code: 'fr', label: 'Français (FR)' },
    { code: 'es', label: 'Español (ES)' },
    { code: 'pt', label: 'Português (PT)' }
  ];

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportCVToPDF(
        'cv-preview-container',
        `${cvData.profile.name.replace(/\s+/g, '_')}_CV_${activeLanguage.toUpperCase()}`,
        activePreset.metadata
      );
    } catch (e) {
      console.error("PDF Export error:", e);
      alert("Error generating PDF. Please make sure the preview tab is loaded.");
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
        
        {/* Brand Title */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-sm shadow">
            CV
          </div>
          <span className="font-bold text-sm text-white tracking-tight hidden sm:inline">
            CV Studio & Role Kanban
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-lg border border-slate-750">
          <button
            onClick={() => setActiveTab('tailor')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
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
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
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
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
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
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
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
          
          {/* Target Language Dropdown */}
          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={activeLanguage}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none font-medium cursor-pointer"
            >
              {availableLanguages.map(l => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-slate-200">
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Backup / Restore */}
          <button
            onClick={exportDataJSON}
            title="Backup JSON Data"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors hidden md:block"
          >
            <DownloadCloud className="w-4 h-4" />
          </button>
          <label
            title="Restore JSON Data"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer hidden md:block"
          >
            <UploadCloud className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
          <button
            onClick={() => {
              if (confirm("Reset data to original profile defaults?")) {
                resetToDefaultData();
              }
            }}
            title="Reset Data"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors hidden md:block"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Download PDF Action */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg font-medium text-xs shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
          </button>

        </div>
      </div>
    </header>
  );
};
