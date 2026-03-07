import { supabase } from "./supabase";

/**
 * Returns the previous best weight for a movement (excluding the current session).
 * Used to detect personal records at log time.
 */
export async function getPreviousBestWeight(
  movementId: string,
  beforeSessionId?: string,
): Promise<number> {
  let query = supabase
    .from("sets")
    .select(
      `
      weight,
      exercise:exercises!inner(
        movement_id,
        session_id
      )
    `,
    )
    .eq("exercise.movement_id", movementId)
    .not("weight", "is", null);

  if (beforeSessionId) {
    query = query.neq("exercise.session_id", beforeSessionId);
  }

  const { data, error } = await query
    .order("weight", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return 0;
  return (data[0].weight as number) ?? 0;
}

/**
 * Given a list of weights from the current session, returns those that beat the previous best.
 */
export function detectPRs(
  weights: (number | null)[],
  previousBest: number,
): boolean[] {
  let sessionBest = previousBest;
  return weights.map((w) => {
    if (w === null) return false;
    if (w > sessionBest) {
      sessionBest = w;
      return true;
    }
    return false;
  });
}
