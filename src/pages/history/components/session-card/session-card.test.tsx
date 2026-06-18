import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Exercise, Session } from '../../../../types'
import { SessionCard } from './session-card'

const exercises: Exercise[] = [
  {
    id: 'ex1',
    name: 'Bench Press',
    libraryId: 'bench',
    muscleGroups: [],
    primaryMuscles: [],
    secondaryMuscles: [],
    notes: '',
    createdAt: '2026-01-01',
  },
]

const session: Session = {
  id: 's1',
  date: '2026-06-10',
  label: 'Push Day',
  entries: [
    {
      exerciseId: 'ex1',
      sets: [
        { reps: 8, weight: 80, unit: 'kg' },
        { reps: 6, weight: 85, unit: 'kg' },
      ],
    },
  ],
}

describe('SessionCard', () => {
  it('renders a table with Set/Reps/Weight headers when expanded', async () => {
    render(<SessionCard session={session} sessions={[session]} exercises={exercises} onDelete={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /bench press/i }))

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Set')).toBeInTheDocument()
    expect(screen.getByText('Reps')).toBeInTheDocument()
    expect(screen.getByText('Weight')).toBeInTheDocument()
  })

  it('displays set data in table rows', async () => {
    render(<SessionCard session={session} sessions={[session]} exercises={exercises} onDelete={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /bench press/i }))

    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(3)
    expect(rows[1]).toHaveTextContent('8')
    expect(rows[1]).toHaveTextContent('80kg')
    expect(rows[2]).toHaveTextContent('6')
    expect(rows[2]).toHaveTextContent('85kg')
  })
})
