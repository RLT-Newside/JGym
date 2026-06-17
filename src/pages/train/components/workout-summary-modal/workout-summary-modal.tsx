// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { Activity, Download, Dumbbell, Share2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '../../../../components/button/button'
import { Modal } from '../../../../components/modal/modal'
import type { Exercise, SavedPlan, Session } from '../../../../types'
import { exportImageFile } from '../../../../utils/fileExport'
import { formatDate, formatTimer } from '../../../../utils/format'
import { detectPattern, dismissPattern } from '../../../../utils/patternDetection'
import { calculatePR } from '../../../../utils/pr'
import { isStravaConnected, uploadSession } from '../../../../utils/strava'
import { PRConfetti } from '../pr-confetti/pr-confetti'

interface Props {
  session: Session | null
  sessions: Session[]
  exercises: Exercise[]
  savedPlans: SavedPlan[]
  elapsed: number
  onClose: () => void
  onNavigateToExercises?: () => void
  isSupporter?: boolean
}

function totalVolume(session: Session): number {
  return session.entries.reduce((sum, e) => sum + e.sets.reduce((s2, set) => s2 + set.reps * set.weight, 0), 0)
}

function getAccentColor(): string {
  return getComputedStyle(document.documentElement).getPropertyValue('--color-brand').trim() || '#f5e642'
}

function drawSummaryCard(
  session: Session,
  exercises: Exercise[],
  elapsed: number,
  isSupporter: boolean,
): HTMLCanvasElement {
  const W = 600
  const PADDING = 40
  const LINE_H = 24
  const headerH = 160
  const accent = getAccentColor()

  const exerciseLines = session.entries.flatMap((e) => {
    const ex = exercises.find((x) => x.id === e.exerciseId)
    return [ex?.name ?? 'Unknown', ...e.sets.map((s, i) => `  ${i + 1}.  ${s.reps} × ${s.weight}${s.unit}`)]
  })

  const H = headerH + exerciseLines.length * LINE_H + PADDING * 2 + 40
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H

  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  ctx.fillStyle = '#0d0d0d'
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = accent
  ctx.fillRect(0, 0, 6, H)

  ctx.fillStyle = accent
  ctx.font = 'bold 36px system-ui, sans-serif'
  const appLabel = isSupporter ? 'JGYM ★' : 'JGYM'
  ctx.fillText(appLabel, PADDING + 16, PADDING + 32)

  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '16px system-ui, sans-serif'
  ctx.fillText(formatDate(session.date) + (session.label ? `  ·  ${session.label}` : ''), PADDING + 16, PADDING + 60)
  ctx.fillText(`Duration: ${formatTimer(elapsed)}`, PADDING + 16, PADDING + 84)

  const vol = totalVolume(session)
  const unit = session.entries[0]?.sets[0]?.unit ?? 'kg'
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.font = '14px system-ui, sans-serif'
  ctx.fillText(`Total volume: ${vol.toLocaleString()} ${unit}`, PADDING + 16, PADDING + 108)

  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PADDING + 16, headerH)
  ctx.lineTo(W - PADDING, headerH)
  ctx.stroke()

  let y = headerH + PADDING
  for (const line of exerciseLines) {
    const isHeader = !line.startsWith('  ')
    ctx.fillStyle = isHeader ? '#ffffff' : 'rgba(255,255,255,0.45)'
    ctx.font = isHeader ? 'bold 16px system-ui, sans-serif' : '14px system-ui, sans-serif'
    ctx.fillText(line, PADDING + 16, y)
    y += LINE_H
  }

  return canvas
}

