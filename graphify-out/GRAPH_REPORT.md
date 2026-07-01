# Graph Report - JGym  (2026-07-01)

## Corpus Check
- 137 files · ~308,159 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 408 nodes · 363 edges · 26 communities detected
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

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
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]

## God Nodes (most connected - your core abstractions)
1. `MediaBridgePlugin` - 19 edges
2. `MediaBrowserBridge` - 17 edges
3. `MediaNotificationListener` - 7 edges
4. `App()` - 6 edges
5. `getDateStr()` - 6 edges
6. `drawSummaryCard()` - 5 edges
7. `exportJsonFile()` - 4 edges
8. `getDaysAgo()` - 4 edges
9. `verifyCode()` - 4 edges
10. `ErrorBoundary` - 4 edges

## Surprising Connections (you probably didn't know these)
- `useUpdateCheck()` --calls--> `App()`  [INFERRED]
  src/hooks/useUpdateCheck.ts → src/App.tsx
- `App()` --calls--> `useTheme()`  [INFERRED]
  src/App.tsx → src/hooks/useTheme.ts
- `App()` --calls--> `useStorage()`  [INFERRED]
  src/App.tsx → src/hooks/useStorage.ts
- `App()` --calls--> `useSharedImport()`  [INFERRED]
  src/App.tsx → src/hooks/useSharedImport.ts
