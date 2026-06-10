// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  children: ReactNode
}

const styles = {
  primary: 'bg-brand text-black font-semibold hover:shadow-[0_0_20px_var(--color-brand)] hover:shadow-brand/25',
  secondary: 'bg-white/[0.06] text-[#e8e4dc] border border-white/[0.08] hover:bg-white/[0.1] hover:border-white/[0.14]',
  danger: 'bg-red-500/15 text-red-300 border border-red-500/20 hover:bg-red-500/25',
  ghost: 'text-[#e8e4dc] hover:bg-white/[0.08]',
}

export function Button({ variant = 'primary', children, className = '', ...props }: Props) {
  return (
    <button
      className={`px-4 py-2.5 rounded-xl text-sm transition-all press-scale disabled:opacity-40 disabled:pointer-events-none ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
