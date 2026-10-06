# Graph Report - JGym  (2026-10-06)

## Corpus Check
- 189 files · ~436,926 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1003 nodes · 2073 edges · 63 communities (59 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `22c879a5`
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
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 54|Community 54]]

## God Nodes (most connected - your core abstractions)
1. `Exercise` - 56 edges
2. `Session` - 40 edges
3. `MediaBridgePlugin` - 19 edges
4. `Button()` - 18 edges
5. `SavedPlan` - 18 edges
6. `MediaBrowserBridge` - 17 edges
7. `Modal()` - 17 edges
8. `MuscleGroup` - 17 edges
9. `compilerOptions` - 17 edges
10. `PluginCall` - 16 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `useUpdateCheck()`  [INFERRED]
  src/App.tsx → src/hooks/useUpdateCheck.ts
- `ViewContent()` --calls--> `formatPR()`  [EXTRACTED]
  src/components/exercise-detail/exercise-detail.tsx → src/utils/pr.ts
- `Props` --references--> `Session`  [EXTRACTED]
  src/components/exercise-detail/progression-chart.tsx → src/types/index.ts
- `estimateTDEE()` --calls--> `get()`  [INFERRED]
  src/utils/nutrition.ts → src/components/modal/modal.test.tsx
- `getAverageDailyIntake()` --calls--> `get()`  [INFERRED]
  src/utils/nutrition.ts → src/components/modal/modal.test.tsx

## Import Cycles
- None detected.

