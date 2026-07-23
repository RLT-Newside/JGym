// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Exercise, SavedPlan } from '../../../../../types'
import { SavedPlanDetail } from './saved-plan-detail'

const makeExercise = (id: string, name: string): Exercise => ({
  id,
  name,
  muscleGroups: [],
  primaryMuscles: [],
  secondaryMuscles: [],
  notes: '',
  createdAt: '2026-01-01',
})

const makePlan = (overrides?: Partial<SavedPlan>): SavedPlan => ({
  id: 'plan-1',
  name: 'Test Plan',
  currentDayIndex: 0,
  createdAt: '2026-01-01',
  days: [
    {
      label: 'Day 1',
      focus: 'Push',
      exerciseIds: ['ex1'],
      defaults: [{ exerciseId: 'ex1', sets: 3, reps: '8-12' }],
    },
    {
      label: 'Day 2',
      focus: 'Pull',
      exerciseIds: ['ex2'],
      defaults: [{ exerciseId: 'ex2', sets: 3, reps: '8-12' }],
    },
    {
      label: 'Day 3',
      focus: 'Legs',
      exerciseIds: ['ex3'],
      defaults: [{ exerciseId: 'ex3', sets: 3, reps: '8-12' }],
    },
  ],
  ...overrides,
})

const exercises: Exercise[] = [
  makeExercise('ex1', 'Bench Press'),
  makeExercise('ex2', 'Pull-up'),
  makeExercise('ex3', 'Squat'),
]

describe('SavedPlanDetail — day reordering', () => {
  it('renders move-up and move-down buttons for each day', () => {
    render(<SavedPlanDetail plan={makePlan()} exercises={exercises} onBack={vi.fn()} onUpdatePlan={vi.fn()} />)
    expect(screen.getAllByTitle('Move day up').length).toBe(3)
    expect(screen.getAllByTitle('Move day down').length).toBe(3)
  })

  it('disables move-up on the first day', () => {
    render(<SavedPlanDetail plan={makePlan()} exercises={exercises} onBack={vi.fn()} onUpdatePlan={vi.fn()} />)
    const upButtons = screen.getAllByTitle('Move day up')
    expect(upButtons[0]).toBeDisabled()
    expect(upButtons[1]).not.toBeDisabled()
  })

  it('disables move-down on the last day', () => {
    render(<SavedPlanDetail plan={makePlan()} exercises={exercises} onBack={vi.fn()} onUpdatePlan={vi.fn()} />)
    const downButtons = screen.getAllByTitle('Move day down')
    expect(downButtons[2]).toBeDisabled()
    expect(downButtons[1]).not.toBeDisabled()
  })

  it('moves a day down when the move-down button is clicked', async () => {
    const onUpdatePlan = vi.fn()
    render(<SavedPlanDetail plan={makePlan()} exercises={exercises} onBack={vi.fn()} onUpdatePlan={onUpdatePlan} />)
    const downButtons = screen.getAllByTitle('Move day down')
    await userEvent.click(downButtons[0])
    expect(onUpdatePlan).toHaveBeenCalledOnce()
    const updated: SavedPlan = onUpdatePlan.mock.calls[0][0]
    expect(updated.days[0].label).toBe('Day 2')
    expect(updated.days[1].label).toBe('Day 1')
    expect(updated.days[2].label).toBe('Day 3')
  })

  it('moves a day up when the move-up button is clicked', async () => {
    const onUpdatePlan = vi.fn()
    render(<SavedPlanDetail plan={makePlan()} exercises={exercises} onBack={vi.fn()} onUpdatePlan={onUpdatePlan} />)
    const upButtons = screen.getAllByTitle('Move day up')
    await userEvent.click(upButtons[2])
    expect(onUpdatePlan).toHaveBeenCalledOnce()
    const updated: SavedPlan = onUpdatePlan.mock.calls[0][0]
    expect(updated.days[1].label).toBe('Day 3')
    expect(updated.days[2].label).toBe('Day 2')
  })

  it('updates currentDayIndex when the current day is moved', async () => {
    const onUpdatePlan = vi.fn()
    const plan = makePlan({ currentDayIndex: 0 })
    render(<SavedPlanDetail plan={plan} exercises={exercises} onBack={vi.fn()} onUpdatePlan={onUpdatePlan} />)
    const downButtons = screen.getAllByTitle('Move day down')
    await userEvent.click(downButtons[0])
    const updated: SavedPlan = onUpdatePlan.mock.calls[0][0]
    expect(updated.currentDayIndex).toBe(1)
  })

  it('updates currentDayIndex when the displaced day was the current day', async () => {
    const onUpdatePlan = vi.fn()
    const plan = makePlan({ currentDayIndex: 1 })
    render(<SavedPlanDetail plan={plan} exercises={exercises} onBack={vi.fn()} onUpdatePlan={onUpdatePlan} />)
    const downButtons = screen.getAllByTitle('Move day down')
    await userEvent.click(downButtons[0])
    const updated: SavedPlan = onUpdatePlan.mock.calls[0][0]
    expect(updated.currentDayIndex).toBe(0)
  })

  it('does not show move buttons when there is only one day', () => {
    const plan = makePlan({
      days: [{ label: 'Day 1', focus: '', exerciseIds: [], defaults: [] }],
    })
    render(<SavedPlanDetail plan={plan} exercises={exercises} onBack={vi.fn()} onUpdatePlan={vi.fn()} />)
    expect(screen.queryByTitle('Move day up')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Move day down')).not.toBeInTheDocument()
  })
})

describe('SavedPlanDetail — exercise reordering', () => {
  it('renders move-up and move-down buttons for exercises within a day', () => {
    const plan = makePlan({
      days: [
        {
          label: 'Day 1',
          focus: '',
          exerciseIds: ['ex1', 'ex2'],
          defaults: [
            { exerciseId: 'ex1', sets: 3, reps: '8-12' },
            { exerciseId: 'ex2', sets: 3, reps: '8-12' },
          ],
        },
      ],
    })
    render(<SavedPlanDetail plan={plan} exercises={exercises} onBack={vi.fn()} onUpdatePlan={vi.fn()} />)
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
    expect(screen.getByText('Pull-up')).toBeInTheDocument()
  })

  it('moves an exercise down within a day', async () => {
    const onUpdatePlan = vi.fn()
    const plan = makePlan({
      days: [
        {
          label: 'Day 1',
          focus: '',
          exerciseIds: ['ex1', 'ex2'],
          defaults: [
            { exerciseId: 'ex1', sets: 3, reps: '8-12' },
            { exerciseId: 'ex2', sets: 3, reps: '8-12' },
          ],
        },
      ],
    })
    render(<SavedPlanDetail plan={plan} exercises={exercises} onBack={vi.fn()} onUpdatePlan={onUpdatePlan} />)
    // ▼ buttons: first exercise's down button
    const downButtons = screen.getAllByText('▼')
    await userEvent.click(downButtons[0])
    const updated: SavedPlan = onUpdatePlan.mock.calls[0][0]
    expect(updated.days[0].exerciseIds).toEqual(['ex2', 'ex1'])
  })
})
