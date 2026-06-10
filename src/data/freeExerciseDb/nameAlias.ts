// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
//
// Maps WIKI_EXERCISES.name (and common WIKI_PLANS exercise names) to
// free-exercise-db slug ids. Lookup is case-insensitive — keys must be lowercase.
// Add an entry whenever a JuMa display name doesn't match its dataset slug
// (which is most of them: dataset names tend to be longer/more specific).

export const NAME_ALIAS: Record<string, string> = {
  // Chest
  'bench press (barbell)': 'Barbell_Bench_Press_-_Medium-Grip',
  'bench press (dumbbell)': 'Dumbbell_Bench_Press',
  'incline bench press (barbell)': 'Barbell_Incline_Bench_Press_-_Medium-Grip',
  'incline dumbbell press': 'Dumbbell_Incline_Bench_Press',
  'decline press': 'Barbell_Decline_Bench_Press',
  'cable fly': 'Cable_Crossover',
  'dumbbell fly': 'Dumbbell_Flyes',
  'pec deck': 'Butterfly',
  'cable chest press': 'Cable_Chest_Press',
  'push-up': 'Pushups',
  'dip (chest)': 'Dips_-_Chest_Version',
  'cable crossover': 'Cable_Crossover',
  'dumbbell pullover': 'Dumbbell_Pullover',
  // Back
  'deadlift (barbell)': 'Barbell_Deadlift',
  'deadlift (sumo)': 'Sumo_Deadlift',
  'barbell row': 'Bent_Over_Barbell_Row',
  'dumbbell row': 'Bent_Over_Dumbbell_Row',
  'cable row (seated)': 'Seated_Cable_Rows',
  'lat pulldown': 'Wide-Grip_Lat_Pulldown',
  'lat pulldown (close-grip)': 'Close-Grip_Front_Lat_Pulldown',
  'pull-up': 'Pullups',
  'chin-up': 'Chin-Up',
  't-bar row': 'T-Bar_Row_with_Handle',
  'face pull': 'Face_Pull',
  'shrug (barbell)': 'Barbell_Shrug',
  'inverted row': 'Inverted_Row',
  // Shoulders
  'overhead press (barbell)': 'Standing_Military_Press',
  'dumbbell shoulder press': 'Dumbbell_Shoulder_Press',
  'arnold press': 'Arnold_Dumbbell_Press',
  'lateral raise (dumbbell)': 'Side_Lateral_Raise',
  'lateral raise (cable)': 'Cable_Lateral_Raise',
  'front raise': 'Front_Dumbbell_Raise',
  'rear delt fly (dumbbell)': 'Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench',
  'rear delt fly (cable)': 'Reverse_Cable_Curl',
  'upright row': 'Upright_Barbell_Row',
  // Biceps
  'barbell curl': 'Barbell_Curl',
  'ez-bar curl': 'EZ-Bar_Curl',
  'dumbbell curl': 'Dumbbell_Bicep_Curl',
  'hammer curl': 'Hammer_Curls',
  'incline dumbbell curl': 'Incline_Dumbbell_Curl',
  'preacher curl': 'Preacher_Curl',
  'cable curl': 'Cable_Curl',
  'concentration curl': 'Concentration_Curls',
  // Triceps
  'skull crusher': 'EZ-Bar_Skullcrusher',
  'overhead tricep extension': 'Seated_Triceps_Press',
  'tricep pushdown (cable)': 'Triceps_Pushdown',
  'close-grip bench press': 'Close-Grip_Barbell_Bench_Press',
  'dip (tricep)': 'Dips_-_Triceps_Version',
  // Quads / Legs
  squat: 'Barbell_Squat',
  'squat (barbell)': 'Barbell_Squat',
  'front squat': 'Barbell_Front_Squat',
  'leg press': 'Leg_Press',
  'leg extension': 'Leg_Extensions',
  lunge: 'Dumbbell_Lunges',
  'bulgarian split squat': 'Bulgarian_Split_Squat',
  'goblet squat': 'Goblet_Squat',
  'hack squat': 'Hack_Squat',
  // Hamstrings
  'romanian deadlift (barbell)': 'Romanian_Deadlift',
  'leg curl (lying)': 'Lying_Leg_Curls',
  'leg curl (seated)': 'Seated_Leg_Curl',
  'good morning': 'Good_Morning',
  // Glutes
  'hip thrust (barbell)': 'Barbell_Hip_Thrust',
  'glute bridge': 'Barbell_Glute_Bridge',
  // Calves
  'standing calf raise': 'Standing_Barbell_Calf_Raise',
  'seated calf raise': 'Seated_Calf_Raise',
  // Core
  plank: 'Plank',
  crunch: 'Crunches',
  'hanging leg raise': 'Hanging_Leg_Raise',
  'cable crunch': 'Cable_Crunch',
  'ab wheel rollout': 'Ab_Roller',
  'russian twist': 'Russian_Twist',
  'side plank': 'Side_Bridge',
  // Forearms
  'wrist curl': 'Barbell_Wrist_Curl',
  'reverse wrist curl': 'Barbell_Reverse_Wrist_Curl',
}

export function getLibraryIdForName(name: string): string | null {
  return NAME_ALIAS[name.toLowerCase()] ?? null
}
