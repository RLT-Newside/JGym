import { afterEach, describe, expect, it, vi } from 'vitest'
import { type AiFoodConfig, analyzeFood, endpointHost, PROVIDER_DEFAULTS, parseFoodAnalysis } from './foodVision'

describe('parseFoodAnalysis', () => {
  it('parses clean JSON response', () => {
    const result = parseFoodAnalysis('{"name":"Grilled chicken breast","calories":165,"protein":31,"carbs":0,"fat":4}')
    expect(result).toEqual({ name: 'Grilled chicken breast', calories: 165, protein: 31, carbs: 0, fat: 4 })
  })

  it('parses JSON embedded in extra text', () => {
    const text =
      'Here is my estimate:\n{"name":"Rice and beans","calories":350,"protein":12,"carbs":65,"fat":3}\nHope that helps.'
    const result = parseFoodAnalysis(text)
    expect(result.name).toBe('Rice and beans')
    expect(result.calories).toBe(350)
  })

  it('rounds float values to integers', () => {
    const result = parseFoodAnalysis('{"name":"Oatmeal","calories":150.6,"protein":5.3,"carbs":27.1,"fat":2.8}')
    expect(result.calories).toBe(151)
    expect(result.protein).toBe(5)
    expect(result.carbs).toBe(27)
    expect(result.fat).toBe(3)
  })

  it('clamps negative values to zero', () => {
    const result = parseFoodAnalysis('{"name":"Apple","calories":52,"protein":-1,"carbs":14,"fat":-0.5}')
    expect(result.protein).toBe(0)
    expect(result.fat).toBe(0)
  })

  it('handles missing macro fields as zero', () => {
    const result = parseFoodAnalysis('{"name":"Mystery food","calories":200}')
    expect(result.protein).toBe(0)
    expect(result.carbs).toBe(0)
    expect(result.fat).toBe(0)
  })

  it('throws when no JSON in response', () => {
    expect(() => parseFoodAnalysis('I cannot identify the food.')).toThrow('No JSON found')
  })

  it('throws when name is missing', () => {
    expect(() => parseFoodAnalysis('{"calories":200,"protein":10,"carbs":20,"fat":5}')).toThrow()
  })
})

describe('analyzeFood', () => {
  afterEach(() => vi.unstubAllGlobals())

  const reply = '{"name":"Apple","calories":52,"protein":0,"carbs":14,"fat":0}'

  it('calls an OpenAI-compatible server with a data URL and no auth header when key is empty', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: reply } }] })))
    vi.stubGlobal('fetch', fetchMock)
    const cfg: AiFoodConfig = { ...PROVIDER_DEFAULTS.openai, baseUrl: 'https://ai.home.lan/v1/', apiKey: '' }
    const result = await analyzeFood('AAA', 'image/jpeg', cfg)
    expect(result.name).toBe('Apple')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://ai.home.lan/v1/chat/completions')
    expect(init.headers.Authorization).toBeUndefined()
    expect(init.body).toContain('data:image/jpeg;base64,AAA')
  })

  it('calls Anthropic messages endpoint with x-api-key', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ content: [{ text: reply }] })))
    vi.stubGlobal('fetch', fetchMock)
    await analyzeFood('AAA', 'image/png', { ...PROVIDER_DEFAULTS.anthropic, apiKey: 'sk-ant-x' })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.anthropic.com/v1/messages')
    expect(init.headers['x-api-key']).toBe('sk-ant-x')
  })
})

describe('endpointHost', () => {
  it('extracts host with port', () => {
    expect(endpointHost('http://localhost:11434/v1')).toBe('localhost:11434')
  })
})
