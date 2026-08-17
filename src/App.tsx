import React from 'react';
import { CVProvider, useCV } from './context/CVContext';
import { Navbar } from './components/Navbar';
import { AIRoleTailor } from './components/AIFeatures/AIRoleTailor';
import { CVEditor } from './components/CVEditor/CVEditor';
import { KanbanBoard } from './components/Kanban/KanbanBoard';
import { MetadataEditor } from './components/MetadataEditor';

const AppContent: React.FC = () => {
  const { activeTab } = useCV();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1 pb-12">
        {activeTab === 'tailor' && <AIRoleTailor />}
        {activeTab === 'editor' && <CVEditor />}
        {activeTab === 'kanban' && <KanbanBoard />}
        {activeTab === 'metadata' && <MetadataEditor />}
      </main>
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
