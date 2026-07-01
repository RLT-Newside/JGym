// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/** Catches render/runtime errors in the subtree so a single throw no longer
 *  white-screens the whole PWA. Saved data (localStorage) is untouched. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught error in render tree:', error, info)
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0d0d0d] text-[#e8e4dc]">
        <div className="glass rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
          <h1 className="font-heading text-2xl text-brand">Something broke</h1>
          <p className="text-sm text-white/60">The app hit an unexpected error. Your saved data is safe.</p>
          <button
            type="button"
            onClick={this.handleReload}
            className="w-full py-2.5 rounded-xl bg-brand text-black text-sm font-semibold press-scale"
          >
            Reload
          </button>
        </div>
      </div>
    )
  }
}
