// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { ExternalLink, FolderOpen, List, Music } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useMediaBrowser } from '../../hooks/useMediaBrowser'
import { BrowseView } from './browse-view'
import { NowPlaying } from './now-playing'
import { QueueView } from './queue-view'

const SIMPMUSIC_URL = 'https://github.com/maxrave-dev/SimpMusic'

type SubTab = 'playing' | 'browse' | 'queue'

const subTabs: { id: SubTab; label: string; icon: typeof Music }[] = [
  { id: 'playing', label: 'Playing', icon: Music },
  { id: 'browse', label: 'Browse', icon: FolderOpen },
  { id: 'queue', label: 'Queue', icon: List },
]

export function MusicView() {
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
      <div className="flex flex-col items-center justify-center h-[70vh] px-8">
        <Music size={56} className="text-brand/30" />
        <h2 className="text-lg font-heading font-bold mt-6">Connect SimpMusic</h2>
        <p className="text-sm text-white/40 text-center mt-2">
          {needsAppInstall
            ? 'SimpMusic is not installed. Download it to enable music controls in JGym.'
            : 'JGym needs notification access to see and control your music playback.'}
        </p>
        <button
          onClick={() => {
            if (needsAppInstall) {
              setShowRedirectPrompt(true)
            } else {
              media.requestPermission()
            }
          }}
          className="mt-6 px-6 py-2.5 rounded-lg bg-brand text-black font-bold text-sm hover:bg-brand/90 flex items-center gap-2"
        >
          {needsAppInstall && <ExternalLink size={14} />}
          {needsAppInstall ? 'Get SimpMusic' : 'Grant Access'}
        </button>

        {showRedirectPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
            <div className="bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/[0.1] rounded-xl p-6 max-w-sm w-full shadow-xl">
              <h3 className="text-base font-heading font-bold">Open SimpMusic GitHub?</h3>
              <p className="text-sm text-white/50 mt-2">
                You'll be redirected to the SimpMusic GitHub page to download the app.
              </p>
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
                  className="flex-1 py-2.5 rounded-lg bg-brand text-black text-sm font-bold"
                >
                  Go to GitHub
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Sub-tab bar */}
      <div className="flex border-b border-white/5">
        {subTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSubTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
              subTab === id ? 'text-brand border-b-2 border-brand' : 'text-white/40'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="overflow-y-auto">
        {subTab === 'playing' && (
          <NowPlaying
            metadata={media.metadata}
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
            metadata={media.metadata}
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
            metadata={media.metadata}
            onRefresh={media.refreshQueue}
            onPlay={handlePlay}
            onRemove={media.removeQueueItem}
            onMove={media.moveQueueItem}
          />
        )}
      </div>
    </div>
  )
}
