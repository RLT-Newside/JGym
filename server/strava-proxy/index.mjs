// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
//
// Minimal stateless Strava OAuth token proxy. Holds the client secret and
// performs the two server-only calls: authorization-code exchange and token
// refresh. Stores nothing. Run anywhere with Node 18+ (built-in fetch).
//
//   STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET  — from strava.com/settings/api
//   ALLOWED_ORIGIN                          — CORS origin of the JGym client
//   PORT                                    — defaults to 8787

import { createServer } from 'node:http'

const CLIENT_ID = process.env.STRAVA_CLIENT_ID
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*'
const PORT = Number(process.env.PORT) || 8787
const TOKEN_URL = 'https://www.strava.com/oauth/token'

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET')
  process.exit(1)
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function send(res, status, body) {
  cors(res)
  res.setHeader('Content-Type', 'application/json')
  res.writeHead(status)
  res.end(JSON.stringify(body))
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (c) => {
      raw += c
      if (raw.length > 1e6) reject(new Error('payload too large'))
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch (e) {
        reject(e)
      }
    })
  })
}

// Strips the refresh response down to what the client needs (never the secret).
function pickTokens(data) {
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    athlete: data.athlete ?? null,
  }
}

async function exchange(params) {
  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, ...params }),
  })
  const data = await resp.json()
  return { ok: resp.ok, data }
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    cors(res)
    res.writeHead(204)
    return res.end()
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' })

  try {
    const body = await readJson(req)

    if (req.url === '/exchange') {
      if (!body.code) return send(res, 400, { error: 'missing_code' })
      const { ok, data } = await exchange({ code: body.code, grant_type: 'authorization_code' })
      return send(res, ok ? 200 : 400, ok ? pickTokens(data) : data)
    }

    if (req.url === '/refresh') {
      if (!body.refresh_token) return send(res, 400, { error: 'missing_refresh_token' })
      const { ok, data } = await exchange({ refresh_token: body.refresh_token, grant_type: 'refresh_token' })
      return send(res, ok ? 200 : 400, ok ? pickTokens(data) : data)
    }

    return send(res, 404, { error: 'not_found' })
  } catch (e) {
    return send(res, 400, { error: 'bad_request', detail: String(e?.message ?? e) })
  }
})

server.listen(PORT, () => console.log(`strava-proxy listening on :${PORT}`))
