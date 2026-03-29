"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workouts, workoutExercises, sets } from "@/db/schema";
import { revalidatePath } from "next/cache";

export interface SetInput {
  reps: number;
  weightLbs: string | null;
}

export interface ExerciseInput {
  exerciseId: number;
  sets: SetInput[];
}

export interface CreateWorkoutInput {
  name: string;
  notes: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  exercises: ExerciseInput[];
}

export async function createWorkout(input: CreateWorkoutInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const startedAt = new Date(`${input.date}T${input.startTime}:00`);
  const endedAt = input.endTime
    ? new Date(`${input.date}T${input.endTime}:00`)
    : null;

  const [workout] = await db
    .insert(workouts)
    .values({
      userId,
      name: input.name || null,
      notes: input.notes || null,
      startedAt,
      endedAt,
    })
    .returning({ id: workouts.id });

  for (let i = 0; i < input.exercises.length; i++) {
    const ex = input.exercises[i];

    const [we] = await db
      .insert(workoutExercises)
      .values({
        workoutId: workout.id,
        exerciseId: ex.exerciseId,
        order: i,
      })
      .returning({ id: workoutExercises.id });

    if (ex.sets.length > 0) {
      await db.insert(sets).values(
        ex.sets.map((s, idx) => ({
          workoutExerciseId: we.id,
          setNumber: idx + 1,
          reps: s.reps,
          weightLbs: s.weightLbs ?? null,
        }))
      );
    }
  }

  revalidatePath("/dashboard");
}
