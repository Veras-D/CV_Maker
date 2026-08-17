import React, { useState } from 'react';
import { useCV } from '../context/CVContext';
import { 
  FileText, 
  Eye, 
  Kanban, 
  FileCheck, 
  Download, 
  Plus, 
  Languages, 
  Sliders, 
  DownloadCloud, 
  UploadCloud, 
  RotateCcw,
  Palette,
  Check
} from 'lucide-react';
import { exportCVToPDF } from '../utils/pdfExport';

export const Navbar: React.FC = () => {
  const { 
    cvData, 
    activePreset, 
    activeLanguage, 
    activeTab, 
    setActiveTab, 
    selectPreset, 
    createPreset, 
    setLanguage,
    setAccentColor,
    exportDataJSON,
    importDataJSON,
    resetToDefaultData
  } = useCV();

  const [isExporting, setIsExporting] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');

  const colorOptions = [
    { name: 'Sky Blue', hex: '#0284c7' },
    { name: 'Emerald', hex: '#0d9488' },
    { name: 'Royal Blue', hex: '#2563eb' },
    { name: 'Purple', hex: '#7c3aed' },
    { name: 'Slate Gray', hex: '#475569' },
    { name: 'Rose', hex: '#e11d48' }
  ];

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Ensure we target the visible cv-preview container
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
            alert("CV data restored successfully!");
          } else {
            alert("Invalid JSON data file.");
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCreatePresetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPresetName.trim()) {
      createPreset(newPresetName.trim(), newPresetDesc.trim());
      setNewPresetName('');
      setNewPresetDesc('');
      setShowPresetModal(false);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-sky-500/20">
            CV
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg text-white leading-tight flex items-center gap-2">
              CV Studio <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-mono font-medium border border-sky-500/30">Tauri TS</span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">Tailored Resume Engine & Job Application Kanban</p>
          </div>
        </div>

        {/* Main Tab Switcher */}
        <nav className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'editor' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden md:inline">Data Editor</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'preview' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="hidden md:inline">Live Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'kanban' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span className="hidden md:inline">Role Kanban</span>
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'metadata' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span className="hidden md:inline">PDF Metadata</span>
          </button>
        </nav>

        {/* Right Tools & Actions */}
        <div className="flex items-center gap-2.5">
          
          {/* Preset Picker */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={cvData.activePresetId}
              onChange={(e) => selectPreset(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none font-medium"
            >
              {cvData.presets.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowPresetModal(true)}
              title="Save current filters & settings as new preset"
              className="text-slate-400 hover:text-sky-400 p-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                activeLanguage === 'en' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ENG
            </button>
            <button
              onClick={() => setLanguage('cs')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                activeLanguage === 'cs' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CZ
            </button>
          </div>

          {/* Color Palette Accent Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <Palette className="w-3.5 h-3.5 text-slate-400 ml-1 mr-1" />
            {colorOptions.map(c => (
              <button
                key={c.hex}
                onClick={() => setAccentColor(c.hex)}
                style={{ backgroundColor: c.hex }}
                className="w-4 h-4 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                title={c.name}
              >
                {activePreset.accentColor === c.hex && (
                  <Check className="w-2.5 h-2.5 text-white" />
                )}
              </button>
            ))}
          </div>

          {/* Backup / Restore Controls */}
          <div className="hidden xl:flex items-center gap-1 border-l border-slate-800 pl-2">
            <button
              onClick={exportDataJSON}
              title="Backup JSON Data"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <DownloadCloud className="w-4 h-4" />
            </button>
            <label
              title="Restore JSON Data"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              onClick={() => {
                if (confirm("Reset profile data to original defaults?")) {
                  resetToDefaultData();
                }
              }}
              title="Reset Data to Initial PDF/GitHub state"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* PDF Export Action */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-3.5 py-1.5 rounded-lg font-medium text-xs sm:text-sm shadow-md shadow-sky-500/20 disabled:opacity-50 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
          </button>

        </div>
      </div>

      {/* Preset Modal */}
      {showPresetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Create New Role Preset</h3>
            <p className="text-xs text-slate-400 mb-4">
              Save your current tag filters, language preference ({activeLanguage.toUpperCase()}), layout, and metadata settings for quick selection when applying for target roles.
            </p>
            <form onSubmit={handleCreatePresetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Preset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior DevOps Specialist"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
                <textarea
                  placeholder="Target roles or requirements summary..."
                  value={newPresetDesc}
                  onChange={(e) => setNewPresetDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPresetModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
