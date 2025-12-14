import { ActivityType, WritingEntry, PlannedActivity } from '../types';
import { GoogleGenAI, Type, Schema } from "@google/genai";

const getAI = () => {
    const apiKey = window.APP_CONFIG?.GEMINI_API_KEY;
    if (!apiKey || apiKey.includes('PASTE_YOUR')) {
        throw new Error("Gemini API Key is missing in config.js");
    }
    return new GoogleGenAI({ apiKey });
};

export async function generateEntryTitle(content: string, activityType: ActivityType): Promise<string> {
    if (!content) {
        return `Untitled ${activityType} Entry`;
    }

    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a short, engaging title (max 6 words) for a writing entry with the following content. The activity type is ${activityType}. Do not use quotes in the output.\n\nContent:\n${content.substring(0, 1000)}`,
        });
        return response.text?.trim() || `Untitled ${activityType} Entry`;
    } catch (error) {
        console.error("Error generating entry title:", error);
        // Inform the user that the AI feature failed but the app can proceed.
        return `Untitled ${activityType} Entry`;
    }
}


export async function generateEntrySummary(entry: Omit<WritingEntry, 'id' | 'entry_date' | 'tags'>) {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the following text entry and provide:
            1. A concise summary (max 2 sentences).
            2. A list of 3-5 key themes.
            3. A list of 3-5 suggested tags.
            
            Entry Content:
            ${entry.content.substring(0, 3000)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        themes: { type: Type.ARRAY, items: { type: Type.STRING } },
                        suggested_tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["summary", "themes", "suggested_tags"]
                }
            }
        });
        
        if (response.text) {
            return JSON.parse(response.text);
        }
        throw new Error("Empty response from AI");
    } catch (error) {
        console.error("Error generating entry summary:", error);
        return { summary: "Error generating AI summary.", themes: [], suggested_tags: [] };
    }
}


export async function parseMultiDayPlan(planDescription: string, startDate: string, endDate: string): Promise<Omit<PlannedActivity, 'id'>[]> {
    try {
        const ai = getAI();
        
        const prompt = `You are a planning assistant. I will give you a description of a writing plan, a start date, and an end date.
        Your job is to parse this description into a list of specific activities.
        
        Start Date: ${startDate}
        End Date: ${endDate}
        Description: ${planDescription}
        
        Generate a JSON array of activities. Each activity must have a date (YYYY-MM-DD), activity_type (Writing, Editing, Planning/Outlining, Process Review, Reading/Research, Tool Setup), title, start_time (HH:MM), duration_minutes (integer), and notes.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            date: { type: Type.STRING, description: "YYYY-MM-DD format" },
                            activity_type: { type: Type.STRING, enum: ["Writing", "Editing", "Planning/Outlining", "Process Review", "Reading/Research", "Tool Setup"] },
                            title: { type: Type.STRING },
                            start_time: { type: Type.STRING, description: "HH:MM format, 24h" },
                            duration_minutes: { type: Type.INTEGER },
                            notes: { type: Type.STRING }
                        },
                        required: ["date", "activity_type", "title", "start_time", "duration_minutes", "notes"]
                    }
                }
            }
        });

        if (response.text) {
            const data = JSON.parse(response.text);
            // Ensure we match the internal enum strings if AI slightly deviates
            return data.map((item: any) => ({
                ...item,
                activity_type: item.activity_type as ActivityType
            }));
        }
        return [];
    } catch (error) {
        console.error("Error parsing multi-day plan:", error);
        alert("Failed to generate plan. Please check your API key in config.js");
        return [];
    }
}

export async function parseDailyPlan(planDescription: string, date: string): Promise<Omit<PlannedActivity, 'id'>[]> {
    // A daily plan is a multi-day plan where start and end dates are the same.
    return parseMultiDayPlan(planDescription, date, date);
}