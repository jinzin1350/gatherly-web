import type { TextAIProvider, ImageAIProvider, ProviderMeta } from './types';
import { GeminiTextProvider } from './text/gemini-provider';
import { ClaudeTextProvider } from './text/claude-provider';
import { OpenAITextProvider } from './text/openai-provider';
import { GeminiImageProvider } from './image/gemini-image-provider';

// Singleton instances
const textProviders: Record<string, TextAIProvider> = {
  gemini: new GeminiTextProvider(),
  claude: new ClaudeTextProvider(),
  openai: new OpenAITextProvider(),
};

const imageProviders: Record<string, ImageAIProvider> = {
  'gemini-image': new GeminiImageProvider(),
};

export function getTextProvider(name: string): TextAIProvider {
  const provider = textProviders[name];
  if (!provider) throw new Error(`Unknown text provider: ${name}`);
  return provider;
}

export function getImageProvider(name: string): ImageAIProvider {
  const provider = imageProviders[name];
  if (!provider) throw new Error(`Unknown image provider: ${name}`);
  return provider;
}

// Returns metadata for all providers, marking unavailable ones whose API
// key env var is absent. Used by the admin UI to filter the dropdown.
export function listTextProviderMeta(): ProviderMeta[] {
  return [
    {
      id: 'gemini',
      displayName: 'Gemini 2.5 Flash',
      description: 'Google Gemini — fast, multilingual, excellent for event content.',
      strengths: ['Multilingual', 'Fast', 'Cost-effective'],
      available: Boolean(process.env.GEMINI_API_KEY),
    },
    {
      id: 'claude',
      displayName: 'Claude (Anthropic)',
      description: 'Anthropic Claude — nuanced writing, strong reasoning.',
      strengths: ['Nuanced prose', 'Strong reasoning', 'Safety-focused'],
      available: Boolean(process.env.ANTHROPIC_API_KEY),
    },
    {
      id: 'openai',
      displayName: 'OpenAI GPT',
      description: 'OpenAI GPT — widely supported, broad capability.',
      strengths: ['Broad capability', 'Widely supported'],
      available: Boolean(process.env.OPENAI_API_KEY),
    },
  ];
}

export function listImageProviderMeta(): ProviderMeta[] {
  return [
    {
      id: 'gemini-image',
      displayName: 'Gemini Image (nano banana)',
      description: 'Gemini image generation — beautiful, photorealistic event imagery.',
      strengths: ['Photorealistic', 'Fast', 'Cost-effective'],
      available: Boolean(process.env.GEMINI_API_KEY),
    },
  ];
}
