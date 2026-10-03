import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useUpdateInstall } from './useUpdateInstall'

const URL_OK = 'https://github.com/RLT-Newside/JGym/releases/download/v2.0.0/JGym-v2.0.0.apk'
const SHA = 'b'.repeat(64)
const UPDATE = { version: 'v2.0.0', url: URL_OK, sha256: SHA }

type ProgressCb = (e: { received: number; total: number }) => void

function installPlugin(overrides: Record<string, unknown> = {}) {
  const listeners: ProgressCb[] = []
  const remove = vi.fn(async () => {})
  const plugin = {
    canInstall: vi.fn(async () => ({ allowed: true })),
    openInstallSettings: vi.fn(async () => {}),
    downloadAndInstall: vi.fn(async () => {}),
    addListener: vi.fn(async (_event: string, cb: ProgressCb) => {
      listeners.push(cb)
      return { remove }
    }),
    ...overrides,
  }
  ;(window as unknown as { Capacitor: unknown }).Capacitor = { Plugins: { AppUpdate: plugin } }
  return { plugin, listeners, remove }
}

beforeEach(() => {
  vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true)
  vi.mocked(App.addListener).mockImplementation(
    () => Promise.resolve({ remove: vi.fn() }) as unknown as ReturnType<typeof App.addListener>,
  )
})

afterEach(() => {
  vi.restoreAllMocks()
  delete (window as unknown as { Capacitor?: unknown }).Capacitor
})

describe('useUpdateInstall', () => {
  it('is unsupported on web', () => {
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(false)
    installPlugin()
    const { result } = renderHook(() => useUpdateInstall(UPDATE))
    expect(result.current.supported).toBe(false)
  })

  it('is unsupported when the native plugin is missing (older APK)', () => {
    const { result } = renderHook(() => useUpdateInstall(UPDATE))
    expect(result.current.supported).toBe(false)
  })

  it('is unsupported without a digest or with a foreign URL', () => {
    installPlugin()
    const noDigest = renderHook(() => useUpdateInstall({ version: 'v2.0.0', url: URL_OK }))
    expect(noDigest.result.current.supported).toBe(false)
    const foreign = renderHook(() => useUpdateInstall({ ...UPDATE, url: 'https://evil.example/JGym.apk' }))
    expect(foreign.result.current.supported).toBe(false)
  })

  it('reports missing install permission', async () => {
    installPlugin({ canInstall: vi.fn(async () => ({ allowed: false })) })
    const { result } = renderHook(() => useUpdateInstall(UPDATE))
    expect(result.current.supported).toBe(true)
    await waitFor(() => expect(result.current.canInstall).toBe(false))
  })

  it('downloads with progress, then opens the installer', async () => {
    let finish: () => void = () => {}
    const { plugin, listeners, remove } = installPlugin({
      downloadAndInstall: vi.fn(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve
          }),
      ),
    })
    const { result } = renderHook(() => useUpdateInstall(UPDATE))

    let done: Promise<void> = Promise.resolve()
    act(() => {
      done = result.current.start()
    })
    await waitFor(() => expect(result.current.status).toBe('downloading'))
    await waitFor(() => expect(listeners).toHaveLength(1))
    expect(plugin.downloadAndInstall).toHaveBeenCalledWith({ url: URL_OK, sha256: SHA })

    act(() => listeners[0]({ received: 50, total: 200 }))
    expect(result.current.progress).toBe(0.25)

    await act(async () => {
      finish()
      await done
    })
    expect(result.current.status).toBe('installer')
    expect(remove).toHaveBeenCalled()
  })

  it('surfaces errors so the user can retry', async () => {
    installPlugin({ downloadAndInstall: vi.fn(async () => Promise.reject(new Error('Checksum mismatch'))) })
    const { result } = renderHook(() => useUpdateInstall(UPDATE))

    await act(async () => {
      await result.current.start()
    })
    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Checksum mismatch')
  })
})
