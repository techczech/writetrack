
import { GoogleGenAI, Type } from "@google/genai";
import { ActivityType, WritingEntry, PlannedActivity } from '../types';

// This is a placeholder. In a real app, use environment variables.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY not found. AI features will be disabled.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY! });

export async function generateEntryTitle(content: string, activityType: ActivityType): Promise<string> {
    if (!API_KEY || !content) {
        return `Untitled ${activityType} Entry`;
    }

    const prompt = `Based on the following content from a "${activityType}" activity, generate a concise and descriptive title (5-10 words maximum).

    Content:
    ---
    ${content.substring(0, 2000)}
    ---

    Return only the title text, with no extra formatting, labels, or quotation marks.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        // Clean up potential quotes and trim whitespace
        const title = response.text.trim().replace(/^["']|["']$/g, '');
        return title || `Untitled ${activityType} Entry`; // Fallback if response is empty
    } catch (error) {
        console.error("Error generating entry title:", error);
        return `Untitled ${activityType} Entry`;
    }
}


export async function generateEntrySummary(entry: Omit<WritingEntry, 'id' | 'entry_date' | 'tags'>) {
    if (!API_KEY) return { summary: "AI features disabled. No API key.", themes: [], suggested_tags: [] };

    const summaryPrompt = `Summarize this ${entry.activity_type} entry for a writing log.

    Activity Type: ${entry.activity_type}
    Writing Type: ${entry.writing_type}
    Title: ${entry.title}
    Word Count: ${entry.word_count}

    Content:
    ${entry.content}

    Process Notes:
    ${entry.notes}

    Based on the activity type, provide:
    - For Writing: Summarize the content (2-3 sentences), identify main themes, note accomplishments
    - For Editing: Describe what was edited, what improved, editorial focus areas
    - For Planning/Outlining: Extract structural elements, organizational strategy, next steps
    - For Process Review: Extract key insights, identify patterns, action items
    - For Reading/Research: List sources/concepts, note relevance to projects
    - For Tool Setup: Document what was configured, decisions made

    Return a valid JSON object with the specified schema.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: summaryPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING, description: "2-3 sentence summary" },
                        themes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of identified themes" },
                        suggested_tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of suggested tags" },
                    },
                    required: ["summary", "themes", "suggested_tags"],
                },
            },
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error generating entry summary:", error);
        return { summary: "Error generating AI summary.", themes: [], suggested_tags: [] };
    }
}


export async function parseMultiDayPlan(planDescription: string, startDate: string, endDate: string): Promise<Omit<PlannedActivity, 'id'>[]> {
    if (!API_KEY) return [];

    const planParserPrompt = `Parse the following writing plan description into a series of structured activities scheduled between ${startDate} and ${endDate}.

    Plan description:
    ---
    ${planDescription}
    ---

    Analyze the description and extract each distinct activity. For each activity, determine the specific date it should occur on, ensuring the date falls within the provided range.

    Extract each activity with:
    - date (format: YYYY-MM-DD)
    - activity_type (must be one of: Writing, Editing, Planning/Outlining, Process Review, Reading/Research, Tool Setup)
    - title (brief description)
    - start_time (format: HH:MM in 24-hour format)
    - duration_minutes (integer)
    - notes (any additional context)

    If a specific date isn't mentioned for an activity, distribute the activities logically across the date range. If no time is specified, estimate a reasonable time. If no duration is specified, use 60 minutes as a default.

    Return a valid JSON array of activity objects.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: planParserPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
                            activity_type: {
                                type: Type.STRING,
                                enum: Object.values(ActivityType),
                            },
                            title: { type: Type.STRING },
                            start_time: { type: Type.STRING },
                            duration_minutes: { type: Type.INTEGER },
                            notes: { type: Type.STRING },
                        },
                        required: ["date", "activity_type", "title", "start_time", "duration_minutes"],
                    },
                },
            },
        });
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Error parsing multi-day plan:", error);
        return [];
    }
}

// Fix: Add parseDailyPlan function which was missing.
export async function parseDailyPlan(planDescription: string, date: string): Promise<Omit<PlannedActivity, 'id'>[]> {
    // A daily plan is a multi-day plan where start and end dates are the same.
    return parseMultiDayPlan(planDescription, date, date);
}
