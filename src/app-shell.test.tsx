import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppShell } from './app-shell'
import { STORAGE_KEYS } from './data/storage'
import { renderWithAppData } from './test/render-with-app-data'

const RELEASE = {
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
}

beforeEach(() => {
  vi.stubGlobal('__APP_VERSION__', '1.0.0')
  localStorage.setItem(STORAGE_KEYS.privacyConsent, 'true')
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) =>
      url === 'https://api.github.com/repos/RLT-Newside/JGym/releases/latest'
        ? { ok: true, json: async () => RELEASE }
        : { ok: false, status: 404, json: async () => ({}) },
    ),
  )
})

describe('AppShell update dialog', () => {
  it('can be reopened from Settings after it was dismissed', async () => {
    renderWithAppData(<AppShell />, { settingsOpen: true })

    await userEvent.click(await screen.findByRole('button', { name: 'Not now' }))
    expect(screen.queryByRole('heading', { name: 'Update available' })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Update available: v2.0.0' }))

    expect(screen.getByRole('heading', { name: 'Update available' })).toBeInTheDocument()
  })
})
