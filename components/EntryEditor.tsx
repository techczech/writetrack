import React, { useState, useEffect, useCallback } from 'react';
import { ActivityType, EntryStatus, WritingEntry } from '../types';
import { ACTIVITY_TYPES, SettingsIcon } from '../constants';
import Button from './ui/Button';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Select from './ui/Select';
import Badge from './ui/Badge';
import { generateEntrySummary, generateEntryTitle } from '../services/geminiService';
import { useDebounce } from '../hooks/useDebounce';
import Card, { CardContent, CardHeader } from './ui/Card';
import Timer from './ui/Timer';
import useTimerSettings from '../hooks/useTimerSettings';

interface EntryEditorProps {
  activityType?: ActivityType;
  entryToEdit?: WritingEntry;
  onSave: (entry: WritingEntry) => void;
  onCancel: () => void;
}

const getWritingTypeDefaults = (activityType: ActivityType): { default: string; options: string[] } => {
    switch (activityType) {
      case ActivityType.Writing:
        return { default: 'Writing', options: ['Writing', 'Fiction', 'Non-Fiction', 'Journaling', 'Other'] };
      case ActivityType.Editing:
        return { default: 'Editing', options: ['Editing', 'Proofreading', 'Line Editing', 'Other'] };
      case ActivityType.Planning:
        return { default: 'Outlining', options: ['Outlining', 'Brainstorming', 'Mind Mapping', 'Other'] };
      case ActivityType.Review:
        return { default: 'Process Review', options: ['Process Review', 'Feedback Analysis', 'Other'] };
      case ActivityType.Research:
        return { default: 'Reading/Research', options: ['Reading/Research', 'Note Taking', 'Other'] };
      case ActivityType.Setup:
        return { default: 'Tool Setup', options: ['Tool Setup', 'Workflow Design', 'Other'] };
      default:
        return { default: 'Other', options: ['Other'] };
    }
  };

