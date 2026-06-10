import { describe, expect, it } from 'vitest'
import { isNewer } from './version'

describe('isNewer', () => {
  it('detects a higher major/minor/patch', () => {
    expect(isNewer('1.2.4', '1.2.3')).toBe(true)
    expect(isNewer('1.3.0', '1.2.9')).toBe(true)
    expect(isNewer('2.0.0', '1.9.9')).toBe(true)
  })

  it('returns false for equal versions', () => {
    expect(isNewer('1.2.3', '1.2.3')).toBe(false)
  })

  it('returns false for older versions', () => {
    expect(isNewer('1.2.2', '1.2.3')).toBe(false)
    expect(isNewer('1.0.0', '2.0.0')).toBe(false)
  })

  it('tolerates a leading v prefix', () => {
    expect(isNewer('v1.2.4', '1.2.3')).toBe(true)
    expect(isNewer('v1.2.3', 'v1.2.3')).toBe(false)
  })

  it('handles differing segment counts', () => {
    expect(isNewer('1.2', '1.2.0')).toBe(false)
    expect(isNewer('1.2.1', '1.2')).toBe(true)
  })

  it('returns false on non-numeric garbage', () => {
    expect(isNewer('abc', '1.0.0')).toBe(false)
  })
})
