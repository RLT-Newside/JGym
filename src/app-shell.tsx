// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { useState } from 'react'
import { ErrorBoundary } from './components/error-boundary/error-boundary'
import { ExerciseDetail } from './components/exercise-detail/exercise-detail'
import { Modal } from './components/modal/modal'
import { PrivacyConsent } from './components/privacy-consent/privacy-consent'
import { SettingsModal } from './components/settings-modal/settings-modal'
import { UpdateBanner } from './components/update-banner/update-banner'
import { useAppData } from './context/app-data'
import { STORAGE_KEYS } from './data/storage'
import { useUpdateCheck } from './hooks/useUpdateCheck'
import { BottomNav } from './layout/bottom-nav/bottom-nav'
import { Header } from './layout/header/header'
import { AppRouter } from './router/router'

export function AppShell() {
  const {
    tab,
    setTab,
    settingsOpen,
    setSettingsOpen,
    detailExercise,
    setDetailExercise,
    sessions,
    startWith,
    sharedImport,
    setSharedImport,
    importBackup,
    exercises,
    importExercises,
    theme,
    setTheme,
    isSupporter,
    tryActivate,
    revoke,
    musicPopupDisabled,
    setMusicPopupDisabled,
  } = useAppData()

  const { update, checkNow, checking } = useUpdateCheck()

  const [privacyAccepted, setPrivacyAccepted] = useState(
    () => localStorage.getItem(STORAGE_KEYS.privacyConsent) === 'true',
  )

  const sharedKeyCount = sharedImport ? Object.keys(sharedImport).filter((k) => k.startsWith('gym_')).length : 0

  const applySharedImport = (mode: 'merge' | 'replace') => {
    if (!sharedImport) return
    importBackup(sharedImport, mode)
    setSharedImport(null)
    // importBackup only re-syncs exercises/sessions state; reload so every
    // gym_* key (plans, food, water, weight, goals, activity) re-initializes.
    window.location.reload()
  }

  if (!privacyAccepted) {
    return (
      <PrivacyConsent
        onAccept={() => {
          localStorage.setItem(STORAGE_KEYS.privacyConsent, 'true')
          setPrivacyAccepted(true)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#e8e4dc] pb-16 max-w-lg mx-auto">
      {update && <UpdateBanner version={update.version} url={update.url} />}
      <Header onSettingsClick={() => setSettingsOpen(true)} />

      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>

      <BottomNav active={tab} onChange={setTab} />

      <ExerciseDetail
        open={!!detailExercise}
        onClose={() => setDetailExercise(null)}
        exercise={detailExercise}
        sessions={sessions}
        onStartWith={startWith}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onImport={importBackup}
        exercises={exercises}
        onImportExercises={importExercises}
        theme={theme}
        onThemeChange={setTheme}
        isSupporter={isSupporter}
        onActivateCode={tryActivate}
        onRevoke={revoke}
        update={update}
        onCheckUpdate={checkNow}
        checkingUpdate={checking}
        musicPopupDisabled={musicPopupDisabled}
        onToggleMusicPopup={setMusicPopupDisabled}
      />

      <Modal open={!!sharedImport} onClose={() => setSharedImport(null)} title="Import Backup">
        <div className="space-y-4">
          <p className="text-sm text-white/70 leading-relaxed">
            Received a backup with {sharedKeyCount} data {sharedKeyCount === 1 ? 'section' : 'sections'}. Merge keeps
            your current data and adds new entries. Replace overwrites everything with the backup.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => applySharedImport('merge')}
              className="flex-1 py-2.5 rounded-xl bg-brand text-black text-sm font-medium hover:opacity-90 transition-opacity press-scale"
            >
              Merge
            </button>
            <button
              type="button"
              onClick={() => applySharedImport('replace')}
              className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-colors press-scale"
            >
              Replace
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSharedImport(null)}
            className="w-full py-2 text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  )
}
