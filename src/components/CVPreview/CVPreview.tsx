import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { ModernTemplate } from './ModernTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import { ClassicTemplate } from './ClassicTemplate';
import { Layout, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { exportCVToPDF } from '../../utils/pdfExport';

export const CVPreview: React.FC = () => {
  const { cvData, activePreset, activeLanguage, selectedTags, activeLayout, setLayout } = useCV();
  const [zoom, setZoom] = useState(100);
  const [isExporting, setIsExporting] = useState(false);
  const [feedbackNotification, setFeedbackNotification] = useState<string | null>(null);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const filename = `${cvData.profile.name.replace(/\s+/g, '_')}_CV_${activeLanguage.toUpperCase()}.pdf`;
      await exportCVToPDF(
        'cv-preview-container',
        filename,
        activePreset.metadata
      );
      setFeedbackNotification(`PDF downloaded: "${filename}" saved to your Downloads folder.`);
      setTimeout(() => setFeedbackNotification(null), 5000);
    } catch (e) {
      console.error("Export PDF failed:", e);
      alert("Error generating PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Preview Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        
        {/* Layout Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-2">
            <Layout className="w-4 h-4 text-sky-400" />
            <span>Layout Style:</span>
          </span>
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setLayout('modern')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeLayout === 'modern' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Modern Executive
            </button>
            <button
              onClick={() => setLayout('minimal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeLayout === 'minimal' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Minimal Tech
            </button>
            <button
              onClick={() => setLayout('classic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeLayout === 'classic' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Classic Corporate
            </button>
          </div>
        </div>

        {/* Zoom Controls & Export Action */}
        <div className="flex items-center gap-3">
          
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs text-slate-300">
            <button
              onClick={() => setZoom(z => Math.max(60, z - 10))}
              className="p-1 hover:text-white transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono">{zoom}%</span>
            <button
              onClick={() => setZoom(z => Math.min(130, z + 10))}
              className="p-1 hover:text-white transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 disabled:opacity-50 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating PDF...' : 'Download PDF with Metadata'}</span>
          </button>

        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackNotification && (
        <div className="bg-sky-950 border border-sky-800 text-sky-200 text-xs p-3 rounded-xl flex items-center justify-between font-medium shadow-md">
          <span>💾 {feedbackNotification}</span>
        </div>
      )}

      {/* Live PDF Paper View */}
      <div className="overflow-x-auto pb-12 pt-2 flex justify-center">
        <div 
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          className="transition-transform duration-150"
        >
          <div id="cv-preview-container">
            {activeLayout === 'modern' && (
              <ModernTemplate 
                data={cvData} 
                language={activeLanguage} 
                selectedTags={selectedTags} 
                preset={activePreset} 
              />
            )}
            {activeLayout === 'minimal' && (
              <MinimalTemplate 
                data={cvData} 
                language={activeLanguage} 
                selectedTags={selectedTags} 
                preset={activePreset} 
              />
            )}
            {activeLayout === 'classic' && (
              <ClassicTemplate 
                data={cvData} 
                language={activeLanguage} 
                selectedTags={selectedTags} 
                preset={activePreset} 
              />
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
