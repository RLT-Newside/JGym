// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import type { MuscleGroup } from '../../types'

export const FE_MUSCLE_MAP: Record<string, MuscleGroup[]> = {
  abdominals: ['Upper Abs', 'Lower Abs'],
  abductors: ['TFL', 'Gluteus Medius'],
  adductors: ['Adductors'],
  biceps: ['Biceps Long Head', 'Biceps Short Head'],
  calves: ['Gastrocnemius', 'Soleus'],
  chest: ['Mid Chest', 'Lower Chest'],
  forearms: ['Brachioradialis', 'Wrist Flexors', 'Wrist Extensors'],
  glutes: ['Gluteus Maximus'],
  hamstrings: ['Biceps Femoris', 'Semitendinosus', 'Semimembranosus'],
  lats: ['Upper Lats', 'Lower Lats'],
  'lower back': ['Erector Spinae'],
  'middle back': ['Rhomboids', 'Mid Traps'],
  neck: [],
  quadriceps: ['Rectus Femoris', 'Vastus Lateralis', 'Vastus Medialis'],
  shoulders: ['Front Delts', 'Side Delts'],
  traps: ['Upper Traps', 'Mid Traps'],
  triceps: ['Triceps Long Head', 'Triceps Lateral Head', 'Triceps Medial Head'],
}

export function mapFreeExerciseMuscle(name: string): MuscleGroup[] {
  return FE_MUSCLE_MAP[name.toLowerCase()] ?? []
}
