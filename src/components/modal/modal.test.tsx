import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

  describe('JGYM-23: scroll-to-top on update check', () => {
    let focusSpy: ReturnType<typeof vi.spyOn>
    let offsetParentDescriptor: PropertyDescriptor | undefined

    beforeEach(() => {
      // Make elements "visible" in JSDOM so focusables() includes them.
      offsetParentDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent')
      Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
        get() {
          return this.parentElement ?? null
        },
        configurable: true,
      })
      focusSpy = vi.spyOn(HTMLElement.prototype, 'focus')
    })

    afterEach(() => {
      focusSpy.mockRestore()
      if (offsetParentDescriptor) {
        Object.defineProperty(HTMLElement.prototype, 'offsetParent', offsetParentDescriptor)
      }
    })

    it('focuses the first element with preventScroll: true on open', () => {
      render(
        <Modal open onClose={vi.fn()} title="Test">
          <button>Action</button>
        </Modal>,
      )
      const preventScrollCalls = focusSpy.mock.calls.filter(
        (args: [FocusOptions?]) => args[0]?.preventScroll === true,
      )
      expect(preventScrollCalls.length).toBeGreaterThan(0)
    })

    it('does not re-focus (and scroll) when onClose reference changes while open', () => {
      const { rerender } = render(
        <Modal open onClose={() => {}} title="Test">
          <button>Action</button>
        </Modal>,
      )
      const callsAfterOpen = focusSpy.mock.calls.length

      // Simulate parent re-rendering with a new inline onClose — the trigger for JGYM-23.
      rerender(
        <Modal open onClose={() => {}} title="Test">
          <button>Action</button>
        </Modal>,
      )

      // No additional focus() calls: the effect must not have re-run.
      expect(focusSpy.mock.calls.length).toBe(callsAfterOpen)
    })
  })
})
