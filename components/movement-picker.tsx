"use client"

import { useState, useEffect } from "react"
import { Search, Check, ArrowLeft, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getMovements, createMovement } from "@/lib/queries"
import type {
  Movement,
  ExerciseArea,
  ExerciseType,
  Metric,
} from "@/types/database"
import { cn } from "@/lib/utils"

const AREA_LABELS: Record<ExerciseArea, string> = {
  full: "Full Body",
  lower: "Lower",
  upper: "Upper",
}

const METRIC_LABELS: Record<Metric, string> = {
  reps: "Reps",
  weight: "Weight",
  distance: "Distance",
  calories: "Calories",
  duration: "Duration",
}

const ALL_METRICS: Metric[] = ["reps", "weight", "distance", "calories", "duration"]

interface MovementPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (movement: Movement) => void
  selectedId?: string
}

export function MovementPicker({
  open,
  onClose,
  onSelect,
  selectedId,
}: MovementPickerProps) {
  const [movements, setMovements] = useState<Movement[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<"search" | "create">("search")

  useEffect(() => {
    if (!open) {
      setMode("search")
      setSearch("")
    }
  }, [open])

  useEffect(() => {
    if (!open || mode !== "search") return
    setLoading(true)
    const timeout = setTimeout(async () => {
      const data = await getMovements({ search: search || undefined })
      setMovements(data)
      setLoading(false)
    }, 150)
    return () => clearTimeout(timeout)
  }, [open, search, mode])

  function handleSelect(movement: Movement) {
    onSelect(movement)
    setSearch("")
    onClose()
  }

  function handleCreated(movement: Movement) {
    onSelect(movement)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[80vh] flex flex-col p-0 gap-0">
        {mode === "search" ? (
          <>
            <DialogHeader className="px-4 pt-4 pb-3 border-b border-border-neutral-default">
              <DialogTitle>Pick a movement</DialogTitle>
            </DialogHeader>
            <div className="px-4 py-3 border-b border-border-neutral-default">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground-neutral-faded" />
                <Input
                  autoFocus
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-12 rounded-xl bg-background-neutral-subtle animate-pulse"
                    />
                  ))}
                </div>
              ) : movements.length === 0 ? (
                <p className="text-center text-body-medium-default text-foreground-neutral-faded py-8">
                  No movements found
                </p>
              ) : (
                <div className="p-2 space-y-0.5">
                  {movements.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSelect(m)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors text-left",
                        m.id === selectedId
                          ? "bg-background-neutral-strong text-foreground-neutral-default"
                          : "hover:bg-background-neutral-strong",
                      )}
                    >
                      <div>
                        <p className="text-body-medium-strong">{m.name}</p>
                        <p className="text-body-small-default mt-0.5 text-foreground-neutral-faded">
                          {AREA_LABELS[m.area]} · {m.type}
                        </p>
                      </div>
                      {m.id === selectedId && (
                        <Check className="size-4 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-border-neutral-default">
              <button
                onClick={() => setMode("create")}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-body-medium-default text-foreground-neutral-faded hover:bg-background-neutral-strong hover:text-foreground-neutral-default transition-colors"
              >
                <Plus className="size-4" />
                Create movement
              </button>
            </div>
          </>
        ) : (
          <CreateMovementForm
            onBack={() => setMode("search")}
            onCreated={handleCreated}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface CreateMovementFormProps {
  onBack: () => void
  onCreated: (movement: Movement) => void
}

function CreateMovementForm({ onBack, onCreated }: CreateMovementFormProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<ExerciseType>("strength")
  const [area, setArea] = useState<ExerciseArea>("full")
  const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleMetric(metric: Metric) {
    setSelectedMetrics((prev) =>
      prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric],
    )
  }

  const canSubmit = name.trim().length > 0 && selectedMetrics.length > 0 && !saving

  async function handleSubmit() {
    if (!canSubmit) return
    setSaving(true)
    setError(null)
    try {
      const movement = await createMovement({
        name: name.trim(),
        type,
        area,
        metrics: selectedMetrics,
      })
      onCreated(movement)
    } catch {
      setError("Failed to create movement. Please try again.")
      setSaving(false)
    }
  }

  return (
    <>
      <DialogHeader className="px-4 pt-4 pb-3 border-b border-border-neutral-default">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-foreground-neutral-faded hover:text-foreground-neutral-default transition-colors"
          >
            <ArrowLeft className="size-4" />
          </button>
          <DialogTitle>New movement</DialogTitle>
        </div>
      </DialogHeader>

      <div className="overflow-y-auto flex-1 px-4 py-4 space-y-5">
        <div className="space-y-1.5">
          <label className="text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded block">
            Name
          </label>
          <Input
            autoFocus
            placeholder="e.g. Romanian Deadlift"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        <div className="space-y-2">
          <label className="text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded block">
            Metrics
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_METRICS.map((metric) => {
              const active = selectedMetrics.includes(metric)
              return (
                <button
                  key={metric}
                  onClick={() => toggleMetric(metric)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-body-small-strong transition-colors border",
                    active
                      ? "bg-background-neutral-strong border-border-neutral-strong text-foreground-neutral-default"
                      : "bg-background-neutral-subtle border-border-neutral-default text-foreground-neutral-faded hover:border-border-neutral-strong hover:text-foreground-neutral-default",
                  )}
                >
                  {METRIC_LABELS[metric]}
                </button>
              )
            })}
          </div>
          {selectedMetrics.length === 0 && (
            <p className="text-body-small-default text-foreground-neutral-faded">
              Select at least one metric
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded block">
              Type
            </label>
            <Select value={type} onValueChange={(v) => setType(v as ExerciseType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="skill">Skill</SelectItem>
                <SelectItem value="conditioning">Conditioning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded block">
              Area
            </label>
            <Select value={area} onValueChange={(v) => setArea(v as ExerciseArea)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Body</SelectItem>
                <SelectItem value="upper">Upper</SelectItem>
                <SelectItem value="lower">Lower</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <p className="text-body-small-default text-foreground-neutral-faded">
            {error}
          </p>
        )}
      </div>

      <div className="px-4 py-3 border-t border-border-neutral-default">
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {saving ? "Creating…" : "Create movement"}
        </Button>
      </div>
    </>
  )
}
