// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import {
  BarChart3,
  CalendarDays,
  Check,
  Download,
  Dumbbell,
  ExternalLink,
  Heart,
  KeyRound,
  Merge,
  MessageSquare,
  RefreshCw,
  Replace,
  Shield,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useRef, useState } from 'react'
import type { Theme } from '../../hooks/useTheme'
import type { CheckResult } from '../../hooks/useUpdateCheck'
import type { Exercise } from '../../types'
import { exportJsonFile } from '../../utils/fileExport'
import { DEFAULT_REP_RANGES, loadRepRanges, type RepRangeMap, saveRepRanges } from '../../utils/progression'
import { Button } from '../button/button'
import { Modal } from '../modal/modal'

declare const __APP_VERSION__: string

// Public JGym issue tracker — anyone can file bugs / feature requests here.
const FEEDBACK_URL = 'https://jgym.atlassian.net/jira/'

function RepRangeSettings() {
  const [ranges, setRanges] = useState<RepRangeMap[]>(loadRepRanges)
  const [newTarget, setNewTarget] = useState('')
  const [newMin, setNewMin] = useState('')
  const [newMax, setNewMax] = useState('')

  const update = (updated: RepRangeMap[]) => {
    const sorted = [...updated].sort((a, b) => a.target - b.target)
    setRanges(sorted)
    saveRepRanges(sorted)
  }

  const remove = (target: number) => update(ranges.filter((r) => r.target !== target))

  const add = () => {
    const t = parseInt(newTarget, 10)
    const mn = parseInt(newMin, 10)
    const mx = parseInt(newMax, 10)
    if (!t || !mn || !mx || mn > mx || t < 1) return
    update([...ranges.filter((r) => r.target !== t), { target: t, min: mn, max: mx }])
    setNewTarget('')
    setNewMin('')
    setNewMax('')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs text-white/40 uppercase tracking-wider">Rep Ranges</h3>
        <button
          onClick={() => update([...DEFAULT_REP_RANGES])}
          className="text-[9px] text-white/20 hover:text-white/40 transition-colors"
        >
          Reset
        </button>
      </div>
      <p className="text-[9px] text-white/20">When you hit the target reps, you get a weight increase suggestion</p>
      <div className="space-y-1.5">
        {ranges.map((r) => (
          <div key={r.target} className="flex items-center gap-2 glass rounded-lg px-3 py-2">
            <span className="text-xs text-white/60 w-16">Target: {r.target}</span>
            <span className="text-[10px] text-white/30 flex-1">
              Range: {r.min}–{r.max}
            </span>
            <button onClick={() => remove(r.target)} className="text-[10px] text-red-400/50 hover:text-red-400">
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min="1"
          max="100"
          value={newTarget}
          onChange={(e) => setNewTarget(e.target.value)}
          placeholder="Target"
          className="w-16 glass rounded-lg px-2 py-1.5 text-[10px] text-center focus:outline-none focus:border-brand/40"
        />
        <input
          type="number"
          min="1"
          max="100"
          value={newMin}
          onChange={(e) => setNewMin(e.target.value)}
          placeholder="Min"
          className="w-14 glass rounded-lg px-2 py-1.5 text-[10px] text-center focus:outline-none focus:border-brand/40"
        />
        <span className="text-white/20 text-[10px]">–</span>
        <input
          type="number"
          min="1"
          max="100"
          value={newMax}
          onChange={(e) => setNewMax(e.target.value)}
          placeholder="Max"
          className="w-14 glass rounded-lg px-2 py-1.5 text-[10px] text-center focus:outline-none focus:border-brand/40"
        />
        <button
          onClick={add}
          className="px-2 py-1.5 rounded-lg bg-brand text-black text-[10px] font-medium press-scale"
        >
          +
        </button>
      </div>
    </div>
  )
}

const THEMES: { id: Theme; label: string; color: string }[] = [
  { id: 'yellow', label: 'Classic', color: '#f5e642' },
  { id: 'cyan', label: 'Aqua', color: '#22d3ee' },
  { id: 'purple', label: 'Violet', color: '#a855f7' },
  { id: 'coral', label: 'Coral', color: '#fb7185' },
  { id: 'green', label: 'Neon', color: '#4ade80' },
]

interface Props {
  open: boolean
  onClose: () => void
  onImport: (data: Record<string, unknown>, mode: 'merge' | 'replace') => void
  exercises: Exercise[]
  onImportExercises: (exercises: Exercise[], mode: 'merge' | 'replace') => void
  theme: Theme
  onThemeChange: (t: Theme) => void
  isSupporter: boolean
  onActivateCode: (code: string) => Promise<boolean>
  onRevoke: () => void
  update: { version: string; url: string } | null
  onCheckUpdate: () => Promise<CheckResult>
  checkingUpdate: boolean
}

export function SettingsModal({
  open,
  onClose,
  onImport,
  exercises,
  onImportExercises,
  theme,
  onThemeChange,
  isSupporter,
  onActivateCode,
  onRevoke,
  update,
  onCheckUpdate,
  checkingUpdate,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const exFileRef = useRef<HTMLInputElement>(null)
  const [importData, setImportData] = useState<Record<string, unknown> | null>(null)
  const [importExercises, setImportExercises] = useState<Exercise[] | null>(null)
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState(false)
  const [codeVerifying, setCodeVerifying] = useState(false)
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null)

  const handleCheckUpdate = async () => {
    setCheckResult(null)
    const result = await onCheckUpdate()
    setCheckResult(result)
  }

  const handleExport = async () => {
    const data: Record<string, unknown> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('gym_')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key)!)
        } catch {
          data[key] = localStorage.getItem(key)
        }
      }
    }
    const date = new Date().toISOString().split('T')[0]
    await exportJsonFile(data, `jgym-backup-${date}.json`, 'JGym Backup')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (typeof data === 'object' && data !== null) {
          setImportData(data)
        } else {
          alert('Invalid backup file format.')
        }
      } catch {
        alert('Could not parse file. Make sure it is a valid JSON backup.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleImport = (mode: 'merge' | 'replace') => {
    if (!importData) return
    onImport(importData, mode)
    setImportData(null)
    onClose()
  }

  const handleExportExercises = async () => {
    const date = new Date().toISOString().split('T')[0]
    await exportJsonFile(exercises, `jgym-exercises-${date}.json`, 'JGym Exercises')
  }

  const handleExFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (
          Array.isArray(data) &&
          data.every((ex: unknown) => typeof ex === 'object' && ex !== null && 'id' in ex && 'name' in ex)
        ) {
          setImportExercises(data as Exercise[])
        } else {
          alert('Invalid exercises file. Expected an array of exercises.')
        }
      } catch {
        alert('Could not parse file. Make sure it is a valid JSON file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleImportExercisesConfirm = (mode: 'merge' | 'replace') => {
    if (!importExercises) return
    onImportExercises(importExercises, mode)
    setImportExercises(null)
    onClose()
  }

  const comingSoon = [
    { icon: BarChart3, label: 'Analytics', desc: 'Progress charts per exercise over time' },
    { icon: CalendarDays, label: 'Calendar Heatmap', desc: 'Consistency visualization' },
  ]

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="space-y-5">
        <div>
          <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">Full Backup</h3>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Download size={14} /> Export All
            </Button>
            <Button
              variant="secondary"
              onClick={() => fileRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Upload size={14} /> Import All
            </Button>
          </div>
          <p className="text-[9px] text-white/20 mt-1.5">Exercises, sessions, and all settings</p>
          <input ref={fileRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
        </div>

        {importData && (
          <div className="glass rounded-xl p-4 space-y-3">
            <p className="text-sm">Backup loaded. How would you like to import?</p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => handleImport('merge')}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Merge size={14} /> Merge
              </Button>
              <Button
                variant="danger"
                onClick={() => handleImport('replace')}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Replace size={14} /> Replace All
              </Button>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">Exercises Only</h3>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleExportExercises}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Dumbbell size={14} /> Export
            </Button>
            <Button
              variant="secondary"
              onClick={() => exFileRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Upload size={14} /> Import
            </Button>
          </div>
          <p className="text-[9px] text-white/20 mt-1.5">Share your exercise library without session data</p>
          <input ref={exFileRef} type="file" accept=".json" onChange={handleExFileSelect} className="hidden" />
        </div>

        {importExercises && (
          <div className="glass rounded-xl p-4 space-y-3">
            <p className="text-sm">
              {importExercises.length} exercise{importExercises.length !== 1 ? 's' : ''} found. How would you like to
              import?
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => handleImportExercisesConfirm('merge')}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Merge size={14} /> Merge
              </Button>
              <Button
                variant="danger"
                onClick={() => handleImportExercisesConfirm('replace')}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Replace size={14} /> Replace
              </Button>
            </div>
          </div>
        )}

        {/* Supporter */}
        <div className="glass rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart size={15} className={isSupporter ? 'text-brand fill-brand' : 'text-white/30'} />
              <h3 className="text-sm font-medium">Support JGym</h3>
            </div>
            {isSupporter && (
              <span className="text-[9px] bg-brand/10 text-brand px-2 py-0.5 rounded-full font-medium">
                Supporter ★
              </span>
            )}
          </div>
          <p className="text-[10px] text-white/30 leading-relaxed">
            JGym is free, open-source, and will stay that way. If it's become part of your training, a coffee helps keep
            it alive.
          </p>
          <a
            href="https://ko-fi.com/rltnewside"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-brand text-black text-sm font-medium hover:opacity-90 transition-opacity press-scale"
          >
            <Heart size={14} className="fill-black" /> Buy me a protein shake
            <ExternalLink size={11} className="opacity-50" />
          </a>

          {!isSupporter ? (
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-[10px] text-white/25">
                <KeyRound size={10} />
                <span>Enter activation code</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => {
                    setCodeInput(e.target.value.toUpperCase())
                    setCodeError(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && codeInput.trim()) {
                      setCodeVerifying(true)
                      onActivateCode(codeInput).then((ok) => {
                        if (!ok) setCodeError(true)
                        setCodeVerifying(false)
                        if (ok) setCodeInput('')
                      })
                    }
                  }}
                  placeholder="JGYM-XXXX-XXXX-XXXX"
                  className={`flex-1 glass rounded-xl px-3 py-2 text-xs font-mono tracking-wider placeholder:text-white/20 focus:outline-none transition-all ${
                    codeError
                      ? 'border-red-500/60 focus:border-red-500/80'
                      : 'focus:border-brand/40 focus:bg-white/[0.06]'
                  }`}
                />
                <button
                  disabled={!codeInput.trim() || codeVerifying}
                  onClick={() => {
                    setCodeVerifying(true)
                    onActivateCode(codeInput).then((ok) => {
                      if (!ok) setCodeError(true)
                      setCodeVerifying(false)
                      if (ok) setCodeInput('')
                    })
                  }}
                  className="px-3 py-2 rounded-xl bg-brand text-black text-xs font-medium disabled:opacity-30 press-scale transition-opacity"
                >
                  {codeVerifying ? '...' : <Check size={14} />}
                </button>
              </div>
              {codeError && <p className="text-[10px] text-red-400/80">Invalid code. Check your code and try again.</p>}
              <p className="text-[9px] text-white/15">Tip on Ko-fi to receive your code via email</p>
            </div>
          ) : (
            <button
              onClick={onRevoke}
              className="w-full text-center text-[10px] text-white/20 hover:text-white/40 transition-colors py-1"
            >
              <X size={8} className="inline mr-1" />
              Deactivate supporter status
            </button>
          )}
        </div>

        {/* Theme picker — supporter only */}
        {isSupporter && (
          <div>
            <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">Accent Theme</h3>
            <div className="grid grid-cols-5 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onThemeChange(t.id)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                    theme === t.id ? 'border-white/30 bg-white/5' : 'border-white/5 hover:border-white/15'
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: t.color, boxShadow: theme === t.id ? `0 0 8px ${t.color}80` : 'none' }}
                  />
                  <span className="text-[10px] text-white/40">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Rep Range Progression */}
        <RepRangeSettings />

        {/* Feedback */}
        <div className="space-y-3">
          <h3 className="text-xs text-white/40 uppercase tracking-wider">Feedback</h3>
          <a
            href={FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm hover:bg-white/[0.1] transition-colors press-scale"
          >
            <MessageSquare size={14} /> Report an issue or idea
            <ExternalLink size={11} className="opacity-50" />
          </a>
          <p className="text-[9px] text-white/20">
            Opens the JGym issue tracker — bugs and feature requests are welcome.
          </p>
        </div>

        {/* Privacy & Data */}
        <div className="space-y-3">
          <h3 className="text-xs text-white/40 uppercase tracking-wider">Privacy & Data</h3>
          <a
            href="https://github.com/RLT-Newside/JGym/blob/main/PRIVACY_POLICY.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            <Shield size={12} /> Privacy Policy →
          </a>
          <Button
            variant="danger"
            onClick={() => {
              if (
                confirm(
                  'This will PERMANENTLY delete all your workouts, exercises, nutrition data, and settings. This cannot be undone.\n\nAre you sure?',
                )
              ) {
                const keys: string[] = []
                for (let i = 0; i < localStorage.length; i++) {
                  const k = localStorage.key(i)
                  if (k?.startsWith('gym_')) keys.push(k)
                }
                keys.forEach((k) => localStorage.removeItem(k))
                localStorage.removeItem('gym_privacy_consent')
                window.location.reload()
              }
            }}
            className="w-full flex items-center justify-center gap-2"
          >
            <Trash2 size={14} /> Delete All Data
          </Button>
        </div>

        <div>
          <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">Coming Soon</h3>
          <div className="space-y-2">
            {comingSoon.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3 glass rounded-xl p-3 opacity-40">
                <Icon size={16} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-[10px] text-white/40">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-white/5 text-center space-y-2">
          <p className="text-[10px] text-white/20">JGym v{__APP_VERSION__}</p>
          <button
            onClick={handleCheckUpdate}
            disabled={checkingUpdate}
            className="inline-flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white/60 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={11} className={checkingUpdate ? 'animate-spin' : ''} />
            {checkingUpdate ? 'Checking…' : 'Check for updates'}
          </button>
          {update ? (
            <a
              href={update.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[10px] text-brand hover:underline"
            >
              Update available: {update.version}
            </a>
          ) : (
            checkResult === 'latest' && <p className="text-[10px] text-white/30">You're on the latest version.</p>
          )}
          {checkResult === 'error' && <p className="text-[10px] text-red-400/70">Check failed. Try again later.</p>}
        </div>
      </div>
    </Modal>
  )
}
