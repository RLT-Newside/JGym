// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { X } from 'lucide-react'
import { type ReactNode, useEffect } from 'react'
import { useBackHandler } from '../../hooks/useBackButton'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: Props) {
  useBackHandler(() => {
    onClose()
    return true
  }, open)

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/[0.1] w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5 animate-slide-up shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-2xl">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors press-scale">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
