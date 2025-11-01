# WriteTrack: AI-Powered Writing Log

**[Live Demo](http://writetrack.techczech.net)**

![WriteTrack Dashboard Screenshot](./writetrackscreenshot.png)

WriteTrack is a smart, standalone web application designed to help writers, editors, and creators track, analyze, and improve their writing habits. It combines a user-friendly interface with powerful AI features to provide a comprehensive toolkit for managing your writing life. All data is stored locally in your browser, ensuring your work remains private and accessible offline.

Note: This app was vibecoded by Dominik Lukes using Google AI Studio. 

## Core Features

### 1. Activity-Based Logging
Quickly log any of six core writing-related activities directly from the dashboard:
- **Writing:** For drafting new content.
- **Editing:** For revising and proofreading.
- **Planning/Outlining:** For brainstorming and structuring your work.
- **Process Review:** For analyzing your workflow and feedback.
- **Reading/Research:** For gathering information and inspiration.
- **Tool Setup:** For configuring your writing environment.

### 2. AI-Powered Enhancements
Leverage the Google Gemini API to streamline your logging process:
- **Automatic Title Generation:** Forget about manually titling your entries. WriteTrack analyzes your content and generates a concise, relevant title for you when you save.
- **AI Summaries & Themes:** With a single click, generate a summary of your entry, identify key themes, and get suggestions for relevant tags. This helps you quickly review your work and spot patterns.

### 3. Integrated Live Timer
Track your sessions with precision using the built-in timer:
- **Live Tracking:** Start the timer when you begin an activity and let it run in the background.
- **Pause & Resume:** Take a break without losing your session time. Each pause and resume action is automatically logged in the "Process Notes" section for a detailed record.
- **Full-Screen Mode:** Enter a distraction-free, full-screen timer mode to help you focus on your task, whether you're writing in the app or elsewhere.
- **Manual Entry:** Prefer to log time after the fact? You can easily switch to manual input.

### 4. AI Planning Assistant
Plan your writing schedule for a single day, a week, or a whole month:
- **Natural Language Planning:** Simply describe your goals in plain English (e.g., "Write 1000 words on Monday and Wednesday, edit on Friday afternoon").
- **AI Parsing:** The Planning Assistant uses AI to parse your description and create a structured schedule of activities.
- **iCal Export:** Export your entire plan as an `.ics` file and import it directly into your calendar (Google Calendar, Outlook, Apple Calendar).

### 5. Local Data Storage with Backup
Your data privacy is paramount.
- **100% Local:** All your writing entries and plans are stored directly in your browser's local storage. Your data never leaves your computer.
- **Export & Import:** Safeguard your work by exporting all your data to a single JSON file. You can use this file as a backup or to import your data into WriteTrack on another device.

## How It Works: Technical Overview

WriteTrack is built with a modern, client-side tech stack, ensuring a fast and responsive user experience without the need for a backend server.

- **Frontend Framework:** Built with **React** and **TypeScript** for a robust and maintainable component-based architecture.
- **Styling:** Styled with **Tailwind CSS** for a clean, responsive, and utility-first design.
- **AI Integration:** Utilizes the **@google/genai** library to interact with the **Google Gemini API** for all AI-powered features.
- **Data Persistence:** Employs a custom `useLocalStorage` React hook to seamlessly save and retrieve all application data from the browser's local storage.
- **No Backend:** The application is fully self-contained and runs entirely in the browser.

## Getting Started

1.  **Open the Application:** Simply open the `index.html` file in a modern web browser.
2.  **Start a Session:** Click one of the six activity buttons on the dashboard to start a new entry.
3.  **Write or Work:** Add your content in the main text area. The timer can be started to track your session live.
4.  **Save Your Entry:** Click "Save Entry." A title will be automatically generated, and the entry will be saved to your local storage.
5.  **Plan Your Week:** Navigate to the "Planning Assistant," describe your schedule, and export it to your calendar.
6.  **Backup Your Data:** Go to the "About" page to export your data periodically for safekeeping.

This project was created to demonstrate the power of modern frontend tools and generative AI in creating practical, user-centric applications.