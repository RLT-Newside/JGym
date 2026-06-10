// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Session } from '../../../../types'

interface Props {
  sessions: Session[]
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
}

export function CalendarGrid({ sessions, selectedDate, onSelectDate }: Props) {
  const [viewDate, setViewDate] = useState(() => new Date())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const sessionDates = useMemo(() => {
    const dates = new Set<string>()
    sessions.forEach((s) => dates.add(new Date(s.date).toISOString().split('T')[0]))
    return dates
  }, [sessions])

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return cells
  }, [year, month])

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="glass rounded-xl p-3">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded">
          <ChevronLeft size={18} />
        </button>
        <span className="font-heading text-base">{monthLabel}</span>
        <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-[10px] text-white/20 py-1">
            {d}
          </div>
        ))}
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const hasSession = sessionDates.has(dateStr)
          const isSelected = selectedDate === dateStr

          return (
            <button
              key={dateStr}
              onClick={() => (hasSession ? onSelectDate(isSelected ? null : dateStr) : undefined)}
              className={`py-1.5 text-xs rounded relative transition-colors ${
                isSelected
                  ? 'bg-brand text-black font-bold'
                  : hasSession
                    ? 'bg-brand/10 text-brand hover:bg-brand/20'
                    : 'text-white/30'
              }`}
            >
              {day}
              {hasSession && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
