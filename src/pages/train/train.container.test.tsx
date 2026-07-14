import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithAppData } from '../../test/render-with-app-data'
import type { Exercise, SavedPlan, Session } from '../../types'
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

describe('TrainContainer', () => {
  it('renders Start Training button when no active session', () => {
    renderWithAppData(<TrainContainer />)
    expect(screen.getByText('Start Training')).toBeInTheDocument()
  })

  it('shows session label input when idle', () => {
    renderWithAppData(<TrainContainer />)
    expect(screen.getByPlaceholderText(/Session label/)).toBeInTheDocument()
  })

  it('starts session when Start Training clicked', async () => {
    renderWithAppData(<TrainContainer />)
    await userEvent.type(screen.getByPlaceholderText(/Session label/), 'Push Day')
    await userEvent.click(screen.getByText('Start Training'))
    expect(screen.getByText('Push Day')).toBeInTheDocument()
    expect(screen.getByText('Finish Session')).toBeInTheDocument()
  })

  it('shows Finish Session and Cancel buttons when session active', async () => {
    renderWithAppData(<TrainContainer />)
    await userEvent.click(screen.getByText('Start Training'))
    expect(screen.getByText('Finish Session')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('shows cancel confirm dialog when Cancel clicked', async () => {
    renderWithAppData(<TrainContainer />)
    await userEvent.click(screen.getByText('Start Training'))
    await userEvent.click(screen.getByText('Cancel'))
    expect(screen.getByText('Cancel Session')).toBeInTheDocument()
    expect(screen.getByText(/Discard this session/)).toBeInTheDocument()
  })

  it('cancels session when confirm dialog confirmed', async () => {
    renderWithAppData(<TrainContainer />)
    await userEvent.click(screen.getByText('Start Training'))
    await userEvent.click(screen.getByText('Cancel'))
    await userEvent.click(screen.getByText('Discard'))
    expect(screen.getByText('Start Training')).toBeInTheDocument()
  })

  it('shows saved plans when plans exist', () => {
    const savedPlans: SavedPlan[] = [
      {
        id: 'p1',
        name: 'Push/Pull/Legs',
        currentDayIndex: 0,
        createdAt: new Date().toISOString(),
        days: [{ label: 'Push Day', focus: 'Chest', exerciseIds: [], defaults: [] }],
      },
    ]
    renderWithAppData(<TrainContainer />, { savedPlans })
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
    renderWithAppData(<TrainContainer />, { sessions })
    expect(screen.getByText('Leg Day')).toBeInTheDocument()
  })

  it('pre-fills exercise when preSelectedExercise is set', async () => {
    const exercise = makeExercise('ex1', 'Squat')
    // Pass exercise in exercises list so ExerciseEntryComponent can resolve the name
    renderWithAppData(<TrainContainer />, { exercises: [exercise], preSelectedExercise: exercise })
    await userEvent.click(screen.getByText('Start Training'))
    expect(screen.getByText('Squat')).toBeInTheDocument()
  })

  it('replaces an exercise in the session via the replace picker', async () => {
    const squat = makeExercise('ex1', 'Squat')
    const lunge = makeExercise('ex2', 'Lunge')
    renderWithAppData(<TrainContainer />, { exercises: [squat, lunge], preSelectedExercise: squat })
    await userEvent.click(screen.getByText('Start Training'))
    // Squat is in session; open replace picker and pick Lunge
    await userEvent.click(screen.getByTitle('Replace exercise'))
    expect(screen.getByText('Replace Exercise')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Lunge'))
    // After replacement, Lunge should be visible and Squat gone
    expect(screen.getByText('Lunge')).toBeInTheDocument()
    expect(screen.queryByText('Squat')).not.toBeInTheDocument()
  })

  it('reorders exercises via move up button', async () => {
    const squat = makeExercise('ex1', 'Squat')
    const lunge = makeExercise('ex2', 'Lunge')
    renderWithAppData(<TrainContainer />, { exercises: [squat, lunge], preSelectedExercise: squat })
    await userEvent.click(screen.getByText('Start Training'))
    // Add lunge as second exercise
    await userEvent.click(screen.getByText('Add Exercise'))
    await userEvent.click(screen.getByText('Lunge'))
    // Lunge is second — its "move up" button should be enabled
    const upButtons = screen.getAllByTitle('Move exercise up')
    // Second entry's up button (index 1) should be enabled
    const lungeUpBtn = upButtons[1]
    expect(lungeUpBtn).not.toBeDisabled()
    await userEvent.click(lungeUpBtn)
    // After moving up, Lunge should appear before Squat in the DOM
    const names = screen.getAllByRole('button', { name: /Squat|Lunge/ })
    expect(names[0].textContent).toBe('Lunge')
  })

  it('adds a warmup set when adding an exercise with defaultWarmup: true', async () => {
    const exercise: Exercise = { ...makeExercise('ex-wu', 'Bench Press'), defaultWarmup: true }
    renderWithAppData(<TrainContainer />, { exercises: [exercise] })
    await userEvent.click(screen.getByText('Start Training'))
    await userEvent.click(screen.getByText('Add Exercise'))
    await userEvent.click(screen.getByText('Bench Press'))
    expect(screen.getByText('Warm')).toBeInTheDocument()
  })
})
