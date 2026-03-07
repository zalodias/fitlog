"use client";

import { Button } from "@/components/ui/button";
import { getRecentSessions, getStreak, getWeeklyVolume } from "@/lib/queries";
import type { Session } from "@/types/database";
import { format, isToday, isYesterday } from "date-fns";
import {
  ArrowRight,
  Dumbbell,
  Flame,
  Layers,
  Plus,
  Weight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const SESSION_TYPE_ICONS = {
  strength: Dumbbell,
  workout: Zap,
  mixed: Layers,
};

const SESSION_TYPE_COLORS = "text-foreground-neutral-default";

const SESSION_TYPE_LABELS = {
  strength: "Strength",
  workout: "Workout",
  mixed: "Strength + Workout",
};

function formatSessionDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE, MMM d");
}

export default function DashboardPage() {
  const [streak, setStreak] = useState<number | null>(null);
  const [weeklyVolume, setWeeklyVolume] = useState<number | null>(null);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, v, rs] = await Promise.all([
        getStreak(),
        getWeeklyVolume(),
        getRecentSessions(5),
      ]);
      setStreak(s);
      setWeeklyVolume(v);
      setRecentSessions(rs);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Greeting */}
      <div>
        <p className="text-body-medium-strong text-foreground-neutral-faded uppercase tracking-widest">
          {format(new Date(), "EEEE, MMMM d")}
        </p>
        <h1 className="text-display-small-strong mt-1">Fitlog</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-background-neutral-subtle rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="size-4 text-foreground-neutral-faded" />
            <p className="text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded">
              Streak
            </p>
          </div>
          {loading ? (
            <div className="h-10 w-16 bg-background-neutral-subtle rounded animate-pulse" />
          ) : (
            <p className="text-display-medium-strong">
              {streak}
              <span className="text-body-large-strong text-foreground-neutral-faded ml-2">
                {streak === 1 ? "day" : "days"}
              </span>
            </p>
          )}
        </div>

        <div className="bg-background-neutral-subtle rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Weight className="size-4 text-foreground-neutral-faded" />
            <p className="text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded">
              This Week
            </p>
          </div>
          {loading ? (
            <div className="h-10 w-20 bg-background-neutral-subtle rounded animate-pulse" />
          ) : (
            <p className="text-display-medium-strong">
              {(weeklyVolume ?? 0).toLocaleString()}
              <span className="text-body-large-strong text-foreground-neutral-faded ml-2">
                kg
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Recent sessions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-body-medium-strong uppercase tracking-widest text-foreground-neutral-faded">
            Recent
          </h2>
          <Link
            href="/calendar"
            className="flex items-center gap-1 text-body-small-default text-foreground-neutral-faded hover:text-foreground-neutral-default transition-colors"
          >
            Calendar <ArrowRight className="size-3" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 bg-background-neutral-subtle rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : recentSessions.length === 0 ? (
          <div className="bg-background-neutral-subtle rounded-2xl p-6 text-center text-body-medium-default text-foreground-neutral-faded">
            No sessions yet. Log your first one!
          </div>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((session) => {
              const Icon = SESSION_TYPE_ICONS[session.type];
              return (
                <div
                  key={session.id}
                  className="flex items-center gap-4 bg-background-neutral-subtle rounded-2xl px-4 py-3.5"
                >
                  <div
                    className={`flex size-9 items-center justify-center rounded-xl bg-background-neutral-strong ${SESSION_TYPE_COLORS}`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-medium-strong">
                      {SESSION_TYPE_LABELS[session.type]}
                    </p>
                    <p className="text-body-small-default text-foreground-neutral-faded">
                      {formatSessionDate(session.date)}
                    </p>
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
