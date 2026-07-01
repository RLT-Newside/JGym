// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import type { ReactNode } from 'react'

/** Uppercase caption heading used above form/content sections. */
export function SectionHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={`section-head ${className}`}>{children}</h3>
}
