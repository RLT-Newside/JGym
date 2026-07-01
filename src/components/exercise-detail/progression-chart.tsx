// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { useMemo } from 'react'
import type { Session } from '../../types'
import { formatDate } from '../../utils/format'
import { SectionHeader } from '../section-header/section-header'

interface Props {
  exerciseId: string
  sessions: Session[]
}

export function ProgressionChart({ exerciseId, sessions }: Props) {
  // Filter + sort + reduce over every session runs on each render otherwise.
  const points = useMemo(
    () =>
      [...sessions]
        .filter((s) => s.entries.some((e) => e.exerciseId === exerciseId))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((s) => {
          const entry = s.entries.find((e) => e.exerciseId === exerciseId)!
          const maxWeight = Math.max(...entry.sets.map((set) => set.weight))
          return { date: s.date, weight: maxWeight, unit: entry.sets[0]?.unit ?? 'kg' }
        }),
    [exerciseId, sessions],
  )

  if (points.length < 2) return null

  const W = 280
  const H = 80
  const PAD = { top: 8, right: 8, bottom: 20, left: 32 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const weights = points.map((p) => p.weight)
  const minW = Math.min(...weights)
  const maxWt = Math.max(...weights)
  const range = maxWt - minW || 1

  const x = (i: number) => PAD.left + (i / (points.length - 1)) * chartW
  const y = (w: number) => PAD.top + chartH - ((w - minW) / range) * chartH

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.weight).toFixed(1)}`).join(' ')

  const yLabels = [minW, minW + range / 2, maxWt].filter((v, i, a) => a.indexOf(v) === i)

  return (
    <div>
      <SectionHeader className="mb-2">Progression</SectionHeader>
      <div className="bg-white/[0.04] rounded-xl p-3">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
          {yLabels.map((v) => (
            <g key={v}>
              <line
                x1={PAD.left}
                y1={y(v).toFixed(1)}
                x2={PAD.left + chartW}
                y2={y(v).toFixed(1)}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 4}
                y={y(v)}
                textAnchor="end"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.3)"
                fontSize="8"
              >
                {v}
              </text>
            </g>
          ))}

          <path
            d={pathD}
            fill="none"
            stroke="var(--color-brand)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {points.map((p, i) => (
            <circle key={i} cx={x(i).toFixed(1)} cy={y(p.weight).toFixed(1)} r="2.5" fill="var(--color-brand)" />
          ))}

          {[0, points.length - 1].map((i) => (
            <text
              key={i}
              x={x(i)}
              y={H - 4}
              textAnchor={i === 0 ? 'start' : 'end'}
              fill="rgba(255,255,255,0.25)"
              fontSize="7"
            >
              {formatDate(points[i].date)}
            </text>
          ))}
        </svg>
        <p className="text-[9px] text-white/20 text-right mt-0.5">{points[0].unit} · max weight per session</p>
      </div>
    </div>
  )
}
