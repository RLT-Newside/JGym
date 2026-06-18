// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'

interface Props {
  title: string | null
  artist: string | null
  isPlaying: boolean
  onCommand: (action: 'play_pause' | 'next' | 'previous') => void
  onRequestPermission: () => void
  hasPermission: boolean
  hidePrompt?: boolean
}

export function MediaBar({
  title,
  artist,
  isPlaying,
  onCommand,
  onRequestPermission,
  hasPermission,
  hidePrompt,
}: Props) {
  if (!hasPermission) {
    if (hidePrompt) return null
    return (
      <div className="flex items-center justify-between px-3 py-2 bg-white/[0.03] border-t border-white/5 text-[11px]">
        <span className="text-white/40">Connect SimpMusic</span>
        <button onClick={onRequestPermission} className="text-brand/80 hover:text-brand px-2 py-1 rounded bg-brand/10">
          Grant access
        </button>
      </div>
    )
  }

  if (!title && !artist) return null

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-white/[0.03] border-t border-white/5">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-white/80 truncate">{title ?? '—'}</p>
        {artist && <p className="text-[10px] text-white/40 truncate">{artist}</p>}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onCommand('previous')}
          className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white/80"
        >
          <SkipBack size={14} />
        </button>
        <button
          onClick={() => onCommand('play_pause')}
          className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          onClick={() => onCommand('next')}
          className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white/80"
        >
          <SkipForward size={14} />
        </button>
      </div>
    </div>
  )
}
