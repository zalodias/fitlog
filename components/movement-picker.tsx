"use client";

import { useState, useEffect } from "react";
import { Search, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getMovements } from "@/lib/queries";
import type { Movement, ExerciseArea, ExerciseType } from "@/types/database";
import { cn } from "@/lib/utils";

const AREA_LABELS: Record<ExerciseArea, string> = {
  full: "Full Body",
  lower: "Lower",
  upper: "Upper",
};

const TYPE_COLORS = "text-foreground-neutral-faded";

interface MovementPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (movement: Movement) => void;
  selectedId?: string;
}

export function MovementPicker({
  open,
  onClose,
  onSelect,
  selectedId,
}: MovementPickerProps) {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const timeout = setTimeout(async () => {
      const data = await getMovements({ search: search || undefined });
      setMovements(data);
      setLoading(false);
    }, 150);
    return () => clearTimeout(timeout);
  }, [open, search]);

  function handleSelect(movement: Movement) {
    onSelect(movement);
    setSearch("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-border-neutral-default">
          <DialogTitle>Pick a movement</DialogTitle>
        </DialogHeader>
        <div className="px-4 py-3 border-b border-border-neutral-default">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground-neutral-faded" />
            <Input
              autoFocus
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-xl bg-background-neutral-subtle animate-pulse"
                />
              ))}
            </div>
          ) : movements.length === 0 ? (
            <p className="text-center text-body-medium-default text-foreground-neutral-faded py-8">
              No movements found
            </p>
          ) : (
            <div className="p-2 space-y-0.5">
              {movements.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelect(m)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors text-left",
                    m.id === selectedId
                      ? "bg-background-neutral-strong text-foreground-neutral-default"
                      : "hover:bg-background-neutral-strong",
                  )}
                >
                  <div>
                    <p className="text-body-medium-strong">{m.name}</p>
                    <p className={cn("text-body-small-default mt-0.5", TYPE_COLORS)}>
                      {AREA_LABELS[m.area]} · {m.type}
                    </p>
                  </div>
                  {m.id === selectedId && (
                    <Check className="size-4 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
