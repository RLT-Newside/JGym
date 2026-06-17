# JGym Strava proxy

Stateless token proxy for the Strava OAuth code flow. Holds the
`client_secret` so the public JGym client never has to. See
[`../../docs/strava-integration.md`](../../docs/strava-integration.md)
for the full design.

## Run

```sh
cp .env.example .env   # fill in STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET
npm start
```

## Endpoints

- `POST /exchange  { code }`            → `{ access_token, refresh_token, expires_at, athlete }`
- `POST /refresh   { refresh_token }`   → same shape

Both proxy to `https://www.strava.com/oauth/token`, injecting the secret.
The secret is never returned to the client.
