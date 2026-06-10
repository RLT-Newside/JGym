// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { useMemo } from 'react'

const FIXED_COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#c084fc', '#fb923c']

interface Props {
  trigger: number // increment this to re-fire the burst
}

export function PRConfetti({ trigger }: Props) {
  const particles = useMemo(() => {
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-brand').trim() || '#f5e642'
    const colors = [accent, ...FIXED_COLORS]
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      size: 4 + Math.random() * 4,
      color: colors[i % colors.length],
      delay: Math.random() * 0.25,
      duration: 0.7 + Math.random() * 0.5,
      shape: i % 3 === 0 ? '2px' : '50%',
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  if (trigger === 0) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 overflow-visible">
      {particles.map((p) => (
        <div
          key={`${trigger}-${p.id}`}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: 0,
            width: p.size,
            height: p.size,
            borderRadius: p.shape,
            backgroundColor: p.color,
            animation: `confetti-rise ${p.duration}s ${p.delay}s ease-out forwards`,
          }}
        />
      ))}
    </div>
  )
}