export function WorkoutSummaryModal({
  session,
  sessions,
  exercises,
  savedPlans,
  elapsed,
  onClose,
  onNavigateToExercises,
  isSupporter = false,
}: Props) {
  const [patternDismissed, setPatternDismissed] = useState(false)
  const [stravaStatus, setStravaStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const { newPRExerciseIds, confettiTrigger } = useMemo(() => {
    if (!session) return { newPRExerciseIds: new Set<string>(), confettiTrigger: 0 }
    const priorSessions = sessions.filter((s) => s.id !== session.id)
    const newPRIds = new Set<string>()
    for (const entry of session.entries) {
      const prBefore = calculatePR(entry.exerciseId, priorSessions)
      const sessionMax = entry.sets.reduce(
        (best, s) => (!best || s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps) ? s : best),
        null as (typeof entry.sets)[0] | null,
      )
      if (!sessionMax || sessionMax.weight === 0) continue
      const isNew =
        !prBefore ||
        sessionMax.weight > prBefore.weight ||
        (sessionMax.weight === prBefore.weight && sessionMax.reps > prBefore.reps)
      if (isNew) newPRIds.add(entry.exerciseId)
    }
    return { newPRExerciseIds: newPRIds, confettiTrigger: newPRIds.size > 0 ? 1 : 0 }
  }, [session, sessions])

  const patternSuggestion = useMemo(() => {
    if (!session || patternDismissed) return null
    return detectPattern(sessions, savedPlans, exercises)
  }, [session, sessions, savedPlans, exercises, patternDismissed])

  if (!session) return null

  const vol = totalVolume(session)
  const unit = session.entries[0]?.sets[0]?.unit ?? 'kg'

  const handleExport = async (share: boolean) => {
    const canvas = drawSummaryCard(session, exercises, elapsed, isSupporter)
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'))
    if (!blob) return
    await exportImageFile(blob, `workout-${session.date.slice(0, 10)}.png`, 'Workout Summary', share)
  }

  const handleSendToStrava = async () => {
    if (!session) return
    setStravaStatus('sending')
    try {
      await uploadSession(session, exercises, elapsed)
      setStravaStatus('done')
    } catch {
      setStravaStatus('error')
    }
  }

  const handleDismissPattern = (exerciseIds: string[]) => {
    dismissPattern(exerciseIds)
    setPatternDismissed(true)
  }

  const handleCreatePlan = () => {
    onClose()
    onNavigateToExercises?.()
  }

  return (
    <Modal open={!!session} onClose={onClose} title="Session Complete">
      <div className="relative space-y-4">
        <PRConfetti trigger={confettiTrigger} />

        <div className="bg-white/[0.04] rounded-xl p-4 border-l-2 border-brand">
          <p className="font-heading text-2xl">{session.label || formatDate(session.date)}</p>
          <p className="text-xs text-white/40 mt-0.5">
            {formatDate(session.date)} · {formatTimer(elapsed)}
          </p>
          <p className="text-sm text-white/50 mt-1">
            Volume:{' '}
            <span className="text-brand">
              {vol.toLocaleString()} {unit}
            </span>
          </p>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {session.entries.map((e) => {
            const ex = exercises.find((x) => x.id === e.exerciseId)
            const isNewPR = newPRExerciseIds.has(e.exerciseId)
            return (
              <div key={e.exerciseId} className="bg-white/[0.03] rounded px-3 py-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{ex?.name ?? 'Unknown'}</p>
                  {isNewPR && (
                    <span
                      className="text-[10px] text-brand font-heading"
                      style={{ animation: 'pr-flash 0.8s ease-in-out' }}
                    >
                      🏆 PR!
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/40 mt-0.5">
                  {e.sets.map((s, i) => `${i + 1}. ${s.reps}×${s.weight}${s.unit}`).join('  ')}
                </p>
              </div>
            )
          })}
        </div>

        {patternSuggestion && !patternDismissed && (
          <div className="glass border border-brand/20 rounded-xl p-3">
            <div className="flex items-start gap-2 mb-2">
              <Dumbbell size={14} className="text-brand mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-white/80">Looks like a pattern</p>
                <p className="text-[11px] text-white/50 mt-0.5">
                  You often train: {patternSuggestion.exerciseNames.slice(0, 4).join(', ')}
                  {patternSuggestion.exerciseNames.length > 4 ? '…' : ''}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreatePlan}
                className="flex-1 text-[11px] py-1.5 rounded bg-brand/10 text-brand hover:bg-brand/20 transition-colors"
              >
                Create Plan
              </button>
              <button
                onClick={() => handleDismissPattern(patternSuggestion.exerciseIds)}
                className="flex-1 text-[11px] py-1.5 rounded bg-white/5 text-white/40 hover:bg-white/10 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => handleExport(true)}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Share2 size={14} /> Share
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleExport(false)}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Download size={14} /> Save PNG
          </Button>
        </div>

        {isStravaConnected() && (
          <Button
            variant="secondary"
            onClick={handleSendToStrava}
            disabled={stravaStatus === 'sending' || stravaStatus === 'done'}
            className="w-full flex items-center justify-center gap-2"
          >
            <Activity size={14} className="text-[#fc4c02]" />
            {stravaStatus === 'sending'
              ? 'Sending…'
              : stravaStatus === 'done'
                ? 'Sent to Strava ✓'
                : stravaStatus === 'error'
                  ? 'Failed — retry'
                  : 'Send to Strava'}
          </Button>
        )}

        <Button onClick={onClose} className="w-full">
          Done
        </Button>
      </div>
    </Modal>
  )
}
