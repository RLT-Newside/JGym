// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { Music, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward } from 'lucide-react'
import { useState } from 'react'
import type { FullMediaMetadata } from '../../types'

interface Props {
  metadata: FullMediaMetadata | null
  onCommand: (action: 'play_pause' | 'next' | 'previous') => void
  onSeek: (position: number) => void
  onShuffle: (enabled: boolean) => void
  onRepeat: (mode: 'off' | 'one' | 'all') => void
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

function nextRepeatMode(current: 'off' | 'one' | 'all'): 'off' | 'one' | 'all' {
  if (current === 'off') return 'all'
  if (current === 'all') return 'one'
  return 'off'
}

function AlbumArt({ uri }: { uri: string | null }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <div className="w-48 h-48 rounded-xl glass flex items-center justify-center overflow-hidden mb-6 relative">
      {(!uri || error) && <Music size={64} className="text-white/10" />}
      {uri && !error && (
        <img
          src={uri}
          alt=""
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  )
}

export function NowPlaying({ metadata, onCommand, onSeek, onShuffle, onRepeat }: Props) {
  if (!metadata || (!metadata.title && !metadata.artist)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/30">
        <Music size={48} />
        <p className="mt-4 text-sm">Nothing playing</p>
        <p className="text-xs text-white/20 mt-1">Play something in SimpMusic</p>
      </div>
    )
  }

  const progress = metadata.duration > 0 ? (metadata.position / metadata.duration) * 100 : 0

  const repeatMode = metadata.repeatMode ?? 'off'
  const shuffleOn = metadata.shuffleMode ?? false

  return (
    <div className="flex flex-col items-center px-6 pt-8 pb-4">
      {/* Album art */}
      <AlbumArt uri={metadata.albumArtUri} />

      {/* Track info */}
      <h2 className="text-lg font-heading font-bold text-center truncate w-full">{metadata.title ?? '—'}</h2>
      {metadata.artist && <p className="text-sm text-white/50 mt-0.5 truncate w-full text-center">{metadata.artist}</p>}
      {metadata.album && <p className="text-xs text-white/30 mt-0.5 truncate w-full text-center">{metadata.album}</p>}

      {/* Seek bar */}
      <div className="w-full mt-6">
        <input
          type="range"
          min={0}
          max={metadata.duration || 1}
          value={metadata.position}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand"
          style={{
            background: `linear-gradient(to right, var(--color-brand) ${progress}%, rgba(255,255,255,0.1) ${progress}%)`,
          }}
        />
        <div className="flex justify-between text-[10px] text-white/30 mt-1">
          <span>{formatTime(metadata.position)}</span>
          <span>{formatTime(metadata.duration)}</span>
        </div>
      </div>

      {/* Shuffle / Repeat row */}
      <div className="flex items-center justify-between w-full mt-5 px-2">
        <button
          onClick={() => onShuffle(!shuffleOn)}
          className={`p-2 rounded-full transition-colors ${shuffleOn ? 'text-brand' : 'text-white/30 hover:text-white/60'}`}
        >
          <Shuffle size={20} />
        </button>
        <button
          onClick={() => onRepeat(nextRepeatMode(repeatMode))}
          className={`p-2 rounded-full transition-colors ${repeatMode !== 'off' ? 'text-brand' : 'text-white/30 hover:text-white/60'}`}
        >
          {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
        </button>
      </div>

      {/* Transport controls */}
      <div className="flex items-center gap-6 mt-2">
        <button
          onClick={() => onCommand('previous')}
          className="p-3 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
        >
          <SkipBack size={24} />
        </button>
        <button
          onClick={() => onCommand('play_pause')}
          className="p-4 rounded-full bg-brand text-black hover:bg-brand/90"
        >
          {metadata.isPlaying ? <Pause size={28} /> : <Play size={28} />}
        </button>
        <button
          onClick={() => onCommand('next')}
          className="p-3 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
        >
          <SkipForward size={24} />
        </button>
      </div>
    </div>
  )
}
