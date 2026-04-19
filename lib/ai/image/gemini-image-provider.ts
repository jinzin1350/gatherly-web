import { GoogleGenAI } from '@google/genai';
import type { ImageAIProvider } from '../types';

const getClient = () =>
  new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export class GeminiImageProvider implements ImageAIProvider {
  async generateImage(
    prompt: string,
    aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' = '16:9'
  ): Promise<string> {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A highly professional, beautiful photograph. No text, no words, no letters. ${prompt}`,
          },
        ],
      },
      config: {
        imageConfig: { aspectRatio },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error('No parts in image response');

    for (const part of parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`;
      }
    }
    throw new Error('No image generated');
  }
}
