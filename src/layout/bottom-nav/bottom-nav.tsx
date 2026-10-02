// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { Calendar, Dumbbell, Home, Play, UtensilsCrossed } from 'lucide-react'
import type { Tab } from '../../types'

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
  sessionActive?: boolean
  hidden?: boolean
}

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'exercises', label: 'Exercises', icon: Dumbbell },
  { id: 'train', label: 'Train', icon: Play },
  { id: 'nutrition', label: 'Nutrition', icon: UtensilsCrossed },
  { id: 'history', label: 'History', icon: Calendar },
]

export function BottomNav({ active, onChange, sessionActive, hidden }: Props) {
  // Hidden while the software keyboard is open so the form gets the space (JGYM-43).
  if (hidden) return null

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-40 glass-nav border-t safe-bottom">
      <div className="flex items-center justify-around">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          const isTrain = id === 'train'
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`relative flex flex-col items-center py-2.5 px-2 min-w-0 flex-1 transition-all press-scale ${
                isTrain ? (isActive ? 'text-black' : 'text-brand') : isActive ? 'text-brand' : 'text-white/35'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isTrain ? 'bg-brand shadow-[0_0_16px_var(--color-brand)] shadow-brand/30' : isActive ? '' : ''
                }`}
              >
                <Icon size={20} fill={isTrain && !isActive ? 'none' : undefined} />
              </div>
              <span className="text-[9px] mt-0.5 font-medium">{label}</span>
              {isActive && !isTrain && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-brand shadow-[0_0_6px_var(--color-brand)]" />
              )}
              {isTrain && sessionActive && !isActive && (
                <span className="absolute top-1.5 right-3 w-2 h-2 rounded-full bg-brand animate-pulse" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
