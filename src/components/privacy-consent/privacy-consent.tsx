// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { Shield } from 'lucide-react'
import { Button } from '../button/button'

interface Props {
  onAccept: () => void
}

export function PrivacyConsent({ onAccept }: Props) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm px-6">
      <div className="bg-[#1a1a1a]/90 backdrop-blur-2xl border border-white/[0.1] rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand/15 flex items-center justify-center">
            <Shield size={20} className="text-brand" />
          </div>
          <h2 className="font-heading text-xl">Your Privacy</h2>
        </div>

        <div className="space-y-2 text-sm text-white/60 leading-relaxed">
          <p>
            JGym stores your fitness, nutrition, and weight data{' '}
            <strong className="text-white/80">locally on your device only</strong>.
          </p>
          <p>No data is sent to servers. No accounts. No tracking.</p>
          <p>Barcode scanning (optional) sends the barcode number to OpenFoodFacts to look up nutrition info.</p>
        </div>

        <a
          href="https://github.com/RLT-Newside/JuMa/blob/main/PRIVACY_POLICY.md"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-[10px] text-brand/60 hover:text-brand/80 transition-colors"
        >
          Read full privacy policy →
        </a>

        <Button onClick={onAccept} className="w-full">
          I Understand & Agree
        </Button>
      </div>
    </div>
  )
}
