"use client";

import { MovementPicker } from "@/components/movement-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPreviousBestWeight } from "@/lib/pr";
import {
  createExercise,
  createSession,
  createWorkout,
  createWorkoutMovement,
  upsertSet,
} from "@/lib/queries";
import { cn } from "@/lib/utils";
import type {
  Movement,
  SessionType,
  WorkoutFormat,
  WorkoutResult,
} from "@/types/database";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// ── Local form types ───────────────────────────────────────────────────────

interface SetForm {
  number: number;
  reps: string;
  weight: string;
  duration: string;
  effort: string;
}

interface ExerciseForm {
  movement: Movement | null;
  sets: SetForm[];
  pickerOpen: boolean;
  collapsed: boolean;
}

interface WorkoutMovementForm {
  movement: Movement | null;
  reps: string;
  weight: string;
  distance: string;
  pickerOpen: boolean;
}

interface WorkoutBlockForm {
  format: WorkoutFormat;
  cap: string;
  result: WorkoutResult;
  seconds: string;
  rounds: string;
  reps: string;
  movements: WorkoutMovementForm[];
  collapsed: boolean;
}

function emptySet(number: number): SetForm {
  return { number, reps: "", weight: "", duration: "", effort: "" };
}

function emptyExerciseForm(): ExerciseForm {
  return {
    movement: null,
    sets: [emptySet(1)],
    pickerOpen: true,
    collapsed: false,
  };
}

function emptyWorkoutBlock(): WorkoutBlockForm {
  return {
    format: "amrap",
    cap: "",
    result: "rounds_reps",
    seconds: "",
    rounds: "",
    reps: "",
    movements: [emptyWorkoutMovementForm()],
    collapsed: false,
  };
}

function emptyWorkoutMovementForm(): WorkoutMovementForm {
  return {
    movement: null,
    reps: "",
    weight: "",
    distance: "",
    pickerOpen: true,
  };
}

// ── Component ──────────────────────────────────────────────────────────────

