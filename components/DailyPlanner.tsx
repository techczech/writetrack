
import React, { useState } from 'react';
import { DailyPlan, PlannedActivity, ActivityType } from '../types';
import { parseDailyPlan } from '../services/geminiService';
import { ACTIVITY_TYPES } from '../constants';
import Button from './ui/Button';
import Textarea from './ui/Textarea';
import Card, { CardContent, CardHeader } from './ui/Card';
import Input from './ui/Input';
import Select from './ui/Select';
import Badge from './ui/Badge';

interface DailyPlannerProps {
    onBack: () => void;
}

const DailyPlanner: React.FC<DailyPlannerProps> = ({ onBack }) => {
  const [plan, setPlan] = useState<DailyPlan>({
    plan_date: new Date().toISOString().split('T')[0],
    plan_description: '',
    planned_activities: [],
  });
  const [isParsing, setIsParsing] = useState(false);

  const handleParsePlan = async () => {
    if (!plan.plan_description) return;
    setIsParsing(true);
    // Fix: Pass the plan_date to the parseDailyPlan function.
    const activities = await parseDailyPlan(plan.plan_description, plan.plan_date);
    setPlan(prev => ({
      ...prev,
      planned_activities: activities.map((a: Omit<PlannedActivity, 'id'>) => ({...a, id: new Date().toISOString() + Math.random()})),
    }));
    setIsParsing(false);
  };
  
  const generateICalFile = (planDate: Date, activities: PlannedActivity[]): string => {
    const icalHeader = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//WriteTrack//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH`;
  
    const events = activities.map(activity => {
      const [startHour, startMinute] = activity.start_time.split(':').map(Number);
      const startDateTime = new Date(planDate);
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
    const planDate = new Date(plan.plan_date);
    const icalData = generateICalFile(planDate, plan.planned_activities);
    const blob = new Blob([icalData], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `writing-plan-${plan.plan_date}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  const addEmptyActivity = () => {
    const newActivity: PlannedActivity = {
        id: new Date().toISOString() + Math.random(),
        // Fix: Add the 'date' property to match the PlannedActivity interface.
        date: plan.plan_date,
        activity_type: ActivityType.Writing,
        title: '',
        start_time: '09:00',
        duration_minutes: 30,
        notes: ''
    };
    setPlan(p => ({...p, planned_activities: [...p.planned_activities, newActivity]}));
  }
  
  const updateActivity = (id: string, field: keyof PlannedActivity, value: any) => {
    setPlan(p => ({
        ...p,
        planned_activities: p.planned_activities.map(a => a.id === id ? {...a, [field]: value} : a)
    }));
  }

  const removeActivity = (id: string) => {
    setPlan(p => ({...p, planned_activities: p.planned_activities.filter(a => a.id !== id)}));
  }


  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Daily Planner</h1>
        <Button onClick={onBack} variant="secondary">Back to Dashboard</Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Plan for:</h2>
            <Input 
              type="date"
              value={plan.plan_date}
              onChange={(e) => setPlan(p => ({...p, plan_date: e.target.value}))}
              className="w-48"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-lg font-semibold mb-2 block">Plan Description</label>
            <Textarea 
              rows={5}
              placeholder="e.g., Tomorrow I want to write 1000 words on Chapter 3 from 9-11am, then edit the previous chapter from 2-3pm..."
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
                    <table className="w-full text-left">
                        <thead className="border-b dark:border-gray-700">
                            <tr>
                                <th className="p-2">Activity</th>
                                <th className="p-2">Title</th>
                                <th className="p-2">Start</th>
                                <th className="p-2">Duration</th>
                                <th className="p-2">Notes</th>
                                <th className="p-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {plan.planned_activities.map(activity => (
                                <tr key={activity.id} className="border-b dark:border-gray-700">
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

export default DailyPlanner;
