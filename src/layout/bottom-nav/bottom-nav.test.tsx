// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BottomNav } from './bottom-nav'

describe('BottomNav', () => {
  it('renders all five tab buttons', () => {
    render(<BottomNav active="dashboard" onChange={vi.fn()} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Exercises')).toBeInTheDocument()
    expect(screen.getByText('Train')).toBeInTheDocument()
    expect(screen.getByText('Nutrition')).toBeInTheDocument()
    expect(screen.getByText('History')).toBeInTheDocument()
  })

  it('calls onChange with the correct tab when a button is clicked', async () => {
    const onChange = vi.fn()
    render(<BottomNav active="dashboard" onChange={onChange} />)
    await userEvent.click(screen.getByText('Exercises'))
    expect(onChange).toHaveBeenCalledWith('exercises')
  })

  it('shows no session indicator when sessionActive is false', () => {
    const { container } = render(<BottomNav active="dashboard" onChange={vi.fn()} sessionActive={false} />)
    expect(container.querySelector('.animate-pulse')).toBeNull()
  })

  it('shows no session indicator when sessionActive is undefined', () => {
    const { container } = render(<BottomNav active="dashboard" onChange={vi.fn()} />)
    expect(container.querySelector('.animate-pulse')).toBeNull()
  })

  it('shows pulsing session indicator on Train tab when session is active and user is on another tab', () => {
    const { container } = render(<BottomNav active="dashboard" onChange={vi.fn()} sessionActive={true} />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('does not show pulsing indicator when session is active and user is already on Train tab', () => {
    const { container } = render(<BottomNav active="train" onChange={vi.fn()} sessionActive={true} />)
    expect(container.querySelector('.animate-pulse')).toBeNull()
  })

  it('renders nothing while hidden (software keyboard open)', () => {
    const { container } = render(<BottomNav active="dashboard" onChange={vi.fn()} hidden />)
    expect(container.querySelector('nav')).toBeNull()
  })
})
