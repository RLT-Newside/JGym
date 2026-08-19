// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { useMemo, useState } from 'react'
import type { Session } from '../../../../types'

type ChartMode = 'frequency' | 'volume'

interface Props {
  sessions: Session[]
}

interface DataPoint {
  label: string
  value: number
}

function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${week.toString().padStart(2, '0')}`
}

function buildFrequencyData(sessions: Session[]): DataPoint[] {
  const today = new Date()
  const weeks: string[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i * 7)
    weeks.push(isoWeekKey(d))
  }
  const counts: Record<string, number> = {}
  for (const w of weeks) counts[w] = 0
  for (const s of sessions) {
    const k = isoWeekKey(new Date(s.date))
    if (k in counts) counts[k]++
  }
  return weeks.map((w) => ({
    label: `W${w.split('-W')[1]}`,
    value: counts[w],
  }))
}

function buildVolumeData(sessions: Session[]): DataPoint[] {
  return [...sessions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-20)
    .map((s) => {
      const vol = s.entries.reduce((total, entry) => {
        return total + entry.sets.filter((set) => set.done).reduce((sum, set) => sum + set.weight * set.reps, 0)
      }, 0)
      const d = new Date(s.date)
      return {
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.round(vol),
      }
    })
    .filter((d) => d.value > 0)
}

const SVG_W = 280
const SVG_H = 80

function BarChart({ data, ariaLabel }: { data: DataPoint[]; ariaLabel: string }) {
  if (data.length === 0) return null
  const maxVal = Math.max(...data.map((d) => d.value), 1)
  const slot = SVG_W / data.length
  const barW = Math.max(2, slot - 3)

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      preserveAspectRatio="none"
      className="w-full h-20"
      role="img"
      aria-label={ariaLabel}
    >
      {data.map((d, i) => {
        const barH = Math.max(2, (d.value / maxVal) * SVG_H * 0.9)
        const x = i * slot + (slot - barW) / 2
        const y = SVG_H - barH
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={barH}
            rx={2}
            style={{ fill: 'var(--color-brand)', opacity: 0.8 }}
          />
        )
      })}
    </svg>
  )
}

function xLabels(data: DataPoint[]): DataPoint[] {
  if (data.length <= 6) return data
  const step = Math.ceil(data.length / 6)
  return data.filter((_, i) => i % step === 0 || i === data.length - 1)
}

export function AnalysisChart({ sessions }: Props) {
  const [mode, setMode] = useState<ChartMode>('frequency')

  const frequencyData = useMemo(() => buildFrequencyData(sessions), [sessions])
  const volumeData = useMemo(() => buildVolumeData(sessions), [sessions])

  const data = mode === 'frequency' ? frequencyData : volumeData
  const isEmpty = data.every((d) => d.value === 0) || data.length === 0

  const totalSessions = useMemo(() => frequencyData.reduce((s, d) => s + d.value, 0), [frequencyData])
  const peakVolume = useMemo(() => Math.max(...volumeData.map((d) => d.value), 0), [volumeData])
  const volumeUnit = useMemo(() => {
    const hasLbs = sessions.some((s) => s.entries.some((e) => e.sets.some((set) => set.unit === 'lbs')))
    return hasLbs ? 'lbs' : 'kg'
  }, [sessions])

  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs text-white/40 uppercase tracking-wider">Analysis</h3>
        <div className="flex gap-0.5 bg-white/[0.04] rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setMode('frequency')}
            className={`text-[10px] px-2 py-1 rounded-md transition-colors ${
              mode === 'frequency' ? 'bg-brand text-black font-medium' : 'text-white/50 hover:text-white/70'
            }`}
          >
            Frequency
          </button>
          <button
            type="button"
            onClick={() => setMode('volume')}
            className={`text-[10px] px-2 py-1 rounded-md transition-colors ${
              mode === 'volume' ? 'bg-brand text-black font-medium' : 'text-white/50 hover:text-white/70'
            }`}
          >
            Volume
          </button>
        </div>
      </div>

      {isEmpty ? (
        <p className="text-sm text-white/30 text-center py-4">No data yet. Start training!</p>
      ) : (
        <>
          <BarChart
            data={data}
            ariaLabel={
              mode === 'frequency' ? 'Sessions per week, last 12 weeks' : 'Volume per session, last 20 sessions'
            }
          />
          <div className="flex justify-between px-0.5">
            {xLabels(data).map((d, i) => (
              <span key={i} className="text-[8px] text-white/30">
                {d.label}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between text-[10px] text-white/30 pt-0.5">
            {mode === 'frequency' ? (
              <>
                <span>{totalSessions} sessions in 12 weeks</span>
                <span>avg {(totalSessions / 12).toFixed(1)}/wk</span>
              </>
            ) : (
              <>
                <span>
                  peak {peakVolume.toLocaleString()} {volumeUnit}
                </span>
                <span>last {volumeData.length} sessions</span>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
