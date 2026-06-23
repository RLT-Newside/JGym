// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { useEffect, useState } from 'react'
import { Button } from '../../../../components/button/button'
import { Modal } from '../../../../components/modal/modal'

interface Props {
  open: boolean
  currentSeconds: number
  onClose: () => void
  onSave: (seconds: number) => void
}

export function DurationEditModal({ open, currentSeconds, onClose, onSave }: Props) {
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')

  useEffect(() => {
    if (open) {
      const h = Math.floor(currentSeconds / 3600)
      const m = Math.floor((currentSeconds % 3600) / 60)
      setHours(h > 0 ? String(h) : '')
      setMinutes(String(m))
    }
  }, [open, currentSeconds])

  const handleSave = () => {
    const h = Number.parseInt(hours, 10) || 0
    const m = Number.parseInt(minutes, 10) || 0
    onSave(h * 3600 + m * 60)
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Duration">
      <div className="space-y-4">
        <div className="flex gap-3 items-end">
          <label className="flex-1">
            <span className="text-xs text-white/50 block mb-1">Hours</span>
            <input
              type="number"
              min="0"
              max="23"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="0"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
          </label>
          <label className="flex-1">
            <span className="text-xs text-white/50 block mb-1">Minutes</span>
            <input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="0"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
          </label>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </Modal>
  )
}
