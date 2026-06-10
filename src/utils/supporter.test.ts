import { beforeEach, describe, expect, it, vi } from 'vitest'
import { activateCode, deactivateSupporter, isActivated, verifyCode } from './supporter'

// Mock fetch for network-dependent tests
const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
  mockFetch.mockResolvedValue({
    json: async () => ({ hashes: [] }),
  })
})

describe('verifyCode', () => {
  it('returns false for empty/garbage code', async () => {
    const result = await verifyCode('NOTAVALIDCODE123')
    expect(result).toBe(false)
  })

  it('returns false when hash not in fetched list', async () => {
    mockFetch.mockResolvedValue({ json: async () => ({ hashes: ['aaa', 'bbb'] }) })
    const result = await verifyCode('INVALIDCODE')
    expect(result).toBe(false)
  })

  it('returns true when hash matches fetched list', async () => {
    // Hash of 'TESTCODE' — precomputed
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('TESTCODE')).then((buf) =>
      Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(''),
    )
    mockFetch.mockResolvedValue({ json: async () => ({ hashes: [hash] }) })
    const result = await verifyCode('TESTCODE')
    expect(result).toBe(true)
  })

  it('trims and uppercases code before hashing', async () => {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('TESTCODE')).then((buf) =>
      Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(''),
    )
    mockFetch.mockResolvedValue({ json: async () => ({ hashes: [hash] }) })
    const result = await verifyCode('  testcode  ')
    expect(result).toBe(true)
  })

  it('falls back to cached hashes when fetch fails', async () => {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('CACHED')).then((buf) =>
      Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(''),
    )
    localStorage.setItem('gym_supporter_hashes', JSON.stringify([hash]))
    mockFetch.mockRejectedValue(new Error('network error'))
    const result = await verifyCode('CACHED')
    expect(result).toBe(true)
  })
})

describe('activateCode / isActivated / deactivateSupporter', () => {
  it('activateCode stores hash when code is valid', async () => {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('VALIDCODE')).then((buf) =>
      Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(''),
    )
    mockFetch.mockResolvedValue({ json: async () => ({ hashes: [hash] }) })
    const result = await activateCode('VALIDCODE')
    expect(result).toBe(true)
    expect(isActivated()).toBe(true)
    expect(localStorage.getItem('gym_supporter')).toBe('true')
  })

  it('activateCode returns false and does not store for invalid code', async () => {
    const result = await activateCode('BADCODE')
    expect(result).toBe(false)
    expect(isActivated()).toBe(false)
  })

  it('deactivateSupporter clears activation', async () => {
    localStorage.setItem('gym_supporter_hash', 'somehash')
    deactivateSupporter()
    expect(isActivated()).toBe(false)
    expect(localStorage.getItem('gym_supporter')).toBe('false')
  })
})
