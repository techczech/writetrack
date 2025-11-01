
import React from 'react';
import { ActivityType, WritingEntry } from '../types';
import { ACTIVITY_TYPES } from '../constants';
import Card, { CardContent, CardHeader } from './ui/Card';

interface DashboardProps {
  onNewEntry: (activityType: ActivityType) => void;
  recentEntries: WritingEntry[];
}

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

const Dashboard: React.FC<DashboardProps> = ({ onNewEntry, recentEntries }) => {
    const totalWords = recentEntries.filter(e => e.activity_type === ActivityType.Writing).reduce((sum, e) => sum + e.word_count, 0);
    const totalTime = recentEntries.reduce((sum, e) => sum + e.time_spent_minutes, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.values(ActivityType).map((type) => (
          <ActivityButton key={type} activity={type} onClick={() => onNewEntry(type)} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Current Streak" value="1 day" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>} />
          <StatCard title="Today's Sessions" value={`${recentEntries.length}`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>} />
          <StatCard title="Today's Words" value={`${totalWords}`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>} />
          <StatCard title="Today's Time" value={`${totalTime}m`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />
      </div>

      <div>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Recent Entries</h2>
          </CardHeader>
          <CardContent>
            {recentEntries.length > 0 ? (
                <ul className="space-y-4">
                {recentEntries.map((entry) => {
                    const { color } = ACTIVITY_TYPES[entry.activity_type];
                    return (
                        <li key={entry.id} className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
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
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No entries yet. Click an activity button to start!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
