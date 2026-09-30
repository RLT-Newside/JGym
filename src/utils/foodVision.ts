// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

export interface FoodAnalysis {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

/**
 * `openai` = any OpenAI-compatible /chat/completions server (Ollama, LM Studio,
 * llama.cpp, vLLM — or OpenAI itself). `anthropic` = Claude Messages API.
 */
export type AiProvider = 'openai' | 'anthropic'

export interface AiFoodConfig {
  provider: AiProvider
  baseUrl: string
  model: string
  apiKey: string
}

export const PROVIDER_DEFAULTS: Record<AiProvider, Omit<AiFoodConfig, 'apiKey'>> = {
  openai: { provider: 'openai', baseUrl: 'http://localhost:11434/v1', model: 'qwen2.5vl' },
  anthropic: { provider: 'anthropic', baseUrl: 'https://api.anthropic.com/v1', model: 'claude-haiku-4-5-20251001' },
}

const SYSTEM_PROMPT =
  'You are a nutrition analyst. Identify food in the image and estimate total nutritional content for the full portion shown. ' +
  'Respond ONLY with valid JSON in this exact format (no markdown, no extra text): ' +
  '{"name":"<food description>","calories":<kcal>,"protein":<g>,"carbs":<g>,"fat":<g>} ' +
  'All numbers are integers. Estimate generously but realistically.'

const USER_PROMPT = 'Estimate the calories and macros for this food.'

/** Host the photo will be sent to — shown to the user when asking for consent. */
export function endpointHost(baseUrl: string): string {
  try {
    return new URL(baseUrl).host
  } catch {
    return baseUrl
  }
}

function buildRequest(cfg: AiFoodConfig, imageBase64: string, mimeType: string): [string, RequestInit] {
  const base = cfg.baseUrl.replace(/\/+$/, '')
  if (cfg.provider === 'anthropic') {
    return [
      `${base}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': cfg.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: cfg.model,
          max_tokens: 256,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
                { type: 'text', text: USER_PROMPT },
              ],
            },
          ],
        }),
      },
    ]
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (cfg.apiKey) headers.Authorization = `Bearer ${cfg.apiKey}`
  return [
    `${base}/chat/completions`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: cfg.model,
        max_tokens: 256,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
              { type: 'text', text: USER_PROMPT },
            ],
          },
        ],
      }),
    },
  ]
}

export async function analyzeFood(imageBase64: string, mimeType: string, cfg: AiFoodConfig): Promise<FoodAnalysis> {
  const [url, init] = buildRequest(cfg, imageBase64, mimeType)
  let res: Response
  try {
    res = await fetch(url, init)
  } catch {
    throw new Error(`Could not reach ${endpointHost(cfg.baseUrl)}. Check the URL, CORS and (on Android) HTTPS.`)
  }

  if (!res.ok) {
    let msg = `API error ${res.status}`
    try {
      const body = await res.json()
      if (body?.error?.message) msg = body.error.message
    } catch {}
    throw new Error(msg)
  }

  const data = await res.json()
  const text: string =
    cfg.provider === 'anthropic' ? (data.content?.[0]?.text ?? '') : (data.choices?.[0]?.message?.content ?? '')
  return parseFoodAnalysis(text)
}

export function parseFoodAnalysis(text: string): FoodAnalysis {
  const match = text.match(/\{[\s\S]*?\}/)
  if (!match) throw new Error('No JSON found in response')
  const parsed = JSON.parse(match[0])
  if (typeof parsed.name !== 'string' || !parsed.name) throw new Error('Missing food name in response')
  return {
    name: parsed.name,
    calories: Math.max(0, Math.round(Number(parsed.calories) || 0)),
    protein: Math.max(0, Math.round(Number(parsed.protein) || 0)),
    carbs: Math.max(0, Math.round(Number(parsed.carbs) || 0)),
    fat: Math.max(0, Math.round(Number(parsed.fat) || 0)),
  }
}
