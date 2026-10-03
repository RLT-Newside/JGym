// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { Download, Sparkles, X } from 'lucide-react'
import { useBackHandler } from '../../hooks/useBackButton'
import { RELEASES_URL, type UpdateInfo } from '../../hooks/useUpdateCheck'
import type { UpdateInstaller } from '../../hooks/useUpdateInstall'

interface Props {
  update: UpdateInfo
  installer: UpdateInstaller
  onClose: () => void
}

const PRIMARY =
  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand text-black text-sm font-bold hover:bg-brand/90 transition-colors'
const SECONDARY =
  'flex-1 py-2.5 rounded-xl bg-white/8 text-sm text-center text-white/60 font-medium hover:bg-white/12 transition-colors'

function NativeActions({ installer, onClose }: { installer: UpdateInstaller; onClose: () => void }) {
  const { state, start } = installer

  if (state.phase === 'downloading') {
    const percent = state.progress === null ? null : Math.round(state.progress * 100)
    return (
      <div className="mt-5">
        <div
          role="progressbar"
          aria-label="Download progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent ?? undefined}
          className="h-1.5 rounded-full bg-white/10 overflow-hidden"
        >
          <div
            className={`h-full bg-brand transition-[width] duration-200 ${percent === null ? 'w-full animate-pulse' : ''}`}
            style={percent === null ? undefined : { width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-white/50 mt-2">Downloading…{percent !== null && ` ${percent}%`}</p>
      </div>
    )
  }

  if (state.phase === 'installer') {
    return (
      <>
        <p className="text-sm text-white/70 mt-4">Confirm the update in the Android dialog.</p>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className={SECONDARY}>
            Not now
          </button>
          <button onClick={() => start()} className={PRIMARY}>
            Open installer again
          </button>
        </div>
      </>
    )
  }

  if (state.phase === 'error') {
    return (
      <>
        <p className="text-sm text-red-400/80 mt-4">Update failed.</p>
        <div className="flex gap-3 mt-5">
          <a href={RELEASES_URL} target="_blank" rel="noreferrer" className={SECONDARY}>
            Download manually
          </a>
          <button onClick={() => start()} className={PRIMARY}>
            Try again
          </button>
        </div>
      </>
    )
  }

  return (
    <div className="flex gap-3 mt-5">
      <button onClick={onClose} className={SECONDARY}>
        Not now
      </button>
      <button onClick={() => start()} className={PRIMARY}>
        <Download size={14} />
        Update
      </button>
    </div>
  )
}

export function UpdateBanner({ update, installer, onClose }: Props) {
  useBackHandler(() => {
    onClose()
    return true
  })

  const sizeMb = update.size ? Math.max(1, Math.round(update.size / 1_000_000)) : null

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-8">
      <div className="bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/[0.1] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-brand/15 flex items-center justify-center">
            <Sparkles size={20} className="text-brand" />
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        <h3 className="text-base font-heading font-bold">Update available</h3>
        <p className="text-sm text-white/50 mt-1">
          Version <span className="text-white/80 font-medium">{update.version}</span> is ready to download
          {sizeMb && ` (${sizeMb} MB)`}.
        </p>

        {installer.supported ? (
          <>
            <NativeActions installer={installer} onClose={onClose} />
            {installer.needsPermission && installer.state.phase !== 'error' && (
              <p className="text-[11px] text-white/40 mt-3 leading-relaxed">
                First update: Android asks once to allow installs from JGym — allow it, then confirm the update.
              </p>
            )}
          </>
        ) : (
          <div className="flex gap-3 mt-5">
            <button onClick={onClose} className={SECONDARY}>
              Not now
            </button>
            <a href={update.url} target="_blank" rel="noreferrer" onClick={onClose} className={PRIMARY}>
              <Download size={14} />
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
