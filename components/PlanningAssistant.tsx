import React, { useState } from 'react';
import { MultiDayPlan, PlannedActivity, ActivityType } from '../types';
import { parseMultiDayPlan } from '../services/geminiService';
import Button from './ui/Button';
import Textarea from './ui/Textarea';
import Card, { CardContent, CardHeader } from './ui/Card';
import Input from './ui/Input';
import Select from './ui/Select';

interface PlanningAssistantProps {
    onBack: () => void;
}

const getDefaultEndDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 6);
    return date.toISOString().split('T')[0];
};

const PlanningAssistant: React.FC<PlanningAssistantProps> = ({ onBack }) => {
  const [plan, setPlan] = useState<MultiDayPlan>({
    start_date: new Date().toISOString().split('T')[0],
    end_date: getDefaultEndDate(),
    plan_description: '',
    planned_activities: [],
  });
  const [isParsing, setIsParsing] = useState(false);

  const handleParsePlan = async () => {
    if (!plan.plan_description) return;
    setIsParsing(true);
    const activities = await parseMultiDayPlan(plan.plan_description, plan.start_date, plan.end_date);
    setPlan(prev => ({
      ...prev,
      planned_activities: activities.map((a: Omit<PlannedActivity, 'id'>) => ({...a, id: new Date().toISOString() + Math.random()})),
    }));
    setIsParsing(false);
  };
  
  const generateICalFile = (activities: PlannedActivity[]): string => {
    const icalHeader = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//WriteTrack//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH`;
  
    const events = activities.map(activity => {
      const [startHour, startMinute] = activity.start_time.split(':').map(Number);
      const startDateTime = new Date(`${activity.date}T00:00:00.000Z`);
      startDateTime.setUTCHours(startHour, startMinute, 0, 0);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setUTCMinutes(endDateTime.getUTCMinutes() + activity.duration_minutes);
      
      const formatDateTime = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };
      
      return `BEGIN:VEVENT
UID:${activity.id}@writetrack.app
DTSTAMP:${formatDateTime(new Date())}
DTSTART:${formatDateTime(startDateTime)}
DTEND:${formatDateTime(endDateTime)}
SUMMARY:${activity.activity_type}: ${activity.title}
DESCRIPTION:${activity.notes || ''}
STATUS:CONFIRMED
END:VEVENT`;
    }).join('\n');
  
    const icalFooter = `END:VCALENDAR`;
    
    return `${icalHeader}\n${events}\n${icalFooter}`;
  }

  const downloadICalFile = () => {
    const icalData = generateICalFile(plan.planned_activities);
    const blob = new Blob([icalData], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `writing-plan-${plan.start_date}-to-${plan.end_date}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  const addEmptyActivity = () => {
    const newActivity: PlannedActivity = {
        id: new Date().toISOString() + Math.random(),
        date: plan.start_date,
        activity_type: ActivityType.Writing,
        title: '',
        start_time: '09:00',
        duration_minutes: 30,
        notes: ''
    };
    setPlan(p => ({...p, planned_activities: [...p.planned_activities, newActivity]}));
  }
  
  const updateActivity = (id: string, field: keyof Omit<PlannedActivity, 'id'>, value: any) => {
    setPlan(p => ({
        ...p,
        planned_activities: p.planned_activities.map(a => a.id === id ? {...a, [field]: value} : a)
    }));
  }

  const removeActivity = (id: string) => {
    setPlan(p => ({...p, planned_activities: p.planned_activities.filter(a => a.id !== id)}));
  }


  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Planning Assistant</h1>
        <Button onClick={onBack} variant="secondary">Back to Dashboard</Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-xl font-bold">Planning Period:</h2>
            <div className="flex items-center gap-2">
                <label htmlFor="start-date">From</label>
                <Input 
                  id="start-date"
                  type="date"
                  value={plan.start_date}
                  onChange={(e) => setPlan(p => ({...p, start_date: e.target.value}))}
                  className="w-40"
                />
            </div>
            <div className="flex items-center gap-2">
                <label htmlFor="end-date">To</label>
                <Input 
                  id="end-date"
                  type="date"
                  value={plan.end_date}
                  onChange={(e) => setPlan(p => ({...p, end_date: e.target.value}))}
                  className="w-40"
                />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-lg font-semibold mb-2 block">Plan Description</label>
            <Textarea 
              rows={5}
              placeholder="e.g., This week I want to write 1000 words on Monday and Wednesday from 9-11am, and edit the previous chapter on Friday from 2-3pm..."
              value={plan.plan_description}
              onChange={(e) => setPlan(p => ({...p, plan_description: e.target.value}))}
            />
          </div>
          <Button onClick={handleParsePlan} disabled={isParsing || !plan.plan_description}>
            {isParsing ? 'Generating Plan...' : 'Generate Plan from Description with AI'}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold">Planned Activities</h2>
                 <div>
                    <Button onClick={addEmptyActivity} variant="secondary" size="sm" className="mr-2">+</Button>
                    <Button onClick={downloadICalFile} disabled={plan.planned_activities.length === 0}>
                        Generate iCal File
                    </Button>
                 </div>
            </div>
        </CardHeader>
        <CardContent>
            {plan.planned_activities.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="border-b dark:border-gray-700">
                            <tr>
                                <th className="p-2 w-32">Date</th>
                                <th className="p-2 w-48">Activity</th>
                                <th className="p-2">Title</th>
                                <th className="p-2 w-24">Start</th>
                                <th className="p-2 w-32">Duration (min)</th>
                                <th className="p-2">Notes</th>
                                <th className="p-2 w-12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {plan.planned_activities.map(activity => (
                                <tr key={activity.id} className="border-b dark:border-gray-700">
                                    <td className="p-2"><Input type="date" value={activity.date} onChange={e => updateActivity(activity.id, 'date', e.target.value)} /></td>
                                    <td className="p-2">
                                        <Select value={activity.activity_type} onChange={e => updateActivity(activity.id, 'activity_type', e.target.value)}>
                                            {Object.values(ActivityType).map(t => <option key={t} value={t}>{t}</option>)}
                                        </Select>
                                    </td>
                                    <td className="p-2"><Input value={activity.title} onChange={e => updateActivity(activity.id, 'title', e.target.value)} /></td>
                                    <td className="p-2"><Input type="time" value={activity.start_time} onChange={e => updateActivity(activity.id, 'start_time', e.target.value)} /></td>
                                    <td className="p-2"><Input type="number" value={activity.duration_minutes} onChange={e => updateActivity(activity.id, 'duration_minutes', parseInt(e.target.value) || 0)} /></td>
                                    <td className="p-2"><Input value={activity.notes} onChange={e => updateActivity(activity.id, 'notes', e.target.value)} /></td>
                                    <td className="p-2"><Button variant="destructive" size="sm" onClick={() => removeActivity(activity.id)}>X</Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-gray-500 py-4">No activities planned yet. Add one manually or generate from a description.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanningAssistant;