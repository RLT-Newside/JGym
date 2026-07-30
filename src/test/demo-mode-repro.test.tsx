import { render, waitFor } from '@testing-library/react'
import type { ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BodyMap } from '../components/body-map/body-map'
import { ExerciseDetail } from '../components/exercise-detail/exercise-detail'
import { SettingsModal } from '../components/settings-modal/settings-modal'
import { buildDemoSeed } from '../data/demoSeed'
import { STORAGE_KEYS } from '../data/storage'
import { Dashboard } from '../pages/dashboard/dashboard.container'
import { ExerciseForm } from '../pages/exercises/components/exercise-form/exercise-form'
import { ExerciseList } from '../pages/exercises/exercises.container'
import { HistoryContainer } from '../pages/history/history.container'
import { NutritionContainer } from '../pages/nutrition/nutrition.container'
import { WorkoutSummaryModal } from '../pages/train/components/workout-summary-modal/workout-summary-modal'
import { TrainContainer } from '../pages/train/train.container'
import type { Exercise } from '../types'
import { renderWithAppData } from './render-with-app-data'

beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
  localStorage.setItem('gym_privacy_consent', 'true')
  const seed = buildDemoSeed()
  for (const [k, v] of Object.entries(seed)) sessionStorage.setItem(`demo::${k}`, v)
  sessionStorage.setItem('jgym_demo', '1')
  vi.stubGlobal('__APP_VERSION__', '0.0.0-test')
})

function demoData() {
  const seed = buildDemoSeed()
  const p = (k: string) => JSON.parse(seed[k])
  return {
    exercises: p(STORAGE_KEYS.exercises),
    sessions: p(STORAGE_KEYS.sessions),
    savedPlans: p(STORAGE_KEYS.plans),
    foodEntries: p(STORAGE_KEYS.food),
    waterEntries: p(STORAGE_KEYS.water),
    weightEntries: p(STORAGE_KEYS.weight),
    activityEntries: p(STORAGE_KEYS.activity),
    nutritionGoal: p(STORAGE_KEYS.nutritionGoal),
  }
}

it('renders the full app shell in demo mode without crashing', async () => {
  const errs: string[] = []
  vi.spyOn(console, 'error').mockImplementation((...a) => errs.push(a.map(String).join(' ')))
  const { default: App } = await import('../App')
  const { container } = render(<App />)
  await waitFor(() => expect(container.querySelector('nav')).toBeTruthy())
  expect(errs.join('\n---\n')).toBe('')
})

describe('each tab + exercise detail with demo data', () => {
  const cases: [string, () => ReactElement][] = [
    ['dashboard', () => <Dashboard />],
    ['exercises', () => <ExerciseList />],
    ['train', () => <TrainContainer />],
    ['history', () => <HistoryContainer />],
    ['nutrition', () => <NutritionContainer />],
  ]
  for (const [name, ui] of cases) {
    it(`renders ${name}`, () => {
      expect(() => renderWithAppData(ui(), demoData())).not.toThrow()
    })
  }

  it('opens exercise detail for EVERY demo exercise', () => {
    const d = demoData()
    for (const ex of d.exercises as Exercise[]) {
      expect(() =>
        renderWithAppData(
          <ExerciseDetail open onClose={vi.fn()} exercise={ex} sessions={d.sessions} onStartWith={vi.fn()} />,
          d,
        ),
      ).not.toThrow()
    }
  })

  it('renders the edit form + body map for EVERY demo exercise', () => {
    const d = demoData()
    for (const ex of d.exercises as Exercise[]) {
      expect(() =>
        renderWithAppData(<ExerciseForm open onClose={vi.fn()} onSave={vi.fn()} exercise={ex} />, d),
      ).not.toThrow()
      expect(() =>
        renderWithAppData(
          <BodyMap
            primaryMuscles={ex.primaryMuscles}
            secondaryMuscles={ex.secondaryMuscles}
            onToggle={vi.fn()}
            mode="primary"
          />,
          d,
        ),
      ).not.toThrow()
    }
  })

  it('renders the workout summary card (canvas) for demo sessions', () => {
    const d = demoData()
    for (const session of d.sessions) {
      expect(() =>
        renderWithAppData(
          <WorkoutSummaryModal
            session={session}
            sessions={d.sessions}
            exercises={d.exercises}
            savedPlans={d.savedPlans}
            elapsed={session.durationSeconds ?? 0}
            onClose={vi.fn()}
            isSupporter
          />,
          d,
        ),
      ).not.toThrow()
    }
  })

  it('renders settings modal open in demo mode with premium unlocked', () => {
    const d = demoData()
    expect(() =>
      renderWithAppData(
        <SettingsModal
          open
          onClose={vi.fn()}
          onImport={vi.fn()}
          exercises={d.exercises}
          onImportExercises={vi.fn()}
          theme="yellow"
          onThemeChange={vi.fn()}
          isSupporter
          onActivateCode={vi.fn(async () => true)}
          onRevoke={vi.fn()}
          update={null}
          onCheckUpdate={vi.fn()}
          checkingUpdate={false}
          musicPopupDisabled={false}
          onToggleMusicPopup={vi.fn()}
          demoMode
          onEnterDemo={vi.fn()}
          onExitDemo={vi.fn()}
          onToggleDemoPremium={vi.fn()}
        />,
        { ...d, demoMode: true, isSupporter: true },
      ),
    ).not.toThrow()
  })
})
