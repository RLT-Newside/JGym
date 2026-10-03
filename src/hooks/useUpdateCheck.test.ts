import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useUpdateCheck } from './useUpdateCheck'

vi.stubGlobal('__APP_VERSION__', '1.2.9')

const CHECK_KEY = 'gym_update_last_check'
const CACHE_KEY = 'gym_update_cached'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

afterEach(() => {
  localStorage.clear()
})

describe('useUpdateCheck', () => {
  it('clears stale cache when cached version is no longer newer than current', () => {
    localStorage.setItem(CHECK_KEY, String(Date.now()))
    localStorage.setItem(CACHE_KEY, JSON.stringify({ version: 'v1.2.9', url: 'https://example.com/dl' }))

    const { result } = renderHook(() => useUpdateCheck())

    expect(result.current.update).toBeNull()
    expect(localStorage.getItem(CACHE_KEY)).toBeNull()
  })

  it('serves cached update when cached version is still newer', () => {
    localStorage.setItem(CHECK_KEY, String(Date.now()))
    localStorage.setItem(CACHE_KEY, JSON.stringify({ version: 'v2.0.0', url: 'https://example.com/dl' }))

    const { result } = renderHook(() => useUpdateCheck())

    expect(result.current.update).toEqual({ version: 'v2.0.0', url: 'https://example.com/dl' })
  })

  it('fetches from API when cache has expired', async () => {
    const dayAgo = Date.now() - 25 * 60 * 60 * 1000
    localStorage.setItem(CHECK_KEY, String(dayAgo))

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            tag_name: 'v2.0.0',
            assets: [{ name: 'app.apk', browser_download_url: 'https://example.com/app.apk' }],
          }),
      }),
    )

    const { result } = renderHook(() => useUpdateCheck())

    await waitFor(() => {
      expect(result.current.update).toEqual({ version: 'v2.0.0', url: 'https://example.com/app.apk' })
    })
  })

  it('includes the APK sha256 digest and size so the download can be verified', async () => {
    const dayAgo = Date.now() - 25 * 60 * 60 * 1000
    localStorage.setItem(CHECK_KEY, String(dayAgo))

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            tag_name: 'v2.0.0',
            html_url: 'https://github.com/RLT-Newside/JGym/releases/tag/v2.0.0',
            assets: [
              {
                name: 'JGym-v2.0.0.apk',
                content_type: 'application/vnd.android.package-archive',
                size: 11298707,
                digest: 'sha256:646fe66d66c672d40f318a16421838ac6b98be36934e92bb9697e0072ea4263d',
                browser_download_url: 'https://github.com/RLT-Newside/JGym/releases/download/v2.0.0/JGym-v2.0.0.apk',
              },
            ],
          }),
      }),
    )

    const { result } = renderHook(() => useUpdateCheck())

    await waitFor(() => {
      expect(result.current.update).toEqual({
        version: 'v2.0.0',
        url: 'https://github.com/RLT-Newside/JGym/releases/download/v2.0.0/JGym-v2.0.0.apk',
        sha256: '646fe66d66c672d40f318a16421838ac6b98be36934e92bb9697e0072ea4263d',
        size: 11298707,
      })
    })
  })

  it('does not show update when API returns same version', async () => {
    const dayAgo = Date.now() - 25 * 60 * 60 * 1000
    localStorage.setItem(CHECK_KEY, String(dayAgo))

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            tag_name: 'v1.2.9',
            assets: [{ name: 'app.apk', browser_download_url: 'https://example.com/app.apk' }],
          }),
      }),
    )

    const { result } = renderHook(() => useUpdateCheck())

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })
    expect(result.current.update).toBeNull()
  })
})
