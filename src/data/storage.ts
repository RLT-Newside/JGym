// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

/**
 * Central registry of every localStorage key the app uses. Keeping the keys in
 * one place makes them discoverable and prevents typos/collisions. All keys
 * share the `gym_` prefix so backup import/export can find them by prefix.
 */
export const GYM_KEY_PREFIX = 'gym_'

export const STORAGE_KEYS = {
  // Core user data (backed up / imported).
  exercises: 'gym_exercises',
  sessions: 'gym_sessions',
  plans: 'gym_plans',
  food: 'gym_food',
  water: 'gym_water',
  weight: 'gym_weight',
  activity: 'gym_activity',
  nutritionGoal: 'gym_nutrition_goal',
  // Preferences / UI.
  musicPopupDisabled: 'gym_music_popup_disabled',
  theme: 'gym_theme',
  repRanges: 'gym_rep_ranges',
  // Transient / session.
  activeSession: 'gym_active_session',
  patternDismissed: 'gym_pattern_dismissed',
  // Consent flags.
  privacyConsent: 'gym_privacy_consent',
  barcodeConsent: 'gym_barcode_consent',
  // One-time migrations.
  relinkImagesV1: 'gym_relink_images_v1',
  // Supporter activation.
  supporter: 'gym_supporter',
  supporterHash: 'gym_supporter_hash',
  supporterHashes: 'gym_supporter_hashes',
  // Update checker cache.
  updateLastCheck: 'gym_update_last_check',
  updateCached: 'gym_update_cached',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
