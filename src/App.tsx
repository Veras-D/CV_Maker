import React from 'react';
import { CVProvider, useCV } from './context/CVContext';
import { Navbar } from './components/Navbar';
import { CVEditor } from './components/CVEditor/CVEditor';
import { CVPreview } from './components/CVPreview/CVPreview';
import { KanbanBoard } from './components/Kanban/KanbanBoard';
import { MetadataEditor } from './components/MetadataEditor';
import { AIRoleTailor } from './components/AIFeatures/AIRoleTailor';

const AppContent: React.FC = () => {
  const { activeTab } = useCV();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1 pb-16">
        {activeTab === 'editor' && <CVEditor />}
        {activeTab === 'preview' && <CVPreview />}
        {activeTab === 'kanban' && <KanbanBoard />}
        {activeTab === 'metadata' && <MetadataEditor />}
      </main>

      {/* Floating AI Auto-Tailor Action Button */}
      {activeTab !== 'kanban' && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => {
              // Switch tab or trigger modal
            }}
            className="hidden shadow-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white p-3.5 rounded-full font-bold text-sm flex items-center gap-2 border border-sky-400/40"
          >
            <span>AI Tailor</span>
          </button>
        </div>
      )}

      {/* Sub-view switcher for AI Role Tailoring inside preview/editor if needed */}
      {activeTab === 'editor' && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-12">
          <AIRoleTailor />
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <CVProvider>
      <AppContent />
    </CVProvider>
  );
}

export default App;
