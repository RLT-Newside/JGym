import { describe, expect, it } from 'vitest'
import { parseFoodAnalysis } from './claudeVision'

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
