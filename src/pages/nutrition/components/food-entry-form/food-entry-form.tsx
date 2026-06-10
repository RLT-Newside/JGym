// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { AlertCircle, Loader, ScanLine } from 'lucide-react'
import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { Button } from '../../../../components/button/button'
import { Modal } from '../../../../components/modal/modal'
import type { FoodEntry, MealType } from '../../../../types'
import { getDateStr, MEAL_LABELS } from '../../../../utils/nutrition'
import { lookupBarcode, type OpenFoodProduct, scaleMacros } from '../../../../utils/openFoodFacts'
import { BarcodeScanner } from '../barcode-scanner/barcode-scanner'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (entry: FoodEntry) => void
  entry?: FoodEntry | null
  defaultMeal?: MealType
  defaultDate?: string
}

export function FoodEntryForm({ open, onClose, onSave, entry, defaultMeal = 'lunch', defaultDate }: Props) {
  const [name, setName] = useState(entry?.name ?? '')
  const [calories, setCalories] = useState(entry?.calories?.toString() ?? '')
  const [protein, setProtein] = useState(entry?.protein?.toString() ?? '0')
  const [carbs, setCarbs] = useState(entry?.carbs?.toString() ?? '0')
  const [fat, setFat] = useState(entry?.fat?.toString() ?? '0')
  const [mealType, setMealType] = useState<MealType>(entry?.mealType ?? defaultMeal)
  const [date, setDate] = useState(entry?.date ?? defaultDate ?? getDateStr())

  // Barcode / product state
  const [scannerOpen, setScannerOpen] = useState(false)
  const [looking, setLooking] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [product, setProduct] = useState<OpenFoodProduct | null>(null)
  const [portionG, setPortionG] = useState('100')
  const [isDrink, setIsDrink] = useState(entry?.mealType === 'drink')

  const handleSave = () => {
    if (!name.trim() || !calories) return
    onSave({
      id: entry?.id ?? uuid(),
      name: name.trim(),
      calories: Math.round(Number(calories) || 0),
      protein: Math.round(Number(protein) || 0),
      carbs: Math.round(Number(carbs) || 0),
      fat: Math.round(Number(fat) || 0),
      mealType,
      volumeMl: isDrink ? Number(portionG) || undefined : undefined,
      date,
      createdAt: entry?.createdAt ?? new Date().toISOString(),
    })
    onClose()
  }

  const handleBarcodeScan = async (barcode: string) => {
    setScannerOpen(false)
    if (!barcode || !/^\d{8,14}$/.test(barcode)) {
      setLookupError('Invalid barcode format. Expected 8–14 digits.')
      return
    }
    setLooking(true)
    setLookupError(null)

    try {
      const p = await lookupBarcode(barcode)
      if (!p?.name) {
        setLookupError(`No product found for barcode ${barcode}. Enter manually.`)
        setLooking(false)
        return
      }

      setProduct(p)
      const portion = p.servingSizeG
      setPortionG(portion.toString())
      if (p.isDrink) {
        setIsDrink(true)
        setMealType('drink')
      }

      const macros = scaleMacros(p.per100g, portion)
      const displayName = p.brand ? `${p.name} (${p.brand})` : p.name
      setName(displayName)
      setCalories(macros.calories.toString())
      setProtein(macros.protein.toString())
      setCarbs(macros.carbs.toString())
      setFat(macros.fat.toString())
    } catch {
      setLookupError('Could not look up product. Check your connection or enter manually.')
    }

    setLooking(false)
  }

  const handlePortionChange = (grams: string) => {
    setPortionG(grams)
    if (!product) return
    const g = Number(grams)
    if (!g || g <= 0) return
    const macros = scaleMacros(product.per100g, g)
    setCalories(macros.calories.toString())
    setProtein(macros.protein.toString())
    setCarbs(macros.carbs.toString())
    setFat(macros.fat.toString())
  }

  const meals: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'drink']

  return (
    <>
      {scannerOpen && <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setScannerOpen(false)} />}
      <Modal open={open} onClose={onClose} title={entry ? 'Edit Entry' : 'Add Entry'}>
        <div className="space-y-4">
          {/* Scan button */}
          {!entry && (
            <button
              onClick={() => {
                if (localStorage.getItem('gym_barcode_consent') !== 'true') {
                  const ok = confirm(
                    'Scanning a barcode sends the barcode number to OpenFoodFacts (openfoodfacts.org) to look up nutrition data.\n\nNo other personal data is sent. Continue?',
                  )
                  if (!ok) return
                  localStorage.setItem('gym_barcode_consent', 'true')
                }
                setScannerOpen(true)
              }}
              disabled={looking}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand/10 border border-brand/20 text-brand text-sm font-medium hover:bg-brand/15 transition-colors disabled:opacity-50"
            >
              {looking ? (
                <>
                  <Loader size={14} className="animate-spin" /> Looking up product...
                </>
              ) : (
                <>
                  <ScanLine size={14} /> Scan Barcode
                </>
              )}
            </button>
          )}

          {/* Lookup error */}
          {lookupError && (
            <div className="flex items-start gap-2 px-3 py-2 bg-red-900/15 border border-red-900/20 rounded-lg">
              <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-red-400/80">{lookupError}</p>
            </div>
          )}

          {/* Product portion control (shown after successful scan) */}
          {product && !entry && (
            <div className="px-3 py-2.5 bg-white/[0.03] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  {isDrink ? 'Volume' : 'Portion Size'}
                </p>
                <p className="text-[10px] text-white/20">
                  {product.per100g.calories} kcal per 100{isDrink ? 'ml' : 'g'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="50000"
                  value={portionG}
                  onChange={(e) => handlePortionChange(e.target.value)}
                  className="w-24 bg-white/[0.04] border border-white/[0.08] rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:border-brand/40 focus:bg-white/[0.06]"
                  inputMode="decimal"
                  step="1"
                />
                <span className="text-sm text-white/40">{isDrink ? 'ml' : 'g'}</span>
                {product.servingSizeG !== 100 && (
                  <button
                    onClick={() => handlePortionChange(product.servingSizeG.toString())}
                    className="ml-auto text-[10px] text-brand/50 hover:text-brand/80 transition-colors"
                  >
                    Reset to serving ({product.servingSizeG}
                    {isDrink ? 'ml' : 'g'})
                  </button>
                )}
              </div>
            </div>
          )}

          {isDrink && !product && (
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Volume (ml)</label>
              <input
                type="number"
                min="0"
                max="50000"
                value={portionG}
                onChange={(e) => setPortionG(e.target.value)}
                placeholder="e.g. 500"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.06]"
                inputMode="numeric"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">
              {isDrink ? 'Drink Name' : 'Food Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isDrink ? 'e.g. Coca-Cola, Orange juice' : 'e.g. Chicken breast, Rice, Banana'}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand/40 focus:bg-white/[0.06]"
              autoFocus={!product}
            />
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Meal</label>
            <div className="grid grid-cols-5 gap-1.5">
              {meals.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMealType(m)
                    setIsDrink(m === 'drink')
                  }}
                  className={`py-2 rounded-lg text-[10px] font-medium transition-colors ${
                    mealType === m ? 'bg-brand text-black' : 'glass text-white/40 hover:bg-white/[0.06]'
                  }`}
                >
                  {MEAL_LABELS[m]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Calories (kcal)</label>
            <input
              type="number"
              min="0"
              max="50000"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="e.g. 350"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand/40 focus:bg-white/[0.06]"
              inputMode="numeric"
            />
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Macros (optional)</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-white/30 block mb-1">Protein (g)</span>
                <input
                  type="number"
                  min="0"
                  max="50000"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:border-brand/40 focus:bg-white/[0.06]"
                  inputMode="numeric"
                />
              </div>
              <div>
                <span className="text-[10px] text-white/30 block mb-1">Carbs (g)</span>
                <input
                  type="number"
                  min="0"
                  max="50000"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:border-brand/40 focus:bg-white/[0.06]"
                  inputMode="numeric"
                />
              </div>
              <div>
                <span className="text-[10px] text-white/30 block mb-1">Fat (g)</span>
                <input
                  type="number"
                  min="0"
                  max="50000"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:border-brand/40 focus:bg-white/[0.06]"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand/40 focus:bg-white/[0.06] [color-scheme:dark]"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim() || !calories}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
