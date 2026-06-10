// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { Download, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { useBackHandler } from '../../hooks/useBackButton'

interface Props {
  version: string
  url: string
}

export function UpdateBanner({ version, url }: Props) {
  const [dismissed, setDismissed] = useState(false)
  useBackHandler(() => {
    setDismissed(true)
    return true
  }, !dismissed)

  if (dismissed) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-8">
      <div className="bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/[0.1] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-brand/15 flex items-center justify-center">
            <Sparkles size={20} className="text-brand" />
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        <h3 className="text-base font-heading font-bold">Update available</h3>
        <p className="text-sm text-white/50 mt-1">
          Version <span className="text-white/80 font-medium">{version}</span> is ready to download.
        </p>

        <div className="flex gap-3 mt-5">
          <button
            onClick={() => setDismissed(true)}
            className="flex-1 py-2.5 rounded-xl bg-white/8 text-sm text-white/60 font-medium hover:bg-white/12 transition-colors"
          >
            Not now
          </button>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            onClick={() => setDismissed(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand text-black text-sm font-bold hover:bg-brand/90 transition-colors"
          >
            <Download size={14} />
            Download
          </a>
        </div>
      </div>
    </div>
  )
}
