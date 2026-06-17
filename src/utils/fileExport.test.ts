import { Capacitor } from '@capacitor/core'
import { Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { exportImageFile } from './fileExport'

vi.mock('@capacitor/filesystem', () => ({
  Directory: { Cache: 'CACHE' },
  Encoding: { UTF8: 'utf8' },
  Filesystem: { writeFile: vi.fn(async () => ({ uri: 'file:///cache/workout.png' })) },
}))

vi.mock('@capacitor/share', () => ({
  Share: { share: vi.fn(async () => {}) },
}))

const makeBlob = () => new Blob(['fake-png'], { type: 'image/png' })

describe('exportImageFile (web)', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:mock')
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shares via navigator.share when share=true and canShare allows', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { canShare: vi.fn(() => true), share })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    await exportImageFile(makeBlob(), 'workout.png', 'Workout', true)

    expect(share).toHaveBeenCalledOnce()
    expect(click).not.toHaveBeenCalled()
  })

  it('falls back to download when canShare is false', async () => {
    Object.assign(navigator, { canShare: vi.fn(() => false) })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    await exportImageFile(makeBlob(), 'workout.png', 'Workout', true)

    expect(click).toHaveBeenCalledOnce()
    expect(URL.createObjectURL).toHaveBeenCalled()
  })

  it('downloads directly when share=false', async () => {
    const share = vi.fn()
    Object.assign(navigator, { canShare: vi.fn(() => true), share })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    await exportImageFile(makeBlob(), 'workout.png', 'Workout', false)

    expect(share).not.toHaveBeenCalled()
    expect(click).toHaveBeenCalledOnce()
  })

  it('falls back to download when navigator.share rejects', async () => {
    Object.assign(navigator, {
      canShare: vi.fn(() => true),
      share: vi.fn().mockRejectedValue(new Error('cancelled')),
    })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    await exportImageFile(makeBlob(), 'workout.png', 'Workout', true)

    expect(click).toHaveBeenCalledOnce()
  })
})

describe('exportImageFile (native)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('writes the PNG to cache and opens the Capacitor share sheet', async () => {
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true)

    await exportImageFile(makeBlob(), 'workout.png', 'Workout Summary', true)

    expect(Filesystem.writeFile).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'workout.png', directory: 'CACHE' }),
    )
    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Workout Summary', url: 'file:///cache/workout.png' }),
    )
  })
})
