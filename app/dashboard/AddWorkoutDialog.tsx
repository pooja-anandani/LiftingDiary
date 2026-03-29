"use client";

import * as React from "react";
import { Plus, Trash2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { createWorkout } from "./actions";
import type { Exercise } from "@/data/exercises";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WORKOUT_TYPES = [
  {
    id: "Push",
    label: "Push Day",
    description: "Chest · Shoulders · Triceps",
    emoji: "🔼",
  },
  {
    id: "Pull",
    label: "Pull Day",
    description: "Back · Biceps · Rear Delts",
    emoji: "🔽",
  },
  {
    id: "Legs",
    label: "Leg Day",
    description: "Quads · Hamstrings · Glutes · Calves",
    emoji: "🦵",
  },
  {
    id: "Custom",
    label: "Custom",
    description: "Build your own workout",
    emoji: "✏️",
  },
] as const;

type WorkoutTypeId = (typeof WORKOUT_TYPES)[number]["id"];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SetRow {
  reps: string;
  weightLbs: string;
}

interface ExerciseRow {
  exerciseId: string;
  sets: SetRow[];
}

function emptySet(): SetRow {
  return { reps: "", weightLbs: "" };
}

function emptyExercise(): ExerciseRow {
  return { exerciseId: "", sets: [emptySet()] };
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  exercises: Exercise[];
  selectedDate: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AddWorkoutDialog({ exercises, selectedDate }: Props) {
  const [open, setOpen] = React.useState(false);

  // ── Wizard step ────────────────────────────────────────────────────────────
  const [step, setStep] = React.useState<"type" | "builder">("type");
  const [workoutType, setWorkoutType] = React.useState<WorkoutTypeId | null>(
    null
  );

  // ── Form state ─────────────────────────────────────────────────────────────
  const [name, setName] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [startTime, setStartTime] = React.useState("08:00");
  const [endTime, setEndTime] = React.useState("");
  const [exerciseRows, setExerciseRows] = React.useState<ExerciseRow[]>([
    emptyExercise(),
  ]);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // ── Reset ──────────────────────────────────────────────────────────────────
  function reset() {
    setStep("type");
    setWorkoutType(null);
    setName("");
    setNotes("");
    setStartTime("08:00");
    setEndTime("");
    setExerciseRows([emptyExercise()]);
    setError(null);
    setPending(false);
  }

  function handleOpenChange(val: boolean) {
    if (!val) reset();
    setOpen(val);
  }

  // ── Step 1 ─────────────────────────────────────────────────────────────────
  function selectType(type: WorkoutTypeId) {
    setWorkoutType(type);
    setName(type === "Custom" ? "" : `${type} Day`);
    setStep("builder");
  }

  // ── Exercise helpers ───────────────────────────────────────────────────────
  function addExercise() {
    setExerciseRows((prev) => [...prev, emptyExercise()]);
  }

  function removeExercise(i: number) {
    setExerciseRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateExerciseId(i: number, value: string) {
    setExerciseRows((prev) =>
      prev.map((ex, idx) => (idx === i ? { ...ex, exerciseId: value } : ex))
    );
  }

  // ── Set helpers ────────────────────────────────────────────────────────────
  function addSet(exIdx: number) {
    setExerciseRows((prev) =>
      prev.map((ex, idx) =>
        idx === exIdx ? { ...ex, sets: [...ex.sets, emptySet()] } : ex
      )
    );
  }

  function removeSet(exIdx: number, setIdx: number) {
    setExerciseRows((prev) =>
      prev.map((ex, idx) =>
        idx === exIdx
          ? { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) }
          : ex
      )
    );
  }

  function updateSet(
    exIdx: number,
    setIdx: number,
    field: keyof SetRow,
    value: string
  ) {
    setExerciseRows((prev) =>
      prev.map((ex, idx) =>
        idx === exIdx
          ? {
              ...ex,
              sets: ex.sets.map((s, si) =>
                si === setIdx ? { ...s, [field]: value } : s
              ),
            }
          : ex
      )
    );
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!startTime) {
      setError("Start time is required.");
      return;
    }

    const validExercises = exerciseRows.filter((ex) => ex.exerciseId !== "");
    if (validExercises.length === 0) {
      setError("Add at least one exercise.");
      return;
    }

    for (const ex of validExercises) {
      for (const s of ex.sets) {
        if (!s.reps || isNaN(Number(s.reps)) || Number(s.reps) <= 0) {
          setError("All sets need a valid rep count.");
          return;
        }
      }
    }

    setPending(true);
    try {
      await createWorkout({
        name,
        notes,
        date: selectedDate,
        startTime,
        endTime,
        exercises: validExercises.map((ex) => ({
          exerciseId: Number(ex.exerciseId),
          sets: ex.sets.map((s) => ({
            reps: Number(s.reps),
            weightLbs: s.weightLbs.trim() || null,
          })),
        })),
      });
      handleOpenChange(false);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Workout
          </Button>
        }
      />

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* ── Step 1: Workout type picker ── */}
        {step === "type" && (
          <>
            <DialogHeader className="pr-8">
              <DialogTitle>What type of workout?</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3 py-2">
              {WORKOUT_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => selectType(type.id)}
                  className="flex flex-col items-start gap-1.5 rounded-xl border border-border bg-card p-5 text-left transition-colors hover:bg-accent hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="text-3xl">{type.emoji}</span>
                  <span className="font-semibold text-sm">{type.label}</span>
                  <span className="text-xs text-muted-foreground leading-snug">
                    {type.description}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── Step 2: Workout builder ── */}
        {step === "builder" && (
          <>
            <DialogHeader className="pr-8">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setStep("type")}
                  className="shrink-0 -ml-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <DialogTitle className="flex items-center gap-2">
                  {workoutType && workoutType !== "Custom" && (
                    <Badge variant="secondary">{workoutType}</Badge>
                  )}
                  {name || "New Workout"}
                </DialogTitle>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 py-1">
              {/* ── Meta ── */}
              <div className="grid grid-cols-2 gap-4">
                {workoutType === "Custom" && (
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="workout-name">Workout Name</Label>
                    <Input
                      id="workout-name"
                      placeholder="e.g. Full Body Blast"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>

                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="How did it feel? Any PRs?"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="resize-none"
                  />
                </div>
              </div>

              <Separator />

              {/* ── Exercises ── */}
              <div className="space-y-4">
                <p className="text-sm font-semibold">Exercises</p>

                {exerciseRows.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    className="rounded-xl border border-border bg-muted/30 p-4 space-y-3"
                  >
                    {/* Exercise header */}
                    <div className="flex items-end gap-2">
                      <div className="flex-1 space-y-1.5">
                        <Label htmlFor={`exercise-${exIdx}`}>
                          Exercise {exIdx + 1}
                        </Label>
                        <select
                          id={`exercise-${exIdx}`}
                          value={ex.exerciseId}
                          onChange={(e) =>
                            updateExerciseId(exIdx, e.target.value)
                          }
                          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="">Select exercise…</option>
                          {exercises.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.name}
                              {e.muscleGroup ? ` · ${e.muscleGroup}` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      {exerciseRows.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeExercise(exIdx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Sets */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-[1.5rem_1fr_1fr_2rem] gap-2 px-0.5">
                        <span className="text-xs text-muted-foreground font-medium">#</span>
                        <span className="text-xs text-muted-foreground font-medium">Reps</span>
                        <span className="text-xs text-muted-foreground font-medium">Weight (lbs)</span>
                        <span />
                      </div>

                      {ex.sets.map((s, setIdx) => (
                        <div
                          key={setIdx}
                          className="grid grid-cols-[1.5rem_1fr_1fr_2rem] gap-2 items-center px-0.5"
                        >
                          <span className="text-sm text-muted-foreground tabular-nums font-medium">
                            {setIdx + 1}
                          </span>
                          <Input
                            type="number"
                            min={1}
                            placeholder="10"
                            value={s.reps}
                            onChange={(e) =>
                              updateSet(exIdx, setIdx, "reps", e.target.value)
                            }
                          />
                          <Input
                            type="number"
                            min={0}
                            step="0.5"
                            placeholder="BW"
                            value={s.weightLbs}
                            onChange={(e) =>
                              updateSet(exIdx, setIdx, "weightLbs", e.target.value)
                            }
                          />
                          {ex.sets.length > 1 ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeSet(exIdx, setIdx)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <span />
                          )}
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground h-7 px-2 text-xs"
                      onClick={() => addSet(exIdx)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Set
                    </Button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addExercise}
                  className="w-full rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Exercise
                </button>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              {/* ── Footer ── */}
              <div className="-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={pending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Saving…" : "Save Workout"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
