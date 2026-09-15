# SparkyFitness Integration — Evaluation (JGYM-40)

## Summary

**Feasibility: Yes.** SparkyFitness is self-hosted and exposes a REST API. JGym can POST completed sessions to it using the same pattern as the Strava integration, but simpler — no proxy server or OAuth flow is needed. The user provides their own instance URL and API key.

## Architecture

```
JGym (browser/native)
       │  POST /api/workouts
       ▼
SparkyFitness instance (self-hosted)
```

No server-side component is needed on JGym's side. Credentials are stored only in the user's own `localStorage`, scoped to their device.

## Configuration

The user enters two values in Settings → SparkyFitness:

| Field    | Description                                       |
|----------|---------------------------------------------------|
| Base URL | Full URL to their SparkyFitness instance, e.g. `https://sparky.yourdomain.com` |
| API Key  | Generated in SparkyFitness user profile settings  |

Stored as `gym_sparkyfitness_config` in localStorage (same `gym_` prefix, backed up by JGym's export/import).

## API Endpoints Used

> **TODO:** Confirm these paths against a running SparkyFitness instance before
> removing the draft status. Adjust the constants in `src/utils/sparkyfitness.ts`
> if your instance uses a different version prefix or endpoint shape.

| Method | Path              | Purpose              |
|--------|-------------------|----------------------|
| GET    | `/api/user/profile`  | Connection test / auth check |
| POST   | `/api/workouts`   | Create a workout entry |

### Workout Payload

```json
{
  "title": "Push Day",
  "date": "2026-09-15T10:00:00Z",
  "duration_seconds": 3600,
  "source": "jgym",
  "exercises": [
    {
      "name": "Bench Press",
      "sets": [
        { "reps": 8, "weight": 80, "unit": "kg" },
        { "reps": 6, "weight": 85, "unit": "kg" }
      ]
    }
  ]
}
```

## Implementation Delivered (Draft)

- `src/utils/sparkyfitness.ts` — config storage, connection test, `uploadSessionToSparky()`
- `src/utils/sparkyfitness.test.ts` — unit tests for config helpers and payload builder
- `src/data/storage.ts` — `sparkyFitnessConfig` key added
- `src/components/settings-modal/settings-modal.tsx` — Connect / Disconnect / Test UI added

## What Is Still Needed Before Merging

1. **Verify API endpoints** — run the integration against an actual SparkyFitness instance and confirm `/api/user/profile` and `/api/workouts` paths and payload shape. Update `sparkyfitness.ts` if they differ.
2. **Workout summary modal hook** — add a "Sync to SparkyFitness" button in `src/pages/train/components/workout-summary-modal/workout-summary-modal.tsx`, following the Strava pattern on `feat/strava-integration`.
3. **Privacy policy update** — disclose the optional self-hosted outbound connection, as was done for Strava.

## Comparison to Strava

| Aspect           | Strava          | SparkyFitness    |
|------------------|-----------------|------------------|
| Auth             | OAuth 2.0 + proxy server | API key (no proxy needed) |
| Self-hosted      | No              | Yes              |
| Shared secret    | Yes (client secret in proxy) | No |
| User effort      | OAuth consent flow | Paste URL + API key |
