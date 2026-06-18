import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Exercise, Session } from '../../../../types'
import { SessionCard } from './session-card'

const exercises: Exercise[] = [
  {
    id: 'ex1',
    name: 'Bench Press',
    muscleGroups: [],
    primaryMuscles: [],
    secondaryMuscles: [],
    notes: '',
    createdAt: '2026-01-01',
  },
]

const session: Session = {
  id: 's1',
  date: '2026-06-18',
  label: 'Push Day',
  entries: [
    {
      exerciseId: 'ex1',
      sets: [
        { reps: 10, weight: 80, unit: 'kg' },
        { reps: 8, weight: 85, unit: 'kg' },
        { reps: 6, weight: 90, unit: 'kg' },
      ],
    },
  ],
}

describe('SessionCard', () => {
  it('renders a table with Set/Reps/Weight headers when expanded', async () => {
    render(<SessionCard session={session} sessions={[session]} exercises={exercises} onDelete={vi.fn()} />)
    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Set')).toBeInTheDocument()
    expect(screen.getByText('Reps')).toBeInTheDocument()
    expect(screen.getByText('Weight')).toBeInTheDocument()
  })

  it('renders set data in table rows', async () => {
    render(<SessionCard session={session} sessions={[session]} exercises={exercises} onDelete={vi.fn()} />)
    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByText('80kg')).toBeInTheDocument()
    expect(screen.getByText('85kg')).toBeInTheDocument()
    expect(screen.getByText('90kg')).toBeInTheDocument()
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(4) // 1 header + 3 data rows
  })

  it('does not render a table when collapsed', () => {
    render(<SessionCard session={session} sessions={[session]} exercises={exercises} onDelete={vi.fn()} />)
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows exercise name in collapsed summary', () => {
    render(<SessionCard session={session} sessions={[session]} exercises={exercises} onDelete={vi.fn()} />)
    expect(screen.getByText(/Bench Press/)).toBeInTheDocument()
  })
})
