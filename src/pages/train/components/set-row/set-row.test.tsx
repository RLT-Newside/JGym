import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { SetEntry } from '../../../../types'
import { SetRow } from './set-row'

const baseSet: SetEntry = { reps: 5, weight: 20, unit: 'kg' }

describe('SetRow set-type display', () => {
  it('shows the set index for a normal set', () => {
    render(<SetRow index={0} set={baseSet} onChange={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('labels a warmup set "Warm" instead of a faint single letter', () => {
    render(<SetRow index={0} set={{ ...baseSet, type: 'warmup' }} onChange={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Warm')).toBeInTheDocument()
  })

  it('labels drop and failure sets with full words', () => {
    const { rerender } = render(
      <SetRow index={0} set={{ ...baseSet, type: 'drop' }} onChange={vi.fn()} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('Drop')).toBeInTheDocument()
    rerender(<SetRow index={0} set={{ ...baseSet, type: 'failure' }} onChange={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Fail')).toBeInTheDocument()
  })

  it('cycles the set type from normal to warmup when the label is clicked', async () => {
    const onChange = vi.fn()
    render(<SetRow index={0} set={baseSet} onChange={onChange} onDelete={vi.fn()} />)
    await userEvent.click(screen.getByText('1'))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ type: 'warmup' }))
  })
})
