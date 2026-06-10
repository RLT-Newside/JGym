// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ExtendedBodyPart, Slug } from 'react-muscle-highlighter'
import Body from 'react-muscle-highlighter'
import { backMuscles, deepMuscles, frontMuscles, structuralBack, structuralFront } from '../../data/musclePaths'
import { MUSCLE_SLUGS, SLUG_LABELS, SLUG_TO_MUSCLES } from '../../data/muscleSlugMap'
import { MUSCLE_CATEGORIES, type MuscleGroup } from '../../types'

interface Props {
  primaryMuscles: MuscleGroup[]
  secondaryMuscles: MuscleGroup[]
  onToggle: (muscle: MuscleGroup) => void
  mode: 'primary' | 'secondary'
}

export function BodyMap({ primaryMuscles, secondaryMuscles, onToggle, mode }: Props) {
  const [view, setView] = useState<'front' | 'back'>('front')
  const [advanced, setAdvanced] = useState(false)
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [hoveredSlug, setHoveredSlug] = useState<Slug | null>(null)
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleGroup | null>(null)

  const isPrimary = (m: MuscleGroup) => primaryMuscles.includes(m)
  const isSecondary = (m: MuscleGroup) => secondaryMuscles.includes(m)
  const isSelected = (m: MuscleGroup) => isPrimary(m) || isSecondary(m)

  // ── Simple mode: react-muscle-highlighter data ──
  const bodyData: ExtendedBodyPart[] = useMemo(() => {
    return MUSCLE_SLUGS.map((slug) => {
      const muscles = SLUG_TO_MUSCLES[slug]
      const hasPrimary = muscles.some((m) => isPrimary(m))
      const hasSecondary = muscles.some((m) => isSecondary(m))
      const isHovered = hoveredSlug === slug

      let fill = 'rgba(255,255,255,0.03)'
      if (hasPrimary) fill = '#dc2626'
      else if (hasSecondary) fill = '#ea580c'
      else if (isHovered) fill = 'rgba(255,255,255,0.08)'

      return {
        slug,
        styles: { fill, stroke: 'rgba(255,255,255,0.12)', strokeWidth: hasPrimary || hasSecondary ? 1.2 : 0.5 },
      }
    })
  }, [primaryMuscles, secondaryMuscles, hoveredSlug])

  const handleBodyPartPress = (part: ExtendedBodyPart) => {
    const slug = part.slug
    if (!slug || !SLUG_TO_MUSCLES[slug]) return
    const muscles = SLUG_TO_MUSCLES[slug]
    if (muscles.length === 0) return
    const anySelected = muscles.some((m) => isSelected(m))
    muscles.forEach((m) => {
      const currentlySelected = isSelected(m)
      if (anySelected && currentlySelected) onToggle(m)
      else if (!anySelected && !currentlySelected) onToggle(m)
    })
  }

  const isSlugSelected = (slug: Slug) => SLUG_TO_MUSCLES[slug]?.some((m) => isSelected(m)) ?? false
  const isSlugPrimary = (slug: Slug) => SLUG_TO_MUSCLES[slug]?.some((m) => isPrimary(m)) ?? false

  // All muscles that have a body map region
  const allMappedMuscles = new Set(Object.values(SLUG_TO_MUSCLES).flat())

  // ── Advanced mode: path fill per individual muscle ──
  const getMusclePathFill = (muscle: MuscleGroup) => {
    if (isPrimary(muscle)) return '#dc2626'
    if (isSecondary(muscle)) return '#ea580c'
    if (hoveredMuscle === muscle) return 'rgba(255,255,255,0.1)'
    return 'rgba(255,255,255,0.03)'
  }

  const _getMusclePathStrokeWidth = (muscle: MuscleGroup) => (isPrimary(muscle) || isSecondary(muscle) ? 1.2 : 0.6)

  const advancedMuscles = view === 'front' ? frontMuscles : backMuscles

  return (
    <div className="space-y-3">
      {/* Controls row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex bg-white/[0.03] rounded-lg p-0.5">
          <button
            onClick={() => setAdvanced(false)}
            className={`px-3 py-1 rounded text-[10px] font-medium transition-colors ${
              !advanced ? 'bg-white/[0.06] text-white' : 'text-white/40'
            }`}
          >
            Simple
          </button>
          <button
            onClick={() => setAdvanced(true)}
            className={`px-3 py-1 rounded text-[10px] font-medium transition-colors ${
              advanced ? 'bg-white/[0.06] text-white' : 'text-white/40'
            }`}
          >
            Advanced
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-2 text-[9px] text-white/40">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-red-600" />
              Pri
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-orange-600" />
              Sec
            </span>
          </div>

          <button
            onClick={() => setView((v) => (v === 'front' ? 'back' : 'front'))}
            className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 px-2 py-1 glass rounded transition-colors"
          >
            <RotateCcw size={10} />
            {view === 'front' ? 'Back' : 'Front'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div
        className="relative flex justify-center glass rounded-xl py-4"
        onMouseLeave={() => {
          setHoveredSlug(null)
          setHoveredMuscle(null)
        }}
      >
        {!advanced ? (
          <>
            <Body
              data={bodyData}
              side={view}
              gender="male"
              scale={1.4}
              border="rgba(255,255,255,0.08)"
              defaultFill="rgba(255,255,255,0.03)"
              defaultStroke="rgba(255,255,255,0.08)"
              defaultStrokeWidth={0.4}
              hiddenParts={['hair']}
              disabledParts={['head', 'hands', 'feet', 'ankles', 'knees', 'neck']}
              onBodyPartPress={(part) => {
                handleBodyPartPress(part)
                setHoveredSlug(part.slug ?? null)
              }}
            />
            {hoveredSlug && SLUG_TO_MUSCLES[hoveredSlug]?.length > 0 && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/[0.06] border border-white/10 text-white text-[10px] px-2.5 py-1 rounded-lg pointer-events-none whitespace-nowrap shadow-lg z-10">
                {SLUG_LABELS[hoveredSlug]}
                {isSlugPrimary(hoveredSlug) && <span className="text-red-400 ml-1">primary</span>}
                {!isSlugPrimary(hoveredSlug) && isSlugSelected(hoveredSlug) && (
                  <span className="text-orange-400 ml-1">secondary</span>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <svg viewBox="0 0 320 500" className="w-[220px]" style={{ display: 'block' }}>
              <path
                d={view === 'front' ? structuralFront : structuralBack}
                fill="rgba(255,255,255,0.04)"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={0.4}
              />
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {advancedMuscles.map(({ muscle, d }) => {
                const selected = isPrimary(muscle) || isSecondary(muscle)
                return (
                  <path
                    key={muscle}
                    d={d}
                    fill={getMusclePathFill(muscle)}
                    stroke={selected ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)'}
                    strokeWidth={selected ? 1 : 0.4}
                    strokeLinejoin="round"
                    filter={selected ? 'url(#glow)' : undefined}
                    onClick={() => onToggle(muscle)}
                    onMouseEnter={() => setHoveredMuscle(muscle)}
                    onMouseLeave={() => setHoveredMuscle(null)}
                    className="cursor-pointer transition-[fill,stroke] duration-150"
                  />
                )
              })}
            </svg>
            {hoveredMuscle && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/[0.06] border border-white/10 text-white text-[10px] px-2.5 py-1 rounded-lg pointer-events-none whitespace-nowrap shadow-lg z-10">
                {hoveredMuscle}
                {isPrimary(hoveredMuscle) && <span className="text-red-400 ml-1">primary</span>}
                {!isPrimary(hoveredMuscle) && isSecondary(hoveredMuscle) && (
                  <span className="text-orange-400 ml-1">secondary</span>
                )}
              </div>
            )}
          </>
        )}

        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-white/[0.08] tracking-[3px] font-heading pointer-events-none">
          {view === 'front' ? 'FRONT' : 'BACK'}
        </div>
      </div>

      {/* Mode hint */}
      <p className="text-[10px] text-center text-white/20">
        Tap muscles to set as{' '}
        <span className={mode === 'primary' ? 'text-red-400 font-medium' : 'text-orange-400 font-medium'}>{mode}</span>
      </p>

      {/* Advanced: expandable category chip list (supplementary — covers opposite-side muscles) */}
      {advanced && (
        <div className="space-y-1">
          {Object.entries(MUSCLE_CATEGORIES).map(([cat, catMuscles]) => {
            const visibleMuscles = catMuscles.filter((m) => allMappedMuscles.has(m) && !deepMuscles.includes(m))
            if (visibleMuscles.length === 0) return null
            const anySelected = visibleMuscles.some((m) => isSelected(m))
            const isExpanded = expandedCat === cat

            return (
              <div key={cat} className="bg-white/[0.03] rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedCat(isExpanded ? null : cat)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white/60">{cat}</span>
                    {anySelected && (
                      <span className="text-[9px] text-white/25">
                        {visibleMuscles.filter((m) => isSelected(m)).length}/{visibleMuscles.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {visibleMuscles
                        .filter((m) => isSelected(m))
                        .map((m) => (
                          <span
                            key={m}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: isPrimary(m) ? '#dc2626' : '#ea580c' }}
                          />
                        ))}
                    </div>
                    {isExpanded ? (
                      <ChevronDown size={12} className="text-white/20" />
                    ) : (
                      <ChevronRight size={12} className="text-white/20" />
                    )}
                  </div>
                </button>
                {isExpanded && (
                  <div className="flex flex-wrap gap-1.5 px-3 pb-2.5">
                    {visibleMuscles.map((m) => (
                      <button
                        key={m}
                        onClick={() => onToggle(m)}
                        className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                          isPrimary(m)
                            ? 'bg-red-600/20 text-red-400 ring-1 ring-red-600/30'
                            : isSecondary(m)
                              ? 'bg-orange-600/15 text-orange-400 ring-1 ring-orange-600/25'
                              : 'glass text-white/35 hover:bg-white/[0.06] hover:text-white/50'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Selection summary */}
      {(primaryMuscles.length > 0 || secondaryMuscles.length > 0) && (
        <div className="text-[10px] text-white/30 leading-relaxed">
          {primaryMuscles.length > 0 && (
            <p>
              Primary: <span className="text-red-400">{primaryMuscles.join(', ')}</span>
            </p>
          )}
          {secondaryMuscles.length > 0 && (
            <p>
              Secondary: <span className="text-orange-400/70">{secondaryMuscles.join(', ')}</span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
