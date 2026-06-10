// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { Minus, Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { Button } from '../../../../components/button/button'
import type { WeightEntry } from '../../../../types'
import { getDateStr, getWeeklyAverages, getWeightTrend } from '../../../../utils/nutrition'

interface Props {
  weights: WeightEntry[]
  onAddWeight: (entry: WeightEntry) => void
  onDeleteWeight: (id: string) => void
}

export function WeightTracker({ weights, onAddWeight, onDeleteWeight }: Props) {
  const [weight, setWeight] = useState('')
  const [unit, setUnit] = useState<'kg' | 'lbs'>(weights[0]?.unit ?? 'kg')
  const [date, setDate] = useState(getDateStr())
  const [showAll, setShowAll] = useState(false)

  const trend30 = getWeightTrend(weights, 30)
  const weeklyAvgs = getWeeklyAverages(weights, 8)

  const sorted = [...weights].sort((a, b) => b.date.localeCompare(a.date))
  const displayWeights = showAll ? sorted : sorted.slice(0, 7)

  const handleAdd = () => {
    const w = Number(weight)
    if (!w || w <= 0) return
    onAddWeight({
      id: uuid(),
      weight: w,
      unit,
      date,
      createdAt: new Date().toISOString(),
    })
    setWeight('')
  }

  return (
    <div className="space-y-4">
      {/* Quick add */}
      <div className="glass rounded-xl p-4 space-y-3">
        <h3 className="text-xs text-white/40 uppercase tracking-wider">Log Weight</h3>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            max="1000"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={unit === 'kg' ? 'e.g. 75.5' : 'e.g. 165'}
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand/40 focus:bg-white/[0.06]"
            inputMode="decimal"
            step="0.1"
          />
          <div className="flex bg-white/[0.04] rounded-lg p-0.5 border border-white/10">
            <button
              onClick={() => setUnit('kg')}
              className={`px-3 py-2 rounded text-[10px] font-medium transition-colors ${
                unit === 'kg' ? 'bg-white/[0.06] text-white' : 'text-white/40'
              }`}
            >
              kg
            </button>
            <button
              onClick={() => setUnit('lbs')}
              className={`px-3 py-2 rounded text-[10px] font-medium transition-colors ${
                unit === 'lbs' ? 'bg-white/[0.06] text-white' : 'text-white/40'
              }`}
            >
              lbs
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand/40 focus:bg-white/[0.06] [color-scheme:dark]"
          />
          <Button onClick={handleAdd} disabled={!weight || Number(weight) <= 0} className="flex items-center gap-1.5">
            <Plus size={14} /> Log
          </Button>
        </div>
      </div>

      {/* 30-day trend */}
      {trend30 && (
        <div className="glass rounded-xl p-4">
          <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">30-Day Trend</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-2xl font-heading">
                {trend30.lastWeight} <span className="text-sm text-white/30">{trend30.unit}</span>
              </p>
              <p className="text-[10px] text-white/25">Current</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                {trend30.weeklyChangeKg > 0.05 ? (
                  <TrendingUp size={16} className="text-red-400" />
                ) : trend30.weeklyChangeKg < -0.05 ? (
                  <TrendingDown size={16} className="text-green-400" />
                ) : (
                  <Minus size={16} className="text-white/30" />
                )}
                <span
                  className={`text-sm font-medium ${
                    Math.abs(trend30.weeklyChangeKg) < 0.05
                      ? 'text-white/40'
                      : trend30.weeklyChangeKg > 0
                        ? 'text-red-400'
                        : 'text-green-400'
                  }`}
                >
                  {trend30.weeklyChangeKg > 0 ? '+' : ''}
                  {Math.round(trend30.weeklyChangeKg * 100) / 100} kg/wk
                </span>
              </div>
              <p className="text-[10px] text-white/25">
                {trend30.entries} weigh-ins over {trend30.daysBetween}d
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Weekly averages */}
      {weeklyAvgs.length > 1 && (
        <div className="glass rounded-xl p-4">
          <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">Weekly Averages</h3>
          <div className="space-y-2">
            {(() => {
              const maxWeight = Math.max(...weeklyAvgs.map((ww) => ww.avg))
              const minWeight = Math.min(...weeklyAvgs.map((ww) => ww.avg))
              const range = maxWeight - minWeight || 1
              return weeklyAvgs.map((w, i) => {
                const prev = weeklyAvgs[i - 1]
                const diff = prev ? w.avg - prev.avg : 0
                const barPercent = ((w.avg - minWeight) / range) * 60 + 20

                return (
                  <div key={w.week} className="flex items-center gap-3">
                    <span className="text-[10px] text-white/30 w-16 shrink-0">{w.week}</span>
                    <div className="flex-1 h-3 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand/30 transition-all duration-300"
                        style={{ width: `${barPercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/60 w-16 text-right">
                      {w.avg} {w.unit}
                    </span>
                    {prev && (
                      <span
                        className={`text-[10px] w-12 text-right ${
                          Math.abs(diff) < 0.1 ? 'text-white/20' : diff > 0 ? 'text-red-400/60' : 'text-green-400/60'
                        }`}
                      >
                        {diff > 0 ? '+' : ''}
                        {Math.round(diff * 10) / 10}
                      </span>
                    )}
                    {!prev && <span className="w-12" />}
                  </div>
                )
              })
            })()}
          </div>
        </div>
      )}

      {/* Recent entries */}
      {sorted.length > 0 && (
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-3 py-2.5 border-b border-white/5">
            <h3 className="text-xs text-white/40 uppercase tracking-wider">Recent Weigh-Ins</h3>
          </div>
          <div className="divide-y divide-white/5">
            {displayWeights.map((w) => (
              <div key={w.id} className="px-3 py-2 flex items-center gap-3">
                <span className="text-[10px] text-white/30 w-20">
                  {new Date(`${w.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-xs flex-1">
                  {w.weight} {w.unit}
                </span>
                <button
                  onClick={() => onDeleteWeight(w.id)}
                  className="p-1 hover:bg-red-900/30 rounded opacity-30 hover:opacity-100"
                >
                  <Trash2 size={12} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
          {sorted.length > 7 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full text-center py-2 text-[10px] text-white/30 hover:text-white/50 transition-colors"
            >
              {showAll ? 'Show less' : `Show all ${sorted.length} entries`}
            </button>
          )}
        </div>
      )}

      {sorted.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-white/30">No weight entries yet</p>
          <p className="text-[10px] text-white/15 mt-1">Log your weight regularly to see trends</p>
        </div>
      )}
    </div>
  )
}
