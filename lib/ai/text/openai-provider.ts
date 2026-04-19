import type { TextAIProvider } from '../types';
import type { EventData, PromptAnalysis } from '@/lib/types';

export class OpenAITextProvider implements TextAIProvider {
  async analyzePrompt(_prompt: string): Promise<PromptAnalysis> {
    throw new Error('OpenAI provider not yet implemented');
  }

  async generateEventDetails(
    _prompt: string,
    _date: string,
    _time: string,
    _location: string
  ): Promise<Omit<EventData, 'images' | 'eventId' | 'shortToken' | 'hostId' | 'plan' | 'createdAt'>> {
    throw new Error('OpenAI provider not yet implemented');
  }
}
