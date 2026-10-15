// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
//
// SparkyFitness client module (JGYM-40). Syncs completed sessions to a
// self-hosted SparkyFitness instance via its REST API. The user supplies
// their own base URL and API key; no shared secret or proxy server is needed.
// See docs/sparkyfitness-integration.md for the full evaluation.
//
// TODO: Verify API endpoints against a live SparkyFitness instance before
// removing the draft status. The paths below follow the SparkyFitness v2 API
// conventions; adjust if your instance uses a different version prefix.

import { STORAGE_KEYS } from '../data/storage'
import type { Exercise, Session } from '../types'

const CONFIG_KEY = STORAGE_KEYS.sparkyFitnessConfig

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SparkyFitnessConfig {
  baseUrl: string
  apiKey: string
}

interface SparkyWorkoutSet {
  reps: number
  weight: number
  unit: string
}

interface SparkyWorkoutExercise {
  name: string
  sets: SparkyWorkoutSet[]
}

interface SparkyWorkoutPayload {
  title: string
  date: string
  duration_seconds: number
  source: string
  exercises: SparkyWorkoutExercise[]
}

// ─── Config storage ───────────────────────────────────────────────────────────

export function readSparkyConfig(): SparkyFitnessConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    return raw ? (JSON.parse(raw) as SparkyFitnessConfig) : null
  } catch {
    return null
  }
}

export function saveSparkyConfig(config: SparkyFitnessConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

export function disconnectSparkyFitness() {
  localStorage.removeItem(CONFIG_KEY)
}

export function isSparkyFitnessConfigured(): boolean {
  const cfg = readSparkyConfig()
  return Boolean(cfg?.baseUrl && cfg?.apiKey)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '')
}

function buildHeaders(apiKey: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }
}

export function buildWorkoutPayload(session: Session, exercises: Exercise[]): SparkyWorkoutPayload {
  return {
    title: session.label || 'Strength Session',
    date: session.date,
    duration_seconds: session.durationSeconds ?? 0,
    source: 'jgym',
    exercises: session.entries.map((entry) => {
      const ex = exercises.find((e) => e.id === entry.exerciseId)
      return {
        name: ex?.name ?? 'Exercise',
        sets: entry.sets.filter((s) => s.reps > 0).map((s) => ({ reps: s.reps, weight: s.weight, unit: s.unit })),
      }
    }),
  }
}

// ─── API calls ────────────────────────────────────────────────────────────────

// Verifies connectivity to the SparkyFitness instance. Returns true when the
// API key is valid. Throws on network error or authentication failure.
// TODO: Confirm this endpoint path against a running SparkyFitness instance.
export async function testSparkyConnection(): Promise<boolean> {
  const cfg = readSparkyConfig()
  if (!cfg) throw new Error('SparkyFitness is not configured')
  const base = normalizeBaseUrl(cfg.baseUrl)
  const resp = await fetch(`${base}/api/user/profile`, {
    headers: buildHeaders(cfg.apiKey),
  })
  if (resp.status === 401 || resp.status === 403) return false
  if (!resp.ok) throw new Error(`SparkyFitness connection test failed (${resp.status})`)
  return true
}

// Syncs a completed session to SparkyFitness as a workout entry.
// TODO: Confirm the /api/workouts endpoint path and payload shape against a
// running SparkyFitness instance; adjust fields as needed.
export async function uploadSessionToSparky(session: Session, exercises: Exercise[]): Promise<void> {
  const cfg = readSparkyConfig()
  if (!cfg) throw new Error('SparkyFitness is not configured')
  const base = normalizeBaseUrl(cfg.baseUrl)
  const payload = buildWorkoutPayload(session, exercises)
  const resp = await fetch(`${base}/api/workouts`, {
    method: 'POST',
    headers: buildHeaders(cfg.apiKey),
    body: JSON.stringify(payload),
  })
  if (!resp.ok) throw new Error(`SparkyFitness upload failed (${resp.status})`)
}
