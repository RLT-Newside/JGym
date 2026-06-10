// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
const CODES_URL = 'https://raw.githubusercontent.com/RLT-Newside/JGym/main/supporter-hashes.json'
const FRIEND_HASH = 'ffe43f490f1e4894cdd2d101fdf19c2c43ccfb5ed2a955d889df1c2f2ccb8a44'
const CACHE_KEY = 'gym_supporter_hashes'
const HASH_KEY = 'gym_supporter_hash'

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function fetchCodeHashes(): Promise<string[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    let res: Response
    try {
      res = await fetch(CODES_URL, { signal: controller.signal })
    } finally {
      clearTimeout(timeoutId)
    }
    const data = await res.json()
    const hashes: string[] = data.hashes ?? []
    localStorage.setItem(CACHE_KEY, JSON.stringify(hashes))
    return hashes
  } catch {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '[]')
    } catch {
      return []
    }
  }
}

export async function verifyCode(code: string): Promise<boolean> {
  const normalized = code.trim().toUpperCase()
  const hash = await sha256(normalized)

  if (hash === FRIEND_HASH) return true

  const hashes = await fetchCodeHashes()
  return hashes.includes(hash)
}

export function getSavedHash(): string | null {
  return localStorage.getItem(HASH_KEY)
}

export async function activateCode(code: string): Promise<boolean> {
  const normalized = code.trim().toUpperCase()
  const hash = await sha256(normalized)
  const valid = await verifyCode(normalized)
  if (valid) {
    localStorage.setItem(HASH_KEY, hash)
    localStorage.setItem('gym_supporter', 'true')
    return true
  }
  return false
}

export function deactivateSupporter() {
  localStorage.removeItem(HASH_KEY)
  localStorage.setItem('gym_supporter', 'false')
}

export function isActivated(): boolean {
  return !!localStorage.getItem(HASH_KEY)
}

export function prefetchHashes() {
  fetchCodeHashes().catch(() => {})
}
