import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { vi } from 'vitest'
import { type AppData, AppDataContext } from '../context/app-data'

/** Full AppData value with empty data + no-op handlers, so tests only supply
 *  the slices/spies they assert on. */
function baseAppData(): AppData {
  return {
    exercises: [],
    sessions: [],
    savedPlans: [],
    foodEntries: [],
    waterEntries: [],
    weightEntries: [],
    activityEntries: [],
    nutritionGoal: {
      dailyCalories: 2300,
      dailyProtein: 150,
      dailyCarbs: 250,
      dailyFat: 75,
      dailyWaterMl: 2000,
      goalType: 'maintain',
      eatBackPerc: 50,
    },
    musicPopupDisabled: false,
    theme: 'yellow',
    setTheme: vi.fn(),
    isSupporter: false,
    tryActivate: vi.fn(async () => false),
    revoke: vi.fn(),
    tab: 'dashboard',
    setTab: vi.fn(),
    settingsOpen: false,
    setSettingsOpen: vi.fn(),
    detailExercise: null,
    setDetailExercise: vi.fn(),
    preSelectedExercise: null,
    sharedImport: null,
    setSharedImport: vi.fn(),
    startWith: vi.fn(),
    navigateToExercises: vi.fn(),
    clearPreSelected: vi.fn(),
    exerciseClick: vi.fn(),
    saveExercise: vi.fn(),
    deleteExercise: vi.fn(),
    importExercises: vi.fn(),
    sessionSave: vi.fn(),
    deleteSession: vi.fn(),
    updateSession: vi.fn(),
    savePlan: vi.fn(),
    updatePlan: vi.fn(),
    deletePlan: vi.fn(),
    advancePlanDay: vi.fn(),
    addFood: vi.fn(),
    deleteFood: vi.fn(),
    addWater: vi.fn(),
    deleteWater: vi.fn(),
    addWeight: vi.fn(),
    deleteWeight: vi.fn(),
    addActivity: vi.fn(),
    deleteActivity: vi.fn(),
    updateGoal: vi.fn(),
    setMusicPopupDisabled: vi.fn(),
    importBackup: vi.fn(),
  }
}

/** Render a component under a stubbed AppDataProvider. Pass overrides for the
 *  data slices and handler spies the test needs. */
export function renderWithAppData(ui: ReactElement, overrides: Partial<AppData> = {}) {
  const value: AppData = { ...baseAppData(), ...overrides }
  return { value, ...render(<AppDataContext.Provider value={value}>{ui}</AppDataContext.Provider>) }
}
