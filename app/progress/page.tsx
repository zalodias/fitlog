"use client";

import { getStreak, getTopPRs, getWeeklyVolume } from "@/lib/queries";
import type { PersonalRecord } from "@/types/database";
import { format } from "date-fns";
import { Flame, Trophy, Weight } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProgressPage() {
  const [streak, setStreak] = useState<number | null>(null);
  const [weeklyVolume, setWeeklyVolume] = useState<number | null>(null);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, v, p] = await Promise.all([
        getStreak(),
        getWeeklyVolume(),
        getTopPRs(20),
      ]);
      setStreak(s);
      setWeeklyVolume(v);
      setPrs(p);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-title-large-strong">Progress</h1>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-background-neutral-subtle rounded-2xl p-5 space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="size-4 text-foreground-neutral-faded" />
            <p className="text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded">
              Streak
            </p>
          </div>
          {loading ? (
            <div className="h-10 w-20 bg-background-neutral-subtle rounded animate-pulse" />
          ) : (
            <p className="text-display-medium-strong">
              {streak}
              <span className="text-body-large-strong text-foreground-neutral-faded ml-2">
                {streak === 1 ? "day" : "days"}
              </span>
            </p>
          )}
        </div>

        <div className="bg-background-neutral-subtle rounded-2xl p-5 space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Weight className="size-4 text-foreground-neutral-faded" />
            <p className="text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded">
              This Week
            </p>
          </div>
          {loading ? (
            <div className="h-10 w-24 bg-background-neutral-subtle rounded animate-pulse" />
          ) : (
            <p className="text-display-medium-strong">
              {weeklyVolume?.toLocaleString()}
              <span className="text-body-large-strong text-foreground-neutral-faded ml-2">
                kg
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Personal records */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="size-4 text-foreground-neutral-default" />
          <h2 className="text-body-medium-strong uppercase tracking-widest text-foreground-neutral-faded">
            Personal Records
          </h2>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 bg-background-neutral-subtle rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : prs.length === 0 ? (
          <div className="bg-background-neutral-subtle rounded-2xl p-6 text-center text-body-medium-default text-foreground-neutral-faded">
            No PRs yet — log some weighted sets to start tracking.
          </div>
        ) : (
          <div className="space-y-2">
            {prs.map((pr, i) => (
              <div
                key={pr.movement_id}
                className="flex items-center gap-4 bg-background-neutral-subtle rounded-2xl px-4 py-3"
              >
                <span className="text-body-small-subtle text-foreground-neutral-faded w-6 text-center">
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-body-medium-strong truncate">
                    {pr.movement_name}
                  </p>
                  <p className="text-body-small-default text-foreground-neutral-faded">
                    {format(new Date(pr.date), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-title-small-strong">
                    {pr.weight}
                    <span className="text-body-medium-strong text-foreground-neutral-faded ml-1">
                      kg
                    </span>
                  </p>
                  {pr.reps && (
                    <p className="text-body-small-default text-foreground-neutral-faded">
                      × {pr.reps}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
