"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import {
  getMovement,
  getSetsForMovement,
  getPRForMovement,
} from "@/lib/queries";
import type { Movement, PersonalRecord } from "@/types/database";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const AREA_LABELS: Record<string, string> = {
  full: "Full Body",
  lower: "Lower",
  upper: "Upper",
};

const BADGE_STYLE =
  "bg-background-neutral-strong text-foreground-neutral-default border-border-neutral-default";

interface SetRow {
  id: string;
  number: number;
  reps: number | null;
  weight: number | null;
  duration: number | null;
  effort: number | null;
  exercise: {
    session: { date: string };
  };
}

export default function MovementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [movement, setMovement] = useState<Movement | null>(null);
  const [sets, setSets] = useState<SetRow[]>([]);
  const [pr, setPr] = useState<PersonalRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [m, setsData, prData] = await Promise.all([
        getMovement(id),
        getSetsForMovement(id),
        getPRForMovement(id),
      ]);
      setMovement(m);
      setSets(setsData as SetRow[]);
      setPr(prData);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="h-8 w-40 bg-background-neutral-subtle rounded animate-pulse" />
        <div className="h-24 bg-background-neutral-subtle rounded-2xl animate-pulse" />
        <div className="h-48 bg-background-neutral-subtle rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!movement) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <p className="text-foreground-neutral-faded">Movement not found.</p>
      </div>
    );
  }

  const grouped = sets.reduce<Record<string, SetRow[]>>((acc, set) => {
    const date = set.exercise?.session?.date ?? "unknown";
    if (!acc[date]) acc[date] = [];
    acc[date].push(set);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort().reverse();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <Link
        href="/movements"
        className="inline-flex items-center gap-1.5 text-body-medium-default text-foreground-neutral-faded hover:text-foreground-neutral-default transition-colors"
      >
        <ArrowLeft className="size-4" />
        Movements
      </Link>

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-display-small-strong">
            {movement.name}
          </h1>
          {movement.custom && (
            <span className="text-body-small-subtle text-foreground-neutral-faded uppercase tracking-widest mt-1">
              Custom
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-body-small-subtle uppercase tracking-wider border",
              BADGE_STYLE,
            )}
          >
            {AREA_LABELS[movement.area]}
          </span>
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-body-small-subtle uppercase tracking-wider border",
              BADGE_STYLE,
            )}
          >
            {movement.type}
          </span>
        </div>
      </div>

      {pr ? (
        <div className="bg-background-neutral-subtle rounded-2xl p-5 flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-background-neutral-strong">
            <Trophy className="size-6 text-foreground-neutral-default" />
          </div>
          <div>
            <p className="text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded mb-1">
              Personal Record
            </p>
            <p className="text-display-small-strong">
              {pr.weight}{" "}
              <span className="text-title-small-strong text-foreground-neutral-faded">
                kg
              </span>
              {pr.reps && (
                <span className="text-title-medium-strong text-foreground-neutral-faded ml-3">
                  × {pr.reps}
                </span>
              )}
            </p>
            <p className="text-body-small-default text-foreground-neutral-faded mt-1">
              {format(new Date(pr.date), "MMMM d, yyyy")}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-background-neutral-subtle rounded-2xl p-5 text-center text-body-medium-default text-foreground-neutral-faded">
          No weight recorded yet — log a set to start tracking.
        </div>
      )}

      <div>
        <h2 className="text-body-medium-strong uppercase tracking-widest text-foreground-neutral-faded mb-3">
          History
        </h2>

        {sortedDates.length === 0 ? (
          <p className="text-center text-body-medium-default text-foreground-neutral-faded py-10">
            No sets logged yet
          </p>
        ) : (
          <div className="space-y-4">
            {sortedDates.map((date) => {
              const dateSets = grouped[date].sort(
                (a, b) => a.number - b.number,
              );
              const dayPR = Math.max(...dateSets.map((s) => s.weight ?? 0));

              return (
                <div
                  key={date}
                  className="bg-background-neutral-subtle rounded-2xl overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border-neutral-default">
                    <p className="text-body-medium-strong">
                      {format(new Date(date), "EEEE, MMMM d yyyy")}
                    </p>
                  </div>
                  <div className="divide-y divide-border-neutral-default">
                    {dateSets.map((set) => {
                      const isTopWeight =
                        set.weight !== null &&
                        set.weight === dayPR &&
                        dayPR > 0;
                      const isPR =
                        isTopWeight && pr && set.weight === pr.weight;
                      return (
                        <div
                          key={set.id}
                          className="flex items-center justify-between px-4 py-2.5"
                        >
                          <span className="text-body-small-default text-foreground-neutral-faded w-8">
                            #{set.number}
                          </span>
                          <div className="flex items-center gap-4 flex-1 justify-end">
                            {set.weight !== null && (
                              <span className="text-body-large-strong">
                                {set.weight}{" "}
                                <span className="text-body-small-default text-foreground-neutral-faded">
                                  kg
                                </span>
                              </span>
                            )}
                            {set.reps !== null && (
                              <span className="text-body-large-strong">× {set.reps}</span>
                            )}
                            {set.duration !== null && (
                              <span className="text-body-medium-default text-foreground-neutral-faded">
                                {set.duration}s
                              </span>
                            )}
                            {set.effort !== null && (
                              <span className="text-body-small-default text-foreground-neutral-faded">
                                RPE {set.effort}
                              </span>
                            )}
                            {isPR && (
                              <span className="flex items-center gap-1 text-body-small-subtle uppercase tracking-wider text-foreground-neutral-default">
                                <Trophy className="size-3" /> PR
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
