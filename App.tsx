import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import EntryEditor from './components/EntryEditor';
import PlanningAssistant from './components/PlanningAssistant';
import About from './components/About';
import DataManager from './components/DataManager';
import { ActivityType, WritingEntry, View } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { useAuth } from './hooks/useAuth';
import { db, auth, provider } from './services/firebase';
import { collection, onSnapshot, doc, addDoc, updateDoc, writeBatch, query, orderBy } from 'firebase/firestore';
import { signInWithPopup, signOut } from 'firebase/auth';
import Button from './components/ui/Button';

const Header: React.FC<{onViewChange: (view: View) => void, onSignIn: () => void, onSignOut: () => void, isAuthEnabled: boolean}> = ({onViewChange, onSignIn, onSignOut, isAuthEnabled}) => {
    const { user } = useAuth();
    return (
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
            <button onClick={() => onViewChange({name: 'dashboard'})} className="flex items-center gap-3">
                <svg className="w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">WriteTrack</h1>
            </button>
            <div className="flex items-center gap-4">
                <nav className="hidden sm:flex items-center gap-4">
                    <button onClick={() => onViewChange({name: 'dashboard'})} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        Dashboard
                    </button>
                    <button onClick={() => onViewChange({name: 'planningAssistant'})} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        Planning Assistant
                    </button>
                    <button onClick={() => onViewChange({name: 'dataManager'})} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        Manage Data
                    </button>
                    <button onClick={() => onViewChange({name: 'about'})} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        About
                    </button>
                </nav>
                 {user ? (
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm hidden md:inline">{user.displayName}</span>
                        <Button onClick={onSignOut} variant="secondary" size="sm">Sign Out</Button>
                    </div>
                ) : (
                    <Button onClick={onSignIn} size="sm" disabled={!isAuthEnabled} title={!isAuthEnabled ? "Cloud features are not configured" : "Sign in with Google"}>
                        {isAuthEnabled ? 'Sign in with Google' : 'Cloud Sync Disabled'}
                    </Button>
                )}
            </div>
        </header>
    );
};

const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        <p className="absolute text-lg">Loading WriteTrack...</p>
    </div>
);


function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>({ name: 'dashboard' });
  const [localEntries, setLocalEntries] = useLocalStorage<WritingEntry[]>('writetrack-entries', []);
  const [activeEntries, setActiveEntries] = useState<WritingEntry[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);

  const migrateData = useCallback(async (uid: string) => {
    if (localEntries.length === 0 || !db) return;
    setIsMigrating(true);
    try {
      const batch = writeBatch(db);
      const entriesCollectionRef = collection(db, 'users', uid, 'entries');
      localEntries.forEach(entry => {
        const docRef = doc(entriesCollectionRef, entry.id); // Use existing ID to prevent duplicates
        batch.set(docRef, entry);
      });
      await batch.commit();
      alert(`Successfully migrated ${localEntries.length} entries to your account.`);
      setLocalEntries([]); // Clear local data after successful migration
    } catch (error) {
      console.error("Migration failed: ", error);
      alert("Data migration failed. Your local data has not been changed. Please try again.");
    } finally {
      setIsMigrating(false);
    }
  }, [localEntries, setLocalEntries]);

  useEffect(() => {
    if (loading || isMigrating) return;

    if (user && db) {
      if (localEntries.length > 0) {
        if (window.confirm("You have local data on this device. Would you like to move it to your account? This will sync it across all your devices.")) {
          migrateData(user.uid);
        }
      }
      const q = query(collection(db, "users", user.uid, "entries"), orderBy("entry_date", "desc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const firestoreEntries: WritingEntry[] = [];
        querySnapshot.forEach((doc) => {
          firestoreEntries.push({ id: doc.id, ...doc.data() } as WritingEntry);
        });
        setActiveEntries(firestoreEntries);
      }, (error) => {
        console.error("Error fetching Firestore data:", error);
        alert("Could not connect to the database. Please check your connection or Firebase setup.");
      });
      return () => unsubscribe();
    } else {
      setActiveEntries(localEntries);
    }
  }, [user, loading, localEntries, migrateData, isMigrating]);
  
  const handleSignIn = async () => {
    if (!auth || !provider) {
        alert("Firebase is not configured, so sign-in is disabled. Please check the console for more information.");
        return;
    }
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in:", error);
      alert("There was an error during sign-in. Please try again.");
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    setView({ name: 'dashboard' }); // Return to dashboard on sign out
  };

  const handleNewEntry = (activityType: ActivityType) => {
    setView({ name: 'newEntry', activityType });
  };
  
  const handleEditEntry = (entry: WritingEntry) => {
    setView({ name: 'editEntry', entry });
  };

  const handleSaveEntry = async (entryToSave: WritingEntry) => {
    const isNew = !activeEntries.some(e => e.id === entryToSave.id);

    if (user && db) {
        try {
            if (isNew) {
                // For new entries in cloud mode, we let Firestore generate the ID.
                const { id, ...dataToSave } = entryToSave;
                await addDoc(collection(db, 'users', user.uid, 'entries'), dataToSave);
            } else {
                const docRef = doc(db, 'users', user.uid, 'entries', entryToSave.id);
                await updateDoc(docRef, entryToSave);
            }
        } catch(error) {
             console.error("Error saving to Firestore:", error);
             alert("There was an error saving your entry. Please try again.");
        }
    } else {
      setLocalEntries(prev => {
        if (isNew) {
          return [entryToSave, ...prev].sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());
        } else {
          const index = prev.findIndex(e => e.id === entryToSave.id);
          const newEntries = [...prev];
          newEntries[index] = entryToSave;
          return newEntries;
        }
      });
    }
    setView({ name: 'dashboard' });
  };
  
  const handleCancel = () => {
    setView({ name: 'dashboard' });
  };

  const renderView = () => {
    switch (view.name) {
      case 'dashboard':
        return <Dashboard onNewEntry={handleNewEntry} entries={activeEntries} onEditEntry={handleEditEntry} />;
      case 'newEntry':
        return <EntryEditor activityType={view.activityType} onSave={handleSaveEntry} onCancel={handleCancel} />;
      case 'editEntry':
        return <EntryEditor entryToEdit={view.entry} onSave={handleSaveEntry} onCancel={handleCancel} />;
      case 'planningAssistant':
        return <PlanningAssistant onBack={handleCancel}/>;
      case 'about':
        return <About onBack={handleCancel} />;
      case 'dataManager':
        return <DataManager onBack={handleCancel} entries={activeEntries} setEntries={user ? () => {} : setLocalEntries}/>;
      default:
        return <Dashboard onNewEntry={handleNewEntry} entries={activeEntries} onEditEntry={handleEditEntry} />;
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Header onViewChange={setView} onSignIn={handleSignIn} onSignOut={handleSignOut} isAuthEnabled={!!auth} />
        <main>
            {renderView()}
        </main>
    </div>
  );
}

export default App;