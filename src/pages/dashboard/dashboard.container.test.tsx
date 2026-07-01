import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithAppData } from '../../test/render-with-app-data'
import type { Exercise, Session } from '../../types'
import { Dashboard } from './dashboard.container'

const makeSession = (id: string, daysAgo: number, sets = 3): Session => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return {
    id,
    date: d.toISOString(),
    label: '',
    entries: [
      { exerciseId: 'ex1', sets: Array.from({ length: sets }, () => ({ reps: 10, weight: 60, unit: 'kg' as const })) },
    ],
  }
}

const makeExercise = (id: string, name: string): Exercise => ({
  id,
  name,
  primaryMuscles: [],
  secondaryMuscles: [],
  muscleGroups: [],
  notes: '',
  createdAt: new Date().toISOString(),
})

describe('Dashboard container', () => {
  it('renders session count', () => {
    const sessions = [makeSession('s1', 0), makeSession('s2', 1)]
    renderWithAppData(<Dashboard />, { sessions })
    // Session count card: "2" under "Sessions" label
    const sessionCard = screen.getByText('Sessions').closest('div')!
    expect(sessionCard.querySelector('p.font-heading')?.textContent).toBe('2')
  })

  it('renders total sets count', () => {
    const sessions = [makeSession('s1', 0, 4), makeSession('s2', 1, 3)]
    renderWithAppData(<Dashboard />, { sessions })
    const setsCard = screen.getByText('Sets logged').closest('div')!
    expect(setsCard.querySelector('p.font-heading')?.textContent).toBe('7')
  })

  it('renders streak for consecutive days', () => {
    const sessions = [makeSession('s1', 0), makeSession('s2', 1), makeSession('s3', 2)]
    renderWithAppData(<Dashboard />, { sessions })
    const streakCard = screen.getByText('Streak').closest('div')!
    expect(streakCard.querySelector('p.font-heading')?.textContent).toBe('3')
  })

  it('shows empty exercises message when no exercises', () => {
    renderWithAppData(<Dashboard />)
    expect(screen.getByText(/No exercises yet/)).toBeInTheDocument()
  })

  it('renders exercise cards when exercises exist', () => {
    const exercises = [makeExercise('ex1', 'Bench Press'), makeExercise('ex2', 'Squat')]
    renderWithAppData(<Dashboard />, { exercises })
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
    expect(screen.getByText('Squat')).toBeInTheDocument()
  })

  it('calls onExerciseClick when exercise card clicked', async () => {
    const exerciseClick = vi.fn()
    const exercises = [makeExercise('ex1', 'Deadlift')]
    renderWithAppData(<Dashboard />, { exercises, exerciseClick })
    await userEvent.click(screen.getByText('Deadlift'))
    expect(exerciseClick).toHaveBeenCalledWith(exercises[0])
  })
})
