import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmDialog } from './confirm-dialog'

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  title: 'Delete Item',
  message: 'Are you sure?',
}

describe('ConfirmDialog', () => {
  it('renders title and message when open', () => {
    render(<ConfirmDialog {...defaultProps} />)
    expect(screen.getByText('Delete Item')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    render(<ConfirmDialog {...defaultProps} open={false} />)
    expect(screen.queryByText('Delete Item')).not.toBeInTheDocument()
  })

  it('calls onConfirm and onClose when confirm button clicked', async () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} onClose={onClose} />)
    await userEvent.click(screen.getByText('Confirm'))
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('uses custom confirmLabel', () => {
    render(<ConfirmDialog {...defaultProps} confirmLabel="Yes, delete" />)
    expect(screen.getByText('Yes, delete')).toBeInTheDocument()
  })

  it('calls onClose when Cancel clicked', async () => {
    const onClose = vi.fn()
    render(<ConfirmDialog {...defaultProps} onClose={onClose} />)
    await userEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('applies danger variant when danger prop set', () => {
    render(<ConfirmDialog {...defaultProps} danger confirmLabel="Delete" />)
    const confirmBtn = screen.getByText('Delete')
    expect(confirmBtn.className).toContain('red')
  })
})
