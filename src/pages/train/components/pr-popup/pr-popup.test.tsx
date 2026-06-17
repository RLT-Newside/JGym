import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PRPopup } from './pr-popup'

describe('PRPopup', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders nothing when pr is null', () => {
    const { container } = render(<PRPopup pr={null} onDone={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the exercise name and PR banner when set', () => {
    render(<PRPopup pr={{ name: 'Bench Press', key: 1 }} onDone={vi.fn()} />)
    expect(screen.getByText('NEW PR!')).toBeInTheDocument()
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
  })

  it('calls onDone after the auto-dismiss timeout', () => {
    const onDone = vi.fn()
    render(<PRPopup pr={{ name: 'Squat', key: 1 }} onDone={onDone} />)
    expect(onDone).not.toHaveBeenCalled()
    vi.advanceTimersByTime(2600)
    expect(onDone).toHaveBeenCalledOnce()
  })

  it('does not start a timer when pr is null', () => {
    const onDone = vi.fn()
    render(<PRPopup pr={null} onDone={onDone} />)
    vi.advanceTimersByTime(5000)
    expect(onDone).not.toHaveBeenCalled()
  })
})
