// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
//
// Strava client module (JGYM-8). Handles the OAuth code flow via the JGym
// token proxy (which holds the client secret) and pushes completed sessions
// as Strava WeightTraining activities. Tokens are kept on-device only.
// See docs/strava-integration.md.

import type { Exercise, Session } from '../types'

const CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID as string | undefined
const PROXY_URL = import.meta.env.VITE_STRAVA_PROXY_URL as string | undefined
const REDIRECT_URI = import.meta.env.VITE_STRAVA_REDIRECT_URI as string | undefined

const TOKENS_KEY = 'gym_strava_tokens'
const SCOPE = 'activity:write,read'
const ACTIVITIES_URL = 'https://www.strava.com/api/v3/activities'

export interface StravaTokens {
  access_token: string
  refresh_token: string
  expires_at: number // unix seconds
  athlete: { firstname?: string; lastname?: string } | null
}

export function isStravaConfigured(): boolean {
  return Boolean(CLIENT_ID && PROXY_URL && REDIRECT_URI)
}

function readTokens(): StravaTokens | null {
  try {
    const raw = localStorage.getItem(TOKENS_KEY)
    return raw ? (JSON.parse(raw) as StravaTokens) : null
  } catch {
    return null
  }
}

function writeTokens(tokens: StravaTokens) {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
}

export function isStravaConnected(): boolean {
  return readTokens() !== null
}

export function stravaAthleteName(): string | null {
  const a = readTokens()?.athlete
  if (!a) return null
  return [a.firstname, a.lastname].filter(Boolean).join(' ') || null
}

export function disconnectStrava() {
  localStorage.removeItem(TOKENS_KEY)
}

// Builds the Strava authorization URL the user is sent to in order to grant
// access. On web, redirect the current window here; on native, open it in the
// system browser and capture the redirect via a deep link (see design doc).
export function buildAuthorizeUrl(): string {
  if (!isStravaConfigured()) throw new Error('Strava is not configured')
  const params = new URLSearchParams({
    client_id: CLIENT_ID as string,
    redirect_uri: REDIRECT_URI as string,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: SCOPE,
  })
  return `https://www.strava.com/oauth/authorize?${params.toString()}`
}

// Starts the connect flow on web by redirecting to Strava's consent screen.
export function beginStravaConnect() {
  window.location.assign(buildAuthorizeUrl())
}

// Exchanges an authorization code (from the redirect) for tokens via the proxy.
export async function exchangeStravaCode(code: string): Promise<StravaTokens> {
  if (!PROXY_URL) throw new Error('Strava proxy not configured')
  const resp = await fetch(`${PROXY_URL}/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  if (!resp.ok) throw new Error(`Strava exchange failed (${resp.status})`)
  const tokens = (await resp.json()) as StravaTokens
  writeTokens(tokens)
  return tokens
}

async function refreshStravaTokens(tokens: StravaTokens): Promise<StravaTokens> {
  if (!PROXY_URL) throw new Error('Strava proxy not configured')
  const resp = await fetch(`${PROXY_URL}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: tokens.refresh_token }),
  })
  if (!resp.ok) throw new Error(`Strava refresh failed (${resp.status})`)
  const next = (await resp.json()) as StravaTokens
  // Strava keeps athlete only on the first exchange; preserve it across refresh.
  if (!next.athlete) next.athlete = tokens.athlete
  writeTokens(next)
  return next
}

// Returns a valid access token, refreshing it if it expires within 60s.
async function validAccessToken(): Promise<string> {
  let tokens = readTokens()
  if (!tokens) throw new Error('Not connected to Strava')
  if (tokens.expires_at - 60 <= Math.floor(Date.now() / 1000)) {
    tokens = await refreshStravaTokens(tokens)
  }
  return tokens.access_token
}

function buildDescription(session: Session, exercises: Exercise[]): string {
  const lines = session.entries.map((entry) => {
    const name = exercises.find((e) => e.id === entry.exerciseId)?.name ?? 'Exercise'
    const sets = entry.sets
      .filter((s) => s.reps > 0)
      .map((s) => `${s.reps}×${s.weight}${s.unit}`)
      .join(', ')
    return `${name}: ${sets}`
  })
  return ['Logged with JGym', '', ...lines].join('\n')
}

// Pushes a completed session to Strava as a manual WeightTraining activity.
// `elapsed` is in seconds.
export async function uploadSession(session: Session, exercises: Exercise[], elapsed: number): Promise<void> {
  const accessToken = await validAccessToken()
  const body = new URLSearchParams({
    name: session.label || 'Strength Session',
    type: 'WeightTraining',
    sport_type: 'WeightTraining',
    start_date_local: new Date(session.date).toISOString(),
    elapsed_time: String(Math.max(0, Math.round(elapsed))),
    description: buildDescription(session, exercises),
  })
  const resp = await fetch(ACTIVITIES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })
  if (!resp.ok) throw new Error(`Strava upload failed (${resp.status})`)
}
