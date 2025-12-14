export enum ActivityType {
  Writing = 'Writing',
  Editing = 'Editing',
  Planning = 'Planning/Outlining',
  Review = 'Process Review',
  Research = 'Reading/Research',
  Setup = 'Tool Setup'
}

export enum EntryStatus {
  Completed = 'Completed',
  InProgress = 'In Progress',
  Planned = 'Planned'
}

export interface WritingEntry {
  id: string;
  entry_date: string;
  activity_type: ActivityType;
  writing_type: string;
  status: EntryStatus;
  title: string;
  content: string;
  notes: string;
  word_count: number;
  time_spent_minutes: number;
  tags: string[];
  ai_summary?: string;
  ai_themes?: string[];
}

export interface PlannedActivity {
  id: string;
  date: string; // "YYYY-MM-DD"
  activity_type: ActivityType;
  title: string;
  start_time: string; // "HH:MM"
  duration_minutes: number;
  notes: string;
}

export interface MultiDayPlan {
  start_date: string;
  end_date: string;
  plan_description: string;
  planned_activities: PlannedActivity[];
}

// Fix: Add DailyPlan interface for DailyPlanner component.
export interface DailyPlan {
  plan_date: string;
  plan_description: string;
  planned_activities: PlannedActivity[];
}

export type View = 
  | { name: 'dashboard' }
  | { name: 'newEntry'; activityType: ActivityType }
  | { name: 'editEntry'; entry: WritingEntry }
  | { name: 'planningAssistant' }
  | { name: 'about' }
  | { name: 'dataManager' };

// Fix: Consolidate all APP_CONFIG properties into a single global declaration
// to resolve TypeScript errors about subsequent property declarations.
declare global {
  interface Window {
    APP_CONFIG?: {
      FIREBASE_API_KEY?: string;
      FIREBASE_AUTH_DOMAIN?: string;
      FIREBASE_PROJECT_ID?: string;
      FIREBASE_STORAGE_BUCKET?: string;
      FIREBASE_MESSAGING_SENDER_ID?: string;
      FIREBASE_APP_ID?: string;
      GEMINI_API_KEY?: string;
    };
  }
}