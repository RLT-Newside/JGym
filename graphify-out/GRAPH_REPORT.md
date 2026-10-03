# Graph Report - JGym  (2026-10-03)

## Corpus Check
- 190 files · ~437,963 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1036 nodes · 2142 edges · 62 communities (57 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 43 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ebd79db5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 105|Community 105]]
- [[_COMMUNITY_Community 107|Community 107]]
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 111|Community 111]]
- [[_COMMUNITY_Community 113|Community 113]]
- [[_COMMUNITY_Community 114|Community 114]]

## God Nodes (most connected - your core abstractions)
1. `Exercise` - 55 edges
2. `Session` - 40 edges
3. `MediaBridgePlugin` - 19 edges
4. `SavedPlan` - 18 edges
5. `MediaBrowserBridge` - 17 edges
6. `Button()` - 17 edges
7. `MuscleGroup` - 17 edges
8. `compilerOptions` - 17 edges
9. `AppUpdatePlugin` - 16 edges
10. `PluginCall` - 16 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `useUpdateCheck()`  [INFERRED]
  src/App.tsx → src/hooks/useUpdateCheck.ts
- `Props` --references--> `Session`  [EXTRACTED]
  src/components/exercise-detail/progression-chart.tsx → src/types/index.ts
- `estimateTDEE()` --calls--> `get()`  [INFERRED]
  src/utils/nutrition.ts → src/components/modal/modal.test.tsx
- `getAverageDailyIntake()` --calls--> `get()`  [INFERRED]
  src/utils/nutrition.ts → src/components/modal/modal.test.tsx
- `detectPattern()` --calls--> `get()`  [INFERRED]
  src/utils/patternDetection.ts → src/components/modal/modal.test.tsx

## Import Cycles
- None detected.

## Communities (62 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (11): Context, PluginCall, String, Override, ComponentName, MediaBrowserBridge, MediaNotificationListener, List (+3 more)

