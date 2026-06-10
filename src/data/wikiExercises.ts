// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import type { WikiExerciseTemplate } from '../types'

export const WIKI_EXERCISES: WikiExerciseTemplate[] = [
  // ─── Chest ───
  {
    name: 'Bench Press (Barbell)',
    category: 'Chest',
    primaryMuscles: ['Mid Chest', 'Lower Chest'],
    secondaryMuscles: ['Front Delts', 'Triceps Long Head', 'Triceps Lateral Head'],
  },
  {
    name: 'Bench Press (Dumbbell)',
    category: 'Chest',
    primaryMuscles: ['Mid Chest', 'Lower Chest'],
    secondaryMuscles: ['Front Delts', 'Triceps Long Head'],
  },
  {
    name: 'Incline Bench Press (Barbell)',
    category: 'Chest',
    primaryMuscles: ['Upper Chest', 'Mid Chest'],
    secondaryMuscles: ['Front Delts', 'Triceps Long Head'],
  },
  {
    name: 'Incline Dumbbell Press',
    category: 'Chest',
    primaryMuscles: ['Upper Chest', 'Mid Chest'],
    secondaryMuscles: ['Front Delts', 'Triceps Long Head'],
  },
  {
    name: 'Decline Press',
    category: 'Chest',
    primaryMuscles: ['Lower Chest', 'Mid Chest'],
    secondaryMuscles: ['Front Delts', 'Triceps Long Head'],
  },
  {
    name: 'Cable Fly',
    category: 'Chest',
    primaryMuscles: ['Mid Chest'],
    secondaryMuscles: ['Front Delts', 'Serratus Anterior'],
  },
  { name: 'Dumbbell Fly', category: 'Chest', primaryMuscles: ['Mid Chest'], secondaryMuscles: ['Front Delts'] },
  { name: 'Pec Deck', category: 'Chest', primaryMuscles: ['Mid Chest'], secondaryMuscles: ['Front Delts'] },
  {
    name: 'Cable Chest Press',
    category: 'Chest',
    primaryMuscles: ['Mid Chest', 'Lower Chest'],
    secondaryMuscles: ['Front Delts', 'Triceps Long Head', 'Serratus Anterior'],
  },
  {
    name: 'Push-Up',
    category: 'Chest',
    primaryMuscles: ['Mid Chest', 'Lower Chest'],
    secondaryMuscles: ['Front Delts', 'Triceps Long Head', 'Serratus Anterior'],
  },
  {
    name: 'Dip (Chest)',
    category: 'Chest',
    primaryMuscles: ['Lower Chest', 'Mid Chest'],
    secondaryMuscles: ['Front Delts', 'Triceps Long Head', 'Triceps Lateral Head'],
  },
  {
    name: 'Cable Crossover',
    category: 'Chest',
    primaryMuscles: ['Mid Chest', 'Lower Chest'],
    secondaryMuscles: ['Front Delts'],
  },
  {
    name: 'Dumbbell Pullover',
    category: 'Chest',
    primaryMuscles: ['Mid Chest', 'Serratus Anterior'],
    secondaryMuscles: ['Upper Lats', 'Triceps Long Head'],
  },

  // ─── Back ───
  {
    name: 'Deadlift (Barbell)',
    category: 'Back',
    primaryMuscles: ['Erector Spinae', 'Gluteus Maximus'],
    secondaryMuscles: ['Upper Traps', 'Rhomboids', 'Upper Lats', 'Lower Lats', 'Biceps Femoris'],
  },
  {
    name: 'Deadlift (Sumo)',
    category: 'Back',
    primaryMuscles: ['Gluteus Maximus', 'Adductors', 'Erector Spinae'],
    secondaryMuscles: ['Upper Traps', 'Rhomboids', 'Rectus Femoris'],
  },
  {
    name: 'Barbell Row',
    category: 'Back',
    primaryMuscles: ['Upper Lats', 'Lower Lats', 'Rhomboids'],
    secondaryMuscles: ['Rear Delts', 'Biceps Long Head', 'Biceps Short Head'],
  },
  {
    name: 'Dumbbell Row',
    category: 'Back',
    primaryMuscles: ['Upper Lats', 'Lower Lats'],
    secondaryMuscles: ['Rear Delts', 'Rhomboids', 'Biceps Long Head'],
  },
  {
    name: 'Cable Row (Seated)',
    category: 'Back',
    primaryMuscles: ['Upper Lats', 'Lower Lats', 'Rhomboids'],
    secondaryMuscles: ['Rear Delts', 'Biceps Long Head'],
  },
  {
    name: 'Lat Pulldown',
    category: 'Back',
    primaryMuscles: ['Upper Lats', 'Lower Lats'],
    secondaryMuscles: ['Biceps Long Head', 'Biceps Short Head', 'Teres Major'],
  },
  {
    name: 'Lat Pulldown (Close-Grip)',
    category: 'Back',
    primaryMuscles: ['Lower Lats', 'Upper Lats'],
    secondaryMuscles: ['Biceps Long Head', 'Biceps Short Head', 'Rhomboids'],
  },
  {
    name: 'Pull-Up',
    category: 'Back',
    primaryMuscles: ['Upper Lats', 'Lower Lats'],
    secondaryMuscles: ['Biceps Long Head', 'Biceps Short Head', 'Teres Major'],
  },
  {
    name: 'Chin-Up',
    category: 'Back',
    primaryMuscles: ['Upper Lats', 'Lower Lats', 'Biceps Long Head'],
    secondaryMuscles: ['Biceps Short Head', 'Teres Major'],
  },
  {
    name: 'T-Bar Row',
    category: 'Back',
    primaryMuscles: ['Upper Lats', 'Lower Lats', 'Rhomboids'],
    secondaryMuscles: ['Rear Delts', 'Biceps Long Head'],
  },
  {
    name: 'Face Pull',
    category: 'Back',
    primaryMuscles: ['Rear Delts'],
    secondaryMuscles: ['Infraspinatus', 'Rhomboids', 'Mid Traps'],
  },
  { name: 'Shrug (Barbell)', category: 'Back', primaryMuscles: ['Upper Traps'], secondaryMuscles: ['Mid Traps'] },
  {
    name: 'Inverted Row',
    category: 'Back',
    primaryMuscles: ['Upper Lats', 'Lower Lats', 'Rhomboids'],
    secondaryMuscles: ['Rear Delts', 'Biceps Long Head'],
  },

  // ─── Shoulders ───
  {
    name: 'Overhead Press (Barbell)',
    category: 'Shoulders',
    primaryMuscles: ['Front Delts', 'Side Delts'],
    secondaryMuscles: ['Upper Traps', 'Triceps Long Head', 'Triceps Lateral Head'],
  },
  {
    name: 'Dumbbell Shoulder Press',
    category: 'Shoulders',
    primaryMuscles: ['Front Delts', 'Side Delts'],
    secondaryMuscles: ['Upper Traps', 'Triceps Long Head'],
  },
  {
    name: 'Arnold Press',
    category: 'Shoulders',
    primaryMuscles: ['Front Delts', 'Side Delts'],
    secondaryMuscles: ['Upper Traps', 'Triceps Long Head'],
  },
  {
    name: 'Lateral Raise (Dumbbell)',
    category: 'Shoulders',
    primaryMuscles: ['Side Delts'],
    secondaryMuscles: ['Front Delts', 'Upper Traps'],
  },
  {
    name: 'Lateral Raise (Cable)',
    category: 'Shoulders',
    primaryMuscles: ['Side Delts'],
    secondaryMuscles: ['Front Delts'],
  },
  { name: 'Front Raise', category: 'Shoulders', primaryMuscles: ['Front Delts'], secondaryMuscles: ['Side Delts'] },
  {
    name: 'Rear Delt Fly (Dumbbell)',
    category: 'Shoulders',
    primaryMuscles: ['Rear Delts'],
    secondaryMuscles: ['Rhomboids', 'Mid Traps'],
  },
  {
    name: 'Rear Delt Fly (Cable)',
    category: 'Shoulders',
    primaryMuscles: ['Rear Delts'],
    secondaryMuscles: ['Rhomboids', 'Mid Traps'],
  },
  {
    name: 'Upright Row',
    category: 'Shoulders',
    primaryMuscles: ['Side Delts', 'Upper Traps'],
    secondaryMuscles: ['Front Delts', 'Biceps Long Head'],
  },

  // ─── Biceps ───
  {
    name: 'Barbell Curl',
    category: 'Biceps',
    primaryMuscles: ['Biceps Long Head', 'Biceps Short Head'],
    secondaryMuscles: ['Brachialis', 'Brachioradialis'],
  },
  {
    name: 'EZ-Bar Curl',
    category: 'Biceps',
    primaryMuscles: ['Biceps Long Head', 'Biceps Short Head'],
    secondaryMuscles: ['Brachialis'],
  },
  {
    name: 'Dumbbell Curl',
    category: 'Biceps',
    primaryMuscles: ['Biceps Long Head', 'Biceps Short Head'],
    secondaryMuscles: ['Brachialis'],
  },
  {
    name: 'Hammer Curl',
    category: 'Biceps',
    primaryMuscles: ['Brachialis', 'Brachioradialis'],
    secondaryMuscles: ['Biceps Long Head'],
  },
  {
    name: 'Incline Dumbbell Curl',
    category: 'Biceps',
    primaryMuscles: ['Biceps Long Head'],
    secondaryMuscles: ['Biceps Short Head', 'Brachialis'],
  },
  {
    name: 'Preacher Curl',
    category: 'Biceps',
    primaryMuscles: ['Biceps Short Head'],
    secondaryMuscles: ['Biceps Long Head', 'Brachialis'],
  },
  {
    name: 'Cable Curl',
    category: 'Biceps',
    primaryMuscles: ['Biceps Long Head', 'Biceps Short Head'],
    secondaryMuscles: ['Brachialis'],
  },
  {
    name: 'Concentration Curl',
    category: 'Biceps',
    primaryMuscles: ['Biceps Short Head'],
    secondaryMuscles: ['Biceps Long Head', 'Brachialis'],
  },

  // ─── Triceps ───
  {
    name: 'Skull Crusher',
    category: 'Triceps',
    primaryMuscles: ['Triceps Long Head', 'Triceps Lateral Head'],
    secondaryMuscles: ['Triceps Medial Head'],
  },
  {
    name: 'Overhead Tricep Extension',
    category: 'Triceps',
    primaryMuscles: ['Triceps Long Head'],
    secondaryMuscles: ['Triceps Lateral Head', 'Triceps Medial Head'],
  },
  {
    name: 'Tricep Pushdown (Cable)',
    category: 'Triceps',
    primaryMuscles: ['Triceps Lateral Head', 'Triceps Medial Head'],
    secondaryMuscles: ['Triceps Long Head'],
  },
  {
    name: 'Close-Grip Bench Press',
    category: 'Triceps',
    primaryMuscles: ['Triceps Long Head', 'Triceps Lateral Head', 'Mid Chest'],
    secondaryMuscles: ['Front Delts'],
  },
  {
    name: 'Dip (Tricep)',
    category: 'Triceps',
    primaryMuscles: ['Triceps Long Head', 'Triceps Lateral Head'],
    secondaryMuscles: ['Mid Chest', 'Front Delts'],
  },
  {
    name: 'Tricep Kickback',
    category: 'Triceps',
    primaryMuscles: ['Triceps Lateral Head'],
    secondaryMuscles: ['Triceps Long Head'],
  },

  // ─── Forearms ───
  { name: 'Wrist Curl', category: 'Forearms', primaryMuscles: ['Wrist Flexors'], secondaryMuscles: [] },
  { name: 'Reverse Wrist Curl', category: 'Forearms', primaryMuscles: ['Wrist Extensors'], secondaryMuscles: [] },

  // ─── Quads ───
  {
    name: 'Squat (Barbell)',
    category: 'Legs - Quads',
    primaryMuscles: ['Rectus Femoris', 'Vastus Lateralis', 'Vastus Medialis'],
    secondaryMuscles: ['Gluteus Maximus', 'Erector Spinae'],
  },
  {
    name: 'Hack Squat',
    category: 'Legs - Quads',
    primaryMuscles: ['Rectus Femoris', 'Vastus Lateralis', 'Vastus Medialis'],
    secondaryMuscles: ['Gluteus Maximus'],
  },
  {
    name: 'Goblet Squat',
    category: 'Legs - Quads',
    primaryMuscles: ['Rectus Femoris', 'Vastus Lateralis', 'Vastus Medialis'],
    secondaryMuscles: ['Gluteus Maximus'],
  },
  {
    name: 'Leg Press',
    category: 'Legs - Quads',
    primaryMuscles: ['Rectus Femoris', 'Vastus Lateralis', 'Vastus Medialis'],
    secondaryMuscles: ['Gluteus Maximus'],
  },
  {
    name: 'Leg Extension',
    category: 'Legs - Quads',
    primaryMuscles: ['Rectus Femoris', 'Vastus Lateralis', 'Vastus Medialis', 'Vastus Intermedius'],
    secondaryMuscles: [],
  },
  {
    name: 'Walking Lunge',
    category: 'Legs - Quads',
    primaryMuscles: ['Rectus Femoris', 'Vastus Lateralis', 'Gluteus Maximus'],
    secondaryMuscles: ['Vastus Medialis', 'Biceps Femoris'],
  },
  {
    name: 'Reverse Lunge',
    category: 'Legs - Quads',
    primaryMuscles: ['Rectus Femoris', 'Gluteus Maximus'],
    secondaryMuscles: ['Vastus Lateralis', 'Vastus Medialis'],
  },
  {
    name: 'Bulgarian Split Squat',
    category: 'Legs - Quads',
    primaryMuscles: ['Rectus Femoris', 'Vastus Lateralis', 'Gluteus Maximus'],
    secondaryMuscles: ['Vastus Medialis', 'Gluteus Medius'],
  },
  {
    name: 'Step-Up',
    category: 'Legs - Quads',
    primaryMuscles: ['Rectus Femoris', 'Gluteus Maximus'],
    secondaryMuscles: ['Vastus Lateralis', 'Vastus Medialis'],
  },

  // ─── Hamstrings / Glutes ───
  {
    name: 'Romanian Deadlift',
    category: 'Legs - Hamstrings',
    primaryMuscles: ['Biceps Femoris', 'Semitendinosus', 'Gluteus Maximus'],
    secondaryMuscles: ['Erector Spinae'],
  },
  {
    name: 'Leg Curl (Lying)',
    category: 'Legs - Hamstrings',
    primaryMuscles: ['Biceps Femoris', 'Semitendinosus', 'Semimembranosus'],
    secondaryMuscles: ['Gastrocnemius'],
  },
  {
    name: 'Leg Curl (Seated)',
    category: 'Legs - Hamstrings',
    primaryMuscles: ['Biceps Femoris', 'Semitendinosus', 'Semimembranosus'],
    secondaryMuscles: [],
  },
  {
    name: 'Hip Thrust (Barbell)',
    category: 'Legs - Glutes',
    primaryMuscles: ['Gluteus Maximus'],
    secondaryMuscles: ['Biceps Femoris', 'Gluteus Medius'],
  },
  {
    name: 'Glute Bridge',
    category: 'Legs - Glutes',
    primaryMuscles: ['Gluteus Maximus'],
    secondaryMuscles: ['Biceps Femoris'],
  },
  {
    name: 'Good Morning',
    category: 'Legs - Hamstrings',
    primaryMuscles: ['Erector Spinae', 'Biceps Femoris'],
    secondaryMuscles: ['Gluteus Maximus'],
  },
  {
    name: 'Nordic Curl',
    category: 'Legs - Hamstrings',
    primaryMuscles: ['Biceps Femoris', 'Semitendinosus'],
    secondaryMuscles: ['Semimembranosus', 'Gastrocnemius'],
  },
  {
    name: 'Cable Kickback',
    category: 'Legs - Glutes',
    primaryMuscles: ['Gluteus Maximus'],
    secondaryMuscles: ['Biceps Femoris'],
  },

  // ─── Calves ───
  { name: 'Standing Calf Raise', category: 'Calves', primaryMuscles: ['Gastrocnemius'], secondaryMuscles: ['Soleus'] },
  { name: 'Seated Calf Raise', category: 'Calves', primaryMuscles: ['Soleus'], secondaryMuscles: ['Gastrocnemius'] },
  { name: 'Donkey Calf Raise', category: 'Calves', primaryMuscles: ['Gastrocnemius'], secondaryMuscles: ['Soleus'] },
  {
    name: 'Leg Press Calf Raise',
    category: 'Calves',
    primaryMuscles: ['Gastrocnemius', 'Soleus'],
    secondaryMuscles: [],
  },

  // ─── Core ───
  {
    name: 'Plank',
    category: 'Core',
    primaryMuscles: ['Upper Abs', 'Lower Abs', 'Transverse Abdominis'],
    secondaryMuscles: ['External Obliques'],
  },
  { name: 'Crunch', category: 'Core', primaryMuscles: ['Upper Abs'], secondaryMuscles: ['Lower Abs'] },
  {
    name: 'Hanging Leg Raise',
    category: 'Core',
    primaryMuscles: ['Lower Abs', 'Hip Flexors'],
    secondaryMuscles: ['Upper Abs', 'External Obliques'],
  },
  {
    name: 'Hanging Knee Raise',
    category: 'Core',
    primaryMuscles: ['Lower Abs', 'Hip Flexors'],
    secondaryMuscles: ['Upper Abs'],
  },
  {
    name: 'Cable Crunch',
    category: 'Core',
    primaryMuscles: ['Upper Abs', 'Lower Abs'],
    secondaryMuscles: ['External Obliques'],
  },
  {
    name: 'Ab Wheel Rollout',
    category: 'Core',
    primaryMuscles: ['Upper Abs', 'Lower Abs'],
    secondaryMuscles: ['External Obliques', 'Erector Spinae'],
  },
  {
    name: 'Russian Twist',
    category: 'Core',
    primaryMuscles: ['External Obliques', 'Internal Obliques'],
    secondaryMuscles: ['Upper Abs'],
  },
  {
    name: 'Side Plank',
    category: 'Core',
    primaryMuscles: ['External Obliques', 'Internal Obliques'],
    secondaryMuscles: ['Transverse Abdominis'],
  },
  {
    name: 'Dead Bug',
    category: 'Core',
    primaryMuscles: ['Transverse Abdominis', 'Lower Abs'],
    secondaryMuscles: ['Hip Flexors'],
  },
  {
    name: 'L-Sit',
    category: 'Core',
    primaryMuscles: ['Hip Flexors', 'Lower Abs'],
    secondaryMuscles: ['Upper Abs', 'Rectus Femoris'],
  },

  // ─── Calisthenics ───
  {
    name: 'Diamond Push-Up',
    category: 'Calisthenics',
    primaryMuscles: ['Triceps Long Head', 'Triceps Lateral Head', 'Mid Chest'],
    secondaryMuscles: ['Front Delts'],
  },
  {
    name: 'Pike Push-Up',
    category: 'Calisthenics',
    primaryMuscles: ['Front Delts', 'Side Delts'],
    secondaryMuscles: ['Triceps Long Head', 'Upper Traps'],
  },
  {
    name: 'Pseudo Planche Push-Up',
    category: 'Calisthenics',
    primaryMuscles: ['Front Delts', 'Mid Chest'],
    secondaryMuscles: ['Triceps Long Head', 'Serratus Anterior'],
  },
  {
    name: 'Commando Pull-Up',
    category: 'Calisthenics',
    primaryMuscles: ['Upper Lats', 'Lower Lats'],
    secondaryMuscles: ['Biceps Long Head', 'External Obliques'],
  },
  {
    name: 'Pistol Squat',
    category: 'Calisthenics',
    primaryMuscles: ['Rectus Femoris', 'Vastus Lateralis', 'Gluteus Maximus'],
    secondaryMuscles: ['Vastus Medialis', 'Gluteus Medius'],
  },
  {
    name: 'Jump Squat',
    category: 'Calisthenics',
    primaryMuscles: ['Rectus Femoris', 'Vastus Lateralis', 'Gluteus Maximus'],
    secondaryMuscles: ['Gastrocnemius', 'Soleus'],
  },

  // ─── Strongman / Functional ───
  {
    name: "Farmer's Carry",
    category: 'Functional',
    primaryMuscles: ['Upper Traps', 'Wrist Flexors'],
    secondaryMuscles: ['Erector Spinae', 'External Obliques'],
  },
  {
    name: 'Sled Push',
    category: 'Functional',
    primaryMuscles: ['Rectus Femoris', 'Vastus Lateralis', 'Gluteus Maximus'],
    secondaryMuscles: ['Gastrocnemius'],
  },
  {
    name: 'Tire Flip',
    category: 'Functional',
    primaryMuscles: ['Gluteus Maximus', 'Erector Spinae', 'Rectus Femoris'],
    secondaryMuscles: ['Upper Traps', 'Biceps Long Head'],
  },
  {
    name: 'Log Press',
    category: 'Functional',
    primaryMuscles: ['Front Delts', 'Side Delts'],
    secondaryMuscles: ['Triceps Long Head', 'Triceps Lateral Head', 'Upper Traps'],
  },
  {
    name: 'Floor Press',
    category: 'Functional',
    primaryMuscles: ['Mid Chest', 'Triceps Long Head'],
    secondaryMuscles: ['Front Delts', 'Triceps Lateral Head'],
  },
  {
    name: 'Yoke Carry',
    category: 'Functional',
    primaryMuscles: ['Upper Traps', 'Erector Spinae'],
    secondaryMuscles: ['Rectus Femoris', 'Gluteus Maximus', 'External Obliques'],
  },

  // ─── Cardio / Conditioning ───
  {
    name: 'Treadmill Run',
    category: 'Cardio',
    primaryMuscles: ['Cardio'],
    secondaryMuscles: ['Gastrocnemius', 'Soleus'],
  },
  {
    name: 'Rowing Machine',
    category: 'Cardio',
    primaryMuscles: ['Cardio'],
    secondaryMuscles: ['Upper Lats', 'Lower Lats', 'Biceps Long Head'],
  },
  {
    name: 'Assault Bike',
    category: 'Cardio',
    primaryMuscles: ['Cardio'],
    secondaryMuscles: ['Rectus Femoris', 'Vastus Lateralis'],
  },
  {
    name: 'Stair Climber',
    category: 'Cardio',
    primaryMuscles: ['Cardio'],
    secondaryMuscles: ['Gluteus Maximus', 'Rectus Femoris'],
  },
  { name: 'Jump Rope', category: 'Cardio', primaryMuscles: ['Cardio'], secondaryMuscles: ['Gastrocnemius', 'Soleus'] },
  {
    name: 'Battle Ropes',
    category: 'Cardio',
    primaryMuscles: ['Cardio'],
    secondaryMuscles: ['Front Delts', 'Side Delts', 'Upper Abs'],
  },
  {
    name: 'Shoulder Position Lat Pulldown',
    category: 'Back',
    primaryMuscles: ['Upper Lats'],
    secondaryMuscles: ['Side Delts', 'Rear Delts'],
  },
  {
    name: 'Incline Dumbbell Bicep Curl',
    category: 'Arms',
    primaryMuscles: ['Biceps Long Head'],
    secondaryMuscles: ['Biceps Short Head'],
  },
]

export const WIKI_EXERCISE_CATEGORIES = [...new Set(WIKI_EXERCISES.map((e) => e.category))]