## Communities (63 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (36): AppDataProvider(), STORAGE_KEYS, StorageKey, clearDemoKeys(), demoActive, enterDemoMode(), exitDemoMode(), isDemoMode() (+28 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (29): CheckResult, handleSaveSetConfig(), getRepTip(), Props, SET_TYPE_CLASS, SET_TYPE_CYCLE, SET_TYPE_LABEL, SetRow() (+21 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (15): Context, Intent, PluginCall, PluginMethod, Intent, Override, PluginCall, PluginMethod (+7 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (47): ActivityEntryForm(), Props, QUICK_NAMES, Button(), Props, styles, CalorieInsights(), Props (+39 more)

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (36): noAutofocus, noLabelWithoutControl, noStaticElementInteractions, noSvgWithoutTitle, useButtonType, useKeyWithClickEvents, noForEach, noUnusedImports (+28 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (3): SavedPlanDetail(), exercises, SavedPlanDay

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (18): fetchLatest(), UpdateInfo, useUpdateCheck(), AppUpdatePlugin, getPlugin(), InstallStatus, ListenerHandle, ProgressEvent (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (20): backgroundSvg, backgroundXml, BAR, BAR_STOPS, BG_STOPS, compose(), foregroundSvg, foregroundXml (+12 more)

### Community 8 - "Community 8"
Cohesion: 0.20
Nodes (12): ExerciseCard(), ExerciseEntryComponent(), entry, exercise, PRBadge(), Props, calculatePR(), formatPR() (+4 more)

### Community 9 - "Community 9"
Cohesion: 0.09
Nodes (22): Props, getMusclePathFill(), _getMusclePathStrokeWidth(), isPrimary(), isSecondary(), isSelected(), backMuscles, deepMuscles (+14 more)

### Community 10 - "Community 10"
Cohesion: 0.16
Nodes (16): buildActivity(), buildDemoSeed(), buildExercises(), buildFood(), buildPlans(), buildSessions(), buildWater(), buildWeights() (+8 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (18): 10. Contact, 1. Who We Are, 2. Data We Collect, 3. Third-Party Services, 4. Data We Do NOT Collect, 5. Your Rights, 6. Data Retention, 7. Data Security (+10 more)

### Community 12 - "Community 12"
Cohesion: 0.09
Nodes (29): BarcodeScanner(), Props, DurationEditModal(), Props, Props, handleBarcodeScan(), handlePortionChange(), FoodPhotoScan() (+21 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (11): Context, PluginCall, String, Override, ComponentName, MediaBrowserBridge, MediaNotificationListener, List (+3 more)

### Community 14 - "Community 14"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 15 - "Community 15"
Cohesion: 0.07
Nodes (21): BodyMap(), EditFormProps, Props, base, defaultProps, { mockLibraryEntry }, ViewContent(), ViewContentProps (+13 more)

### Community 16 - "Community 16"
Cohesion: 0.20
Nodes (13): Props, SessionCard(), baseSession, exercises, totalSets(), totalVolume(), Props, SessionTimer() (+5 more)

### Community 17 - "Community 17"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 18 - "Community 18"
Cohesion: 0.12
Nodes (17): dependencies, @capacitor/android, @capacitor/app, @capacitor/cli, @capacitor/core, @capacitor/filesystem, @capacitor/share, @fontsource/bebas-neue (+9 more)

### Community 19 - "Community 19"
Cohesion: 0.12
Nodes (16): devDependencies, @biomejs/biome, globals, jsdom, @testing-library/jest-dom, @testing-library/react, @testing-library/user-event, @types/node (+8 more)

### Community 20 - "Community 20"
Cohesion: 0.09
Nodes (21): GlassCard(), Props, getPlugin(), useMediaBrowser(), UseMediaBrowserResult, BreadcrumbEntry, BrowseView(), Props (+13 more)

### Community 21 - "Community 21"
Cohesion: 0.27
Nodes (5): PluginCall, PluginMethod, String, File, AppUpdatePlugin

### Community 22 - "Community 22"
Cohesion: 0.18
Nodes (11): ConfirmDialog(), Props, defaultProps, Props, ActiveSession, MediaBar(), Props, ActiveSession (+3 more)

### Community 23 - "Community 23"
Cohesion: 0.19
Nodes (12): dedupe(), __dirname, downloadImage(), FE_MUSCLE_MAP, main(), OUT_BUNDLED_TS, OUT_IMG_DIR, OUT_JSON (+4 more)

### Community 24 - "Community 24"
Cohesion: 0.27
Nodes (11): ExercisesView(), Props, SubTab, MuscleTags(), Props, Props, Exercise, ExerciseDetailState (+3 more)

### Community 25 - "Community 25"
Cohesion: 0.39
Nodes (7): useAppData(), ExerciseList(), SubTab, HistoryContainer(), NutritionContainer(), SubTab, AppRouter()

### Community 26 - "Community 26"
Cohesion: 0.17
Nodes (12): scripts, android, android:open, build, check, dev, format, lint (+4 more)

### Community 27 - "Community 27"
Cohesion: 0.33
Nodes (8): clusterKey(), detectPattern(), dismissPattern(), getDismissed(), drawSummaryCard(), getAccentColor(), totalVolume(), WorkoutSummaryModal()

### Community 28 - "Community 28"
Cohesion: 0.29
Nodes (4): Dashboard(), usePR(), useStreak(), formatFullDate()

### Community 29 - "Community 29"
Cohesion: 0.33
Nodes (6): MediaInfo, useMediaSession(), UseMediaSessionResult, Window, useActiveSession(), TrainContainer()

### Community 30 - "Community 30"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 31 - "Community 31"
Cohesion: 0.36
Nodes (3): AppDataContext, baseAppData(), renderWithAppData()

### Community 32 - "Community 32"
Cohesion: 0.25
Nodes (4): ErrorBoundary, Props, State, renderLibrary()

### Community 33 - "Community 33"
Cohesion: 0.12
Nodes (15): WIKI_EXERCISE_CATEGORIES, WIKI_EXERCISES, WIKI_PLANS, PlanDetail(), Props, expandMuscle(), migrateExercise(), MIGRATION_MAP (+7 more)

### Community 34 - "Community 34"
Cohesion: 0.25
Nodes (7): 1. Installed Plugins (marketplaces), 2. User Skills (`~/.claude/skills/`), 3. Skills To Add, 4. Built-in Claude Code Skills (no install), 5. Project Config (`.claude/settings.json`), 6. Global Config Highlights (`~/.claude/settings.json`), Claude Tooling — Plugins, Skills & Config

### Community 35 - "Community 35"
Cohesion: 0.06
Nodes (31): LibrarySection(), ExerciseLibrary(), FilterRowProps, LibraryRow(), LibraryRowProps, Props, bench, LibraryExerciseDetail() (+23 more)

### Community 36 - "Community 36"
Cohesion: 0.32
Nodes (5): FIXED_COLORS, PRConfetti(), Props, Props, PRPopup()

### Community 37 - "Community 37"
Cohesion: 0.12
Nodes (15): AnalysisChart(), buildFrequencyData(), ChartMode, DataPoint, isoWeekKey(), Props, xLabels(), CalendarGrid() (+7 more)

### Community 38 - "Community 38"
Cohesion: 0.25
Nodes (7): Development, Features, Installation, JGym, License, Privacy, Requirements

### Community 39 - "Community 39"
Cohesion: 0.47
Nodes (4): BottomNav(), Props, tabs, Tab

### Community 40 - "Community 40"
Cohesion: 0.33
Nodes (5): description, name, private, type, version

### Community 42 - "Community 42"
Cohesion: 0.33
Nodes (5): Android Dependencies, Development Dependencies, Fonts, Runtime Dependencies, Third-Party Licenses

### Community 43 - "Community 43"
Cohesion: 0.40
Nodes (4): Git Workflow, graphify, Pre-push Checks, Pull Request Rebases

### Community 44 - "Community 44"
Cohesion: 0.60
Nodes (3): fireFocusIn(), fireFocusOut(), makeFocusEvent()

### Community 47 - "Community 47"
Cohesion: 0.50
Nodes (3): buildCommand, headers, outputDirectory

### Community 54 - "Community 54"
Cohesion: 0.16
Nodes (13): ExerciseDetail(), Header(), Props, getKeyboardInset(), shouldPreserveFocus(), useKeyboardAvoidance(), isTextInput(), useKeyboardVisible() (+5 more)

## Knowledge Gaps
- **273 isolated node(s):** `Context`, `MediaBrowserBridge`, `$schema`, `enabled`, `recommended` (+268 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Exercise` connect `Community 24` to `Community 0`, `Community 1`, `Community 33`, `Community 3`, `Community 35`, `Community 37`, `Community 5`, `Community 8`, `Community 9`, `Community 10`, `Community 15`, `Community 16`, `Community 22`, `Community 25`, `Community 27`, `Community 28`, `Community 29`, `Community 31`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `STORAGE_KEYS` connect `Community 0` to `Community 1`, `Community 6`, `Community 10`, `Community 12`, `Community 54`, `Community 25`, `Community 27`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `Session` connect `Community 37` to `Community 0`, `Community 33`, `Community 3`, `Community 8`, `Community 10`, `Community 15`, `Community 16`, `Community 22`, `Community 24`, `Community 27`, `Community 28`, `Community 29`, `Community 31`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `Context`, `MediaBrowserBridge`, `$schema` to the rest of the system?**
  _273 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08665269042627533 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06753006475485661 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1214574898785425 - nodes in this community are weakly interconnected._