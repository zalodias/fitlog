"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMovement, getMovements } from "@/lib/queries";
import { cn } from "@/lib/utils";
import type { ExerciseArea, ExerciseType, Movement } from "@/types/database";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const AREA_LABELS: Record<ExerciseArea, string> = {
  full: "Full Body",
  lower: "Lower",
  upper: "Upper",
};

const BADGE_STYLE =
  "bg-background-neutral-strong text-foreground-neutral-default border-border-neutral-default";

type FilterArea = ExerciseArea | "all";
type FilterType = ExerciseType | "all";

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Movement[]>([]);
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState<FilterArea>("all");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // New exercise form state
  const [newName, setNewName] = useState("");
  const [newArea, setNewArea] = useState<ExerciseArea>("full");
  const [newType, setNewType] = useState<ExerciseType>("strength");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMovements({
        area: filterArea !== "all" ? filterArea : undefined,
        type: filterType !== "all" ? filterType : undefined,
        search: search || undefined,
      });
      setExercises(data);
    } finally {
      setLoading(false);
    }
  }, [filterArea, filterType, search]);

  useEffect(() => {
    const timeout = setTimeout(load, 200);
    return () => clearTimeout(timeout);
  }, [load]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createMovement({
        name: newName.trim(),
        area: newArea,
        type: newType,
      });
      setDialogOpen(false);
      setNewName("");
      setNewArea("full");
      setNewType("strength");
      load();
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-title-large-strong">Exercises</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Add
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Exercise</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  placeholder="e.g. Bulgarian Split Squat"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Area</Label>
                  <Select
                    value={newArea}
                    onValueChange={(v) => setNewArea(v as ExerciseArea)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Body</SelectItem>
                      <SelectItem value="lower">Lower</SelectItem>
                      <SelectItem value="upper">Upper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select
                    value={newType}
                    onValueChange={(v) => setNewType(v as ExerciseType)}
                  >
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
              </div>
              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
              >
                {creating ? "Creating…" : "Create Exercise"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground-neutral-faded" />
          <Input
            placeholder="Search exercises…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Area filters */}
          <div className="flex gap-1.5">
            {(["all", "full", "lower", "upper"] as const).map((area) => (
              <button
                key={area}
                onClick={() => setFilterArea(area)}
                className={cn(
                  "px-3 py-1 rounded-full text-body-small-subtle uppercase tracking-wider border transition-colors",
                  filterArea === area
                    ? area === "all"
                      ? "bg-foreground-neutral-default text-background-neutral-default border-foreground-neutral-default"
                      : cn(BADGE_STYLE, "border")
                    : "border-border-neutral-default text-foreground-neutral-faded hover:border-foreground-neutral-default/30",
                )}
              >
                {area === "all" ? "All" : AREA_LABELS[area as ExerciseArea]}
              </button>
            ))}
          </div>

          <div className="w-px bg-border-neutral-default" />

          {/* Type filters */}
          <div className="flex gap-1.5">
            {(["all", "strength", "skill", "conditioning"] as const).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={cn(
                    "px-3 py-1 rounded-full text-body-small-subtle uppercase tracking-wider border transition-colors",
                    filterType === type
                      ? type === "all"
                        ? "bg-foreground-neutral-default text-background-neutral-default border-foreground-neutral-default"
                        : cn(BADGE_STYLE, "border")
                      : "border-border-neutral-default text-foreground-neutral-faded hover:border-foreground-neutral-default/30",
                  )}
                >
                  {type === "all"
                    ? "All"
                    : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Exercise list */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-2xl bg-background-neutral-subtle animate-pulse"
            />
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <p className="text-center text-body-medium-default text-foreground-neutral-faded py-16">
          No exercises found
        </p>
      ) : (
        <div className="space-y-2">
          {exercises.map((exercise) => (
            <Link
              key={exercise.id}
              href={`/movements/${exercise.id}`}
              className="flex items-center justify-between px-4 py-3 rounded-2xl bg-background-neutral-subtle hover:bg-background-neutral-strong transition-colors"
            >
              <div>
                <p className="text-body-medium-strong">{exercise.name}</p>
                {exercise.custom && (
                  <p className="text-body-small-default text-foreground-neutral-faded mt-0.5">
                    Custom
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-body-small-subtle uppercase tracking-wider border",
                    BADGE_STYLE,
                  )}
                >
                  {AREA_LABELS[exercise.area]}
                </span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-body-small-subtle uppercase tracking-wider border",
                    BADGE_STYLE,
                  )}
                >
                  {exercise.type}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
