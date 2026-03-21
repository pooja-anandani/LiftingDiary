"use client";

import * as React from "react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ---------------------------------------------------------------------------
// Mock data — replace with real data fetching later
// ---------------------------------------------------------------------------
const MOCK_WORKOUTS = [
  {
    id: 1,
    name: "Upper Body Strength",
    notes: "Felt strong today. Increased bench press weight.",
    startTime: "07:15",
    endTime: "08:30",
    exercises: [
      {
        name: "Bench Press",
        muscleGroup: "Chest",
        sets: [
          { setNumber: 1, reps: 5, weightLbs: "185" },
          { setNumber: 2, reps: 5, weightLbs: "185" },
          { setNumber: 3, reps: 4, weightLbs: "185" },
        ],
      },
      {
        name: "Pull-Up",
        muscleGroup: "Back",
        sets: [
          { setNumber: 1, reps: 8, weightLbs: null },
          { setNumber: 2, reps: 7, weightLbs: null },
          { setNumber: 3, reps: 6, weightLbs: null },
        ],
      },
      {
        name: "Overhead Press",
        muscleGroup: "Shoulders",
        sets: [
          { setNumber: 1, reps: 8, weightLbs: "95" },
          { setNumber: 2, reps: 8, weightLbs: "95" },
          { setNumber: 3, reps: 6, weightLbs: "95" },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Core Finisher",
    notes: null,
    startTime: "08:35",
    endTime: "08:55",
    exercises: [
      {
        name: "Plank",
        muscleGroup: "Core",
        sets: [
          { setNumber: 1, reps: 1, weightLbs: null },
          { setNumber: 2, reps: 1, weightLbs: null },
        ],
      },
    ],
  },
];
// ---------------------------------------------------------------------------

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

export default function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const clampedDate = React.useMemo(() => {
    const dateParam = searchParams.get("date");
    const selected = dateParam
      ? new Date(dateParam + "T00:00:00")
      : today;
    return selected > today ? today : selected;
  }, [searchParams, today]);

  function handleSelectDate(date: Date | undefined) {
    if (!date) return;
    const iso = date.toISOString().split("T")[0];
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", iso);
    router.push(`/dashboard?${params.toString()}`);
  }

  const isToday = clampedDate.toDateString() === today.toDateString();

  // Swap mock data for real fetch later
  const workouts = MOCK_WORKOUTS;

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Workout Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and review your logged workouts.
          </p>
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
                  <Card key={workout.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-base">
                            {workout.name}
                          </CardTitle>
                          {workout.notes && (
                            <CardDescription className="mt-1">
                              {workout.notes}
                            </CardDescription>
                          )}
                        </div>
                        <Badge variant="outline" className="shrink-0 tabular-nums">
                          {workout.startTime}
                          {workout.endTime && ` – ${workout.endTime}`}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {workout.exercises.map((exercise, i) => (
                        <div key={exercise.name}>
                          {i > 0 && <Separator className="mb-6" />}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-medium text-sm">
                              {exercise.name}
                            </span>
                            <Badge
                              variant={muscleGroupColor(exercise.muscleGroup)}
                              className="text-xs"
                            >
                              {exercise.muscleGroup}
                            </Badge>
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
                                  <TableCell className="font-medium">
                                    {s.reps}
                                  </TableCell>
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
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
