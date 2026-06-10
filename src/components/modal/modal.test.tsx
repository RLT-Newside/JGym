import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from './modal'

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Test">
        <p>Content</p>
      </Modal>,
    )
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('renders title and children when open', () => {
    render(
      <Modal open onClose={vi.fn()} title="My Modal">
        <p>Modal content</p>
      </Modal>,
    )
    expect(screen.getByText('My Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('calls onClose when backdrop clicked', async () => {
    const onClose = vi.fn()
    const { container } = render(
      <Modal open onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>,
    )
    const backdrop = container.querySelector('.absolute.inset-0') as HTMLElement
    await userEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when X button clicked', async () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>,
    )
    const closeBtn = screen.getByRole('button')
    await userEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledOnce()
  })
})
