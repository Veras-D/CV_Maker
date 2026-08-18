import React, { useState } from 'react';
import { useCV } from '../context/CVContext';
import { Sparkles, FileText, Kanban, Sliders, Download, DownloadCloud, UploadCloud, CheckCircle2 } from 'lucide-react';
import { exportCVToPDF } from '../utils/pdfExport';
import { ProModal } from './Common/ProModal';

export const Navbar: React.FC = () => {
  const { 
    cvData, 
    activePreset, 
    activeLanguage, 
    selectedTags,
    activeTab, 
    setActiveTab, 
    exportDataJSON,
    importDataJSON
  } = useCV();

  const [isExporting, setIsExporting] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [feedbackNotification, setFeedbackNotification] = useState<string | null>(null);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportCVToPDF({
        elementId: 'tailored-ats-cv-preview',
        filename: `${cvData.profile.name.replace(/\s+/g, '_')}_CV_${activeLanguage.toUpperCase()}`,
        metadata: activePreset.metadata,
        data: cvData,
        language: activeLanguage,
        selectedTags
      });
      const filename = `${cvData.profile.name.replace(/\s+/g, '_')}_CV_${activeLanguage.toUpperCase()}.pdf`;
      setFeedbackNotification(`PDF downloaded: "${filename}" saved to your Downloads folder.`);
      setTimeout(() => setFeedbackNotification(null), 5000);
    } catch (e) {
      console.error("PDF Export error:", e);
      alert("Error generating PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleBackup = () => {
    const filename = exportDataJSON();
    setFeedbackNotification(`Backup downloaded: "${filename}" saved to your Downloads folder.`);
    setTimeout(() => setFeedbackNotification(null), 5000);
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
            setFeedbackNotification(`Database restored successfully from "${file.name}"!`);
            setTimeout(() => setFeedbackNotification(null), 5000);
          } else {
            alert("Invalid JSON backup file format.");
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="bg-slate-950 border-b border-slate-800/80 text-slate-100 w-full relative">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between gap-3">
        
        {/* Left: Brand Icon */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded bg-sky-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            CV
          </div>
        </div>

        {/* Center: Unified Workspace Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('tailor')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'tailor' 
                ? 'bg-sky-600 text-white shadow-sm font-semibold' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>

          <button
            onClick={() => setActiveTab('metadata')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'metadata' 
                ? 'bg-sky-600 text-white shadow-sm font-semibold' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Right Tools */}
        <div className="flex items-center gap-2 shrink-0">

          <button
            onClick={handleBackup}
            title="Backup Master Data to JSON file"
            className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-900 rounded-lg transition-colors hidden md:block"
          >
            <DownloadCloud className="w-4 h-4" />
          </button>

          <label
            title="Restore Master Data from JSON file"
            className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer hidden md:block"
          >
            <UploadCloud className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
          </button>

        </div>
      </div>

      {/* Feedback Banner Notification */}
      {feedbackNotification && (
        <div className="bg-sky-950 border-b border-sky-800 text-sky-200 text-xs px-4 py-1.5 flex items-center justify-between font-medium shadow-inner animate-in fade-in duration-200">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{feedbackNotification}</span>
          </div>
          <button onClick={() => setFeedbackNotification(null)} className="text-sky-300 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      <ProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        featureName="Pro Features"
      />
    </header>
  );
};
