import type { SessionWithBlocks } from "@/types/database";
import type { LucideIcon } from "lucide-react";
import { Dumbbell, Layers, Zap } from "lucide-react";

export function deriveSessionLabel(session: SessionWithBlocks): string {
  const hasStrength = (session.exercises?.length ?? 0) > 0;
  const hasWorkout = (session.workouts?.length ?? 0) > 0;
  if (hasStrength && hasWorkout) return "Strength + Workout";
  if (hasWorkout) return "Workout";
  if (hasStrength) return "Strength";
  return "Session";
}

export function deriveSessionIcon(session: SessionWithBlocks): LucideIcon {
  const hasStrength = (session.exercises?.length ?? 0) > 0;
  const hasWorkout = (session.workouts?.length ?? 0) > 0;
  if (hasStrength && hasWorkout) return Layers;
  if (hasWorkout) return Zap;
  if (hasStrength) return Dumbbell;
  return Dumbbell;
}
