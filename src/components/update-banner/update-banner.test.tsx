import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { UpdateInfo } from '../../hooks/useUpdateCheck'
import type { InstallState, UpdateInstaller } from '../../hooks/useUpdateInstall'
import { UpdateBanner } from './update-banner'

const UPDATE: UpdateInfo = {
  version: 'v2.0.0',
  url: 'https://github.com/RLT-Newside/JGym/releases/download/v2.0.0/JGym-v2.0.0.apk',
  sha256: '646fe66d66c672d40f318a16421838ac6b98be36934e92bb9697e0072ea4263d',
  size: 11298707,
}

function nativeInstaller(state: InstallState, overrides: Partial<UpdateInstaller> = {}): UpdateInstaller {
  return { supported: true, state, needsPermission: false, start: vi.fn().mockResolvedValue(undefined), ...overrides }
}

describe('UpdateBanner on Android', () => {
  it('starts the in-app update when Update is tapped', async () => {
    const installer = nativeInstaller({ phase: 'idle' })
    render(<UpdateBanner update={UPDATE} installer={installer} onClose={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Update' }))

    expect(installer.start).toHaveBeenCalledOnce()
    expect(screen.queryByRole('link', { name: /download/i })).not.toBeInTheDocument()
  })

  it('shows download progress instead of the Update button while downloading', () => {
    render(
      <UpdateBanner
        update={UPDATE}
        installer={nativeInstaller({ phase: 'downloading', progress: 0.45 })}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '45')
    expect(screen.getByText(/45%/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Update' })).not.toBeInTheDocument()
  })

  it('shows an indeterminate progress bar while the size is unknown', () => {
    render(
      <UpdateBanner
        update={UPDATE}
        installer={nativeInstaller({ phase: 'downloading', progress: null })}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow')
  })

  it('lets the user reopen the installer after cancelling it', async () => {
    const installer = nativeInstaller({ phase: 'installer' })
    render(<UpdateBanner update={UPDATE} installer={installer} onClose={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Open installer again' }))

    expect(installer.start).toHaveBeenCalledOnce()
  })

  it('offers a retry and the manual download page after a failure', async () => {
    const installer = nativeInstaller({ phase: 'error' })
    render(<UpdateBanner update={UPDATE} installer={installer} onClose={vi.fn()} />)

    expect(screen.getByRole('link', { name: 'Download manually' })).toHaveAttribute(
      'href',
      'https://github.com/RLT-Newside/JGym/releases/latest',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(installer.start).toHaveBeenCalledOnce()
  })

  it.each([
    [true, true],
    [false, false],
  ])('when needsPermission=%s the one-time permission hint is shown=%s', (needsPermission, shown) => {
    render(
      <UpdateBanner
        update={UPDATE}
        installer={nativeInstaller({ phase: 'idle' }, { needsPermission })}
        onClose={vi.fn()}
      />,
    )

    const hint = screen.queryByText(/allow installs from JGym/i)
    if (shown) expect(hint).toBeInTheDocument()
    else expect(hint).not.toBeInTheDocument()
  })

  it('closes when Not now is tapped', async () => {
    const onClose = vi.fn()
    render(<UpdateBanner update={UPDATE} installer={nativeInstaller({ phase: 'idle' })} onClose={onClose} />)

    await userEvent.click(screen.getByRole('button', { name: 'Not now' }))

    expect(onClose).toHaveBeenCalledOnce()
  })
})

describe('UpdateBanner on web', () => {
  it('keeps the plain APK download link', () => {
    const installer: UpdateInstaller = { ...nativeInstaller({ phase: 'idle' }), supported: false }
    render(<UpdateBanner update={UPDATE} installer={installer} onClose={vi.fn()} />)

    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute(
      'href',
      'https://github.com/RLT-Newside/JGym/releases/download/v2.0.0/JGym-v2.0.0.apk',
    )
    expect(screen.queryByRole('button', { name: 'Update' })).not.toBeInTheDocument()
  })
})
