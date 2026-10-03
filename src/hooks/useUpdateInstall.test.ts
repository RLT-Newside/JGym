import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { UpdateInfo } from './useUpdateCheck'
import { useUpdateInstall } from './useUpdateInstall'

const UPDATE: UpdateInfo = {
  version: 'v2.0.0',
  url: 'https://github.com/RLT-Newside/JGym/releases/download/v2.0.0/JGym-v2.0.0.apk',
  sha256: '646fe66d66c672d40f318a16421838ac6b98be36934e92bb9697e0072ea4263d',
  size: 11298707,
}

type Progress = { bytes: number; total: number }

// Mirrors the object Capacitor's Android bridge exposes on window.Capacitor.Plugins:
// every @PluginMethod plus an addListener that returns { remove } synchronously.
function installFakePlugin() {
  let onProgress: ((p: Progress) => void) | null = null
  const plugin = {
    canInstall: vi.fn().mockResolvedValue({ allowed: true }),
    download: vi.fn().mockResolvedValue(undefined),
    install: vi.fn().mockResolvedValue(undefined),
    addListener: vi.fn((_event: string, cb: (p: Progress) => void) => {
      onProgress = cb
      return {
        remove: vi.fn(async () => {
          onProgress = null
        }),
      }
    }),
  }
  ;(window as any).Capacitor = { Plugins: { AppUpdate: plugin } }
  return { plugin, emitProgress: (bytes: number, total: number) => onProgress?.({ bytes, total }) }
}

function appStateListener(): (state: { isActive: boolean }) => void {
  // App.addListener is overloaded per event; the mock's call typing only sees the last overload.
  const call = vi.mocked(App.addListener).mock.calls.find(([event]) => (event as string) === 'appStateChange')
  if (!call) throw new Error('appStateChange listener not registered')
  return call[1] as unknown as (state: { isActive: boolean }) => void
}

beforeEach(() => {
  vi.mocked(App.addListener).mockClear()
})

afterEach(() => {
  delete (window as any).Capacitor
  vi.restoreAllMocks()
})

describe('useUpdateInstall on web', () => {
  it('is unsupported and never downloads, even if a plugin object exists', async () => {
    const { plugin } = installFakePlugin()

    const { result } = renderHook(() => useUpdateInstall(UPDATE))
    await act(() => result.current.start())

    expect(result.current.supported).toBe(false)
    expect(plugin.download).not.toHaveBeenCalled()
    expect(result.current.state).toEqual({ phase: 'idle' })
  })
})

describe('useUpdateInstall on Android', () => {
  beforeEach(() => {
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true)
  })

  it('downloads the release APK with its checksum, then opens the installer', async () => {
    const { plugin } = installFakePlugin()

    const { result } = renderHook(() => useUpdateInstall(UPDATE))
    expect(result.current.supported).toBe(true)
    await act(() => result.current.start())

    expect(plugin.download).toHaveBeenCalledWith({
      url: 'https://github.com/RLT-Newside/JGym/releases/download/v2.0.0/JGym-v2.0.0.apk',
      fileName: 'JGym-v2.0.0.apk',
      sha256: '646fe66d66c672d40f318a16421838ac6b98be36934e92bb9697e0072ea4263d',
    })
    expect(plugin.install).toHaveBeenCalledTimes(1)
    expect(plugin.install.mock.invocationCallOrder[0]).toBeGreaterThan(plugin.download.mock.invocationCallOrder[0])
    expect(result.current.state).toEqual({ phase: 'installer' })
  })

  it('does nothing without an update', async () => {
    const { plugin } = installFakePlugin()

    const { result } = renderHook(() => useUpdateInstall(null))
    await act(() => result.current.start())

    expect(plugin.download).not.toHaveBeenCalled()
    expect(result.current.state).toEqual({ phase: 'idle' })
  })

  it('reports download progress as a fraction, or null while the size is unknown', async () => {
    const { plugin, emitProgress } = installFakePlugin()
    let finishDownload!: () => void
    plugin.download.mockReturnValue(
      new Promise<void>((resolve) => {
        finishDownload = resolve
      }),
    )

    const { result } = renderHook(() => useUpdateInstall(UPDATE))
    let started!: Promise<void>
    act(() => {
      started = result.current.start()
    })
    await waitFor(() => expect(plugin.download).toHaveBeenCalled())
    expect(result.current.state).toEqual({ phase: 'downloading', progress: null })

    act(() => emitProgress(5_000_000, 10_000_000))
    expect(result.current.state).toEqual({ phase: 'downloading', progress: 0.5 })

    act(() => emitProgress(1_000, -1))
    expect(result.current.state).toEqual({ phase: 'downloading', progress: null })

    await act(async () => {
      finishDownload()
      await started
    })
    expect(result.current.state).toEqual({ phase: 'installer' })
  })

  it('stops listening for progress once the download finished', async () => {
    const { emitProgress } = installFakePlugin()

    const { result } = renderHook(() => useUpdateInstall(UPDATE))
    await act(() => result.current.start())
    act(() => emitProgress(10, 100))

    expect(result.current.state).toEqual({ phase: 'installer' })
  })

  it('ends in error and does not open the installer when the download fails', async () => {
    const { plugin } = installFakePlugin()
    plugin.download.mockRejectedValue(Object.assign(new Error('Checksum mismatch'), { code: 'CHECKSUM' }))

    const { result } = renderHook(() => useUpdateInstall(UPDATE))
    await act(() => result.current.start())

    expect(plugin.install).not.toHaveBeenCalled()
    expect(result.current.state).toEqual({ phase: 'error' })
  })

  it('ends in error when the installer cannot be opened', async () => {
    const { plugin } = installFakePlugin()
    plugin.install.mockRejectedValue(new Error('No installer'))

    const { result } = renderHook(() => useUpdateInstall(UPDATE))
    await act(() => result.current.start())

    expect(result.current.state).toEqual({ phase: 'error' })
  })

  it.each([
    [false, true],
    [true, false],
  ])('when Android reports install allowed=%s, needsPermission is %s', async (allowed, needsPermission) => {
    const { plugin } = installFakePlugin()
    plugin.canInstall.mockResolvedValue({ allowed })

    const { result } = renderHook(() => useUpdateInstall(UPDATE))

    await waitFor(() => expect(plugin.canInstall).toHaveBeenCalled())
    await waitFor(() => expect(result.current.needsPermission).toBe(needsPermission))
  })

  it('re-checks the permission when the user comes back from Android settings', async () => {
    const { plugin } = installFakePlugin()
    plugin.canInstall.mockResolvedValue({ allowed: false })

    const { result } = renderHook(() => useUpdateInstall(UPDATE))
    await waitFor(() => expect(result.current.needsPermission).toBe(true))

    plugin.canInstall.mockResolvedValue({ allowed: true })
    act(() => appStateListener()({ isActive: true }))

    await waitFor(() => expect(result.current.needsPermission).toBe(false))
  })
})
