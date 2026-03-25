"use client";

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Check } from "lucide-react";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

interface MonthCalendarProps {
  trainedDates: string[];
  isLoading: boolean;
}

export function MonthCalendar({ trainedDates, isLoading }: MonthCalendarProps) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const trained = new Set(trainedDates);

  if (isLoading) {
    return (
      <div className="space-y-1">
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="flex items-center justify-center h-7">
              <span className="text-body-small-subtle uppercase text-foreground-neutral-faded">
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl bg-background-neutral-strong animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((label, i) => (
          <div key={i} className="flex items-center justify-center h-7">
            <span className="text-body-small-subtle uppercase text-foreground-neutral-faded">
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, today);
          const isTrained = trained.has(dateStr);
          const isCurrentDay = isToday(day);

          if (!inMonth) {
            return <div key={i} />;
          }

          return (
            <div
              key={i}
              className={[
                "flex items-center justify-center aspect-square rounded-lg",
                isTrained
                  ? "bg-background-brand-default"
                  : isCurrentDay
                    ? "bg-background-neutral-strong ring-1 ring-foreground-neutral-faded"
                    : "bg-background-neutral-subtle",
              ].join(" ")}
            >
              {isTrained ? (
                <div className="bg-background-neutral-default rounded-full p-1">
                  <Check
                    className="size-3 text-foreground-brand-default"
                    strokeWidth={4}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
