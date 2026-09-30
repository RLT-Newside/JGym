// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { ChevronLeft, ChevronRight, ImagePlus, Pencil, RotateCcw, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useExerciseForm } from '../../hooks/useExerciseForm'
import { useExerciseImage } from '../../hooks/useExerciseImage'
import { useLibraryEntry } from '../../hooks/useLibraryEntry'
import type { Exercise, LibraryExercise, Session } from '../../types'
import { formatDate, formatSetsSummary } from '../../utils/format'
import { resizeImageFile } from '../../utils/imageResize'
import { calculatePR, formatPR } from '../../utils/pr'
import { BodyMap } from '../body-map/body-map'
import { Button } from '../button/button'
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog'
import { FormField } from '../form-field/form-field'
import { Modal } from '../modal/modal'
import { MuscleTags } from '../muscle-tags/muscle-tags'
import { SectionHeader } from '../section-header/section-header'
import { ProgressionChart } from './progression-chart'

interface Props {
  open: boolean
  onClose: () => void
  exercise: Exercise | null
  sessions: Session[]
  onStartWith: (exercise: Exercise) => void
  onSave?: (exercise: Exercise) => void
  onResetProgress?: (exercise: Exercise) => void
  initialMode?: 'viewing' | 'editing'
}

export function ExerciseDetail({
  open,
  onClose,
  exercise,
  sessions,
  onStartWith,
  onSave,
  onResetProgress,
  initialMode = 'viewing',
}: Props) {
  const [isEditing, setIsEditing] = useState(initialMode === 'editing')
  const [resetConfirm, setResetConfirm] = useState(false)
  const library = useLibraryEntry(exercise?.libraryId)
  const form = useExerciseForm(exercise)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!exercise) return null

  const pr = calculatePR(exercise.id, sessions, exercise.progressResetAt)
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter((s) => s.entries.some((e) => e.exerciseId === exercise.id))
    .slice(0, 5)

  const handleSave = () => {
    if (!form.canSave || !onSave) return
    onSave(form.buildExercise())
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    form.reset()
    setIsEditing(false)
  }

  const handleAddImages = async (files: FileList) => {
    const newImages: string[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      try {
        newImages.push(await resizeImageFile(file))
      } catch {
        /* skip unreadable files */
      }
    }
    form.setCustomImages((prev) => [...prev, ...newImages])
  }

  const title = isEditing ? `Edit: ${exercise.name}` : exercise.name
  const modeLabel = isEditing ? 'Edit Mode' : 'View Mode'

  return (
    <>
      <Modal open={open} onClose={isEditing ? handleCancelEdit : onClose} title={title}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${
                isEditing ? 'bg-brand/20 text-brand' : 'bg-white/[0.06] text-white/40'
              }`}
            >
              {modeLabel}
            </span>
            {onSave && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                aria-label="Edit exercise"
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.06]"
              >
                <Pencil size={13} /> Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <EditForm
              form={form}
              fileInputRef={fileInputRef}
              onAddImages={handleAddImages}
              onSave={handleSave}
              onCancel={handleCancelEdit}
            />
          ) : (
            <ViewContent
              exercise={exercise}
              library={library}
              pr={pr}
              sessions={sessions}
              recentSessions={recentSessions}
              onStartWith={onStartWith}
              onResetProgress={onResetProgress ? () => setResetConfirm(true) : undefined}
            />
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={resetConfirm}
        onClose={() => setResetConfirm(false)}
        onConfirm={() => {
          onResetProgress?.(exercise)
          setResetConfirm(false)
        }}
        title="Reset Progress"
        message="This will reset your PR and 'Last session' weight for this exercise. Your next session starts fresh from 0."
        confirmLabel="Reset"
        danger
      />
    </>
  )
}

interface ViewContentProps {
  exercise: Exercise
  library: LibraryExercise | null
  pr: ReturnType<typeof calculatePR>
  sessions: Session[]
  recentSessions: Session[]
  onStartWith: (exercise: Exercise) => void
  onResetProgress?: () => void
}

function ViewContent({
  exercise,
  library,
  pr,
  sessions,
  recentSessions,
  onStartWith,
  onResetProgress,
}: ViewContentProps) {
  return (
    <>
      <MuscleTags exercise={exercise} size="sm" />

      {exercise.customImages && exercise.customImages.length > 0 && (
        <CustomImageSection images={exercise.customImages} name={exercise.name} />
      )}

      {exercise.description && (
        <div>
          <SectionHeader className="mb-2">Description</SectionHeader>
          <p className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap">{exercise.description}</p>
        </div>
      )}

      {library && <LibrarySection entry={library} />}

      <div className="bg-white/[0.04] rounded-xl p-4 text-center">
        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Personal Record</p>
        <p className="font-heading text-3xl text-brand">{formatPR(pr)}</p>
      </div>

      <ProgressionChart exerciseId={exercise.id} sessions={sessions} />

      {recentSessions.length > 0 && (
        <div>
          <h3 className="text-xs text-white/40 uppercase tracking-wider mb-2">Recent Sessions</h3>
          <div className="space-y-2">
            {recentSessions.map((session) => {
              const entry = session.entries.find((e) => e.exerciseId === exercise.id)!
              return (
                <div key={session.id} className="flex items-center justify-between bg-white/[0.04] rounded px-3 py-2">
                  <span className="text-xs text-white/50">{formatDate(session.date)}</span>
                  <span className="text-xs">
                    {entry.sets.length} sets: {formatSetsSummary(entry.sets)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {onResetProgress && (
        <button
          onClick={onResetProgress}
          className="w-full flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white/60 py-2 transition-colors"
        >
          <RotateCcw size={14} /> Reset progress
        </button>
      )}

      <Button onClick={() => onStartWith(exercise)} className="w-full">
        Start with this exercise
      </Button>
    </>
  )
}

interface EditFormProps {
  form: ReturnType<typeof useExerciseForm>
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onAddImages: (files: FileList) => void
  onSave: () => void
  onCancel: () => void
}

function EditForm({ form, fileInputRef, onAddImages, onSave, onCancel }: EditFormProps) {
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSave()
      }}
    >
      <FormField
        label="Name"
        type="text"
        value={form.name}
        onChange={(e) => form.setName(e.target.value)}
        placeholder="e.g. Bench Press"
        autoFocus
      />

      <div>
        <label className="label-caption block mb-2">Muscle Groups</label>
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => form.setSelectionMode('primary')}
            className={`flex-1 text-xs py-2 rounded-lg font-medium transition-colors ${
              form.selectionMode === 'primary'
                ? 'bg-brand text-black'
                : 'bg-white/[0.06] text-white/40 hover:bg-white/[0.1]'
            }`}
          >
            Primary
          </button>
          <button
            type="button"
            onClick={() => form.setSelectionMode('secondary')}
            className={`flex-1 text-xs py-2 rounded-lg font-medium transition-colors ${
              form.selectionMode === 'secondary'
                ? 'bg-brand/30 text-brand'
                : 'bg-white/[0.06] text-white/40 hover:bg-white/[0.1]'
            }`}
          >
            Secondary
          </button>
        </div>
        <BodyMap
          primaryMuscles={form.primaryMuscles}
          secondaryMuscles={form.secondaryMuscles}
          onToggle={form.handleToggleMuscle}
          mode={form.selectionMode}
        />
      </div>

      <FormField
        label="Description"
        multiline
        value={form.description}
        onChange={(e) => form.setDescription(e.target.value)}
        placeholder="How to perform this exercise..."
        rows={3}
      />

      <div>
        <label className="label-caption block mb-2">Default warmup set</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => form.setDefaultWarmup(false)}
            className={`flex-1 text-xs py-2 rounded-lg font-medium transition-colors ${
              !form.defaultWarmup
                ? 'bg-white/[0.12] text-white/70'
                : 'bg-white/[0.06] text-white/40 hover:bg-white/[0.1]'
            }`}
          >
            No warmup
          </button>
          <button
            type="button"
            onClick={() => form.setDefaultWarmup(true)}
            className={`flex-1 text-xs py-2 rounded-lg font-medium transition-colors ${
              form.defaultWarmup ? 'bg-sky-400/20 text-sky-400' : 'bg-white/[0.06] text-white/40 hover:bg-white/[0.1]'
            }`}
          >
            With warmup
          </button>
        </div>
      </div>

      <div>
        <label className="label-caption block mb-2">Images</label>
        {form.customImages.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-2">
            {form.customImages.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-white/[0.04]">
                <img src={src} alt={`Custom ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => form.setCustomImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white/80 hover:text-red-400 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) onAddImages(e.target.files)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors px-2 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg"
        >
          <ImagePlus size={14} /> Add image
        </button>
      </div>

      <FormField
        label="Notes"
        multiline
        value={form.notes}
        onChange={(e) => form.setNotes(e.target.value)}
        placeholder="Optional notes..."
        rows={2}
      />

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!form.canSave}>
          Save
        </Button>
      </div>
    </form>
  )
}

