// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { formatPR, type PR } from '../../../../utils/pr'

interface Props {
  pr: PR | null
}

export function PRBadge({ pr }: Props) {
  if (!pr) return null
  return <span className="text-brand font-heading text-lg">{formatPR(pr)}</span>
}
