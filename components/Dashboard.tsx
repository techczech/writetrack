import React, { useMemo, useState } from 'react';
import { ActivityType, WritingEntry } from '../types';
import { ACTIVITY_TYPES } from '../constants';
import Card, { CardContent, CardHeader } from './ui/Card';
import CalendarView from './CalendarView';

interface DashboardProps {
  onNewEntry: (activityType: ActivityType) => void;
  entries: WritingEntry[];
  onEditEntry: (entry: WritingEntry) => void;
}

const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const formatDateHeader = (date: Date, prefix: string): string => {
    if (isSameDay(date, new Date())) {
        return `${prefix} Today`;
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameDay(date, yesterday)) {
        return `${prefix} Yesterday`;
    }
    return `${prefix} on ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};


const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <Card>
        <CardContent className="flex items-center p-4">
            <div className="p-3 mr-4 text-blue-500 bg-blue-100 dark:bg-blue-900 rounded-full">{icon}</div>
            <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                <p className="text-lg font-semibold">{value}</p>
            </div>
        </CardContent>
    </Card>
);

const ActivityButton: React.FC<{ activity: ActivityType; onClick: () => void }> = ({ activity, onClick }) => {
  const { color, icon: Icon, hoverColor } = ACTIVITY_TYPES[activity];
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-6 text-white rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200 ${color} ${hoverColor}`}
    >
      <Icon className="w-10 h-10 mb-2" />
      <span className="font-semibold text-center">{activity}</span>
    </button>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ onNewEntry, entries, onEditEntry }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const entriesForSelectedDate = useMemo(() => {
        return entries.filter(entry => isSameDay(new Date(entry.entry_date), selectedDate));
    }, [entries, selectedDate]);

    const totalWords = entriesForSelectedDate.reduce((sum, e) => sum + (e.word_count || 0), 0);
    
    const writingTime = entriesForSelectedDate
        .filter(e => e.activity_type === ActivityType.Writing || e.activity_type === ActivityType.Editing)
        .reduce((sum, e) => sum + e.time_spent_minutes, 0);

    const otherTime = entriesForSelectedDate
        .filter(e => e.activity_type !== ActivityType.Writing && e.activity_type !== ActivityType.Editing)
        .reduce((sum, e) => sum + e.time_spent_minutes, 0);

    const weeklyStats = useMemo(() => {
        const today = new Date();
        const weekStart = getWeekStart(today);
        
        const weekEntries = entries.filter(entry => {
            const entryDate = new Date(entry.entry_date);
            return entryDate >= weekStart && entryDate <= today;
        });

        const totalWords = weekEntries.reduce((sum, e) => sum + (e.word_count || 0), 0);
        const totalTime = weekEntries.reduce((sum, e) => sum + e.time_spent_minutes, 0);
        const totalSessions = weekEntries.length;

        const todayDayOfWeek = today.getDay(); // 0 for Sunday, 6 for Saturday
        const dayOfWeekMondayBased = todayDayOfWeek === 0 ? 7 : todayDayOfWeek;
        const daysRemaining = 7 - dayOfWeekMondayBased;

        return { totalWords, totalTime, totalSessions, daysRemaining };
    }, [entries]);


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.values(ActivityType).map((type) => (
          <ActivityButton key={type} activity={type} onClick={() => onNewEntry(type)} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
           <CalendarView entries={entries} selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </div>
        <div className="lg:col-span-3 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-2xl font-bold">{formatDateHeader(selectedDate, 'Stats for')}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <StatCard title="Sessions" value={`${entriesForSelectedDate.length}`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>} />
                        <StatCard title="Total Words" value={`${totalWords}`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>} />
                        <StatCard title="Writing/Editing Time" value={`${writingTime}m`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />
                        <StatCard title="Other Time" value={`${otherTime}m`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Weekly Summary</h2>
                    <Card className="mt-4">
                        <CardContent>
                            <ul className="space-y-3 text-sm">
                                <li className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Words This Week:</span>
                                    <span className="font-semibold">{weeklyStats.totalWords}</span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Time This Week:</span>
                                    <span className="font-semibold">{weeklyStats.totalTime}m</span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Sessions This Week:</span>
                                    <span className="font-semibold">{weeklyStats.totalSessions}</span>
                                </li>
                                <li className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Days Remaining in Week:</span>
                                    <span className="font-semibold">{weeklyStats.daysRemaining}</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <h2 className="text-xl font-bold">{formatDateHeader(selectedDate, 'Entries for')}</h2>
                </CardHeader>
                <CardContent>
                    {entriesForSelectedDate.length > 0 ? (
                        <ul className="space-y-4">
                        {entriesForSelectedDate.map((entry) => {
                            const { color } = ACTIVITY_TYPES[entry.activity_type];
                            return (
                                <li 
                                    key={entry.id} 
                                    className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                    onClick={() => onEditEntry(entry)}
                                >
                                    <span className={`w-3 h-3 rounded-full mr-4 ${color}`}></span>
                                    <div className="flex-grow">
                                        <p className="font-semibold">{entry.title}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{entry.activity_type}</p>
                                    </div>
                                    <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                                        <p>{entry.word_count} words</p>
                                        <p>{entry.time_spent_minutes} min</p>
                                    </div>
                                </li>
                            )
                        })}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">No entries for this day. Click an activity button to start!</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
