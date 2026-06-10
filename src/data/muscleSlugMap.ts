// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
/**
 * Maps react-muscle-highlighter Slug values to JGym MuscleGroup names.
 * Used by BodyMap to translate between the visual body diagram and our
 * granular 43-muscle system.
 */

import type { Slug } from 'react-muscle-highlighter'
import type { MuscleGroup } from '../types'

export const SLUG_TO_MUSCLES: Record<Slug, MuscleGroup[]> = {
  chest: ['Upper Chest', 'Mid Chest', 'Lower Chest'],
  obliques: ['External Obliques', 'Internal Obliques', 'Serratus Anterior'],
  abs: ['Upper Abs', 'Lower Abs', 'Transverse Abdominis'],
  trapezius: ['Upper Traps', 'Mid Traps', 'Lower Traps'],
  'upper-back': ['Rhomboids', 'Upper Lats', 'Teres Major', 'Infraspinatus'],
  'lower-back': ['Erector Spinae', 'Lower Lats'],
  deltoids: ['Front Delts', 'Side Delts', 'Rear Delts', 'Rotator Cuff'],
  biceps: ['Biceps Long Head', 'Biceps Short Head', 'Brachialis'],
  triceps: ['Triceps Long Head', 'Triceps Lateral Head', 'Triceps Medial Head'],
  forearm: ['Brachioradialis', 'Wrist Flexors', 'Wrist Extensors'],
  quadriceps: ['Rectus Femoris', 'Vastus Lateralis', 'Vastus Medialis', 'Vastus Intermedius', 'Hip Flexors'],
  hamstring: ['Biceps Femoris', 'Semitendinosus', 'Semimembranosus'],
  gluteal: ['Gluteus Maximus', 'Gluteus Medius', 'Gluteus Minimus'],
  adductors: ['Adductors', 'TFL'],
  calves: ['Gastrocnemius', 'Soleus'],
  tibialis: ['Tibialis Anterior'],
  // Structural / non-muscle parts — no JGym muscles
  neck: [],
  head: [],
  hair: [],
  hands: [],
  feet: [],
  ankles: [],
  knees: [],
}

/** Reverse lookup: MuscleGroup → Slug (for highlighting the body when muscles are selected) */
export const MUSCLE_TO_SLUG: Partial<Record<MuscleGroup, Slug>> = {}
for (const [slug, muscles] of Object.entries(SLUG_TO_MUSCLES)) {
  for (const m of muscles) {
    MUSCLE_TO_SLUG[m] = slug as Slug
  }
}

/** Slugs that represent actual muscle groups (interactive on the body map) */
export const MUSCLE_SLUGS: Slug[] = [
  'chest',
  'obliques',
  'abs',
  'trapezius',
  'upper-back',
  'lower-back',
  'deltoids',
  'biceps',
  'triceps',
  'forearm',
  'quadriceps',
  'hamstring',
  'gluteal',
  'adductors',
  'calves',
  'tibialis',
]

/** Slugs that are structural (non-muscle) parts */
export const STRUCTURAL_SLUGS: Slug[] = ['neck', 'head', 'hair', 'hands', 'feet', 'ankles', 'knees']

/** Human-readable label for each slug */
export const SLUG_LABELS: Record<Slug, string> = {
  chest: 'Chest',
  obliques: 'Obliques',
  abs: 'Abs',
  trapezius: 'Traps',
  'upper-back': 'Upper Back',
  'lower-back': 'Lower Back',
  deltoids: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearm: 'Forearms',
  quadriceps: 'Quads',
  hamstring: 'Hamstrings',
  gluteal: 'Glutes',
  adductors: 'Adductors',
  calves: 'Calves',
  tibialis: 'Tibialis',
  neck: 'Neck',
  head: 'Head',
  hair: 'Hair',
  hands: 'Hands',
  feet: 'Feet',
  ankles: 'Ankles',
  knees: 'Knees',
}
