"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSessions, getSession } from "@/lib/queries";
import { deriveSessionIcon, deriveSessionLabel } from "@/lib/session";
import type { Session, SessionWithBlocks } from "@/types/database";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { cn } from "@/lib/utils";

const SESSION_TYPE_COLORS = "bg-foreground-neutral-default";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSession, setSelectedSession] =
    useState<SessionWithBlocks | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Load sessions for current month
  useEffect(() => {
    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
    getSessions(start, end).then(setSessions);
  }, [currentMonth]);

  // Load session detail when date selected
  useEffect(() => {
    if (!selectedDate) {
      setSelectedSession(null);
      return;
    }
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const session = sessions.find((s) => s.date === dateStr);
    if (!session) {
      setSelectedSession(null);
      return;
    }
    setLoadingDetail(true);
    getSession(session.id).then((data) => {
      setSelectedSession(data);
      setLoadingDetail(false);
    });
  }, [selectedDate, sessions]);

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const sessionsByDate = sessions.reduce<Record<string, Session>>(
    (acc, s) => ({ ...acc, [s.date]: s }),
    {},
  );

  function prevMonth() {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1));
    setSelectedDate(null);
  }

  function nextMonth() {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1));
    setSelectedDate(null);
  }

  function handleDayClick(day: Date) {
    if (isSameDay(day, selectedDate ?? new Date(0))) {
      setSelectedDate(null);
    } else {
      setSelectedDate(day);
    }
  }

  const selectedDateStr = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : null;
  const selectedDaySession = selectedDateStr
    ? sessionsByDate[selectedDateStr]
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <h1 className="text-title-large-strong">
          {format(currentMonth, "MMMM yyyy")}
        </h1>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-background-neutral-subtle rounded-2xl overflow-hidden">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-border-neutral-default">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="py-2 text-center text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const session = sessionsByDate[dateStr];
            const inMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate
              ? isSameDay(day, selectedDate)
              : false;
            const todayDay = isToday(day);

            return (
              <button
                key={i}
                onClick={() => inMonth && handleDayClick(day)}
                disabled={!inMonth}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-3 transition-colors border-b border-r border-border-neutral-default",
                  "[&:nth-child(7n)]:border-r-0",
                  inMonth
                    ? "hover:bg-background-neutral-strong cursor-pointer"
                    : "opacity-20 cursor-default",
                  isSelected && "bg-background-neutral-strong",
                )}
              >
                <span
                  className={cn(
                    "text-body-medium-strong w-7 h-7 flex items-center justify-center rounded-full",
                    todayDay &&
                      "bg-foreground-neutral-default text-background-neutral-default",
                    isSelected &&
                      !todayDay &&
                      "text-foreground-neutral-default",
                  )}
                >
                  {format(day, "d")}
                </span>
                {session && (
                  <span
                    className={cn("size-1.5 rounded-full", SESSION_TYPE_COLORS)}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-body-small-default text-foreground-neutral-faded">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-foreground-neutral-default" />{" "}
          Session
        </span>
      </div>

      {/* Session detail panel */}
      {selectedDate && (
        <div className="bg-background-neutral-subtle rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border-neutral-default">
            <p className="text-body-large-strong">
              {format(selectedDate, "EEEE, MMMM d")}
            </p>
          </div>

          {!selectedDaySession ? (
            <p className="text-center text-body-medium-default text-foreground-neutral-faded py-8">
              No session logged on this day
            </p>
          ) : loadingDetail ? (
            <div className="p-4 space-y-2">
              <div className="h-8 bg-background-neutral-subtle rounded animate-pulse" />
              <div className="h-8 bg-background-neutral-subtle rounded animate-pulse" />
            </div>
          ) : selectedSession ? (
            <div className="divide-y divide-border">
              {/* Session type badge */}
              <div className="px-4 py-3 flex items-center gap-2">
                {(() => {
                  const Icon = deriveSessionIcon(selectedSession);
                  return (
                    <>
                      <Icon className="size-4 text-foreground-neutral-faded" />
                      <span className="text-body-medium-strong capitalize">
                        {deriveSessionLabel(selectedSession)}
                      </span>
                    </>
                  );
                })()}
              </div>

              {/* Exercises (strength) */}
              {selectedSession.exercises &&
                selectedSession.exercises.length > 0 && (
                  <div className="px-4 py-3 space-y-2">
                    <p className="text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded">
                      Strength
                    </p>
                    {selectedSession.exercises.map((ex) => (
                      <div key={ex.id}>
                        <p className="text-body-medium-strong">
                          {ex.movement?.name}
                        </p>
                        <p className="text-body-small-default text-foreground-neutral-faded">
                          {ex.sets?.length ?? 0} set
                          {(ex.sets?.length ?? 0) !== 1 ? "s" : ""}
                          {ex.sets &&
                            ex.sets.length > 0 &&
                            ex.sets[0].weight && (
                              <>
                                {" "}
                                · up to{" "}
                                {Math.max(
                                  ...ex.sets.map((s) => s.weight ?? 0),
                                )}{" "}
                                kg
                              </>
                            )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              {/* Workout blocks */}
              {selectedSession.workouts &&
                selectedSession.workouts.length > 0 && (
                  <div className="px-4 py-3 space-y-2">
                    <p className="text-body-small-subtle uppercase tracking-widest text-foreground-neutral-faded">
                      Workout
                    </p>
                    {selectedSession.workouts.map((wod) => (
                      <div key={wod.id}>
                        <p className="text-body-medium-strong uppercase">
                          {wod.format.replace("_", " ")}
                          {wod.cap ? ` · ${wod.cap} min` : ""}
                        </p>
                        <p className="text-body-small-default text-foreground-neutral-faded">
                          {wod.workout_movements
                            ?.map((wm) => wm.movement?.name)
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        {(wod.seconds || wod.rounds !== null) && (
                          <p className="text-body-medium-strong mt-1">
                            {wod.seconds
                              ? `${Math.floor(wod.seconds / 60)}:${String(wod.seconds % 60).padStart(2, "0")}`
                              : `${wod.rounds ?? 0} rds + ${wod.reps ?? 0} reps`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
