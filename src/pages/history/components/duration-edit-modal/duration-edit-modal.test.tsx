import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DurationEditModal } from './duration-edit-modal'

describe('DurationEditModal', () => {
  it('pre-fills hours and minutes from currentSeconds', () => {
    render(<DurationEditModal open currentSeconds={5400} onClose={vi.fn()} onSave={vi.fn()} />)
    expect(screen.getByDisplayValue('1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('30')).toBeInTheDocument()
  })

  it('calls onSave with correct seconds', async () => {
    const onSave = vi.fn()
    render(<DurationEditModal open currentSeconds={0} onClose={vi.fn()} onSave={onSave} />)

    const [hoursInput, minutesInput] = screen.getAllByRole('spinbutton')
    await userEvent.type(hoursInput, '1')
    await userEvent.type(minutesInput, '45')

    await userEvent.click(screen.getByText('Save'))
    expect(onSave).toHaveBeenCalledWith(6300)
  })

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn()
    render(<DurationEditModal open currentSeconds={0} onClose={onClose} onSave={vi.fn()} />)
    await userEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
