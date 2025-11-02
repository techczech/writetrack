import React, { useRef, useState } from 'react';
import Button from './ui/Button';
import Card, { CardContent, CardHeader } from './ui/Card';
import { WritingEntry } from '../types';
import { useAuth } from '../hooks/useAuth';

interface DataManagerProps {
    onBack: () => void;
    entries: WritingEntry[];
    setEntries: (value: WritingEntry[] | ((val: WritingEntry[]) => WritingEntry[])) => void;
}

const isWritingEntry = (obj: any): obj is WritingEntry => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'entry_date' in obj &&
        'activity_type' in obj &&
        'content' in obj
    );
};

const DataManager: React.FC<DataManagerProps> = ({ onBack, entries, setEntries }) => {
    const { user } = useAuth();
    const importInputRef = useRef<HTMLInputElement>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleExport = () => {
        setFeedback(null);
        if (entries.length === 0) {
            setFeedback({ type: 'error', message: "No data to export." });
            return;
        }
        try {
            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify(entries, null, 2)
            )}`;
            const link = document.createElement("a");
            link.href = jsonString;
            const date = new Date().toISOString().split('T')[0];
            link.download = `writetrack-backup-${date}.json`;
            link.click();
            setFeedback({ type: 'success', message: `Successfully exported ${entries.length} entries.` });
        } catch (error) {
            setFeedback({ type: 'error', message: `Export failed: ${(error as Error).message}` });
        }
    };

    const handleImportClick = () => {
        setFeedback(null);
        importInputRef.current?.click();
    };
    
    const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (user) {
            setFeedback({ type: 'error', message: "Import is disabled while signed in to prevent data conflicts. Please sign out to import local data." });
            return;
        }

        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File could not be read.");
                
                const importedEntries = JSON.parse(text);

                if (!Array.isArray(importedEntries)) {
                    throw new Error("Invalid format: data is not an array.");
                }

                const areEntriesValid = importedEntries.every(isWritingEntry);
                if (importedEntries.length > 0 && !areEntriesValid) {
                    throw new Error("Invalid format: one or more items in the file are not valid writing entries.");
                }

                setEntries(prevEntries => {
                    const combined = [...prevEntries, ...importedEntries];
                    const uniqueMap = new Map<string, WritingEntry>();
                    for (const entry of combined) {
                        if (!uniqueMap.has(entry.id)) {
                            uniqueMap.set(entry.id, entry);
                        }
                    }
                    const finalEntries = Array.from(uniqueMap.values());
                    const addedCount = finalEntries.length - prevEntries.length;
                    setFeedback({ type: 'success', message: `Import successful. Added ${addedCount} new entries.` });
                    return finalEntries;
                });

            } catch (error) {
                setFeedback({ type: 'error', message: `Error importing data: ${(error as Error).message}` });
            } finally {
                if (event.target) event.target.value = '';
            }
        };
        reader.onerror = () => {
             setFeedback({ type: 'error', message: `Error reading file.` });
        }
        reader.readAsText(file);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Data</h1>
                <Button onClick={onBack} variant="secondary">Back to Dashboard</Button>
            </div>

            <Card>
                <CardHeader><h2 className="text-xl font-bold">Export Your Data</h2></CardHeader>
                <CardContent className="space-y-4">
                    {user && (
                        <p className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm">
                            You are signed in. Your data is automatically backed up and synced to the cloud. You can still export a local JSON copy if you wish.
                        </p>
                    )}
                    <p>
                        Download all your writing entries as a single JSON file. This is useful for creating backups or migrating your data to another device.
                    </p>
                    <Button onClick={handleExport} className="w-full sm:w-auto">
                        Export Data as JSON
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><h2 className="text-xl font-bold">Import Your Data</h2></CardHeader>
                <CardContent className="space-y-4">
                     <p>
                        Importing a file will add its entries to your current data. Entries with duplicate IDs will be ignored. <strong>Import is only available when you are signed out.</strong> This prevents conflicts with your cloud-synced data.
                    </p>
                    <Button onClick={handleImportClick} variant="secondary" className="w-full sm:w-auto" disabled={!!user} title={user ? "Sign out to enable import" : "Import Data from JSON"}>
                        {user ? 'Sign out to Import' : 'Import Data from JSON'}
                    </Button>
                    <input
                        type="file"
                        accept=".json"
                        ref={importInputRef}
                        onChange={handleImportFile}
                        className="hidden"
                        disabled={!!user}
                    />
                </CardContent>
            </Card>

            {feedback && (
                <div className={`p-4 rounded-md text-sm ${
                    feedback.type === 'success' 
                    ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100' 
                    : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100'
                }`}>
                    {feedback.message}
                </div>
            )}
        </div>
    );
};

export default DataManager;