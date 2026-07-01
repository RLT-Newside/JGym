// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import type { HTMLAttributes, ReactNode } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/** Glass surface with the standard rounded-xl padding. */
export function GlassCard({ children, className = '', ...props }: Props) {
  return (
    <div className={`glass rounded-xl p-4 ${className}`} {...props}>
      {children}
    </div>
  )
}
