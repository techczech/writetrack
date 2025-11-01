import React, { useRef } from 'react';
import Button from './ui/Button';
import Card, { CardContent, CardHeader } from './ui/Card';
import { WritingEntry } from '../types';

interface AboutProps {
    onBack: () => void;
    entries: WritingEntry[];
    setEntries: (entries: WritingEntry[]) => void;
}

const About: React.FC<AboutProps> = ({ onBack, entries, setEntries }) => {
    const importInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        if (entries.length === 0) {
            alert("No data to export.");
            return;
        }
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(entries, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        const date = new Date().toISOString().split('T')[0];
        link.download = `writetrack-backup-${date}.json`;
        link.click();
    };

    const handleImportClick = () => {
        importInputRef.current?.click();
    };
    
    const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File could not be read");
                
                const importedEntries = JSON.parse(text);

                if (!Array.isArray(importedEntries)) throw new Error("Invalid format: data is not an array.");
                
                // Optional: add more robust validation here, checking object properties

                if (window.confirm("This will overwrite all your current data. Are you sure you want to proceed?")) {
                    setEntries(importedEntries);
                    alert("Data imported successfully!");
                }
            } catch (error) {
                alert(`Error importing data: ${(error as Error).message}`);
            } finally {
                // Reset file input to allow importing the same file again
                if (event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };


    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">About WriteTrack</h1>
                <Button onClick={onBack} variant="secondary">Back to Dashboard</Button>
            </div>

            <Card>
                <CardContent className="prose dark:prose-invert max-w-none">
                    <h2 className="text-2xl font-semibold">What is WriteTrack?</h2>
                    <p>WriteTrack is a smart application designed to help you track, analyze, and improve your writing habits. Whether you're writing, editing, planning, or researching, WriteTrack provides the tools to log your activities, monitor your progress, and gain AI-powered insights into your work.</p>
                    
                    <h3 className="text-xl font-semibold">Core Features:</h3>
                    <ul>
                        <li><strong>Activity Tracking:</strong> Quickly log any of six core writing-related activities from the dashboard.</li>
                        <li><strong>AI-Powered Titles & Summaries:</strong> Focus on your content and let our AI generate a fitting title for your entry. You can also generate concise summaries and thematic tags to better understand your work.</li>
                        <li><strong>Live Timer:</strong> Track your sessions in real-time with a built-in timer, complete with pause, resume, and full-screen modes. Pause events are automatically logged in your notes!</li>
                        <li><strong>Planning Assistant:</strong> Plan your writing schedule using natural language. Our AI will parse your plan into a structured schedule, which you can then export as an iCal file for your calendar.</li>
                    </ul>
                    
                    <h2 className="text-2xl font-semibold mt-6">Data Storage & Backup</h2>
                    <p>
                        <strong>Your data is stored entirely on your local device within your browser's local storage.</strong> It is not sent to any server. This means your work is private and accessible offline.
                    </p>
                    <p>
                        However, this also means that clearing your browser data will erase your entries. To safeguard your work or move it to another device, please use the export and import features below.
                    </p>
                    
                    <Card className="mt-4 bg-gray-50 dark:bg-gray-700">
                        <CardHeader><h3 className="text-lg font-bold">Manage Your Data</h3></CardHeader>
                        <CardContent className="flex flex-col sm:flex-row gap-4">
                            <Button onClick={handleExport} className="w-full sm:w-auto">Export Data as JSON</Button>
                            <Button onClick={handleImportClick} variant="secondary" className="w-full sm:w-auto">Import Data from JSON</Button>
                            <input
                                type="file"
                                accept=".json"
                                ref={importInputRef}
                                onChange={handleImportFile}
                                className="hidden"
                            />
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </div>
    );
};

export default About;