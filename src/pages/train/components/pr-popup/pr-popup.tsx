// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { useEffect } from 'react'
import { PRConfetti } from '../pr-confetti/pr-confetti'

interface Props {
  pr: { name: string; key: number } | null
  onDone: () => void
}

// Celebratory overlay shown the moment a set beats the all-time PR for an
// exercise during a live session. Auto-dismisses after a short burst.
export function PRPopup({ pr, onDone }: Props) {
  useEffect(() => {
    if (!pr) return
    const t = setTimeout(onDone, 2600)
    return () => clearTimeout(t)
  }, [pr, onDone])

  if (!pr) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="relative">
        <PRConfetti trigger={pr.key} />
        <div
          className="flex flex-col items-center gap-1 px-8 py-6 rounded-2xl bg-black/85 border border-brand/40 shadow-2xl"
          style={{ animation: 'pr-pop 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)' }}
        >
          <span className="text-4xl">🏆</span>
          <span className="font-heading text-2xl text-brand tracking-wide">NEW PR!</span>
          <span className="text-sm text-white/70 max-w-[200px] text-center truncate">{pr.name}</span>
        </div>
      </div>
    </div>
  )
}
