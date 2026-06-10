# Graph Report - JGym  (2026-06-10)

## Corpus Check
- 114 files · ~300,714 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 353 nodes · 317 edges · 23 communities detected
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
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
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]

## God Nodes (most connected - your core abstractions)
1. `MediaBridgePlugin` - 19 edges
2. `MediaBrowserBridge` - 17 edges
3. `MediaNotificationListener` - 7 edges
4. `getDateStr()` - 6 edges
5. `drawSummaryCard()` - 5 edges
6. `exportJsonFile()` - 4 edges
7. `getDaysAgo()` - 4 edges
8. `verifyCode()` - 4 edges
9. `isPrimary()` - 4 edges
10. `isSecondary()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `formatTimer()` --calls--> `drawSummaryCard()`  [INFERRED]
  src/utils/format.ts → src/pages/train/components/workout-summary-modal/workout-summary-modal.tsx
- `getDateStr()` --calls--> `ActivityEntryForm()`  [INFERRED]
  src/utils/nutrition.ts → src/pages/nutrition/components/activity-entry-form/activity-entry-form.tsx
- `getDateStr()` --calls--> `prevDay()`  [INFERRED]
  src/utils/nutrition.ts → src/pages/nutrition/components/daily-log/daily-log.tsx
- `getDateStr()` --calls--> `nextDay()`  [INFERRED]
  src/utils/nutrition.ts → src/pages/nutrition/components/daily-log/daily-log.tsx
- `exportJsonFile()` --calls--> `handleExport()`  [INFERRED]
  src/utils/fileExport.ts → src/components/settings-modal/settings-modal.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.17
Nodes (2): MediaBridgePlugin, Plugin

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (6): exportJsonFile(), getLibraryIdForName(), handleExport(), handleExportExercises(), handleExportSavedPlan(), handleImportPlan()

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (12): ActivityEntryForm(), addWater(), handleCustomWater(), nextDay(), prevDay(), estimateTDEE(), getAverageDailyIntake(), getDateStr() (+4 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (1): MediaBrowserBridge

### Community 5 - "Community 5"
Cohesion: 0.2
Nodes (4): getProgressionTip(), getRepRange(), loadRepRanges(), getRepTip()

### Community 6 - "Community 6"
Cohesion: 0.24
Nodes (6): formatDate(), formatTimer(), drawSummaryCard(), getAccentColor(), totalVolume(), WorkoutSummaryModal()

### Community 7 - "Community 7"
Cohesion: 0.2
Nodes (4): ExerciseList(), Modal(), UpdateBanner(), useBackHandler()

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
Cohesion: 0.32
Nodes (5): ExerciseEntryComponent(), calculatePR(), getExerciseFrequency(), getLastSession(), sortExercisesByFrequency()

### Community 12 - "Community 12"
Cohesion: 0.36
Nodes (5): handleBarcodeScan(), handlePortionChange(), lookupBarcode(), parseServingSize(), scaleMacros()

### Community 13 - "Community 13"
Cohesion: 0.32
Nodes (2): MediaNotificationListener, NotificationListenerService

### Community 14 - "Community 14"
Cohesion: 0.39
Nodes (6): dedupe(), downloadImage(), main(), readAliasMap(), readJson(), toLibraryExercise()

### Community 15 - "Community 15"
Cohesion: 0.33
Nodes (2): fetchLatest(), isNewer()

### Community 16 - "Community 16"
Cohesion: 0.33
Nodes (2): localImageUrl(), useExerciseImage()

### Community 17 - "Community 17"
Cohesion: 0.8
Nodes (4): clusterKey(), detectPattern(), dismissPattern(), getDismissed()

### Community 19 - "Community 19"
Cohesion: 0.4
Nodes (2): Dashboard(), useStreak()

### Community 23 - "Community 23"
Cohesion: 0.67
Nodes (2): BridgeActivity, MainActivity

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (2): findLibraryEntry(), loadLibrary()

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (2): getPlugin(), useMediaBrowser()

### Community 36 - "Community 36"
Cohesion: 0.67
Nodes (1): ExampleInstrumentedTest

### Community 37 - "Community 37"
Cohesion: 0.67
Nodes (1): ExampleUnitTest

## Knowledge Gaps
- **Thin community `Community 0`** (20 nodes): `MediaBridgePlugin.java`, `MediaBridgePlugin`, `.addToQueue()`, `.browse()`, `.connectBrowser()`, `.getBrowserBridge()`, `.getFullMetadata()`, `.getMediaInfo()`, `.getQueue()`, `.isAppInstalled()`, `.isNotificationListenerEnabled()`, `.moveQueueItem()`, `.playFromMediaId()`, `.removeQueueItem()`, `.requestPermission()`, `.seekTo()`, `.sendCommand()`, `.setRepeatMode()`, `.setShuffleMode()`, `Plugin`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 3`** (18 nodes): `MediaBrowserBridge.java`, `MediaBrowserBridge`, `.addToQueue()`, `.browse()`, `.connect()`, `.disconnect()`, `.discoverBrowserService()`, `.getFullMetadata()`, `.getQueue()`, `.isAvailable()`, `.isConnected()`, `.MediaBrowserBridge()`, `.moveQueueItem()`, `.playFromMediaId()`, `.removeQueueItem()`, `.seekTo()`, `.setRepeatMode()`, `.setShuffleMode()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (8 nodes): `MediaNotificationListener.java`, `MediaNotificationListener`, `.findAndAttach()`, `.onListenerConnected()`, `.onListenerDisconnected()`, `.onNotificationPosted()`, `.onNotificationRemoved()`, `NotificationListenerService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (6 nodes): `useUpdateCheck.ts`, `version.ts`, `currentVersion()`, `fetchLatest()`, `useUpdateCheck()`, `isNewer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (6 nodes): `isBundled()`, `localImageUrl()`, `remoteImageUrl()`, `useExerciseImage.ts`, `exerciseImages.ts`, `useExerciseImage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (5 nodes): `Dashboard()`, `usePR.ts`, `dashboard.container.tsx`, `usePR()`, `useStreak()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (4 nodes): `MainActivity.java`, `BridgeActivity`, `MainActivity`, `.onCreate()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (3 nodes): `findLibraryEntry()`, `loadLibrary()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (3 nodes): `useMediaBrowser.ts`, `getPlugin()`, `useMediaBrowser()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (3 nodes): `ExampleInstrumentedTest.java`, `ExampleInstrumentedTest`, `.useAppContext()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (3 nodes): `ExampleUnitTest.java`, `ExampleUnitTest`, `.addition_isCorrect()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 3 inferred relationships involving `getDateStr()` (e.g. with `ActivityEntryForm()` and `prevDay()`) actually correct?**
  _`getDateStr()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `drawSummaryCard()` (e.g. with `formatDate()` and `formatTimer()`) actually correct?**
  _`drawSummaryCard()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._