import { GoogleGenAI, Type } from '@google/genai';
import type { TextAIProvider } from '../types';
import type { EventData, PromptAnalysis } from '@/lib/types';

const getClient = () =>
  new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export class GeminiTextProvider implements TextAIProvider {
  async analyzePrompt(prompt: string): Promise<PromptAnalysis> {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following event invitation description. We need to know if the user explicitly provided the date, time, and location.

User Input: "${prompt}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            missingFields: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.BOOLEAN, description: 'True if the date is NOT specified or unclear.' },
                time: { type: Type.BOOLEAN, description: 'True if the time is NOT specified or unclear.' },
                location: { type: Type.BOOLEAN, description: 'True if the location/venue is NOT specified or unclear.' },
              },
              required: ['date', 'time', 'location'],
            },
            extractedData: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING, description: 'The extracted date, or empty string if missing' },
                time: { type: Type.STRING, description: 'The extracted time, or empty string if missing' },
                location: { type: Type.STRING, description: 'The extracted location, or empty string if missing' },
              },
              required: ['date', 'time', 'location'],
            },
          },
          required: ['missingFields', 'extractedData'],
        },
      },
    });

    if (!response.text) throw new Error('Failed to analyze prompt.');

    const result = JSON.parse(response.text.trim());
    return {
      needsMoreInfo:
        result.missingFields.date ||
        result.missingFields.time ||
        result.missingFields.location,
      ...result,
    };
  }

  async generateEventDetails(
    prompt: string,
    date: string,
    time: string,
    location: string
  ): Promise<Omit<EventData, 'images' | 'eventId' | 'shortToken' | 'hostId' | 'plan' | 'createdAt'>> {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert event planner and UI/UX designer for "Gatherly" - an app that creates dynamic, beautiful event pages.

Based on the user's prompt and the confirmed details, generate structured data for their event page.

CRITICAL INSTRUCTIONS - MUST FOLLOW EXACTLY:
1. LANGUAGE MATCHING: You MUST detect the language used in the "User Concept" and generate ALL outputs (title, description, welcomeMessage, schedule titles, schedule descriptions) in THAT EXACT LANGUAGE. For example, if the concept is in Persian (Farsi), write everything in Farsi.
2. TONE & VIBE: Do NOT use highly formal, stiff, or robotic language. Keep the tone very cool, catchy, warm, friendly, and natural. Less formal, more exciting!
3. THEME-DRIVEN UI: Carefully analyze the requested theme. Choose a 'uiStyle' that perfectly reflects it.
4. RTL SUPPORT: If the user's language is written from right-to-left (like Persian, Arabic, or Hebrew), you MUST set "isRTL" to true.
5. ITINERARY: Create an engaging 3 to 5 step timeline for the event.

Confirmed Details:
Date: ${date}
Time: ${time}
Location: ${location}

User Concept: "${prompt}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            themeName: { type: Type.STRING },
            themeColors: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.STRING },
                secondary: { type: Type.STRING },
                background: { type: Type.STRING },
                text: { type: Type.STRING },
              },
              required: ['primary', 'secondary', 'background', 'text'],
            },
            uiStyle: { type: Type.STRING },
            isRTL: { type: Type.BOOLEAN },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['time', 'title', 'description'],
              },
            },
            vibe: { type: Type.STRING },
            welcomeMessage: { type: Type.STRING },
          },
          required: [
            'title', 'description', 'themeName', 'themeColors',
            'uiStyle', 'isRTL', 'schedule', 'vibe', 'welcomeMessage',
          ],
        },
      },
    });

    if (!response.text) throw new Error('Failed to generate event details.');

    const generated = JSON.parse(response.text.trim());
    return { ...generated, date, time, location };
  }
}
