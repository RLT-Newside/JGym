# JGym

A mobile workout tracker and music controller for Android, built with React + Capacitor.

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=react,ts,tailwind,vite,androidstudio,java,gradle&theme=dark" alt="Tech Stack" />
  </a>
</p>

---

## Features

- **Training** — log workouts, track sets/reps, follow saved plans
- **Exercise library** — custom exercises with muscle group tracking
- **History** — view past sessions with volume and PR tracking
- **Nutrition** — calorie, protein, water, and weight logging
- **Music** — browse and control SimpMusic playback with shuffle/repeat/queue editing
- **Wiki** — exercise reference library and plan builder

## Requirements

- Android device
- [SimpMusic](https://github.com/maxrave-dev/SimpMusic) installed (for music features)
- Notification access granted to JGym (prompted on first use)

## Installation

1. Download the latest APK from [Releases](https://github.com/RLT-Newside/JuMa/releases/latest)
2. Enable "Install from unknown sources" on your Android device
3. Install the APK
4. Open JGym → Music tab → grant notification access → enjoy

## Development

```bash
npm install
npm run dev          # web preview
npx cap sync android # sync to Android
npx cap open android # open in Android Studio
```

Releases are built and signed automatically on every push to `main` via GitHub Actions.

## Privacy

JGym stores all data locally on your device. No accounts, no tracking, no ads. [Full Privacy Policy](PRIVACY_POLICY.md).

**Age requirement:** 13+

## License

[GPL-3.0](LICENSE)
