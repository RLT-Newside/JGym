// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { Download, RotateCcw, ShieldAlert, Sparkles, X } from 'lucide-react'
import { useBackHandler } from '../../hooks/useBackButton'
import type { UpdateInfo } from '../../hooks/useUpdateCheck'
import { useUpdateInstall } from '../../hooks/useUpdateInstall'

interface Props {
  update: UpdateInfo
  open: boolean
  onClose: () => void
}

export function UpdateBanner({ update, open, onClose }: Props) {
  const install = useUpdateInstall(update)
  const busy = install.status === 'downloading'
  useBackHandler(() => {
    if (!busy) onClose()
    return true
  }, open)

  if (!open) return null

  const percent = install.progress === null ? null : Math.round(install.progress * 100)

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-8">
      <div className="bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/[0.1] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-brand/15 flex items-center justify-center">
            <Sparkles size={20} className="text-brand" />
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            disabled={busy}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 disabled:opacity-30"
          >
            <X size={18} />
          </button>
        </div>

        <h3 className="text-base font-heading font-bold">Update available</h3>
        <p className="text-sm text-white/50 mt-1">
          Version <span className="text-white/80 font-medium">{update.version}</span> is ready to{' '}
          {install.supported ? 'install' : 'download'}.
        </p>

        {install.supported && install.canInstall === false && install.status === 'idle' && (
          <div className="flex gap-2 mt-4 p-3 rounded-xl bg-white/5 text-xs text-white/60">
            <ShieldAlert size={14} className="shrink-0 mt-0.5 text-brand" />
            <p>
              Android will ask once to allow installs from JGym.{' '}
              <button type="button" onClick={install.openInstallSettings} className="text-brand hover:underline">
                Open settings
              </button>
            </p>
          </div>
        )}

        {busy && (
          <div className="mt-4" role="status">
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent ?? undefined}
                className={`h-full bg-brand transition-[width] ${percent === null ? 'w-1/3 animate-pulse' : ''}`}
                style={percent === null ? undefined : { width: `${percent}%` }}
              />
            </div>
            <p className="text-xs text-white/40 mt-2">Downloading… {percent !== null && `${percent}%`}</p>
          </div>
        )}

        {install.status === 'installer' && (
          <p className="text-xs text-white/50 mt-4">Installer opened — tap “Update” to finish.</p>
        )}

        {install.status === 'error' && <p className="text-xs text-red-400/80 mt-4">Update failed: {install.error}</p>}

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl bg-white/8 text-sm text-white/60 font-medium hover:bg-white/12 transition-colors disabled:opacity-40"
          >
            Not now
          </button>
          {install.supported ? (
            <button
              type="button"
              onClick={install.start}
              disabled={busy}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand text-black text-sm font-bold hover:bg-brand/90 transition-colors disabled:opacity-60"
            >
              {install.status === 'idle' || busy ? <Download size={14} /> : <RotateCcw size={14} />}
              {install.status === 'idle' || busy ? 'Update' : install.status === 'error' ? 'Retry' : 'Install again'}
            </button>
          ) : (
            <a
              href={update.url}
              target="_blank"
              rel="noreferrer"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand text-black text-sm font-bold hover:bg-brand/90 transition-colors"
            >
              <Download size={14} />
              Download
            </a>
          )}
        </div>

        {install.supported && install.status === 'error' && (
          <a
            href={update.url}
            target="_blank"
            rel="noreferrer"
            className="block text-center text-xs text-white/40 hover:text-white/70 mt-3"
          >
            Download manually
          </a>
        )}
      </div>
    </div>
  )
}
