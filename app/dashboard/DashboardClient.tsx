"use client";

import * as React from "react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WorkoutForDate } from "@/data/workouts";
import type { Exercise } from "@/data/exercises";
import AddWorkoutDialog from "./AddWorkoutDialog";

function muscleGroupColor(group: string): "default" | "secondary" | "outline" {
  const map: Record<string, "default" | "secondary" | "outline"> = {
    Chest: "default",
    Back: "secondary",
    Shoulders: "outline",
    Core: "secondary",
    Legs: "default",
    Arms: "outline",
  };
  return map[group] ?? "secondary";
}

function totalSets(workout: WorkoutForDate): number {
  return workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
}

function totalWeightLbs(workout: WorkoutForDate): number {
  return workout.exercises.reduce((sum, ex) => {
    return (
      sum +
      ex.sets.reduce((s, set) => {
        const w = set.weightLbs ? parseFloat(set.weightLbs) : 0;
        return s + w * set.reps;
      }, 0)
    );
  }, 0);
}

function durationMinutes(workout: WorkoutForDate): number | null {
  if (!workout.endedAt) return null;
  return Math.round(
    (workout.endedAt.getTime() - workout.startedAt.getTime()) / 60000,
  );
}

function WorkoutCard({ workout }: { workout: WorkoutForDate }) {
  const [open, setOpen] = React.useState(false);
  const sets = totalSets(workout);
  const weight = totalWeightLbs(workout);
  const duration = durationMinutes(workout);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        {/* Collapsed header — always visible */}
        <CollapsibleTrigger className="w-full text-left">
          <CardHeader className="hover:bg-muted/50 transition-colors rounded-t-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base">
                  {workout.name ?? "Untitled Workout"}
                </CardTitle>
                <CardDescription className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {duration !== null && <span>{duration} min</span>}
                  <span>
                    {sets} set{sets !== 1 ? "s" : ""}
                  </span>
                  {weight > 0 && (
                    <span>{weight.toLocaleString()} lbs total</span>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="tabular-nums">
                  {format(workout.startedAt, "HH:mm")}
                  {workout.endedAt && ` – ${format(workout.endedAt, "HH:mm")}`}
                </Badge>
                {open ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        {/* Expanded detail */}
        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            <Separator className="mb-4" />
            {workout.notes && (
              <p className="text-sm text-muted-foreground -mt-2 mb-2">
                {workout.notes}
              </p>
            )}
            {workout.exercises.map((exercise, i) => (
              <div key={exercise.name}>
                {i > 0 && <Separator className="mb-6" />}
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-medium text-sm">{exercise.name}</span>
                  {exercise.muscleGroup && (
                    <Badge
                      variant={muscleGroupColor(exercise.muscleGroup)}
                      className="text-xs"
                    >
                      {exercise.muscleGroup}
                    </Badge>
                  )}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-14">Set</TableHead>
                      <TableHead className="w-16">Reps</TableHead>
                      <TableHead>Weight</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exercise.sets.map((s) => (
                      <TableRow key={s.setNumber}>
                        <TableCell className="text-muted-foreground">
                          {s.setNumber}
                        </TableCell>
                        <TableCell className="font-medium">{s.reps}</TableCell>
                        <TableCell>
                          {s.weightLbs ? (
                            `${s.weightLbs} lbs`
                          ) : (
                            <span className="text-muted-foreground">
                              Bodyweight
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

interface Props {
  workouts: WorkoutForDate[];
  exercises: Exercise[];
  selectedDate: string;
}

export default function DashboardClient({ workouts, exercises, selectedDate }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const clampedDate = React.useMemo(() => {
    const selected = new Date(selectedDate + "T00:00:00");
    return selected > today ? today : selected;
  }, [selectedDate, today]);

  function handleSelectDate(date: Date | undefined) {
    if (!date) return;
    const iso = date.toISOString().split("T")[0];
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", iso);
    router.push(`/dashboard?${params.toString()}`);
  }

  const isToday = clampedDate.toDateString() === today.toDateString();

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Workout Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and review your logged workouts.
            </p>
          </div>
          <AddWorkoutDialog
            exercises={exercises}
            selectedDate={selectedDate}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ── Left column: calendar ── */}
          <div className="shrink-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 pb-3">
                <Calendar
                  mode="single"
                  selected={clampedDate}
                  onSelect={handleSelectDate}
                  disabled={{ after: today }}
                  initialFocus
                />
              </CardContent>
            </Card>
          </div>

          {/* ── Right column: workouts ── */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Date heading */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  {format(clampedDate, "do MMM yyyy")}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {isToday ? "Today" : format(clampedDate, "EEEE")}
                  {" · "}
                  {workouts.length === 0
                    ? "No workouts logged"
                    : `${workouts.length} workout${workouts.length > 1 ? "s" : ""} logged`}
                </p>
              </div>
            </div>

            <Separator />

            {/* Empty state */}
            {workouts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-4xl mb-4">🏋️</div>
                  <p className="font-medium">No workouts on this day</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select a different date or log a new workout.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {workouts.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
