// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { AlertCircle, Camera, Eye, EyeOff, Key, Loader, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useBackHandler } from '../../../../hooks/useBackButton'
import type { FoodAnalysis } from '../../../../utils/claudeVision'
import { analyzeFood } from '../../../../utils/claudeVision'

const API_KEY_STORAGE = 'gym_claude_api_key'
const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/gif'

interface Props {
  onResult: (analysis: FoodAnalysis) => void
  onClose: () => void
}

export function FoodPhotoScan({ onResult, onClose }: Props) {
  useBackHandler(() => {
    onClose()
    return true
  }, true)

  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) ?? '')
  const [keyInput, setKeyInput] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const hasKey = Boolean(apiKey)

  const handleSaveKey = () => {
    const trimmed = keyInput.trim()
    if (!trimmed.startsWith('sk-ant-')) {
      setError('Key must start with "sk-ant-". Get yours at console.anthropic.com.')
      return
    }
    localStorage.setItem(API_KEY_STORAGE, trimmed)
    setApiKey(trimmed)
    setError(null)
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      setPreview(dataUrl)

      // Extract base64 and mime type from data URL
      const [header, b64] = dataUrl.split(',')
      const mimeMatch = header.match(/data:([^;]+)/)
      const mimeType = mimeMatch?.[1] ?? 'image/jpeg'

      setAnalyzing(true)
      try {
        const result = await analyzeFood(b64, mimeType, apiKey)
        onResult(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed. Try again.')
        setPreview(null)
      } finally {
        setAnalyzing(false)
      }
    }
    reader.readAsDataURL(file)
    // Reset so the same file can be re-selected
    e.target.value = ''
  }

  const forgetKey = () => {
    localStorage.removeItem(API_KEY_STORAGE)
    setApiKey('')
    setKeyInput('')
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Camera size={16} className="text-brand" />
          <span className="text-sm font-medium">AI Food Scanner</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-6 overflow-y-auto py-6">
        {/* API key setup */}
        {!hasKey && (
          <div className="w-full max-w-sm space-y-4">
            <div className="text-center space-y-2">
              <Key size={36} className="text-brand mx-auto" />
              <p className="text-sm font-medium">Claude API Key Required</p>
              <p className="text-xs text-white/40 leading-relaxed">
                This feature sends your food photo to Claude (Anthropic) to estimate calories and macros. Your key is
                stored only in this browser and is never shared.
              </p>
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm pr-10 focus:outline-none focus:border-brand/40"
              />
              <button
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {error && (
              <div className="flex items-start gap-2 px-3 py-2 bg-red-900/15 border border-red-900/20 rounded-lg">
                <AlertCircle size={13} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-red-400/80">{error}</p>
              </div>
            )}
            <button
              onClick={handleSaveKey}
              disabled={!keyInput.trim()}
              className="w-full py-2.5 rounded-xl bg-brand text-black text-sm font-medium hover:bg-brand/90 disabled:opacity-40 transition-colors"
            >
              Save &amp; Continue
            </button>
            <p className="text-[10px] text-white/20 text-center">
              Get a key at <span className="text-brand/60 underline select-all">console.anthropic.com</span>
            </p>
          </div>
        )}

        {/* Photo capture */}
        {hasKey && !analyzing && !preview && (
          <div className="w-full max-w-sm space-y-5 text-center">
            <div className="space-y-2">
              <Camera size={48} className="text-brand/60 mx-auto" />
              <p className="text-sm text-white/70">Take or choose a photo of your food</p>
              <p className="text-xs text-white/30">Claude will estimate calories and macros</p>
            </div>

            <div className="space-y-3">
              {/* Primary: camera capture (mobile) */}
              <button
                onClick={() => {
                  if (fileRef.current) {
                    fileRef.current.removeAttribute('accept')
                    fileRef.current.setAttribute('capture', 'environment')
                    fileRef.current.setAttribute('accept', ACCEPTED_TYPES)
                    fileRef.current.click()
                  }
                }}
                className="w-full py-3 rounded-xl bg-brand text-black text-sm font-medium hover:bg-brand/90 transition-colors flex items-center justify-center gap-2"
              >
                <Camera size={16} /> Take Photo
              </button>

              {/* Secondary: file picker */}
              <button
                onClick={() => {
                  if (fileRef.current) {
                    fileRef.current.removeAttribute('capture')
                    fileRef.current.setAttribute('accept', ACCEPTED_TYPES)
                    fileRef.current.click()
                  }
                }}
                className="w-full py-2.5 rounded-xl glass text-sm text-white/60 hover:bg-white/[0.06] transition-colors"
              >
                Choose from Library
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 px-3 py-2 bg-red-900/15 border border-red-900/20 rounded-lg text-left">
                <AlertCircle size={13} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-red-400/80">{error}</p>
              </div>
            )}

            <button onClick={forgetKey} className="text-[10px] text-white/15 hover:text-white/40 transition-colors">
              Forget API key
            </button>
          </div>
        )}

        {/* Analyzing */}
        {analyzing && (
          <div className="space-y-4 text-center">
            {preview && (
              <img src={preview} alt="Food preview" className="w-48 h-48 object-cover rounded-xl mx-auto opacity-60" />
            )}
            <div className="flex items-center gap-2 text-white/60">
              <Loader size={18} className="animate-spin text-brand" />
              <span className="text-sm">Analysing with Claude...</span>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept={ACCEPTED_TYPES} onChange={handleFile} className="hidden" />
    </div>
  )
}
