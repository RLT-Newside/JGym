// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { Check, ChevronDown, ChevronUp, ListMusic, Loader2, Pencil, Play, RefreshCw, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FullMediaMetadata, QueueItem } from '../../types'

interface Props {
  queue: QueueItem[]
  queueTitle: string | null
  metadata: FullMediaMetadata | null
  onRefresh: () => Promise<void>
  onPlay: (mediaId: string) => Promise<void>
  onRemove: (mediaId: string, title: string) => Promise<void>
  onMove: (item: QueueItem, toIndex: number) => Promise<void>
}

export function QueueView({ queue, queueTitle, metadata, onRefresh, onPlay, onRemove, onMove }: Props) {
  const [editMode, setEditMode] = useState(false)
  const [localQueue, setLocalQueue] = useState<QueueItem[]>(queue)
  const [loading, setLoading] = useState(false)
  const retriesRef = useRef(0)

  useEffect(() => {
    if (!editMode) setLocalQueue(queue)
  }, [queue, editMode])

  useEffect(() => {
    retriesRef.current = 0
    const tryLoad = async () => {
      setLoading(true)
      await onRefresh()
      setLoading(false)
    }
    tryLoad()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (queue.length === 0 && retriesRef.current < 3) {
      retriesRef.current++
      const timer = setTimeout(() => onRefresh(), 1500 * retriesRef.current)
      return () => clearTimeout(timer)
    }
  }, [queue, onRefresh])

  const moveUp = (i: number) => {
    if (i === 0) return
    const item = localQueue[i]
    setLocalQueue((prev) => {
      const next = [...prev]
      ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
      return next
    })
    onMove(item, i - 1)
  }

  const moveDown = (i: number) => {
    if (i === localQueue.length - 1) return
    const item = localQueue[i]
    setLocalQueue((prev) => {
      const next = [...prev]
      ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
      return next
    })
    onMove(item, i + 1)
  }

  if (localQueue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/30">
        {loading ? (
          <Loader2 size={24} className="animate-spin text-brand/50" />
        ) : (
          <>
            <ListMusic size={48} />
            <p className="mt-4 text-sm">No queue</p>
            <p className="text-xs text-white/20 mt-1">Play something first, then check back</p>
            <button
              onClick={async () => {
                setLoading(true)
                await onRefresh()
                setLoading(false)
              }}
              className="mt-4 flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60"
            >
              <RefreshCw size={12} />
              Refresh
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          {queueTitle && <h3 className="text-sm font-heading font-bold text-white/60">{queueTitle}</h3>}
          <button onClick={onRefresh} className="p-1 text-white/20 hover:text-white/50">
            <RefreshCw size={12} />
          </button>
        </div>
        <button
          onClick={() => {
            if (editMode) setLocalQueue(queue)
            setEditMode((e) => !e)
          }}
          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-colors ${
            editMode ? 'text-brand' : 'text-white/40 hover:text-white/70'
          }`}
        >
          {editMode ? <Check size={12} /> : <Pencil size={12} />}
          {editMode ? 'Done' : 'Edit'}
        </button>
      </div>

      <ul className="divide-y divide-white/5">
        {localQueue.map((item, i) => {
          const isActive = !!(metadata?.title && item.title === metadata.title)
          return (
            <li key={item.queueId ?? i} className={`flex items-center gap-2 px-4 py-3 ${isActive ? 'bg-brand/5' : ''}`}>
              {editMode ? (
                <>
                  <button
                    onClick={() => item.mediaId && onRemove(item.mediaId, item.title ?? '')}
                    className="p-1 text-red-400/70 hover:text-red-400 flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${isActive ? 'text-brand' : ''}`}>{item.title ?? 'Unknown'}</p>
                    {item.subtitle && <p className="text-xs text-white/40 truncate">{item.subtitle}</p>}
                  </div>
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => moveUp(i)}
                      disabled={i === 0}
                      className="p-0.5 text-white/30 hover:text-white/70 disabled:opacity-20"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => moveDown(i)}
                      disabled={i === localQueue.length - 1}
                      className="p-0.5 text-white/30 hover:text-white/70 disabled:opacity-20"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => item.mediaId && onPlay(item.mediaId)}
                  className="w-full flex items-center gap-3 text-left"
                >
                  <div className={`w-6 text-center text-xs flex-shrink-0 ${isActive ? 'text-brand' : 'text-white/20'}`}>
                    {isActive ? <Play size={12} className="inline" /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${isActive ? 'text-brand' : ''}`}>{item.title ?? 'Unknown'}</p>
                    {item.subtitle && <p className="text-xs text-white/40 truncate">{item.subtitle}</p>}
                  </div>
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
