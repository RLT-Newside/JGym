// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { Activity, Dumbbell, Flame } from 'lucide-react'
import type { Exercise, Session } from '../../types'
import { ExerciseCard } from './components/exercise-card/exercise-card'
import { MusicCard } from './components/music-card/music-card'

interface Props {
  exercises: Exercise[]
  sessions: Session[]
  streak: number
  totalExerciseSets: number
  todayISO: string
  onExerciseClick: (exercise: Exercise) => void
}

export function DashboardView({ exercises, sessions, streak, totalExerciseSets, todayISO, onExerciseClick }: Props) {
  return (
    <div className="px-4 py-4 space-y-6">
      <div>
        <p className="text-xs text-white/30 uppercase tracking-wider">{todayISO}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-xl p-3 text-center">
          <Activity size={16} className="mx-auto text-white/30 mb-1" />
          <p className="font-heading text-2xl">{sessions.length}</p>
          <p className="text-[10px] text-white/40 uppercase">Sessions</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <Dumbbell size={16} className="mx-auto text-white/30 mb-1" />
          <p className="font-heading text-2xl">{totalExerciseSets}</p>
          <p className="text-[10px] text-white/40 uppercase">Sets logged</p>
        </div>
        <div className="glass rounded-xl p-3 text-center shadow-[0_0_20px_var(--color-brand)] shadow-brand/10">
          <Flame size={16} className="mx-auto text-brand/60 mb-1" />
          <p className="font-heading text-2xl text-brand">{streak}</p>
          <p className="text-[10px] text-white/40 uppercase">Streak</p>
        </div>
      </div>

      <MusicCard />

      <div>
        <h2 className="font-heading text-lg mb-3">EXERCISES</h2>
        {exercises.length === 0 ? (
          <p className="text-sm text-white/30">No exercises yet. Add one in the Exercises tab.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {exercises.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} sessions={sessions} onClick={() => onExerciseClick(ex)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
