// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { Html5Qrcode } from 'html5-qrcode'
import { Camera, Loader, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useBackHandler } from '../../../../hooks/useBackButton'

interface Props {
  onScan: (barcode: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onScan, onClose }: Props) {
  useBackHandler(() => {
    onClose()
    return true
  }, true)
  const containerRef = useRef<HTMLDivElement>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(true)
  const scannedRef = useRef(false)
  const stoppedRef = useRef(false)

  const stopScanner = useCallback(async () => {
    if (stoppedRef.current) return
    stoppedRef.current = true
    const scanner = scannerRef.current
    if (scanner) {
      try {
        await scanner.stop()
      } catch {}
      try {
        scanner.clear()
      } catch {}
      scannerRef.current = null
    }
  }, [])

  const handleClose = useCallback(async () => {
    await stopScanner()
    onClose()
  }, [stopScanner, onClose])

  useEffect(() => {
    const scannerId = 'barcode-scanner-view'
    let cancelled = false

    async function init() {
      try {
        await navigator.mediaDevices
          .getUserMedia({ video: { facingMode: 'environment' } })
          .then((stream) => stream.getTracks().forEach((t) => t.stop()))
      } catch {
        if (!cancelled) {
          setError('Camera permission denied. Please allow camera access when prompted and try again.')
          setStarting(false)
        }
        return
      }

      if (cancelled) return

      const scanner = new Html5Qrcode(scannerId)
      scannerRef.current = scanner

      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 120 } },
          (decodedText) => {
            if (scannedRef.current || cancelled) return
            scannedRef.current = true
            stopScanner()
            onScan(decodedText)
          },
          () => {},
        )
        if (!cancelled) setStarting(false)
      } catch {
        if (!cancelled) {
          setError('Could not start camera. Make sure your device has a camera.')
          setStarting(false)
        }
      }
    }

    init()

    return () => {
      cancelled = true
      stopScanner()
    }
  }, [onScan, stopScanner])

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Camera size={16} className="text-brand" />
          <span className="text-sm font-medium">Scan Barcode</span>
        </div>
        <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        {error ? (
          <div className="text-center space-y-3 max-w-xs">
            <Camera size={40} className="text-white/20 mx-auto" />
            <p className="text-sm text-white/60">{error}</p>
            <button
              onClick={handleClose}
              className="px-4 py-2 glass rounded-xl text-sm text-white/60 hover:bg-white/[0.06] transition-colors"
            >
              Go back
            </button>
          </div>
        ) : (
          <>
            {starting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                <Loader size={24} className="text-brand animate-spin" />
              </div>
            )}
            <div className="w-full max-w-sm relative">
              <div id="barcode-scanner-view" ref={containerRef} className="w-full rounded-xl overflow-hidden" />
              {!starting && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-[270px] h-[130px] relative">
                    <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-brand rounded-tl" />
                    <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-brand rounded-tr" />
                    <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-brand rounded-bl" />
                    <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-brand rounded-br" />
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-white/30 text-center max-w-xs">
              Point the barcode at the yellow box. Works with most packaged food products.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
