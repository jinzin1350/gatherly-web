import { NextRequest, NextResponse } from 'next/server'
import { getAIConfig } from '@/lib/ai/config'
import { getTextProvider } from '@/lib/ai/registry'
import { FIXTURE_ANALYSIS } from '@/lib/fixture'
import type { ApiResponse, PromptAnalysis } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json<ApiResponse<never>>(
        { ok: false, error: { code: 'BAD_REQUEST', message: 'prompt is required' } },
        { status: 400 }
      )
    }

    // Mock mode — skip AI, return fixture
    if (process.env.AI_MOCK === 'true') {
      return NextResponse.json<ApiResponse<PromptAnalysis>>({ ok: true, data: FIXTURE_ANALYSIS })
    }

    const config = await getAIConfig()
    const provider = getTextProvider(config.textProvider)
    const analysis = await provider.analyzePrompt(prompt)

    return NextResponse.json<ApiResponse<PromptAnalysis>>({ ok: true, data: analysis })
  } catch (err) {
    console.error('[analyze]', err)
    return NextResponse.json<ApiResponse<never>>(
      { ok: false, error: { code: 'INTERNAL', message: 'Analysis failed' } },
      { status: 500 }
    )
  }
}
