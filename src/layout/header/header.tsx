// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { Settings } from 'lucide-react'

interface Props {
  onSettingsClick: () => void
}

export function Header({ onSettingsClick }: Props) {
  return (
    <header className="sticky top-0 z-40 glass-nav border-b px-4 py-3 flex items-center justify-between">
      <h1 className="font-heading text-2xl tracking-wide text-brand drop-shadow-[0_0_10px_var(--color-brand)]">JGYM</h1>
      <button onClick={onSettingsClick} className="p-2 hover:bg-white/10 rounded-lg transition-colors press-scale">
        <Settings size={20} className="text-white/50" />
      </button>
    </header>
  )
}
