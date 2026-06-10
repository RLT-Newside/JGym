// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { Clock } from 'lucide-react'
import { formatTimer } from '../../../../utils/format'

interface Props {
  label: string
  elapsed: number
}

export function SessionTimer({ label, elapsed }: Props) {
  return (
    <div className="flex items-center justify-between glass rounded-xl p-3 shadow-[0_0_16px_var(--color-brand)] shadow-brand/10">
      <div>
        <p className="font-heading text-lg">{label || 'Training Session'}</p>
        <p className="text-[10px] text-white/30 uppercase tracking-wider">Active session</p>
      </div>
      <div className="flex items-center gap-1.5 text-brand">
        <Clock size={14} />
        <span className="font-heading text-2xl">{formatTimer(elapsed)}</span>
      </div>
    </div>
  )
}
