// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FolderOpen,
  List,
  Music,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { BrowseView } from '../../../../components/music/browse-view'
import { NowPlaying } from '../../../../components/music/now-playing'
import { QueueView } from '../../../../components/music/queue-view'
import { useMediaBrowser } from '../../../../hooks/useMediaBrowser'

const SIMPMUSIC_URL = 'https://github.com/maxrave-dev/SimpMusic'

type SubTab = 'playing' | 'browse' | 'queue'

export function MusicCard() {
  const [expanded, setExpanded] = useState(false)
  const [subTab, setSubTab] = useState<SubTab>('playing')
  const [showRedirectPrompt, setShowRedirectPrompt] = useState(false)
  const media = useMediaBrowser(true)

  const handlePlay = useCallback(
    async (mediaId: string) => {
      await media.playFromMediaId(mediaId)
      setSubTab('playing')
    },
    [media.playFromMediaId],
  )

  const needsAppInstall = !media.isNative || media.isAppInstalled === false

  if (!media.hasPermission) {
    return (
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
            <Music size={20} className="text-brand/50" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Connect SimpMusic</p>
            <p className="text-[11px] text-white/40 truncate">
              {needsAppInstall ? 'Install to enable music' : 'Grant notification access'}
            </p>
          </div>
          <button
            onClick={() => {
              if (needsAppInstall) setShowRedirectPrompt(true)
              else media.requestPermission()
            }}
            className="px-3 py-1.5 rounded-lg bg-brand/10 text-brand text-xs font-medium"
          >
            {needsAppInstall ? 'Get App' : 'Connect'}
          </button>
        </div>

        {showRedirectPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
            <div className="bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/[0.1] rounded-xl p-6 max-w-sm w-full shadow-xl">
              <h3 className="text-base font-heading font-bold">Open SimpMusic GitHub?</h3>
              <p className="text-sm text-white/50 mt-2">You'll be redirected to download SimpMusic.</p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowRedirectPrompt(false)}
                  className="flex-1 py-2.5 rounded-lg bg-white/10 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    window.open(SIMPMUSIC_URL, '_blank')
                    setShowRedirectPrompt(false)
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-brand text-black text-sm font-bold flex items-center justify-center gap-1.5"
                >
                  <ExternalLink size={14} />
                  Go to GitHub
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const meta = media.metadata

  return (
    <div className="glass rounded-xl overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 p-3 press-scale">
        <div className="w-10 h-10 rounded-lg bg-white/[0.03] flex items-center justify-center overflow-hidden shrink-0">
          {meta?.albumArtUri ? (
            <img src={meta.albumArtUri} alt="" className="w-full h-full object-cover" />
          ) : (
            <Music size={18} className="text-white/20" />
          )}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium truncate">{meta?.title ?? 'Nothing playing'}</p>
          {meta?.artist && <p className="text-[11px] text-white/40 truncate">{meta.artist}</p>}
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => media.sendCommand('previous')}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/50"
          >
            <SkipBack size={14} />
          </button>
          <button
            onClick={() => media.sendCommand('play_pause')}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70"
          >
            {meta?.isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={() => media.sendCommand('next')}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/50"
          >
            <SkipForward size={14} />
          </button>
        </div>
        {expanded ? (
          <ChevronDown size={16} className="text-white/30 shrink-0" />
        ) : (
          <ChevronUp size={16} className="text-white/30 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-white/5">
          <div className="flex border-b border-white/5">
            {[
              { id: 'playing' as SubTab, label: 'Playing', icon: Music },
              { id: 'browse' as SubTab, label: 'Browse', icon: FolderOpen },
              { id: 'queue' as SubTab, label: 'Queue', icon: List },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSubTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium transition-colors ${
                  subTab === id ? 'text-brand border-b border-brand' : 'text-white/40'
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {subTab === 'playing' && (
              <NowPlaying
                metadata={meta}
                onCommand={media.sendCommand}
                onSeek={media.seekTo}
                onShuffle={media.setShuffle}
                onRepeat={media.setRepeat}
              />
            )}
            {subTab === 'browse' && (
              <BrowseView
                browserAvailable={media.browserAvailable}
                items={media.items}
                loading={media.loading}
                metadata={meta}
                onBrowse={media.browse}
                onPlay={handlePlay}
                onAddToQueue={media.addToQueue}
                onShuffle={media.setShuffle}
                onRepeat={media.setRepeat}
              />
            )}
            {subTab === 'queue' && (
              <QueueView
                queue={media.queue}
                queueTitle={media.queueTitle}
                metadata={meta}
                onRefresh={media.refreshQueue}
                onPlay={handlePlay}
                onRemove={media.removeQueueItem}
                onMove={media.moveQueueItem}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
