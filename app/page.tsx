"use client";

import { MonthCalendar } from "@/components/month-calendar";
import {
  getRecentSessions,
  getSessions,
  getStreak,
  getWeeklyVolume,
} from "@/lib/queries";
import { deriveSessionIcon, deriveSessionLabel } from "@/lib/session";
import type { SessionWithBlocks } from "@/types/database";
import {
  endOfMonth,
  format,
  isToday,
  isYesterday,
  startOfMonth,
} from "date-fns";
import { ArrowRight, Flame, Weight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const SESSION_TYPE_COLORS = "text-foreground-neutral-default";

function formatSessionDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE, MMM d");
}

export default function DashboardPage() {
  const [streak, setStreak] = useState<number | null>(null);
  const [weeklyVolume, setWeeklyVolume] = useState<number | null>(null);
  const [recentSessions, setRecentSessions] = useState<SessionWithBlocks[]>([]);
  const [monthTrainedDates, setMonthTrainedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const today = new Date();
      const monthStart = format(startOfMonth(today), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(today), "yyyy-MM-dd");
      const [s, v, rs, ms] = await Promise.all([
        getStreak(),
        getWeeklyVolume(),
        getRecentSessions(5),
        getSessions(monthStart, monthEnd),
      ]);
      setStreak(s);
      setWeeklyVolume(v);
      setRecentSessions(rs);
      setMonthTrainedDates(ms.map((session) => session.date));
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-display-small-strong">Hey, Gonçalo</h1>
        {loading ? (
          <div className="h-5 w-52 bg-background-neutral-subtle rounded-lg animate-pulse mt-2" />
        ) : streak === 0 || streak === null ? (
          <p className="text-title-medium-strong text-foreground-neutral-faded">
            Start your streak today!
          </p>
        ) : (
          <p className="text-title-medium-strong text-foreground-neutral-faded">
            You are on a{" "}
            <span className="text-foreground-brand-default">{streak}</span>
            <span className="text-foreground-neutral-default">
              {" "}
              {streak === 1 ? "day" : "days"} streak.
            </span>
          </p>
        )}
      </div>
      <MonthCalendar trainedDates={monthTrainedDates} isLoading={loading} />

      {/* Recent sessions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-title-large-strong">Recent</h2>
          <Link href="/calendar">
            <ArrowRight className="size-5 text-foreground-neutral-faded" />
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
              const Icon = deriveSessionIcon(session);
              return (
                <div
                  key={session.id}
                  className="flex items-center gap-4 bg-background-neutral-subtle rounded-2xl px-4 py-4"
                >
                  <div
                    className={`flex size-9 items-center justify-center rounded-xl bg-background-neutral-strong ${SESSION_TYPE_COLORS}`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-body-large-strong">
                      {deriveSessionLabel(session)}
                    </p>
                    <p className="text-body-medium-default text-foreground-neutral-faded">
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
