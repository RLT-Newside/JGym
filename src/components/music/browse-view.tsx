// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import {
  ChevronLeft,
  ChevronRight,
  Folder,
  ListPlus,
  Loader2,
  Music,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FullMediaMetadata, MediaItem } from '../../types'

interface Props {
  browserAvailable: boolean
  items: MediaItem[]
  loading: boolean
  metadata: FullMediaMetadata | null
  onBrowse: (mediaId?: string) => Promise<void>
  onPlay: (mediaId: string) => Promise<void>
  onAddToQueue: (item: MediaItem) => Promise<void>
  onShuffle: (enabled: boolean) => void
  onRepeat: (mode: 'off' | 'one' | 'all') => void
}

interface BreadcrumbEntry {
  mediaId: string | undefined
  title: string
}

function nextRepeatMode(current: 'off' | 'one' | 'all'): 'off' | 'one' | 'all' {
  if (current === 'off') return 'all'
  if (current === 'all') return 'one'
  return 'off'
}

function LazyImage({ src, fallback, className }: { src: string; fallback: React.ReactNode; className: string }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (error) return <>{fallback}</>

  return (
    <div className={`${className} relative overflow-hidden`}>
      {!loaded && <div className="absolute inset-0 glass flex items-center justify-center">{fallback}</div>}
      <img
        src={src}
        alt=""
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}

export function BrowseView({
  browserAvailable,
  items,
  loading,
  metadata,
  onBrowse,
  onPlay,
  onAddToQueue,
  onShuffle,
  onRepeat,
}: Props) {
  const [stack, setStack] = useState<BreadcrumbEntry[]>([{ mediaId: undefined, title: 'Library' }])

  useEffect(() => {
    if (browserAvailable) {
      onBrowse(undefined)
    }
  }, [browserAvailable, onBrowse])

  if (!browserAvailable) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/30">
        <Folder size={48} />
        <p className="mt-4 text-sm text-center">SimpMusic library not available</p>
        <p className="text-xs text-white/20 mt-2 text-center px-8">
          This feature requires SimpMusic to expose its media library. Try updating SimpMusic or use it directly to pick
          tracks.
        </p>
      </div>
    )
  }

  const navigateTo = (item: MediaItem) => {
    setStack((prev) => [...prev, { mediaId: item.mediaId, title: item.title ?? 'Unknown' }])
    onBrowse(item.mediaId)
  }

  const goBack = () => {
    if (stack.length <= 1) return
    const newStack = stack.slice(0, -1)
    setStack(newStack)
    onBrowse(newStack[newStack.length - 1].mediaId)
  }

  const currentTitle = stack[stack.length - 1].title
  const repeatMode = metadata?.repeatMode ?? 'off'
  const shuffleOn = metadata?.shuffleMode ?? false
  const playableItems = items.filter((i) => i.playable)
  const isInsidePlaylist = stack.length > 1 && playableItems.length > 0

  const handleShufflePlay = () => {
    if (playableItems.length === 0) return
    onShuffle(true)
    const random = playableItems[Math.floor(Math.random() * playableItems.length)]
    onPlay(random.mediaId)
  }

  return (
    <div className="flex flex-col">
      {/* Header / back */}
      {stack.length > 1 && (
        <button onClick={goBack} className="flex items-center gap-2 px-4 py-2 text-sm text-brand/80 hover:text-brand">
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>
      )}
      <div className="flex items-center justify-between px-4 py-2">
        <h3 className="text-sm font-heading font-bold text-white/60">{currentTitle}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onShuffle(!shuffleOn)}
            className={`p-1.5 rounded-full transition-colors ${shuffleOn ? 'text-brand' : 'text-white/30 hover:text-white/60'}`}
          >
            <Shuffle size={16} />
          </button>
          <button
            onClick={() => onRepeat(nextRepeatMode(repeatMode))}
            className={`p-1.5 rounded-full transition-colors ${repeatMode !== 'off' ? 'text-brand' : 'text-white/30 hover:text-white/60'}`}
          >
            {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </button>
        </div>
      </div>

      {/* Shuffle Play button — shown inside playlists with playable songs */}
      {isInsidePlaylist && !loading && (
        <button
          onClick={handleShufflePlay}
          className="mx-4 mb-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand text-black text-sm font-medium press-scale hover:opacity-90 transition-opacity"
        >
          <Shuffle size={14} />
          Shuffle Play
        </button>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 size={24} className="animate-spin text-brand/50" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-white/20">
          <p className="text-sm">No items</p>
        </div>
      ) : (
        <ul className="divide-y divide-white/5">
          {items.map((item) => (
            <li key={item.mediaId} className="flex items-center hover:bg-white/5">
              <button
                onClick={() => {
                  if (item.browsable) navigateTo(item)
                  else if (item.playable) onPlay(item.mediaId)
                }}
                className="flex-1 min-w-0 flex items-center gap-3 px-4 py-3 text-left"
              >
                {item.iconUri ? (
                  <LazyImage
                    src={item.iconUri}
                    className="w-10 h-10 rounded"
                    fallback={
                      item.browsable ? (
                        <Folder size={16} className="text-white/20" />
                      ) : (
                        <Music size={16} className="text-white/20" />
                      )
                    }
                  />
                ) : (
                  <div className="w-10 h-10 rounded glass flex items-center justify-center">
                    {item.browsable ? (
                      <Folder size={16} className="text-white/20" />
                    ) : (
                      <Music size={16} className="text-white/20" />
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{item.title ?? 'Unknown'}</p>
                  {item.subtitle && <p className="text-xs text-white/40 truncate">{item.subtitle}</p>}
                </div>
                {item.browsable ? (
                  <ChevronRight size={16} className="text-white/20" />
                ) : item.playable ? (
                  <Play size={14} className="text-brand/60" />
                ) : null}
              </button>
              {item.playable && (
                <button
                  onClick={() => onAddToQueue(item)}
                  title="Add to queue"
                  aria-label="Add to queue"
                  className="px-3 py-3 flex-shrink-0 text-white/30 hover:text-brand"
                >
                  <ListPlus size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