const EntryEditor: React.FC<EntryEditorProps> = ({ activityType, entryToEdit, onSave, onCancel }) => {
  const isEditing = !!entryToEdit;
  const initialActivityType = entryToEdit?.activity_type || activityType!;
  
  const { options: writingTypeOptions } = getWritingTypeDefaults(initialActivityType);

  const createInitialState = (): WritingEntry => {
    if (isEditing && entryToEdit) {
        return { ...entryToEdit };
    }
    const { default: defaultWritingType } = getWritingTypeDefaults(activityType!);
    return {
        id: '', // Will be set on save
        entry_date: new Date().toISOString(),
        activity_type: activityType!,
        writing_type: defaultWritingType,
        status: EntryStatus.Completed,
        title: '',
        content: '',
        notes: '',
        word_count: 0,
        time_spent_minutes: 0,
        tags: [],
        ai_summary: '',
        ai_themes: [],
    };
  };

  const [entry, setEntry] = useState<WritingEntry>(createInitialState());
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [timeInputMode, setTimeInputMode] = useState<'timer' | 'manual'>('timer');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [timerSettings, setTimerSettings] = useTimerSettings();

  const calculateWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const debouncedContent = useDebounce(entry.content, 500);

  useEffect(() => {
    setEntry(prev => ({ ...prev, word_count: calculateWordCount(debouncedContent) }));
  }, [debouncedContent]);
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEntry(prev => ({...prev, time_spent_minutes: parseInt(e.target.value, 10) || 0 }));
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    const { summary, themes, suggested_tags } = await generateEntrySummary(entry);
    setEntry(prev => ({
      ...prev,
      ai_summary: summary,
      ai_themes: themes,
      tags: [...new Set([...prev.tags, ...suggested_tags])] // Merge and remove duplicates
    }));
    setIsGeneratingSummary(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !entry.content) return;

    setIsSaving(true);
    
    if (isEditing) {
        onSave(entry);
    } else {
        const generatedTitle = await generateEntryTitle(entry.content, entry.activity_type);
        onSave({ ...entry, title: generatedTitle, id: new Date().toISOString() });
    }
  };
  
  const activityInfo = ACTIVITY_TYPES[initialActivityType];

  const handleTimerStop = (minutes: number) => {
    setEntry(prev => ({ ...prev, time_spent_minutes: minutes }));
    setTimeInputMode('manual'); // Switch to manual so user can see/edit the result
  };
  
  const addLogToNotes = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const log = `\n[${timestamp}] ${message}`;
    setEntry(prev => ({...prev, notes: prev.notes + log}));
  };

  const handleTimerPause = () => {
    addLogToNotes('Timer paused.');
  };
  
  const handleTimerResume = () => {
    addLogToNotes('Timer resumed.');
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Badge colorClass={activityInfo.color} className="text-lg">{initialActivityType}</Badge>
            <h1 className="text-2xl md:text-4xl font-bold mt-2">{isEditing ? 'Edit Entry' : 'New Entry'}</h1>
            {!isEditing && (
                <p className="text-sm text-gray-500 dark:text-gray-400">A title will be generated automatically based on the content when you save.</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={isSaving || !entry.content}>
              {isSaving 
                ? (isEditing ? 'Updating...' : 'Saving...') 
                : (isEditing ? 'Update Entry' : 'Save Entry')}
            </Button>
          </div>
        </header>

        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">Time Tracking</h3>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setIsSettingsOpen(true)} className="p-1 h-auto" aria-label="Timer Settings">
                            <SettingsIcon className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                        <label>Manual</label>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={timeInputMode === 'timer'}
                            onClick={() => setTimeInputMode(timeInputMode === 'manual' ? 'timer' : 'manual')}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors ${timeInputMode === 'timer' ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'}`}
                        >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${timeInputMode === 'timer' ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <label>Timer</label>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {timeInputMode === 'manual' ? (
                <div>
                    <label className="block text-sm font-medium mb-1">Time Spent (minutes)</label>
                    <Input
                    type="number"
                    name="time_spent_minutes"
                    value={entry.time_spent_minutes}
                    onChange={handleTimeChange}
                    />
                </div>
                ) : (
                <Timer
                    onStop={handleTimerStop}
                    onPause={handleTimerPause}
                    onResume={handleTimerResume}
                    initialDuration={!isEditing ? timerSettings[initialActivityType] : undefined}
                />
                )}
            </CardContent>
        </Card>

        {isEditing && (
            <Card>
                <CardContent>
                    <label htmlFor="title-input" className="block text-sm font-medium mb-1">Title</label>
                    <Input id="title-input" name="title" value={entry.title} onChange={handleInputChange} />
                </CardContent>
            </Card>
        )}

        <Card>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <Select name="status" value={entry.status} onChange={handleInputChange}>
                        {Object.values(EntryStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Writing Type</label>
                    <Select name="writing_type" value={entry.writing_type} onChange={handleInputChange}>
                        {writingTypeOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <Input type="datetime-local" name="entry_date" value={entry.entry_date.substring(0, 16)} onChange={handleInputChange} />
                </div>
            </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Content</h3>
                            <span className="text-sm text-gray-500">{entry.word_count} words</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            name="content"
                            value={entry.content}
                            onChange={handleInputChange}
                            placeholder="Start writing..."
                            rows={15}
                            className="text-base"
                        />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Process Notes</h3>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            name="notes"
                            value={entry.notes}
                            onChange={handleInputChange}
                            placeholder="Add notes about your process..."
                            rows={8}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-1 space-y-4">
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">AI Insights</h3>
                    </CardHeader>
                    <CardContent>
                        <Button type="button" onClick={handleGenerateSummary} disabled={isGeneratingSummary || !entry.content} className="w-full">
                            {isGeneratingSummary ? 'Generating...' : 'Generate AI Summary'}
                        </Button>
                        {entry.ai_summary && (
                            <div className="mt-4 space-y-2 text-sm">
                                <h4 className="font-bold">Summary:</h4>
                                <p className="text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded">{entry.ai_summary}</p>
                                {entry.ai_themes && entry.ai_themes.length > 0 && (
                                  <>
                                    <h4 className="font-bold">Themes:</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {entry.ai_themes.map(theme => <Badge key={theme} colorClass="bg-purple-500">{theme}</Badge>)}
                                    </div>
                                  </>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                         <h3 className="text-lg font-semibold">Tags</h3>
                    </CardHeader>
                    <CardContent>
                        <Input 
                          placeholder="Add tags, separated by commas"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value) {
                                e.preventDefault();
                                const newTags = e.currentTarget.value.split(',').map(t => t.trim()).filter(Boolean);
                                setEntry(prev => ({...prev, tags: [...new Set([...prev.tags, ...newTags])]}));
                                e.currentTarget.value = '';
                            }
                          }}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {entry.tags.map(tag => (
                                <Badge key={tag} colorClass="bg-green-500" className="cursor-pointer" onClick={() => {
                                    setEntry(prev => ({...prev, tags: prev.tags.filter(t => t !== tag)}));
                                }}>
                                    {tag} &times;
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </form>

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Default Timer Durations</h2>
                        <Button variant="ghost" onClick={() => setIsSettingsOpen(false)} aria-label="Close Settings">X</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Set a default work duration (in minutes) for each activity. This will be automatically set as a goal when you start a new entry.</p>
                    {Object.values(ActivityType).map(type => (
                        <div key={type} className="flex items-center justify-between gap-4">
                            <label htmlFor={`timer-default-${type}`} className="font-medium">{type}</label>
                            <Input
                                id={`timer-default-${type}`}
                                type="number"
                                className="w-28"
                                placeholder="Minutes"
                                min="0"
                                value={timerSettings[type] ?? ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setTimerSettings(prev => {
                                        const newSettings = { ...prev };
                                        if (value === '') {
                                            delete newSettings[type];
                                        } else {
                                            const numValue = parseInt(value, 10);
                                            if (!isNaN(numValue) && numValue >= 0) {
                                                newSettings[type] = numValue;
                                            }
                                        }
                                        return newSettings;
                                    });
                                }}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )}
    </div>
  );
};

export default EntryEditor;