function LibrarySection({ entry }: { entry: LibraryExercise }) {
  const [imgIdx, setImgIdx] = useState(0)
  const { src, error, loading } = useExerciseImage(entry.imageFolder, imgIdx)
  const hasMultiple = entry.imageCount > 1
  const touchX = useRef<number | null>(null)

  const prev = () => setImgIdx((i) => (i - 1 + entry.imageCount) % entry.imageCount)
  const next = () => setImgIdx((i) => (i + 1) % entry.imageCount)

  return (
    <div className="space-y-3">
      <div
        className="bg-white/[0.04] rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center relative select-none"
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null || !hasMultiple) return
          const delta = e.changedTouches[0].clientX - touchX.current
          if (Math.abs(delta) > 40) {
            if (delta < 0) next()
            else prev()
          }
          touchX.current = null
        }}
      >
        {loading && <span className="text-[10px] text-white/30">loading…</span>}
        {error && !src && <span className="text-[10px] text-white/30">image unavailable offline</span>}
        {src && <img src={src} alt={entry.name} className="w-full h-full object-cover pointer-events-none" />}
        {hasMultiple && src && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white/80 p-1 rounded-full"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white/80 p-1 rounded-full"
            >
              <ChevronRight size={16} />
            </button>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white/80 text-[10px] px-2 py-1 rounded">
              {imgIdx + 1}/{entry.imageCount}
            </span>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {entry.equipment && <Badge label={entry.equipment} />}
        <Badge label={entry.level} />
        {entry.mechanic && <Badge label={entry.mechanic} />}
        {entry.force && <Badge label={entry.force} />}
      </div>

      {entry.instructions.length > 0 && (
        <div>
          <h3 className="text-xs text-white/40 uppercase tracking-wider mb-2">Instructions</h3>
          <ol className="space-y-2 list-decimal list-inside text-xs text-white/70 leading-relaxed">
            {entry.instructions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

function CustomImageSection({ images, name }: { images: string[]; name: string }) {
  const [imgIdx, setImgIdx] = useState(0)
  return (
    <div className="bg-white/[0.04] rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center relative">
      <img src={images[imgIdx]} alt={name} className="w-full h-full object-cover" />
      {images.length > 1 && (
        <button
          onClick={() => setImgIdx((i) => (i + 1) % images.length)}
          className="absolute bottom-2 right-2 bg-black/50 text-white/80 text-[10px] px-2 py-1 rounded"
        >
          {imgIdx + 1}/{images.length}
        </button>
      )}
    </div>
  )
}

function Badge({ label }: { label: string }) {
  return <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/60 capitalize">{label}</span>
}
