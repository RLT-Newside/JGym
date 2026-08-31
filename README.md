# JGym

**JGym** is a minimalist, offline-first gym tracking app for Android that lifters use to log workouts without the bloat. No accounts, no ads, no cloud lock-in — just a fast, distraction-free logbook that lives on your phone and gets out of the way between sets.

It solves a simple problem: most training apps bury the actual act of logging a set under subscriptions, social feeds, and UI clutter. JGym strips that down to a bold, high-contrast interface designed to be used one-handed under the bar.

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=react,ts,tailwind,vite,androidstudio,java,gradle&theme=dark" alt="Tech Stack" />
  </a>
</p>

---

## Features

- **Live session tracking** — log sets/reps/weight with a built-in rest timer, following saved plans
- **Exercise wiki** — muscle-group filters, body map visualization, and a searchable library
- **Training plans** — create, edit, import, export, and share plans as JSON, with day-by-day builder and exercise regenerator
- **History** — calendar-grid view of past sessions with volume and PR tracking
- **Automatic PR detection** — badges and celebrations on personal records
- **Nutrition** — calorie, protein, water, and weight logging
- **Music** — browse and control SimpMusic playback with shuffle/repeat/queue editing
- **Offline-first** — all data stored locally, installs as a native Android app (APK)

Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, and **Capacitor** for the Android shell.

## Requirements

- Android device
- [SimpMusic](https://github.com/maxrave-dev/SimpMusic) installed (for music features)
- Notification access granted to JGym (prompted on first use)

## Installation

1. Download the latest APK from [Releases](https://github.com/RLT-Newside/JGym/releases/latest)
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
