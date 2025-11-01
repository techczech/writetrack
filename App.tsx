import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import EntryEditor from './components/EntryEditor';
import PlanningAssistant from './components/PlanningAssistant';
import About from './components/About';
import { ActivityType, WritingEntry } from './types';
import useLocalStorage from './hooks/useLocalStorage';

type View = 
  | { name: 'dashboard' }
  | { name: 'newEntry'; activityType: ActivityType }
  | { name: 'planningAssistant' }
  | { name: 'about' };

const Header: React.FC<{onViewChange: (view: View) => void}> = ({onViewChange}) => (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
        <button onClick={() => onViewChange({name: 'dashboard'})} className="flex items-center gap-3">
            <svg className="w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">WriteTrack</h1>
        </button>
        <nav className="flex items-center gap-4">
            <button onClick={() => onViewChange({name: 'planningAssistant'})} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Planning Assistant
            </button>
            <button onClick={() => onViewChange({name: 'about'})} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                About
            </button>
        </nav>
    </header>
);

function App() {
  const [view, setView] = useState<View>({ name: 'dashboard' });
  const [entries, setEntries] = useLocalStorage<WritingEntry[]>('writetrack-entries', []);

  const handleNewEntry = (activityType: ActivityType) => {
    setView({ name: 'newEntry', activityType });
  };
  
  const handleSaveEntry = (entry: WritingEntry) => {
    setEntries(prev => [entry, ...prev]);
    setView({ name: 'dashboard' });
  };
  
  const handleCancel = () => {
    setView({ name: 'dashboard' });
  };

  const renderView = () => {
    switch (view.name) {
      case 'dashboard':
        return <Dashboard onNewEntry={handleNewEntry} recentEntries={entries} />;
      case 'newEntry':
        return <EntryEditor activityType={view.activityType} onSave={handleSaveEntry} onCancel={handleCancel} />;
      case 'planningAssistant':
        return <PlanningAssistant onBack={handleCancel}/>;
      case 'about':
        return <About onBack={handleCancel} entries={entries} setEntries={setEntries}/>;
      default:
        return <Dashboard onNewEntry={handleNewEntry} recentEntries={entries} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Header onViewChange={setView}/>
        <main>
            {renderView()}
        </main>
    </div>
  );
}

export default App;