- `App()` --calls--> `useBackButton()`  [INFERRED]
  src/App.tsx → src/hooks/useBackButton.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (12): App(), ExerciseList(), Modal(), UpdateBanner(), useBackButton(), useBackHandler(), useSharedImport(), useStorage() (+4 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (9): blobToBase64(), exportImageFile(), exportJsonFile(), getLibraryIdForName(), resolveLibraryId(), handleExport(), handleExportExercises(), handleExportSavedPlan() (+1 more)

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (3): ImportBridgePlugin, MediaBridgePlugin, Plugin

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (12): ActivityEntryForm(), addWater(), handleCustomWater(), nextDay(), prevDay(), estimateTDEE(), getAverageDailyIntake(), getDateStr() (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (1): MediaBrowserBridge

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (2): isValidRepString(), handleSaveSetConfig()

### Community 6 - "Community 6"
Cohesion: 0.18
Nodes (4): getProgressionTip(), getRepRange(), loadRepRanges(), getRepTip()

### Community 7 - "Community 7"
Cohesion: 0.24
Nodes (6): formatDate(), formatTimer(), drawSummaryCard(), getAccentColor(), totalVolume(), WorkoutSummaryModal()

### Community 8 - "Community 8"
Cohesion: 0.36
Nodes (5): activateCode(), fetchCodeHashes(), prefetchHashes(), sha256(), verifyCode()

### Community 9 - "Community 9"
Cohesion: 0.39
Nodes (5): getMusclePathFill(), _getMusclePathStrokeWidth(), isPrimary(), isSecondary(), isSelected()

### Community 10 - "Community 10"
Cohesion: 0.22
Nodes (3): TrainContainer(), useMediaSession(), useActiveSession()

### Community 11 - "Community 11"
Cohesion: 0.36
Nodes (5): handleBarcodeScan(), handlePortionChange(), lookupBarcode(), parseServingSize(), scaleMacros()

### Community 12 - "Community 12"
Cohesion: 0.32
Nodes (5): ExerciseEntryComponent(), calculatePR(), getExerciseFrequency(), getLastSession(), sortExercisesByFrequency()

### Community 13 - "Community 13"
Cohesion: 0.32
Nodes (2): MediaNotificationListener, NotificationListenerService

### Community 14 - "Community 14"
Cohesion: 0.39
Nodes (6): dedupe(), downloadImage(), main(), readAliasMap(), readJson(), toLibraryExercise()

### Community 15 - "Community 15"
Cohesion: 0.29
Nodes (2): handleAddImages(), resizeImageFile()

### Community 16 - "Community 16"
Cohesion: 0.33
Nodes (2): localImageUrl(), useExerciseImage()

### Community 17 - "Community 17"
Cohesion: 0.47
Nodes (2): BridgeActivity, MainActivity

### Community 18 - "Community 18"
Cohesion: 0.8
Nodes (4): clusterKey(), detectPattern(), dismissPattern(), getDismissed()

### Community 19 - "Community 19"
Cohesion: 0.4
Nodes (1): ErrorBoundary

### Community 21 - "Community 21"
Cohesion: 0.4
Nodes (2): Dashboard(), useStreak()

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (2): mergeBackup(), readArray()

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (2): findLibraryEntry(), loadLibrary()

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (2): getPlugin(), useMediaBrowser()

### Community 39 - "Community 39"
Cohesion: 0.67
Nodes (1): ExampleInstrumentedTest

### Community 40 - "Community 40"
Cohesion: 0.67
Nodes (1): ExampleUnitTest

## Knowledge Gaps
- **Thin community `Community 4`** (18 nodes): `MediaBrowserBridge.java`, `MediaBrowserBridge`, `.addToQueue()`, `.browse()`, `.connect()`, `.disconnect()`, `.discoverBrowserService()`, `.getFullMetadata()`, `.getQueue()`, `.isAvailable()`, `.isConnected()`, `.MediaBrowserBridge()`, `.moveQueueItem()`, `.playFromMediaId()`, `.removeQueueItem()`, `.seekTo()`, `.setRepeatMode()`, `.setShuffleMode()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (16 nodes): `isValidRepString()`, `getExercise()`, `getPickerExercises()`, `handleAddDay()`, `handleAddExercise()`, `handleMoveExercise()`, `handleOpenDayEdit()`, `handleRegenerate()`, `handleRemoveDay()`, `handleRemoveExercise()`, `handleSaveDayEdit()`, `handleSaveName()`, `handleSaveSetConfig()`, `handleSwapExercise()`, `openSetsEditor()`, `saved-plan-detail.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (8 nodes): `MediaNotificationListener.java`, `MediaNotificationListener`, `.findAndAttach()`, `.onListenerConnected()`, `.onListenerDisconnected()`, `.onNotificationPosted()`, `.onNotificationRemoved()`, `NotificationListenerService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (7 nodes): `handleAddImages()`, `handleRemoveImage()`, `handleSave()`, `handleToggle()`, `resizeImageFile()`, `exercise-form.tsx`, `imageResize.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (6 nodes): `isBundled()`, `localImageUrl()`, `remoteImageUrl()`, `useExerciseImage.ts`, `exerciseImages.ts`, `useExerciseImage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (6 nodes): `MainActivity.java`, `BridgeActivity`, `.captureIntent()`, `MainActivity`, `.onCreate()`, `.onNewIntent()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (5 nodes): `ErrorBoundary`, `.componentDidCatch()`, `.getDerivedStateFromError()`, `.render()`, `error-boundary.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (5 nodes): `Dashboard()`, `usePR.ts`, `dashboard.container.tsx`, `usePR()`, `useStreak()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (3 nodes): `mergeBackup()`, `readArray()`, `backup.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (3 nodes): `findLibraryEntry()`, `loadLibrary()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (3 nodes): `useMediaBrowser.ts`, `getPlugin()`, `useMediaBrowser()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (3 nodes): `ExampleInstrumentedTest.java`, `ExampleInstrumentedTest`, `.useAppContext()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (3 nodes): `ExampleUnitTest.java`, `ExampleUnitTest`, `.addition_isCorrect()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ImportBridgePlugin` connect `Community 2` to `Community 17`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `useUpdateCheck()` and `useTheme()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `getDateStr()` (e.g. with `ActivityEntryForm()` and `prevDay()`) actually correct?**
  _`getDateStr()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._