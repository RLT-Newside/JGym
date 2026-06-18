import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { SetEntry } from '../../../../types'
import { SetRow } from './set-row'

const baseSet: SetEntry = { reps: 0, weight: 50, unit: 'kg' }

describe('SetRow done state', () => {
  it('marks the set done when reps are entered', async () => {
    const onChange = vi.fn()
    render(<SetRow index={0} set={baseSet} onChange={onChange} onDelete={vi.fn()} />)

    await userEvent.type(screen.getByPlaceholderText('Reps'), '8')

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ reps: 8, done: true }))
  })

  it('clears done when reps are emptied', async () => {
    const onChange = vi.fn()
    render(<SetRow index={0} set={{ ...baseSet, reps: 8, done: true }} onChange={onChange} onDelete={vi.fn()} />)

    await userEvent.clear(screen.getByPlaceholderText('Reps'))
    await userEvent.tab()

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ reps: 0, done: false }))
  })

  it('no longer renders the done checkmark button (only type, unit, delete)', () => {
    render(<SetRow index={0} set={{ ...baseSet, reps: 5 }} onChange={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('calls onDelete when the delete button is clicked', async () => {
    const onDelete = vi.fn()
    render(<SetRow index={0} set={{ ...baseSet, reps: 5 }} onChange={vi.fn()} onDelete={onDelete} />)

    // delete is the last button in the row
    const buttons = screen.getAllByRole('button')
    await userEvent.click(buttons[buttons.length - 1])

    expect(onDelete).toHaveBeenCalledOnce()
  })
})

describe('SetRow set-type display', () => {
  it('shows the set index for a normal set', () => {
    render(<SetRow index={0} set={{ ...baseSet, reps: 5 }} onChange={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('labels a warmup set "Warm" instead of a faint single letter', () => {
    render(<SetRow index={0} set={{ ...baseSet, reps: 5, type: 'warmup' }} onChange={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Warm')).toBeInTheDocument()
  })

  it('labels drop and failure sets with full words', () => {
    const { rerender } = render(
      <SetRow index={0} set={{ ...baseSet, reps: 5, type: 'drop' }} onChange={vi.fn()} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('Drop')).toBeInTheDocument()
    rerender(<SetRow index={0} set={{ ...baseSet, reps: 5, type: 'failure' }} onChange={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Fail')).toBeInTheDocument()
  })

  it('uses the same fixed width for all set type labels', () => {
    const { rerender } = render(
      <SetRow index={0} set={{ ...baseSet, reps: 5 }} onChange={vi.fn()} onDelete={vi.fn()} />,
    )
    const normalBtn = screen.getByText('1')
    expect(normalBtn.className).toContain('w-10')

    rerender(<SetRow index={0} set={{ ...baseSet, reps: 5, type: 'warmup' }} onChange={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Warm').className).toContain('w-10')

    rerender(<SetRow index={0} set={{ ...baseSet, reps: 5, type: 'drop' }} onChange={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Drop').className).toContain('w-10')

    rerender(<SetRow index={0} set={{ ...baseSet, reps: 5, type: 'failure' }} onChange={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Fail').className).toContain('w-10')
  })

  it('keeps the same horizontal box model for normal and warmup rows so content stays aligned', () => {
    const { container, rerender } = render(
      <SetRow index={0} set={{ ...baseSet, reps: 5 }} onChange={vi.fn()} onDelete={vi.fn()} />,
    )
    const normalWrapper = container.firstChild as HTMLElement
    expect(normalWrapper.className).toContain('border-l-2')
    expect(normalWrapper.className).toContain('pl-1')
    expect(normalWrapper.className).toContain('border-transparent')

    rerender(<SetRow index={0} set={{ ...baseSet, reps: 5, type: 'warmup' }} onChange={vi.fn()} onDelete={vi.fn()} />)
    const warmupWrapper = container.firstChild as HTMLElement
    expect(warmupWrapper.className).toContain('border-l-2')
    expect(warmupWrapper.className).toContain('pl-1')
    expect(warmupWrapper.className).not.toContain('border-transparent')
  })

  it('cycles the set type from normal to warmup when the label is clicked', async () => {
    const onChange = vi.fn()
    render(<SetRow index={0} set={{ ...baseSet, reps: 5 }} onChange={onChange} onDelete={vi.fn()} />)
    await userEvent.click(screen.getByText('1'))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ type: 'warmup' }))
  })
})
