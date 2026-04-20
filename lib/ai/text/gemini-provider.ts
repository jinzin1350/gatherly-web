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
      contents: `Analyze the following event invitation description. We need to know if the user explicitly provided the date, time, and location. We also want to suggest a few optional follow-up questions that would help us generate a richer, more personalized event page.

User Input: "${prompt}"

---

PART 1 — Missing fields:
Determine whether date, time, and location are present in the input.
Set each to true if they are MISSING or unclear.

PART 2 — Smart follow-up questions:
Generate 1 to 3 short, friendly questions that would genuinely improve the event page quality. Follow these rules strictly:

1. Only ask questions whose answers would meaningfully change the event page content — names, special details, personal touches.
2. DO NOT ask about date, time, or location (those are handled separately).
3. DO NOT ask if the prompt is already highly detailed and specific.
4. Keep questions short, warm, and conversational — not formal.
5. Maximum 3 questions. Minimum 0 (return empty array if nothing useful to ask).
6. The question language MUST match the language of the user's input. If the user wrote in Farsi, the questions must be in Farsi.

Good examples:
- "What's the guest of honor's name?" → id: "guest_of_honor_name"
- "Any special activities or surprises planned?" → id: "special_activities"
- "Is there a dress code?" → id: "dress_code"

Bad examples (do NOT generate these):
- "What date is the event?" (handled separately)
- "Where is the event?" (handled separately)
- "What type of event is this?" (already in the prompt)`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            missingFields: {
              type: Type.OBJECT,
              properties: {
                date:     { type: Type.BOOLEAN, description: 'True if the date is NOT specified or unclear.' },
                time:     { type: Type.BOOLEAN, description: 'True if the time is NOT specified or unclear.' },
                location: { type: Type.BOOLEAN, description: 'True if the location/venue is NOT specified or unclear.' },
              },
              required: ['date', 'time', 'location'],
            },
            extractedData: {
              type: Type.OBJECT,
              properties: {
                date:     { type: Type.STRING, description: 'The extracted date, or empty string if missing' },
                time:     { type: Type.STRING, description: 'The extracted time, or empty string if missing' },
                location: { type: Type.STRING, description: 'The extracted location, or empty string if missing' },
              },
              required: ['date', 'time', 'location'],
            },
            smartQuestions: {
              type: Type.ARRAY,
              description: '0 to 3 optional follow-up questions to personalize the event page.',
              items: {
                type: Type.OBJECT,
                properties: {
                  id:          { type: Type.STRING, description: 'snake_case identifier, e.g. guest_of_honor_name' },
                  question:    { type: Type.STRING, description: 'Short, warm question to show the user' },
                  placeholder: { type: Type.STRING, description: 'Input placeholder hint, e.g. e.g. Shirin' },
                },
                required: ['id', 'question', 'placeholder'],
              },
            },
          },
          required: ['missingFields', 'extractedData', 'smartQuestions'],
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
      missingFields:  result.missingFields,
      extractedData:  result.extractedData,
      smartQuestions: result.smartQuestions ?? [],
    };
  }

  async generateEventDetails(
    prompt: string,
    date: string,
    time: string,
    location: string,
    smartAnswers?: Record<string, string>
  ): Promise<Omit<EventData, 'images' | 'eventId' | 'shortToken' | 'hostId' | 'plan' | 'createdAt'>> {
    const ai = getClient();

    // Build optional smart answers section
    const smartAnswersSection = smartAnswers && Object.keys(smartAnswers).length > 0
      ? `\nAdditional details provided by the user:\n${
          Object.entries(smartAnswers)
            .filter(([, v]) => v.trim())
            .map(([k, v]) => `- ${k.replace(/_/g, ' ')}: ${v}`)
            .join('\n')
        }\nUse these details to personalize the event content — incorporate names, special touches, and unique details into the title, description, welcome message, and schedule.`
      : '';

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
6. UI STYLE RULE: uiStyle MUST be exactly one of: elegant, playful, minimal, bold, romantic. No other values are allowed.

Confirmed Details:
Date: ${date}
Time: ${time}
Location: ${location}
${smartAnswersSection}
User Concept: "${prompt}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title:       { type: Type.STRING },
            description: { type: Type.STRING },
            themeName:   { type: Type.STRING },
            themeColors: {
              type: Type.OBJECT,
              properties: {
                primary:    { type: Type.STRING },
                secondary:  { type: Type.STRING },
                background: { type: Type.STRING },
                text:       { type: Type.STRING },
              },
              required: ['primary', 'secondary', 'background', 'text'],
            },
            uiStyle:        { type: Type.STRING, description: 'Must be one of: elegant, playful, minimal, bold, romantic' },
            isRTL:          { type: Type.BOOLEAN },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time:        { type: Type.STRING },
                  title:       { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['time', 'title', 'description'],
              },
            },
            vibe:           { type: Type.STRING },
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
