import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Exercise, Session } from '../../types'
import { TrainContainer } from './train.container'

const makeExercise = (id: string, name: string): Exercise => ({
  id,
  name,
  primaryMuscles: [],
  secondaryMuscles: [],
  muscleGroups: [],
  notes: '',
  createdAt: new Date().toISOString(),
})

const defaultProps = {
  exercises: [] as Exercise[],
  sessions: [] as Session[],
  savedPlans: [],
  onSessionSave: vi.fn(),
  onAdvancePlanDay: vi.fn(),
  onNavigateToExercises: vi.fn(),
  preSelectedExercise: null,
  onClearPreSelected: vi.fn(),
  isSupporter: false,
}

describe('TrainContainer', () => {
  it('renders Start Training button when no active session', () => {
    render(<TrainContainer {...defaultProps} />)
    expect(screen.getByText('Start Training')).toBeInTheDocument()
  })

  it('shows session label input when idle', () => {
    render(<TrainContainer {...defaultProps} />)
    expect(screen.getByPlaceholderText(/Session label/)).toBeInTheDocument()
  })

  it('starts session when Start Training clicked', async () => {
    render(<TrainContainer {...defaultProps} />)
    await userEvent.type(screen.getByPlaceholderText(/Session label/), 'Push Day')
    await userEvent.click(screen.getByText('Start Training'))
    expect(screen.getByText('Push Day')).toBeInTheDocument()
    expect(screen.getByText('Finish Session')).toBeInTheDocument()
  })

  it('shows Finish Session and Cancel buttons when session active', async () => {
    render(<TrainContainer {...defaultProps} />)
    await userEvent.click(screen.getByText('Start Training'))
    expect(screen.getByText('Finish Session')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('shows cancel confirm dialog when Cancel clicked', async () => {
    render(<TrainContainer {...defaultProps} />)
    await userEvent.click(screen.getByText('Start Training'))
    await userEvent.click(screen.getByText('Cancel'))
    expect(screen.getByText('Cancel Session')).toBeInTheDocument()
    expect(screen.getByText(/Discard this session/)).toBeInTheDocument()
  })

  it('cancels session when confirm dialog confirmed', async () => {
    render(<TrainContainer {...defaultProps} />)
    await userEvent.click(screen.getByText('Start Training'))
    await userEvent.click(screen.getByText('Cancel'))
    await userEvent.click(screen.getByText('Discard'))
    expect(screen.getByText('Start Training')).toBeInTheDocument()
  })

  it('shows saved plans when plans exist', () => {
    const plans = [
      {
        id: 'p1',
        name: 'Push/Pull/Legs',
        currentDayIndex: 0,
        createdAt: new Date().toISOString(),
        days: [{ label: 'Push Day', focus: 'Chest', exerciseIds: [], defaults: [] }],
      },
    ]
    render(<TrainContainer {...defaultProps} savedPlans={plans} />)
    expect(screen.getByText('Push/Pull/Legs')).toBeInTheDocument()
  })

  it('shows recent sessions when sessions exist', () => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    const sessions: Session[] = [
      {
        id: 's1',
        date: d.toISOString(),
        label: 'Leg Day',
        entries: [],
      },
    ]
    render(<TrainContainer {...defaultProps} sessions={sessions} />)
    expect(screen.getByText('Leg Day')).toBeInTheDocument()
  })

  it('pre-fills exercise when preSelectedExercise is set', async () => {
    const exercise = makeExercise('ex1', 'Squat')
    // Pass exercise in exercises list so ExerciseEntryComponent can resolve the name
    render(<TrainContainer {...defaultProps} exercises={[exercise]} preSelectedExercise={exercise} />)
    await userEvent.click(screen.getByText('Start Training'))
    expect(screen.getByText('Squat')).toBeInTheDocument()
  })
})
