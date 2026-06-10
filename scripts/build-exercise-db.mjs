#!/usr/bin/env node
// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
//
// Vendor the free-exercise-db dataset (https://github.com/yuhonas/free-exercise-db)
// into the repo. Run manually whenever the upstream JSON changes:
//
//   node scripts/build-exercise-db.mjs
//
// Outputs:
//   src/data/freeExerciseDb/exercises.json  — stripped + muscle-mapped catalog
//   src/data/freeExerciseDb/bundledFolders.ts — set of folders shipped offline
//   public/exercise-images/<folder>/0.jpg + 1.jpg — starter pack
//
// No npm deps. Requires Node ≥ 20 (for fetch).

import { writeFile, mkdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(__dirname, '..')

const UPSTREAM_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main'
const UPSTREAM_JSON = `${UPSTREAM_BASE}/dist/exercises.json`
const UPSTREAM_IMG = `${UPSTREAM_BASE}/exercises`

const OUT_JSON = path.join(REPO, 'src/data/freeExerciseDb/exercises.json')
const OUT_BUNDLED_TS = path.join(REPO, 'src/data/freeExerciseDb/bundledFolders.ts')
const OUT_IMG_DIR = path.join(REPO, 'public/exercise-images')

const FE_MUSCLE_MAP = {
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

const mapMuscle = (m) => FE_MUSCLE_MAP[String(m).toLowerCase()] ?? []
const dedupe = (arr) => [...new Set(arr)]

async function readJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

async function readAliasMap() {
  // Read nameAlias.ts as text and pull the lowercase-name → folder pairs.
  const aliasPath = path.join(REPO, 'src/data/freeExerciseDb/nameAlias.ts')
  const text = await import('node:fs/promises').then((fs) => fs.readFile(aliasPath, 'utf8'))
  const folders = new Set()
  for (const m of text.matchAll(/['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g)) {
    folders.add(m[2])
  }
  return folders
}

async function downloadImage(folder, idx) {
  const remote = `${UPSTREAM_IMG}/${folder}/${idx}.jpg`
  const res = await fetch(remote)
  if (!res.ok) return false
  const dir = path.join(OUT_IMG_DIR, folder)
  await mkdir(dir, { recursive: true })
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(path.join(dir, `${idx}.jpg`), buf)
  return true
}

function toLibraryExercise(raw) {
  // Upstream `id` is a kebab/underscore slug-ish string; the image folder name
  // is conventionally PascalCase_With_Underscores. Use the first image path's
  // first segment as the canonical folder + a sluggified id from the name.
  const imageFolder = raw.images && raw.images[0] ? String(raw.images[0]).split('/')[0] : null
  if (!imageFolder) return null
  return {
    id: imageFolder,
    name: raw.name,
    category: raw.category ?? '',
    primaryMuscles: dedupe((raw.primaryMuscles ?? []).flatMap(mapMuscle)),
    secondaryMuscles: dedupe((raw.secondaryMuscles ?? []).flatMap(mapMuscle)),
    instructions: raw.instructions ?? [],
    equipment: raw.equipment ?? null,
    level: raw.level ?? 'intermediate',
    force: raw.force ?? null,
    mechanic: raw.mechanic ?? null,
    imageFolder,
    imageCount: (raw.images ?? []).length,
  }
}

async function main() {
  console.log('→ fetching upstream dataset…')
  const raw = await readJson(UPSTREAM_JSON)
  console.log(`  got ${raw.length} entries`)

  const aliasFolders = await readAliasMap()
  console.log(`  alias map references ${aliasFolders.size} folders`)

  const stripped = raw.map(toLibraryExercise).filter(Boolean)
  console.log(`  ${stripped.length} entries after stripping`)

  await mkdir(path.dirname(OUT_JSON), { recursive: true })
  await writeFile(OUT_JSON, JSON.stringify(stripped))
  console.log(`✓ wrote ${OUT_JSON}`)

  // Starter pack: every folder referenced by alias map (plan-relevant exercises).
  // Fall back to picking 100 most-cited compounds if alias map is empty.
  const validFolders = new Set(stripped.map((e) => e.imageFolder))
  const starter = [...aliasFolders].filter((f) => validFolders.has(f))
  console.log(`  starter pack: ${starter.length} folders`)

  if (existsSync(OUT_IMG_DIR)) await rm(OUT_IMG_DIR, { recursive: true, force: true })
  await mkdir(OUT_IMG_DIR, { recursive: true })

  let downloaded = 0
  for (const folder of starter) {
    const ok0 = await downloadImage(folder, 0)
    const ok1 = await downloadImage(folder, 1)
    if (ok0 || ok1) downloaded++
  }
  console.log(`✓ downloaded ${downloaded} starter folders → public/exercise-images/`)

  const tsContent = `// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
// AUTO-GENERATED by scripts/build-exercise-db.mjs. Do not edit by hand.
export const BUNDLED_FOLDERS: ReadonlySet<string> = new Set([
${starter.map((f) => `  ${JSON.stringify(f)},`).join('\n')}
])
`
  await writeFile(OUT_BUNDLED_TS, tsContent)
  console.log(`✓ wrote ${OUT_BUNDLED_TS}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