export default function LogPage() {
  const router = useRouter();
  const today = format(new Date(), "yyyy-MM-dd");

  const [date, setDate] = useState(today);
  const [type, setType] = useState<SessionType>("mixed");
  const [exerciseBlocks, setExerciseBlocks] = useState<ExerciseForm[]>([]);
  const [workoutBlocks, setWorkoutBlocks] = useState<WorkoutBlockForm[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const showStrength = type === "strength" || type === "mixed";
  const showWorkout = type === "workout" || type === "mixed";

  // ── Exercise (strength) helpers ───────────────────────────────────────────

  function addExerciseBlock() {
    setExerciseBlocks((prev) => [...prev, emptyExerciseForm()]);
  }

  function removeExerciseBlock(index: number) {
    setExerciseBlocks((prev) => prev.filter((_, i) => i !== index));
  }

  function updateExerciseBlock(index: number, patch: Partial<ExerciseForm>) {
    setExerciseBlocks((prev) =>
      prev.map((block, i) => (i === index ? { ...block, ...patch } : block)),
    );
  }

  function addSet(blockIndex: number) {
    setExerciseBlocks((prev) =>
      prev.map((block, i) => {
        if (i !== blockIndex) return block;
        const next = block.sets.length + 1;
        return { ...block, sets: [...block.sets, emptySet(next)] };
      }),
    );
  }

  function removeSet(blockIndex: number, setIndex: number) {
    setExerciseBlocks((prev) =>
      prev.map((block, i) => {
        if (i !== blockIndex) return block;
        const filtered = block.sets
          .filter((_, si) => si !== setIndex)
          .map((s, si) => ({
            ...s,
            number: si + 1,
          }));
        return { ...block, sets: filtered };
      }),
    );
  }

  function updateSet(
    blockIndex: number,
    setIndex: number,
    patch: Partial<SetForm>,
  ) {
    setExerciseBlocks((prev) =>
      prev.map((block, i) => {
        if (i !== blockIndex) return block;
        return {
          ...block,
          sets: block.sets.map((s, si) =>
            si === setIndex ? { ...s, ...patch } : s,
          ),
        };
      }),
    );
  }

  // ── Workout block helpers ────────────────────────────────────────────────

  function addWorkoutBlock() {
    setWorkoutBlocks((prev) => [...prev, emptyWorkoutBlock()]);
  }

  function removeWorkoutBlock(index: number) {
    setWorkoutBlocks((prev) => prev.filter((_, i) => i !== index));
  }

  function updateWorkoutBlock(index: number, patch: Partial<WorkoutBlockForm>) {
    setWorkoutBlocks((prev) =>
      prev.map((block, i) => (i === index ? { ...block, ...patch } : block)),
    );
  }

  function addWorkoutMovement(blockIndex: number) {
    setWorkoutBlocks((prev) =>
      prev.map((block, i) => {
        if (i !== blockIndex) return block;
        return {
          ...block,
          movements: [...block.movements, emptyWorkoutMovementForm()],
        };
      }),
    );
  }

  function removeWorkoutMovement(blockIndex: number, movIndex: number) {
    setWorkoutBlocks((prev) =>
      prev.map((block, i) => {
        if (i !== blockIndex) return block;
        return {
          ...block,
          movements: block.movements.filter((_, mi) => mi !== movIndex),
        };
      }),
    );
  }

  function updateWorkoutMovement(
    blockIndex: number,
    movIndex: number,
    patch: Partial<WorkoutMovementForm>,
  ) {
    setWorkoutBlocks((prev) =>
      prev.map((block, i) => {
        if (i !== blockIndex) return block;
        return {
          ...block,
          movements: block.movements.map((m, mi) =>
            mi === movIndex ? { ...m, ...patch } : m,
          ),
        };
      }),
    );
  }

  // ── Save ─────────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const session = await createSession({ date, type });

      // Exercises (strength: one movement + sets)
      for (let bi = 0; bi < exerciseBlocks.length; bi++) {
        const block = exerciseBlocks[bi];
        if (!block.movement) continue;

        const ex = await createExercise({
          session_id: session.id,
          movement_id: block.movement.id,
          position: bi,
        });

        const previousBest = await getPreviousBestWeight(
          block.movement.id,
          session.id,
        );
        let sessionBest = previousBest;

        for (const set of block.sets) {
          const weight = set.weight ? Number(set.weight) : null;
          if (weight !== null && weight > sessionBest) {
            sessionBest = weight;
          }
          await upsertSet({
            exercise_id: ex.id,
            number: set.number,
            reps: set.reps ? Number(set.reps) : null,
            weight,
            duration: set.duration ? Number(set.duration) : null,
            effort: set.effort ? Number(set.effort) : null,
          });
        }
      }

      // Workout blocks
      for (let wi = 0; wi < workoutBlocks.length; wi++) {
        const block = workoutBlocks[wi];

        const wod = await createWorkout({
          session_id: session.id,
          format: block.format,
          cap: block.cap ? Number(block.cap) : null,
          position: wi,
        });

        const { supabase } = await import("@/lib/supabase");
        await supabase
          .from("workouts")
          .update({
            result: block.result || null,
            seconds: block.seconds ? Number(block.seconds) : null,
            rounds: block.rounds ? Number(block.rounds) : null,
            reps: block.reps ? Number(block.reps) : null,
          })
          .eq("id", wod.id);

        for (let mi = 0; mi < block.movements.length; mi++) {
          const mov = block.movements[mi];
          if (!mov.movement) continue;
          await createWorkoutMovement({
            workout_id: wod.id,
            movement_id: mov.movement.id,
            reps: mov.reps ? Number(mov.reps) : null,
            weight: mov.weight ? Number(mov.weight) : null,
            distance: mov.distance ? Number(mov.distance) : null,
            position: mi,
          });
        }
      }

      router.push("/");
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(false);
    }
  }

  const canSave =
    exerciseBlocks.some((b) => b.movement) ||
    workoutBlocks.some((b) => b.movements.some((m) => m.movement));

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-title-large-strong">Log Session</h1>

      {/* Date & Type */}
      <div className="bg-background-neutral-subtle rounded-2xl p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as SessionType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="workout">Workout</SelectItem>
                <SelectItem value="mixed">Strength + Workout</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Strength section */}
      {showStrength && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-body-medium-strong uppercase tracking-widest text-foreground-neutral-faded">
              Strength
            </h2>
          </div>

          {exerciseBlocks.map((block, bi) => (
            <ExerciseBlockCard
              key={bi}
              block={block}
              blockIndex={bi}
              onUpdate={(patch) => updateExerciseBlock(bi, patch)}
              onRemove={() => removeExerciseBlock(bi)}
              onAddSet={() => addSet(bi)}
              onRemoveSet={(si) => removeSet(bi, si)}
              onUpdateSet={(si, patch) => updateSet(bi, si, patch)}
            />
          ))}

          <Button
            variant="outline"
            className="w-full gap-2 border-dashed"
            onClick={addExerciseBlock}
          >
            <Plus className="size-4" />
            Add exercise
          </Button>
        </div>
      )}

      {/* Workout section */}
      {showWorkout && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-body-medium-strong uppercase tracking-widest text-foreground-neutral-faded">
              Workout
            </h2>
          </div>

          {workoutBlocks.map((block, wi) => (
            <WorkoutBlockCard
              key={wi}
              block={block}
              blockIndex={wi}
              onUpdate={(patch) => updateWorkoutBlock(wi, patch)}
              onRemove={() => removeWorkoutBlock(wi)}
              onAddMovement={() => addWorkoutMovement(wi)}
              onRemoveMovement={(mi) => removeWorkoutMovement(wi, mi)}
              onUpdateMovement={(mi, patch) =>
                updateWorkoutMovement(wi, mi, patch)
              }
            />
          ))}

          <Button
            variant="outline"
            className="w-full gap-2 border-dashed"
            onClick={addWorkoutBlock}
          >
            <Plus className="size-4" />
            Add Workout Block
          </Button>
        </div>
      )}

      {/* Save error */}
      {saveError && (
        <div className="rounded-xl bg-background-neutral-subtle border border-border-neutral-strong px-4 py-3 text-body-medium-default text-foreground-neutral-default">
          {saveError}
        </div>
      )}

      {/* Save */}
      <Button
        className="w-full h-12 text-body-large-strong"
        onClick={handleSave}
        disabled={saving || !canSave}
      >
        {saving ? "Saving…" : "Save Session"}
      </Button>
    </div>
  );
}

