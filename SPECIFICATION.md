# WriteTrack Application Specification

## 1. Overview
WriteTrack is a client-side, single-page web application (SPA) built with React and TypeScript. It serves as a comprehensive writing log and practice tracker, enhanced with Generative AI (Google Gemini) for insights and planning. It supports both offline (local storage) and online (Firebase) modes.

## 2. Core Architecture
- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini API (`@google/genai`)
- **Persistence Layers**:
  - **Local-Only (Default)**: Uses `localStorage` via a custom hook. Data remains 100% private on the device.
  - **Cloud (Optional)**: Uses Firebase Firestore & Authentication. Enabled only when valid keys are provided in `config.js`.

## 3. Core Features & Workflows

### 3.1. Activity-Based Dashboard
The dashboard serves as the main hub, categorizing work into 6 distinct activity types:
1.  **Writing** (Blue): Core drafting.
2.  **Editing** (Orange): Revision and proofreading.
3.  **Planning/Outlining** (Purple): Structural work and brainstorming.
4.  **Process Review** (Green): Retrospectives and analysis.
5.  **Reading/Research** (Yellow): Information gathering.
6.  **Tool Setup** (Gray): Environment configuration.

**Dashboard Features:**
- **Calendar Heatmap**: Visualizes days with activity.
- **Statistics**:
  - **Daily Stats**: Word count, writing time, and non-writing time for the selected date.
  - **Weekly Summary**: Total accumulation for the current week and days remaining.
- **Entry List**: Chronological list of entries for the selected date.

### 3.2. Entry Editor (The "Work" Interface)
This is the primary interface for logging work.
- **Content Creation**: Large text area with auto-debounced word counting.
- **Metadata Tracking**:
  - **Status**: *Planned*, *In Progress*, or *Completed*.
  - **Writing Type**: Sub-categories specific to the Activity Type (e.g., "Fiction" for Writing, "Proofreading" for Editing).
  - **Tags**: Manual entry or AI-suggested.
- **Process Logging**: A dedicated "Process Notes" field that automatically captures system events (like timer pauses).

### 3.3. Timer System
A robust, integrated timing system designed for flow states.
- **Implementation**: `setInterval` loop in `components/ui/Timer.tsx`.
- **States**: *Idle*, *Active*, *Paused*.
- **Features**:
  - **Auto-Logging**: When the timer is paused, a timestamped entry (e.g., `[10:45:00] Timer paused.`) is automatically appended to the user's Process Notes.
  - **Goal Setting**: Users can define a target duration (e.g., 30 mins). Visual feedback and alerts occur upon completion.
  - **Focus Mode**: A full-screen overlay that hides the UI, displaying only the timer and controls.
  - **Settings**: Default durations can be configured per activity type (persisted in local storage).
  - **Manual Override**: Users can switch to manual input to log past sessions.

### 3.4. AI Integration (Gemini)
The application uses the `gemini-2.5-flash` model for high-speed, cost-effective inference.

**Capabilities:**
1.  **Auto-Titling**:
    - **Trigger**: Saving an entry without a title.
    - **Logic**: Analyzes the first 1000 characters of content to generate a short (<6 words) engaging title.
2.  **Smart Summaries**:
    - **Trigger**: "Generate AI Summary" button in Editor.
    - **Logic**: Analyzes up to 3000 characters to produce a JSON object containing:
      - `summary`: Max 2 sentences.
      - `themes`: 3-5 key themes.
      - `suggested_tags`: 3-5 tags for categorization.
3.  **Planning Assistant**:
    - **Trigger**: "Generate Plan" in Planning Assistant or Daily Planner.
    - **Logic**: Accepts a natural language description (e.g., "Write 500 words every morning this week") and a date range. It parses this into a structured JSON array of `PlannedActivity` objects.

### 3.5. Data Management
- **Format**: JSON.
- **Export**: Dumps the full `WritingEntry[]` array to a downloadable file.
- **Import**: Parses and validates an uploaded JSON file, merging it with existing local data (deduplicated by ID). *Note: Import is disabled while signed in to Cloud mode to ensure source-of-truth integrity.*

### 3.6. Export to Calendar
- **Format**: iCalendar (`.ics`).
- **Function**: Converts AI-generated plans into standard calendar events including Title, Time, Duration, and Notes.

## 4. Technical Specifications

### 4.1. Data Models
**WritingEntry Interface:**
```typescript
{
  id: string;                 // UUID or Firestore ID
  entry_date: string;         // ISO 8601 DateTime
  activity_type: ActivityType;// Enum
  writing_type: string;       // String subtype
  status: EntryStatus;        // Enum
  title: string;
  content: string;            // Main body
  notes: string;              // Process notes
  word_count: number;
  time_spent_minutes: number;
  tags: string[];
  ai_summary?: string;
  ai_themes?: string[];
}
```

### 4.2. Configuration
API Keys are decoupled from the build bundle via `config.js` loaded in `index.html`.
- `window.APP_CONFIG.GEMINI_API_KEY`: Required for AI features.
- `window.APP_CONFIG.FIREBASE_*`: Required for Cloud Sync.

## 5. Deployment & Security
- **Client-Side Only**: The app can be hosted on any static file server (Firebase Hosting, Vercel, Netlify, GitHub Pages).
- **API Security**: Because API keys are exposed to the browser, they **must** be restricted in the Google Cloud Console to the specific HTTP Referrer domains where the app is hosted.
