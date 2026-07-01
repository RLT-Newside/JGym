// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { X } from 'lucide-react'
import { type ReactNode, useEffect, useId, useRef } from 'react'
import { useBackHandler } from '../../hooks/useBackButton'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: Props) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  // Keep a stable ref so the effect doesn't re-run when the parent passes a new
  // onClose arrow on every render — that was causing the modal to re-focus (and
  // scroll back to the top) whenever any parent state changed while open.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // Android hardware back closes the modal.
  useBackHandler(() => {
    onClose()
    return true
  }, open)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const previouslyFocused = document.activeElement as HTMLElement | null

    const focusables = () => {
      const panel = panelRef.current
      if (!panel) return [] as HTMLElement[]
      return Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null)
    }

    // Move focus into the dialog unless a field already claimed it (autoFocus).
    // preventScroll stops the browser from jumping the page/modal to the focused
    // element — the fix for JGYM-23 (scroll-to-top on "Check for updates" click).
    if (!panelRef.current?.contains(document.activeElement)) {
      focusables()[0]?.focus({ preventScroll: true })
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const els = focusables()
      if (els.length === 0) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      previouslyFocused?.focus?.()
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/[0.1] w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5 animate-slide-up shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id={titleId} className="font-heading text-2xl">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors press-scale"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
