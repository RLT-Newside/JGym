import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Exercise, Session } from '../../../../types'
import { SessionCard } from './session-card'

const baseSession: Session = {
  id: 's1',
  date: '2025-06-01T10:00:00.000Z',
  label: 'Push Day',
  entries: [
    {
      exerciseId: 'e1',
      sets: [
        { reps: 10, weight: 60, unit: 'kg' },
        { reps: 8, weight: 65, unit: 'kg' },
      ],
    },
  ],
}

const exercises: Exercise[] = [
  {
    id: 'e1',
    name: 'Bench Press',
    muscleGroups: ['Mid Chest'],
    primaryMuscles: ['Mid Chest'],
    secondaryMuscles: [],
    notes: '',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
]

describe('SessionCard duration display', () => {
  it('shows formatted duration when durationSeconds is set', () => {
    const session = { ...baseSession, durationSeconds: 3725 }
    render(
      <SessionCard
        session={session}
        sessions={[session]}
        exercises={exercises}
        onDelete={vi.fn()}
        onEditDuration={vi.fn()}
      />,
    )
    expect(screen.getByText(/1:02:05/)).toBeInTheDocument()
  })

  it('does not show duration when durationSeconds is missing', () => {
    render(
      <SessionCard
        session={baseSession}
        sessions={[baseSession]}
        exercises={exercises}
        onDelete={vi.fn()}
        onEditDuration={vi.fn()}
      />,
    )
    expect(screen.queryByText(/\d+:\d+:\d+/)).not.toBeInTheDocument()
  })

  it('shows Edit Duration button when expanded', async () => {
    const onEditDuration = vi.fn()
    render(
      <SessionCard
        session={baseSession}
        sessions={[baseSession]}
        exercises={exercises}
        onDelete={vi.fn()}
        onEditDuration={onEditDuration}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /push day/i }))
    await userEvent.click(screen.getByText('Edit Duration'))
    expect(onEditDuration).toHaveBeenCalledWith('s1')
  })
})
