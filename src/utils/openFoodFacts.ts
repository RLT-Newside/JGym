// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
export interface OpenFoodProduct {
  name: string
  brand: string
  servingSizeG: number
  isDrink: boolean
  per100g: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

export async function lookupBarcode(barcode: string): Promise<OpenFoodProduct | null> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=product_name,brands,serving_size,nutriments`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)
  let res: Response
  try {
    res = await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const data = await res.json()
  if (data.status !== 1 || !data.product) return null

  const p = data.product
  const n = p.nutriments ?? {}

  const caloriesKcal = n['energy-kcal_100g']
  const caloriesKj = n.energy_100g
  const calories = caloriesKcal ?? (caloriesKj ? Math.round(caloriesKj / 4.184) : 0)

  const clamp = (v: unknown, max: number) =>
    Math.min(max, Math.max(0, Number.isFinite(Number(v)) ? Math.round(Number(v) * 10) / 10 : 0))

  const per100g = {
    calories: clamp(n['energy-kcal_100g'] ?? calories, 9000),
    protein: clamp(n.proteins_100g, 100),
    carbs: clamp(n.carbohydrates_100g, 100),
    fat: clamp(n.fat_100g, 100),
  }

  const { amount: servingSizeG, unit: servingUnit } = parseServingSize(p.serving_size)
  const isDrink = servingUnit === 'ml'

  return {
    name: p.product_name?.trim() ?? '',
    brand: p.brands?.split(',')[0]?.trim() ?? '',
    servingSizeG,
    isDrink,
    per100g,
  }
}

function parseServingSize(raw: string | undefined): { amount: number; unit: 'g' | 'ml' } {
  if (!raw) return { amount: 100, unit: 'g' }
  const match = raw.match(/(\d+(?:\.\d+)?)\s*(ml|g|gr)/i)
  if (!match) return { amount: 100, unit: 'g' }
  const unit = match[2].toLowerCase() === 'ml' ? 'ml' : 'g'
  return { amount: Math.round(Number(match[1])), unit }
}

export function scaleMacros(per100g: OpenFoodProduct['per100g'], grams: number) {
  const ratio = grams / 100
  return {
    calories: Math.round(per100g.calories * ratio),
    protein: Math.round(per100g.protein * ratio * 10) / 10,
    carbs: Math.round(per100g.carbs * ratio * 10) / 10,
    fat: Math.round(per100g.fat * ratio * 10) / 10,
  }
}
