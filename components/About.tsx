import React from 'react';
import Button from './ui/Button';
import Card, { CardContent } from './ui/Card';

interface AboutProps {
    onBack: () => void;
}

const About: React.FC<AboutProps> = ({ onBack }) => {
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
                        <li><strong>Cloud Sync (Optional):</strong> Sign in with your Google account to securely save and sync your data across all your devices.</li>
                    </ul>
                    
                    <h2 className="text-2xl font-semibold mt-6">Data Storage & Your Privacy</h2>
                    <p>
                        WriteTrack offers two ways to store your data, putting you in control:
                    </p>
                    <p>
                        <strong>1. Local-Only Mode (Default):</strong> By default, your data is stored entirely on your device within your browser's local storage. It is never sent to any server, ensuring complete privacy and offline access.
                    </p>
                    <p>
                        <strong>2. Cloud Sync Mode (Optional):</strong> If you choose to sign in with your Google account, your data will be securely stored in your own private cloud database (Google Cloud Firestore). This allows you to access and sync your entries across multiple devices. Your data remains yours, protected by Google's security and accessible only to you.
                    </p>
                     <p>
                        To safeguard your work, especially in local-only mode, please use the import and export features on the "Manage Data" page.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default About;