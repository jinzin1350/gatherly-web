import type { EventData, PromptAnalysis } from '@/lib/types';

export interface TextAIProvider {
  analyzePrompt(prompt: string): Promise<PromptAnalysis>;
  generateEventDetails(
    prompt: string,
    date: string,
    time: string,
    location: string,
    smartAnswers?: Record<string, string>
  ): Promise<Omit<EventData, 'images' | 'eventId' | 'shortToken' | 'hostId' | 'plan' | 'createdAt'>>;
}

export interface ImageAIProvider {
  generateImage(
    prompt: string,
    aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'
  ): Promise<string>; // base64 data URL
}

export type AIConfig = {
  textProvider: 'gemini' | 'claude' | 'openai';
  imageProvider: 'gemini-image';
};

export type ProviderMeta = {
  id: string;
  displayName: string;
  description: string;
  strengths: string[];
  available: boolean; // false if API key is missing
};
