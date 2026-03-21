"use server";

import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getWorkoutsForDate(date: string) {
  const { userId } = await auth();
  if (!userId) return [];

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutName: workouts.name,
      workoutNotes: workouts.notes,
      startedAt: workouts.startedAt,
      endedAt: workouts.endedAt,
      exerciseName: exercises.name,
      muscleGroup: exercises.muscleGroup,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weightLbs: sets.weightLbs,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, start),
        lt(workouts.startedAt, end)
      )
    );

  // Group by workout
  const workoutMap = new Map<
    number,
    {
      id: number;
      name: string | null;
      notes: string | null;
      startedAt: Date;
      endedAt: Date | null;
      exercises: Map<
        string,
        { muscleGroup: string | null; sets: { setNumber: number; reps: number; weightLbs: string | null }[] }
      >;
    }
  >();

  for (const row of rows) {
    if (!workoutMap.has(row.workoutId)) {
      workoutMap.set(row.workoutId, {
        id: row.workoutId,
        name: row.workoutName,
        notes: row.workoutNotes,
        startedAt: row.startedAt,
        endedAt: row.endedAt,
        exercises: new Map(),
      });
    }
    const workout = workoutMap.get(row.workoutId)!;
    if (row.exerciseName) {
      if (!workout.exercises.has(row.exerciseName)) {
        workout.exercises.set(row.exerciseName, {
          muscleGroup: row.muscleGroup,
          sets: [],
        });
      }
      if (row.setNumber != null && row.reps != null) {
        workout.exercises.get(row.exerciseName)!.sets.push({
          setNumber: row.setNumber,
          reps: row.reps,
          weightLbs: row.weightLbs,
        });
      }
    }
  }

  return Array.from(workoutMap.values()).map((w) => ({
    ...w,
    exercises: Array.from(w.exercises.entries()).map(([name, data]) => ({
      name,
      ...data,
    })),
  }));
}
