# Strava Integration (JGYM-8)

Push completed JGym sessions to Strava as `WeightTraining` activities.

## Why a proxy is required

Strava OAuth uses an **authorization code** flow whose token exchange
requires the app's `client_secret`. A secret must never ship inside a
public client (web bundle or APK — both are trivially decompiled). So
JGym uses a tiny stateless proxy that holds the secret and performs the
two server-only calls: code→token exchange and token refresh. The proxy
stores nothing; tokens live on-device in `localStorage`.

```
 ┌────────┐  1. open authorize URL    ┌─────────────┐
 │ JGym   │ ────────────────────────▶ │  Strava     │
 │ client │                           │  OAuth      │
 │        │ ◀──── 2. redirect ?code ──│             │
 │        │                           └─────────────┘
 │        │  3. POST {code}    ┌──────────────┐  4. exchange (has secret)
 │        │ ─────────────────▶ │ strava-proxy │ ───────────▶ Strava
 │        │ ◀── tokens ─────── │ (this repo)  │ ◀───────────
 │        │  5. POST /activities (Bearer access_token)  ──▶ Strava
 └────────┘
```

## Components

| Piece | Location | Status |
| --- | --- | --- |
| Design doc | `docs/strava-integration.md` | ✅ this file |
| Token proxy | `server/strava-proxy/` | ✅ runnable, needs deploy |
| Client module | `src/utils/strava.ts` | ✅ web flow; native TODO |
| Settings UI | `StravaSettings` in settings modal | ✅ connect/disconnect |
| Send-to-Strava | workout summary button | ✅ on completed session |

## Configuration

Client build-time env (Vite, `.env`):

```
VITE_STRAVA_CLIENT_ID=<your numeric Strava client id>
VITE_STRAVA_PROXY_URL=https://<your-proxy-host>
VITE_STRAVA_REDIRECT_URI=https://<app-origin>/strava/callback
```

Proxy env (`server/strava-proxy/.env`):

```
STRAVA_CLIENT_ID=<same numeric id>
STRAVA_CLIENT_SECRET=<secret from strava.com/settings/api>
ALLOWED_ORIGIN=https://<app-origin>
```

## Data mapping

Gym workouts have no GPS, so sessions are pushed via Strava's
`POST /api/v3/activities` (manual activity), not the upload/FIT endpoint.

| JGym | Strava activity field |
| --- | --- |
| `session.label` (or date) | `name` |
| `session.date` | `start_date_local` |
| `elapsed` seconds | `elapsed_time` |
| sets summary | `description` |
| — | `type` / `sport_type` = `WeightTraining` |

## Remaining work before shipping (native)

1. Register a Strava API app, set the redirect URI.
2. Deploy `server/strava-proxy` (any Node host / serverless) and set its env.
3. **Native OAuth redirect** — add `@capacitor/browser`, open the authorize
   URL in the system browser, register a custom-scheme/App Link
   (`com.rltnewside.jgym://strava/callback`) in `AndroidManifest.xml`, and
   capture the code via `@capacitor/app`'s `appUrlOpen` listener. The web
   redirect path in `strava.ts` already works; only the native open +
   capture is stubbed.
4. QA the full connect → upload loop on a device.
