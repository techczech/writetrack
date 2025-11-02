import React, { useState } from 'react';
import { WritingEntry } from '../types';
import Button from './ui/Button';
import Card, { CardContent } from './ui/Card';

// Helper functions
const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const isToday = (date: Date) => isSameDay(date, new Date());

interface CalendarViewProps {
  entries: WritingEntry[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ entries, selectedDate, onDateChange }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const entryDates = React.useMemo(() => {
    const dates = new Set<string>();
    entries.forEach(entry => {
      dates.add(new Date(entry.entry_date).toDateString());
    });
    return dates;
  }, [entries]);

  const changeMonth = (offset: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => changeMonth(-1)} variant="ghost" size="sm">&lt;</Button>
        <h3 className="text-lg font-semibold">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <Button onClick={() => changeMonth(1)} variant="ghost" size="sm">&gt;</Button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return (
      <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 dark:text-gray-400">
        {days.map(day => <div key={day} className="w-10 mx-auto">{day}</div>)}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = currentMonth;
    const startDate = new Date(monthStart);
    const dayOfWeek = monthStart.getDay(); // 0 for Sunday, 1 for Monday
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - offset);
    
    // Ensure calendar is always 6 rows for consistent height
    const totalCells = 42;
    const cells = [];
    let day = new Date(startDate);
    
    for (let i = 0; i < totalCells; i++) {
        const cloneDay = new Date(day);
        const hasEntry = entryDates.has(cloneDay.toDateString());
        
        const cellClasses = [
          'p-2 rounded-full flex items-center justify-center cursor-pointer transition-colors w-10 h-10 mx-auto'
        ];
        
        if (cloneDay.getMonth() !== currentMonth.getMonth()) {
          cellClasses.push('text-gray-400 dark:text-gray-500');
        } else {
          cellClasses.push('text-gray-800 dark:text-gray-200');
        }

        if (isSameDay(cloneDay, selectedDate)) {
            cellClasses.push('bg-blue-600 text-white font-bold');
        } else if (isToday(cloneDay)) {
            cellClasses.push('border border-blue-500');
        } else {
            cellClasses.push('hover:bg-gray-200 dark:hover:bg-gray-700');
        }
        
        cells.push(
          <div key={day.toString()} className="relative h-12 flex items-center justify-center" onClick={() => onDateChange(cloneDay)}>
            <div className={cellClasses.join(' ')}>
              <span>{day.getDate()}</span>
            </div>
            {hasEntry && !isSameDay(cloneDay, selectedDate) && <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full"></div>}
          </div>
        );
        day.setDate(day.getDate() + 1);
    }

    const rows = [];
    for (let i=0; i<6; i++) {
        rows.push(
            <div className="grid grid-cols-7 gap-1" key={i}>
                {cells.slice(i*7, (i+1)*7)}
            </div>
        )
    }

    return <div className="space-y-1">{rows}</div>;
  };

  return (
    <Card>
      <CardContent>
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </CardContent>
    </Card>
  );
};

export default CalendarView;
