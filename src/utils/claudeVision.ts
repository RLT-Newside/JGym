// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

export interface FoodAnalysis {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

const CLAUDE_API = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-haiku-4-5-20251001'

const SYSTEM_PROMPT =
  'You are a nutrition analyst. Identify food in the image and estimate total nutritional content for the full portion shown. ' +
  'Respond ONLY with valid JSON in this exact format (no markdown, no extra text): ' +
  '{"name":"<food description>","calories":<kcal>,"protein":<g>,"carbs":<g>,"fat":<g>} ' +
  'All numbers are integers. Estimate generously but realistically.'

export async function analyzeFood(imageBase64: string, mimeType: string, apiKey: string): Promise<FoodAnalysis> {
  const res = await fetch(CLAUDE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType, data: imageBase64 },
            },
            { type: 'text', text: 'Estimate the calories and macros for this food.' },
          ],
        },
      ],
    }),
  })

  if (!res.ok) {
    let msg = `API error ${res.status}`
    try {
      const body = await res.json()
      if (body?.error?.message) msg = body.error.message
    } catch {}
    throw new Error(msg)
  }

  const data = await res.json()
  const text: string = data.content?.[0]?.text ?? ''
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
