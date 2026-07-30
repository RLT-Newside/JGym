// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { AppShell } from './app-shell'
import { ErrorBoundary } from './components/error-boundary/error-boundary'
import { AppDataProvider } from './context/app-data'

export default function App() {
  // Top-level boundary: a throw anywhere (provider, shell, always-mounted
  // modals, update check, or a stale dynamic-import chunk after a deploy) shows
  // the recoverable "Something broke / Reload" screen instead of a blank crash.
  // The inner boundary around AppRouter still isolates per-page failures.
  return (
    <ErrorBoundary>
      <AppDataProvider>
        <AppShell />
      </AppDataProvider>
    </ErrorBoundary>
  )
}
