// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { Button } from '../../../../components/button/button'
import { Modal } from '../../../../components/modal/modal'
import type { ActivityEntry } from '../../../../types'
import { getDateStr } from '../../../../utils/nutrition'

const QUICK_NAMES = ['Walk', 'Run', 'Cycle', 'Hike', 'Swim', 'Lift']

interface Props {
  open: boolean
  onClose: () => void
  onSave: (entry: ActivityEntry) => void
  defaultDate?: string
}

export function ActivityEntryForm({ open, onClose, onSave, defaultDate }: Props) {
  const [name, setName] = useState('')
  const [duration, setDuration] = useState('')
  const [calories, setCalories] = useState('')
  const [date, setDate] = useState(defaultDate ?? getDateStr())

  const handleSave = () => {
    if (!name.trim() || !calories) return
    onSave({
      id: uuid(),
      name: name.trim(),
      caloriesBurned: Math.round(Number(calories) || 0),
      durationMins: Math.round(Number(duration) || 0),
      date,
      createdAt: new Date().toISOString(),
    })
    setName('')
    setDuration('')
    setCalories('')
    onClose()
  }

  const handleClose = () => {
    setName('')
    setDuration('')
    setCalories('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Log Activity">
      <div className="space-y-4">
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Activity</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {QUICK_NAMES.map((n) => (
              <button
                key={n}
                onClick={() => setName(n)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                  name === n ? 'bg-brand text-black' : 'glass text-white/40 hover:bg-white/[0.06] hover:text-white/60'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Morning hike, Basketball..."
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand/40 focus:bg-white/[0.06]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Duration (min)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 45"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand/40 focus:bg-white/[0.06]"
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Calories burned</label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="e.g. 400"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand/40 focus:bg-white/[0.06]"
              inputMode="numeric"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand/40 focus:bg-white/[0.06] [color-scheme:dark]"
          />
        </div>

        <p className="text-[10px] text-white/20">
          Use your fitness tracker or watch reading — any number is better than nothing.
        </p>

        <div className="flex gap-3 justify-end pt-1">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !calories}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  )
}