// ── Exercise Block Card (strength: one movement + sets) ─────────────────────

interface ExerciseBlockCardProps {
  block: ExerciseForm;
  blockIndex: number;
  onUpdate: (patch: Partial<ExerciseForm>) => void;
  onRemove: () => void;
  onAddSet: () => void;
  onRemoveSet: (si: number) => void;
  onUpdateSet: (si: number, patch: Partial<SetForm>) => void;
}

function ExerciseBlockCard({
  block,
  onUpdate,
  onRemove,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}: ExerciseBlockCardProps) {
  return (
    <div className="bg-background-neutral-subtle rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-neutral-default">
        <button
          onClick={() =>
            onUpdate({
              pickerOpen: true,
            })
          }
          className={cn(
            "flex-1 text-left text-body-medium-strong",
            !block.movement && "text-foreground-neutral-faded",
          )}
        >
          {block.movement ? block.movement.name : "Pick movement…"}
        </button>
        <button
          onClick={() => onUpdate({ collapsed: !block.collapsed })}
          className="text-foreground-neutral-faded hover:text-foreground-neutral-default p-1"
        >
          {block.collapsed ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronUp className="size-4" />
          )}
        </button>
        <button
          onClick={onRemove}
          className="text-foreground-neutral-faded hover:text-foreground-neutral-strong p-1"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {!block.collapsed && (
        <div className="px-4 py-3 space-y-2">
          {/* Column headers */}
          <div className="grid grid-cols-[1.5rem_1fr_1fr_1fr_1fr_1.5rem] gap-2 px-1">
            <span className="text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded">
              #
            </span>
            <span className="text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded">
              kg
            </span>
            <span className="text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded">
              Reps
            </span>
            <span className="text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded">
              Secs
            </span>
            <span className="text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded">
              RPE
            </span>
            <span />
          </div>

          {/* Set rows */}
          {block.sets.map((set, si) => (
            <div
              key={si}
              className="grid grid-cols-[1.5rem_1fr_1fr_1fr_1fr_1.5rem] gap-2 items-center"
            >
              <span className="text-body-small-default text-foreground-neutral-faded text-center">
                {set.number}
              </span>
              <Input
                type="number"
                placeholder="—"
                value={set.weight}
                onChange={(e) => onUpdateSet(si, { weight: e.target.value })}
                className="h-9 text-center px-2 text-body-large-strong"
              />
              <Input
                type="number"
                placeholder="—"
                value={set.reps}
                onChange={(e) => onUpdateSet(si, { reps: e.target.value })}
                className="h-9 text-center px-2 text-body-large-strong"
              />
              <Input
                type="number"
                placeholder="—"
                value={set.duration}
                onChange={(e) => onUpdateSet(si, { duration: e.target.value })}
                className="h-9 text-center px-2"
              />
              <Input
                type="number"
                placeholder="—"
                min={1}
                max={10}
                value={set.effort}
                onChange={(e) => onUpdateSet(si, { effort: e.target.value })}
                className="h-9 text-center px-2"
              />
              <button
                onClick={() => onRemoveSet(si)}
                className="text-foreground-neutral-faded hover:text-foreground-neutral-strong flex justify-center"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}

          <Button
            variant="ghost"
            size="small"
            className="w-full gap-1.5 text-muted-foreground"
            onClick={onAddSet}
          >
            <Plus className="size-3.5" />
            Add Set
          </Button>
        </div>
      )}

      <MovementPicker
        open={block.pickerOpen}
        onClose={() => onUpdate({ pickerOpen: false })}
        onSelect={(m) => onUpdate({ movement: m, pickerOpen: false })}
        selectedId={block.movement?.id}
      />
    </div>
  );
}

// ── Workout Block Card ────────────────────────────────────────────────────

interface WorkoutBlockCardProps {
  block: WorkoutBlockForm;
  blockIndex: number;
  onUpdate: (patch: Partial<WorkoutBlockForm>) => void;
  onRemove: () => void;
  onAddMovement: () => void;
  onRemoveMovement: (mi: number) => void;
  onUpdateMovement: (mi: number, patch: Partial<WorkoutMovementForm>) => void;
}

const FORMAT_LABELS: Record<WorkoutFormat, string> = {
  amrap: "AMRAP",
  for_time: "For Time",
  emom: "EMOM",
};

function WorkoutBlockCard({
  block,
  onUpdate,
  onRemove,
  onAddMovement,
  onRemoveMovement,
  onUpdateMovement,
}: WorkoutBlockCardProps) {
  const timeToSeconds = (mm: string, ss: string) =>
    (Number(mm) || 0) * 60 + (Number(ss) || 0);

  const secondsToMM = (s: string) =>
    Math.floor(Number(s) / 60)
      .toString()
      .padStart(2, "0");

  const secondsToSS = (s: string) =>
    (Number(s) % 60).toString().padStart(2, "0");

  return (
    <div className="bg-background-neutral-subtle rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border-neutral-default">
        <Select
          value={block.format}
          onValueChange={(v) => {
            const fmt = v as WorkoutFormat;
            onUpdate({
              format: fmt,
              result: fmt === "for_time" ? "time" : "rounds_reps",
            });
          }}
        >
          <SelectTrigger className="h-8 w-36 text-body-medium-strong">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="amrap">AMRAP</SelectItem>
            <SelectItem value="for_time">For Time</SelectItem>
            <SelectItem value="emom">EMOM</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1.5 flex-1">
          <Input
            type="number"
            placeholder="Cap"
            value={block.cap}
            onChange={(e) => onUpdate({ cap: e.target.value })}
            className="h-8 w-20 text-body-medium-default"
          />
          <span className="text-body-small-default text-foreground-neutral-faded">
            min
          </span>
        </div>

        <button
          onClick={() => onUpdate({ collapsed: !block.collapsed })}
          className="text-foreground-neutral-faded hover:text-foreground-neutral-default p-1"
        >
          {block.collapsed ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronUp className="size-4" />
          )}
        </button>
        <button
          onClick={onRemove}
          className="text-foreground-neutral-faded hover:text-foreground-neutral-strong p-1"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {!block.collapsed && (
        <div className="px-4 py-3 space-y-4">
          {/* Movements */}
          <div className="space-y-2">
            {block.movements.map((mov, mi) => (
              <div key={mi} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateMovement(mi, { pickerOpen: true })}
                    className={cn(
                      "flex-1 text-left text-body-medium-strong px-3 py-2 rounded-xl bg-background-neutral-subtle hover:bg-background-neutral-strong transition-colors",
                      !mov.movement && "text-foreground-neutral-faded",
                    )}
                  >
                    {mov.movement ? mov.movement.name : "Pick movement…"}
                  </button>
                  <button
                    onClick={() => onRemoveMovement(mi)}
                    className="text-foreground-neutral-faded hover:text-foreground-neutral-strong p-1"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <span className="text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded block">
                      Reps
                    </span>
                    <Input
                      type="number"
                      placeholder="—"
                      value={mov.reps}
                      onChange={(e) =>
                        onUpdateMovement(mi, { reps: e.target.value })
                      }
                      className="h-9 text-center text-body-large-strong"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded block">
                      kg
                    </span>
                    <Input
                      type="number"
                      placeholder="—"
                      value={mov.weight}
                      onChange={(e) =>
                        onUpdateMovement(mi, { weight: e.target.value })
                      }
                      className="h-9 text-center text-body-large-strong"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded block">
                      Meters
                    </span>
                    <Input
                      type="number"
                      placeholder="—"
                      value={mov.distance}
                      onChange={(e) =>
                        onUpdateMovement(mi, { distance: e.target.value })
                      }
                      className="h-9 text-center text-body-large-strong"
                    />
                  </div>
                </div>

                <MovementPicker
                  open={mov.pickerOpen}
                  onClose={() => onUpdateMovement(mi, { pickerOpen: false })}
                  onSelect={(m) =>
                    onUpdateMovement(mi, { movement: m, pickerOpen: false })
                  }
                  selectedId={mov.movement?.id}
                />
              </div>
            ))}

            <Button
              variant="ghost"
              size="small"
              className="w-full gap-1.5 text-muted-foreground"
              onClick={onAddMovement}
            >
              <Plus className="size-3.5" />
              Add movement
            </Button>
          </div>

          {/* Result */}
          <div className="border-t border-border-neutral-default pt-4 space-y-3">
            <p className="text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded">
              Result
            </p>

            {block.format === "for_time" && (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="00"
                  min={0}
                  value={block.seconds ? secondsToMM(block.seconds) : ""}
                  onChange={(e) => {
                    const ss = block.seconds ? secondsToSS(block.seconds) : "0";
                    onUpdate({
                      seconds: timeToSeconds(e.target.value, ss).toString(),
                    });
                  }}
                  className="h-12 text-center text-title-large-strong w-20"
                />
                <span className="text-body-large-strong text-foreground-neutral-faded">
                  :
                </span>
                <Input
                  type="number"
                  placeholder="00"
                  min={0}
                  max={59}
                  value={block.seconds ? secondsToSS(block.seconds) : ""}
                  onChange={(e) => {
                    const mm = block.seconds ? secondsToMM(block.seconds) : "0";
                    onUpdate({
                      seconds: timeToSeconds(mm, e.target.value).toString(),
                    });
                  }}
                  className="h-12 text-center text-title-large-strong w-20"
                />
                <span className="text-body-medium-default text-foreground-neutral-faded">
                  mm : ss
                </span>
              </div>
            )}

            {(block.format === "amrap" || block.format === "emom") && (
              <div className="flex items-center gap-3">
                <div className="space-y-1">
                  <span className="text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded block">
                    Rounds
                  </span>
                  <Input
                    type="number"
                    placeholder="—"
                    value={block.rounds}
                    onChange={(e) => onUpdate({ rounds: e.target.value })}
                    className="h-12 text-center text-title-large-strong w-24"
                  />
                </div>
                <span className="text-body-large-strong text-foreground-neutral-faded mt-5">
                  +
                </span>
                <div className="space-y-1">
                  <span className="text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded block">
                    Reps
                  </span>
                  <Input
                    type="number"
                    placeholder="—"
                    value={block.reps}
                    onChange={(e) => onUpdate({ reps: e.target.value })}
                    className="h-12 text-center text-title-large-strong w-24"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
