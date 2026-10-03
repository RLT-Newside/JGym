import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithAppData } from '../../test/render-with-app-data'
import { SettingsModal } from './settings-modal'

beforeEach(() => {
  vi.stubGlobal('__APP_VERSION__', '1.7.4')
})

describe('SettingsModal update entry', () => {
  it('reopens the in-app update dialog instead of linking to the APK', async () => {
    const onOpenUpdate = vi.fn()
    renderWithAppData(
      <SettingsModal
        open
        onClose={vi.fn()}
        onImport={vi.fn()}
        exercises={[]}
        onImportExercises={vi.fn()}
        theme="yellow"
        onThemeChange={vi.fn()}
        isSupporter={false}
        onActivateCode={vi.fn(async () => false)}
        onRevoke={vi.fn()}
        update={{
          version: 'v2.0.0',
          url: 'https://github.com/RLT-Newside/JGym/releases/download/v2.0.0/JGym-v2.0.0.apk',
        }}
        onOpenUpdate={onOpenUpdate}
        onCheckUpdate={vi.fn()}
        checkingUpdate={false}
        musicPopupDisabled={false}
        onToggleMusicPopup={vi.fn()}
        demoMode={false}
        onEnterDemo={vi.fn()}
        onExitDemo={vi.fn()}
        onToggleDemoPremium={vi.fn()}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Update available: v2.0.0' }))

    expect(onOpenUpdate).toHaveBeenCalledOnce()
    expect(screen.queryByRole('link', { name: /update available/i })).not.toBeInTheDocument()
  })
})
