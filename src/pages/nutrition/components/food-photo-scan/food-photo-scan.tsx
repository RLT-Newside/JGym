// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { AlertCircle, Camera, Eye, EyeOff, Loader, ShieldAlert, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { STORAGE_KEYS } from '../../../../data/storage'
import { useBackHandler } from '../../../../hooks/useBackButton'
import {
  type AiFoodConfig,
  type AiProvider,
  analyzeFood,
  endpointHost,
  type FoodAnalysis,
  PROVIDER_DEFAULTS,
} from '../../../../utils/foodVision'

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/gif'
const INPUT_CLASS =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand/40'

function loadConfig(): AiFoodConfig | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.aiFoodConfig) ?? 'null')
  } catch {
    return null
  }
}

interface Props {
  onResult: (analysis: FoodAnalysis) => void
  onClose: () => void
}

export function FoodPhotoScan({ onResult, onClose }: Props) {
  useBackHandler(() => {
    onClose()
    return true
  }, true)

  // Saved config == the user's explicit consent to send photos to that endpoint.
  const [config, setConfig] = useState<AiFoodConfig | null>(loadConfig)
  const [draft, setDraft] = useState<AiFoodConfig>(() => config ?? { ...PROVIDER_DEFAULTS.openai, apiKey: '' })
  const [consent, setConsent] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const draftHost = endpointHost(draft.baseUrl)

  const pickProvider = (provider: AiProvider) => {
    setDraft({ ...PROVIDER_DEFAULTS[provider], apiKey: '' })
    setConsent(false)
  }

  const handleSaveConfig = () => {
    const cfg = { ...draft, baseUrl: draft.baseUrl.trim(), model: draft.model.trim(), apiKey: draft.apiKey.trim() }
    if (!/^https?:\/\//.test(cfg.baseUrl)) {
      setError('Server URL must start with http:// or https://')
      return
    }
    if (cfg.provider === 'anthropic' && !cfg.apiKey) {
      setError('Anthropic requires an API key (console.anthropic.com).')
      return
    }
    localStorage.setItem(STORAGE_KEYS.aiFoodConfig, JSON.stringify(cfg))
    setConfig(cfg)
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
        const result = await analyzeFood(b64, mimeType, config!)
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

  const resetConfig = () => {
    localStorage.removeItem(STORAGE_KEYS.aiFoodConfig)
    setConfig(null)
    setConsent(false)
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
        {/* Endpoint setup + explicit consent */}
        {!config && (
          <div className="w-full max-w-sm space-y-4">
            <div className="text-center space-y-2">
              <ShieldAlert size={36} className="text-brand mx-auto" />
              <p className="text-sm font-medium">Choose where photos are analysed</p>
              <p className="text-xs text-white/40 leading-relaxed">
                JGym keeps your data on your device. This feature is the one exception: the photo you take is sent to
                the AI server you configure below. Prefer a model you run yourself.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(['openai', 'anthropic'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => pickProvider(p)}
                  className={`py-2 rounded-xl text-xs font-medium border transition-colors ${
                    draft.provider === p
                      ? 'bg-brand/15 border-brand/40 text-brand'
                      : 'border-white/[0.08] text-white/50 hover:bg-white/[0.04]'
                  }`}
                >
                  {p === 'openai' ? 'Self-hosted / local' : 'Claude (Anthropic)'}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <input
                value={draft.baseUrl}
                onChange={(e) => {
                  setDraft({ ...draft, baseUrl: e.target.value })
                  setConsent(false)
                }}
                placeholder="Server URL"
                aria-label="Server URL"
                className={INPUT_CLASS}
              />
              <input
                value={draft.model}
                onChange={(e) => setDraft({ ...draft, model: e.target.value })}
                placeholder="Vision model"
                aria-label="Model"
                className={INPUT_CLASS}
              />
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={draft.apiKey}
                  onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
                  placeholder={draft.provider === 'anthropic' ? 'sk-ant-...' : 'API key (optional)'}
                  aria-label="API key"
                  className={`${INPUT_CLASS} pr-10`}
                />
                <button
                  onClick={() => setShowKey((v) => !v)}
                  aria-label={showKey ? 'Hide key' : 'Show key'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {draft.provider === 'openai' && (
                <p className="text-[10px] text-white/30 leading-relaxed">
                  Any OpenAI-compatible server (Ollama, LM Studio, llama.cpp). Ollama: set OLLAMA_ORIGINS=* for browser
                  access. On Android the server must use HTTPS (e.g. reverse proxy or Tailscale).
                </p>
              )}
            </div>

            <label className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl border border-white/[0.08] cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 accent-brand"
              />
              <span className="text-[11px] text-white/60 leading-relaxed">
                I understand my food photos will be sent to <b className="text-white/90">{draftHost || '…'}</b>. JGym
                cannot verify whether this server is my own or a third party (e.g. Anthropic, OpenAI) and has no control
                over how it stores the photos.
              </span>
            </label>

            {error && (
              <div className="flex items-start gap-2 px-3 py-2 bg-red-900/15 border border-red-900/20 rounded-lg">
                <AlertCircle size={13} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-red-400/80">{error}</p>
              </div>
            )}
            <button
              onClick={handleSaveConfig}
              disabled={!consent || !draft.baseUrl.trim() || !draft.model.trim()}
              className="w-full py-2.5 rounded-xl bg-brand text-black text-sm font-medium hover:bg-brand/90 disabled:opacity-40 transition-colors"
            >
              Agree &amp; Continue
            </button>
          </div>
        )}

        {/* Photo capture */}
        {config && !analyzing && !preview && (
          <div className="w-full max-w-sm space-y-5 text-center">
            <div className="space-y-2">
              <Camera size={48} className="text-brand/60 mx-auto" />
              <p className="text-sm text-white/70">Take or choose a photo of your food</p>
              <p className="text-xs text-white/30">
                Sent to {endpointHost(config.baseUrl)} ({config.model}) to estimate calories and macros
              </p>
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

            <button onClick={resetConfig} className="text-[10px] text-white/15 hover:text-white/40 transition-colors">
              Change AI server / revoke consent
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
              <span className="text-sm">Analysing on {endpointHost(config?.baseUrl ?? '')}...</span>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept={ACCEPTED_TYPES} onChange={handleFile} className="hidden" />
    </div>
  )
}
