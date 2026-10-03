// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

// Mirrors the allow-list in AppUpdatePlugin.java: only release assets of this repo.
const ALLOWED_APK_URL = /^https:\/\/github\.com\/RLT-Newside\/JGym\/releases\/download\/[^/?#]+\/[^/?#]+\.apk$/

export function isAllowedApkUrl(url: string): boolean {
  return ALLOWED_APK_URL.test(url)
}

// GitHub release assets expose `digest: "sha256:<hex>"`. Returns the lowercase hex, or null.
export function parseSha256Digest(digest: unknown): string | null {
  if (typeof digest !== 'string') return null
  const m = /^sha256:([0-9a-fA-F]{64})$/.exec(digest.trim())
  return m ? m[1].toLowerCase() : null
}
