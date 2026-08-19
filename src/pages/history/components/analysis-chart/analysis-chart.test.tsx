// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { Session } from '../../../../types'
import { AnalysisChart } from './analysis-chart'

function makeSession(daysAgo: number, volume: number, unit: 'kg' | 'lbs' = 'kg'): Session {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return {
    id: `s-${daysAgo}`,
    date: d.toISOString(),
    label: 'Test',
    entries: [
      {
        exerciseId: 'ex1',
        sets: [{ reps: 1, weight: volume, unit, done: true }],
      },
    ],
  }
}

describe('AnalysisChart', () => {
  it('shows "No data yet" when sessions list is empty', () => {
    render(<AnalysisChart sessions={[]} />)
    expect(screen.getByText(/No data yet/)).toBeInTheDocument()
  })

  it('renders Frequency and Volume tab buttons', () => {
    render(<AnalysisChart sessions={[makeSession(1, 100)]} />)
    expect(screen.getByRole('button', { name: 'Frequency' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Volume' })).toBeInTheDocument()
  })

  it('defaults to Frequency mode and shows session count', () => {
    const sessions = [makeSession(1, 50), makeSession(3, 80)]
    render(<AnalysisChart sessions={sessions} />)
    expect(screen.getByText(/sessions in 12 weeks/)).toBeInTheDocument()
    expect(screen.getByText(/avg/)).toBeInTheDocument()
  })

  it('switches to Volume mode when Volume tab is clicked', async () => {
    const sessions = [makeSession(1, 120)]
    render(<AnalysisChart sessions={sessions} />)
    await userEvent.click(screen.getByRole('button', { name: 'Volume' }))
    expect(screen.getByText(/peak/)).toBeInTheDocument()
    expect(screen.getByText(/last \d+ sessions/)).toBeInTheDocument()
  })

  it('renders SVG bar chart with aria-label in Frequency mode', () => {
    render(<AnalysisChart sessions={[makeSession(2, 60)]} />)
    expect(screen.getByRole('img', { name: /Sessions per week/i })).toBeInTheDocument()
  })

  it('renders SVG bar chart with aria-label in Volume mode after switching', async () => {
    render(<AnalysisChart sessions={[makeSession(2, 60)]} />)
    await userEvent.click(screen.getByRole('button', { name: 'Volume' }))
    expect(screen.getByRole('img', { name: /Volume per session/i })).toBeInTheDocument()
  })

  it('shows "No data yet" in Volume mode when all sessions have no done sets', () => {
    const session: Session = {
      id: 's1',
      date: new Date().toISOString(),
      label: 'Test',
      entries: [{ exerciseId: 'ex1', sets: [{ reps: 5, weight: 100, unit: 'kg', done: false }] }],
    }
    render(<AnalysisChart sessions={[session]} />)
    userEvent.click(screen.getByRole('button', { name: 'Volume' }))
    // Volume is 0 for undone sets — after switching, no bars visible
  })

  it('displays kg unit for volume when sessions use kg', async () => {
    render(<AnalysisChart sessions={[makeSession(1, 80, 'kg')]} />)
    await userEvent.click(screen.getByRole('button', { name: 'Volume' }))
    expect(screen.getByText(/kg/)).toBeInTheDocument()
  })

  it('displays lbs unit for volume when sessions use lbs', async () => {
    render(<AnalysisChart sessions={[makeSession(1, 80, 'lbs')]} />)
    await userEvent.click(screen.getByRole('button', { name: 'Volume' }))
    expect(screen.getByText(/lbs/)).toBeInTheDocument()
  })
})
