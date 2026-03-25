import { supabase } from "./supabase"
import type {
  Movement,
  ExerciseArea,
  ExerciseType,
  Metric,
  Session,
  SessionWithBlocks,
  PersonalRecord,
} from "@/types/database"

// ── Movements ───────────────────────────────────────────────────────────────

export async function getMovements(filters?: {
  area?: ExerciseArea;
  type?: ExerciseType;
  search?: string;
}): Promise<Movement[]> {
  let query = supabase.from("movements").select("*").order("name");

  if (filters?.area) query = query.eq("area", filters.area);
  if (filters?.type) query = query.eq("type", filters.type);
  if (filters?.search) query = query.ilike("name", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getMovement(id: string): Promise<Movement | null> {
  const { data, error } = await supabase
    .from("movements")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function createMovement(
  movement: Pick<Movement, "name" | "area" | "type" | "metrics">,
): Promise<Movement> {
  const { data, error } = await supabase
    .from("movements")
    .insert({ ...movement, custom: true })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Sessions ───────────────────────────────────────────────────────────────

export async function getSessions(
  startDate?: string,
  endDate?: string,
): Promise<Session[]> {
  let query = supabase
    .from("sessions")
    .select("*")
    .order("date", { ascending: false });
  if (startDate) query = query.gte("date", startDate);
  if (endDate) query = query.lte("date", endDate);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getSession(
  id: string,
): Promise<SessionWithBlocks | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select(
      `
      *,
      exercises (
        *,
        movement:movements(*),
        sets (*)
      ),
      workouts (
        *,
        workout_movements (
          *,
          movement:movements(*)
        )
      )
    `,
    )
    .eq("id", id)
    .single();
  if (error) return null;

  // Sort nested arrays by position / number
  if (data.exercises) {
    data.exercises.sort(
      (a: { position: number }, b: { position: number }) =>
        a.position - b.position,
    );
    data.exercises.forEach((ex: { sets?: { number: number }[] }) => {
      if (ex.sets) ex.sets.sort((a, b) => a.number - b.number);
    });
  }
  if (data.workouts) {
    data.workouts.sort(
      (a: { position: number }, b: { position: number }) =>
        a.position - b.position,
    );
    data.workouts.forEach(
      (wod: { workout_movements?: { position: number }[] }) => {
        if (wod.workout_movements)
          wod.workout_movements.sort((a, b) => a.position - b.position);
      },
    );
  }

  return data;
}

export async function getRecentSessions(
  limit = 5,
): Promise<SessionWithBlocks[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select(
      `
      *,
      exercises (id),
      workouts (id)
    `,
    )
    .order("date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as SessionWithBlocks[];
}

export async function createSession(
  session: Pick<Session, "date">,
): Promise<Session> {
  const { data, error } = await supabase
    .from("sessions")
    .insert(session)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase.from("sessions").delete().eq("id", id);
  if (error) throw error;
}

// ── Exercises (strength: one movement + sets) ───────────────────────────────

export async function createExercise(block: {
  session_id: string;
  movement_id: string;
  position: number;
}) {
  const { data, error } = await supabase
    .from("exercises")
    .insert(block)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExercise(id: string): Promise<void> {
  const { error } = await supabase.from("exercises").delete().eq("id", id);
  if (error) throw error;
}

// ── Sets ───────────────────────────────────────────────────────────────────

export async function upsertSet(set: {
  id?: string
  exercise_id: string
  number: number
  reps?: number | null
  weight?: number | null
  duration?: number | null
  distance?: number | null
  calories?: number | null
  effort?: number | null
}) {
  if (set.id) {
    const { data, error } = await supabase
      .from("sets")
      .update(set)
      .eq("id", set.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("sets")
      .insert(set)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function deleteSet(id: string): Promise<void> {
  const { error } = await supabase.from("sets").delete().eq("id", id);
  if (error) throw error;
}

export async function getSetsForMovement(movementId: string) {
  const { data, error } = await supabase
    .from("sets")
    .select(
      `
      *,
      exercise:exercises!inner(
        movement_id,
        session:sessions(date)
      )
    `,
    )
    .eq("exercise.movement_id", movementId)
    .order("exercise.session.date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPRForMovement(
  movementId: string,
): Promise<PersonalRecord | null> {
  const { data, error } = await supabase
    .from("sets")
    .select(
      `
      weight,
      reps,
      exercise:exercises!inner(
        movement_id,
        movement:movements(name),
        session:sessions(date)
      )
    `,
    )
    .eq("exercise.movement_id", movementId)
    .not("weight", "is", null)
    .order("weight", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  const ex = data.exercise as unknown as {
    movement: { name: string };
    session: { date: string };
    movement_id: string;
  };

  return {
    movement_id: movementId,
    movement_name: ex.movement.name,
    weight: data.weight as number,
    reps: data.reps as number,
    date: ex.session.date,
  };
}

// ── Workouts ───────────────────────────────────────────────────────────────

export async function createWorkout(workout: {
  session_id: string;
  format: string;
  cap?: number | null;
  position: number;
}) {
  const { data, error } = await supabase
    .from("workouts")
    .insert(workout)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateWorkout(
  id: string,
  fields: Partial<{
    result: string;
    seconds: number;
    rounds: number;
    reps: number;
    cap: number;
  }>,
) {
  const { data, error } = await supabase
    .from("workouts")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteWorkout(id: string): Promise<void> {
  const { error } = await supabase.from("workouts").delete().eq("id", id);
  if (error) throw error;
}

export async function createWorkoutMovement(we: {
  workout_id: string
  movement_id: string
  reps?: number | null
  weight?: number | null
  distance?: number | null
  duration?: number | null
  calories?: number | null
  position: number
}) {
  const { data, error } = await supabase
    .from("workout_movements")
    .insert(we)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteWorkoutMovement(id: string): Promise<void> {
  const { error } = await supabase
    .from("workout_movements")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ── Stats ──────────────────────────────────────────────────────────────────

export async function getStreak(): Promise<number> {
  const { data, error } = await supabase
    .from("sessions")
    .select("date")
    .order("date", { ascending: false });

  if (error || !data || data.length === 0) return 0;

  const dates = [...new Set(data.map((s: { date: string }) => s.date))]
    .sort()
    .reverse();

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < dates.length; i++) {
    const sessionDate = new Date(dates[i]);
    sessionDate.setHours(0, 0, 0, 0);

    const expected = new Date(today);
    expected.setDate(today.getDate() - i);

    if (sessionDate.getTime() === expected.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export async function getWeeklyVolume(): Promise<number> {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("sessions")
    .select(
      `
      id,
      exercises (
        sets (weight, reps)
      )
    `,
    )
    .gte("date", startOfWeek.toISOString().split("T")[0]);

  if (error || !data) return 0;

  let volume = 0;
  for (const session of data) {
    for (const ex of (session.exercises ?? []) as {
      sets: { weight: number | null; reps: number | null }[];
    }[]) {
      for (const set of ex.sets ?? []) {
        if (set.weight && set.reps) {
          volume += set.weight * set.reps;
        }
      }
    }
  }

  return Math.round(volume);
}

export async function getTopPRs(limit = 10): Promise<PersonalRecord[]> {
  const { data: movements } = await supabase
    .from("movements")
    .select("id, name")
    .contains("metrics", ["weight"] as Metric[])

  if (!movements) return [];

  const prs: PersonalRecord[] = [];

  for (const movement of movements) {
    const pr = await getPRForMovement(movement.id);
    if (pr) prs.push(pr);
  }

  return prs.sort((a, b) => b.weight - a.weight).slice(0, limit);
}
