export type ExerciseArea = "full" | "lower" | "upper";
export type ExerciseType = "strength" | "skill" | "conditioning";
export type SessionType = "strength" | "workout" | "mixed";
export type WorkoutFormat = "amrap" | "for_time" | "emom";
export type WorkoutResult = "time" | "rounds_reps" | "score";

export interface Movement {
  id: string;
  name: string;
  area: ExerciseArea;
  type: ExerciseType;
  custom: boolean;
  created_at: string;
}

export interface Session {
  id: string;
  date: string;
  type: SessionType;
  created_at: string;
}

export interface Exercise {
  id: string;
  session_id: string;
  movement_id: string;
  position: number;
  movement?: Movement;
  sets?: Set[];
}

export interface Set {
  id: string;
  exercise_id: string;
  number: number;
  reps: number | null;
  weight: number | null;
  duration: number | null;
  effort: number | null;
  is_pr?: boolean;
}

export interface Workout {
  id: string;
  session_id: string;
  format: WorkoutFormat;
  cap: number | null;
  result: WorkoutResult | null;
  seconds: number | null;
  rounds: number | null;
  reps: number | null;
  position: number;
  workout_movements?: WorkoutMovement[];
}

export interface WorkoutMovement {
  id: string;
  workout_id: string;
  movement_id: string;
  reps: number | null;
  weight: number | null;
  distance: number | null;
  position: number;
  movement?: Movement;
}

export interface SessionWithBlocks extends Session {
  exercises?: Exercise[];
  workouts?: Workout[];
}

export interface PersonalRecord {
  movement_id: string;
  movement_name: string;
  weight: number;
  reps: number;
  date: string;
}