### Community 1 - "Community 1"
Cohesion: 0.16
Nodes (10): CheckResult, handleExport(), handleExportExercises(), Props, RepRangeSettings(), THEMES, exportJsonFile(), RepRangeMap (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (15): Context, Intent, PluginCall, PluginMethod, Intent, Override, PluginCall, PluginMethod (+7 more)

### Community 3 - "Community 3"
Cohesion: 0.14
Nodes (17): MUSCLE_CATEGORIES, Props, ExercisesView(), Props, SubTab, MuscleGroupFilter(), MuscleTags(), Props (+9 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (20): backgroundSvg, backgroundXml, BAR, BAR_STOPS, BG_STOPS, compose(), foregroundSvg, foregroundXml (+12 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (3): handleSaveSetConfig(), SavedPlanDay, isValidRepString()

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (11): LibrarySection(), ExerciseLibrary(), FilterRowProps, LibraryRow(), LibraryRowProps, Props, BUNDLED_FOLDERS, ImageState (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.16
Nodes (12): ConfirmDialog(), Props, defaultProps, ExercisePicker(), MediaBar(), Props, Props, SessionTimer() (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.16
Nodes (8): Props, SET_TYPE_CLASS, SET_TYPE_CYCLE, SET_TYPE_LABEL, SetRow(), baseSet, SetEntry, SetType

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (28): BodyMap(), Props, getMusclePathFill(), _getMusclePathStrokeWidth(), isPrimary(), isSecondary(), isSelected(), backMuscles (+20 more)

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (17): File, String, File, Override, PluginCall, PluginMethod, String, Test (+9 more)

### Community 11 - "Community 11"
Cohesion: 0.15
Nodes (18): ExerciseCard(), Props, ViewContent(), ExerciseEntryComponent(), Props, entry, exercise, PRBadge() (+10 more)

### Community 12 - "Community 12"
Cohesion: 0.19
Nodes (12): dedupe(), __dirname, downloadImage(), FE_MUSCLE_MAP, main(), OUT_BUNDLED_TS, OUT_IMG_DIR, OUT_JSON (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.21
Nodes (8): getLibraryIdForName(), NAME_ALIAS, get(), relinkLibraryIds(), RelinkResult, resolveLibraryId(), library, handleImportPlan()

### Community 14 - "Community 14"
Cohesion: 0.27
Nodes (9): findLibraryEntry(), loadLibrary(), expandMuscle(), LibraryExercise, migrateExercise(), MIGRATION_MAP, MUSCLE_GROUPS, WikiPlanDay (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.12
Nodes (11): EditFormProps, ExerciseDetail(), Props, base, defaultProps, { mockLibraryEntry }, ViewContentProps, ProgressionChart() (+3 more)

### Community 16 - "Community 16"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 17 - "Community 17"
Cohesion: 0.39
Nodes (7): getRepTip(), DEFAULT_REP_RANGES, getProgressionTip(), getRepRange(), loadRepRanges(), VALID_REP_KEYWORDS, validateRepRangeEntry()

### Community 18 - "Community 18"
Cohesion: 0.32
Nodes (5): FIXED_COLORS, PRConfetti(), Props, Props, PRPopup()

### Community 19 - "Community 19"
Cohesion: 0.36
Nodes (6): Props, SessionCard(), baseSession, exercises, totalSets(), totalVolume()

### Community 20 - "Community 20"
Cohesion: 0.11
Nodes (18): GlassCard(), Props, getPlugin(), useMediaBrowser(), UseMediaBrowserResult, BreadcrumbEntry, BrowseView(), Props (+10 more)

### Community 21 - "Community 21"
Cohesion: 0.05
Nodes (36): noAutofocus, noLabelWithoutControl, noStaticElementInteractions, noSvgWithoutTitle, useButtonType, useKeyWithClickEvents, noForEach, noUnusedImports (+28 more)

### Community 22 - "Community 22"
Cohesion: 0.09
Nodes (22): AppDataContext, useAppData(), Dashboard(), ExerciseList(), SubTab, HistoryContainer(), MediaInfo, useMediaSession() (+14 more)

### Community 23 - "Community 23"
Cohesion: 0.40
Nodes (3): formatTime(), NowPlaying(), Props

### Community 24 - "Community 24"
Cohesion: 0.07
Nodes (47): ActivityEntryForm(), Props, QUICK_NAMES, Button(), Props, styles, CalorieInsights(), Props (+39 more)

### Community 28 - "Community 28"
Cohesion: 0.21
Nodes (12): blobToBase64(), exportImageFile(), formatDate(), formatTimer(), clusterKey(), detectPattern(), dismissPattern(), getDismissed() (+4 more)

### Community 35 - "Community 35"
Cohesion: 0.16
Nodes (9): WIKI_EXERCISE_CATEGORIES, WIKI_EXERCISES, WIKI_PLANS, PlanDetail(), Props, ShareablePlan, WikiExerciseTemplate, WikiPlan (+1 more)

### Community 37 - "Community 37"
Cohesion: 0.08
Nodes (32): BarcodeScanner(), Props, DurationEditModal(), Props, Props, handleBarcodeScan(), handlePortionChange(), FoodPhotoScan() (+24 more)

### Community 54 - "Community 54"
Cohesion: 0.06
Nodes (37): BottomNav(), Props, tabs, STORAGE_KEYS, StorageKey, Header(), Props, getKeyboardInset() (+29 more)

### Community 56 - "Community 56"
Cohesion: 0.16
Nodes (16): buildActivity(), buildDemoSeed(), buildExercises(), buildFood(), buildPlans(), buildSessions(), buildWater(), buildWeights() (+8 more)

### Community 58 - "Community 58"
Cohesion: 0.10
Nodes (19): 10. Contact, 1. Who We Are, 2. Data We Collect, 3. Third-Party Services, 4. Data We Do NOT Collect, 5. Your Rights, 6. Data Retention, 7. Data Security (+11 more)

### Community 59 - "Community 59"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 64 - "Community 64"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 66 - "Community 66"
Cohesion: 0.12
Nodes (17): dependencies, @capacitor/android, @capacitor/app, @capacitor/cli, @capacitor/core, @capacitor/filesystem, @capacitor/share, @fontsource/bebas-neue (+9 more)

### Community 70 - "Community 70"
Cohesion: 0.12
Nodes (16): devDependencies, @biomejs/biome, globals, jsdom, @testing-library/jest-dom, @testing-library/react, @testing-library/user-event, @types/node (+8 more)

### Community 72 - "Community 72"
Cohesion: 0.08
Nodes (34): AppDataProvider(), clearDemoKeys(), demoActive, enterDemoMode(), exitDemoMode(), isDemoMode(), isDemoPremium(), session() (+26 more)

### Community 81 - "Community 81"
Cohesion: 0.13
Nodes (14): AnalysisChart(), buildFrequencyData(), ChartMode, DataPoint, isoWeekKey(), Props, xLabels(), CalendarGrid() (+6 more)

### Community 88 - "Community 88"
Cohesion: 0.17
Nodes (12): scripts, android, android:open, build, check, dev, format, lint (+4 more)

### Community 97 - "Community 97"
Cohesion: 0.25
Nodes (7): 1. Installed Plugins (marketplaces), 2. User Skills (`~/.claude/skills/`), 3. Skills To Add, 4. Built-in Claude Code Skills (no install), 5. Project Config (`.claude/settings.json`), 6. Global Config Highlights (`~/.claude/settings.json`), Claude Tooling — Plugins, Skills & Config

### Community 98 - "Community 98"
Cohesion: 0.25
Nodes (7): Development, Features, Installation, JGym, License, Privacy, Requirements

### Community 103 - "Community 103"
Cohesion: 0.33
Nodes (5): description, name, private, type, version

### Community 104 - "Community 104"
Cohesion: 0.33
Nodes (5): Android Dependencies, Development Dependencies, Fonts, Runtime Dependencies, Third-Party Licenses

### Community 105 - "Community 105"
Cohesion: 0.40
Nodes (4): Git Workflow, graphify, Pre-push Checks, Pull Request Rebases

### Community 111 - "Community 111"
Cohesion: 0.50
Nodes (3): buildCommand, headers, outputDirectory

## Knowledge Gaps
- **273 isolated node(s):** `String`, `Context`, `MediaBrowserBridge`, `$schema`, `enabled` (+268 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Exercise` connect `Community 3` to `Community 1`, `Community 35`, `Community 5`, `Community 6`, `Community 7`, `Community 72`, `Community 9`, `Community 11`, `Community 13`, `Community 14`, `Community 15`, `Community 81`, `Community 19`, `Community 22`, `Community 24`, `Community 25`, `Community 56`, `Community 28`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `Session` connect `Community 81` to `Community 3`, `Community 7`, `Community 72`, `Community 11`, `Community 14`, `Community 15`, `Community 19`, `Community 22`, `Community 24`, `Community 56`, `Community 28`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `STORAGE_KEYS` connect `Community 54` to `Community 1`, `Community 37`, `Community 72`, `Community 17`, `Community 22`, `Community 56`, `Community 28`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `String`, `Context`, `MediaBrowserBridge` to the rest of the system?**
  _273 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.11742424242424243 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1214574898785425 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.14130434782608695 - nodes in this community are weakly interconnected._