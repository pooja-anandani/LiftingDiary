import {
  integer,
  pgTable,
  varchar,
  text,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";

export const workouts = pgTable("workouts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }),
  notes: text(),
  startedAt: timestamp().notNull().defaultNow(),
  endedAt: timestamp(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const exercises = pgTable("exercises", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  muscleGroup: varchar({ length: 100 }),
  createdAt: timestamp().notNull().defaultNow(),
});

export const workoutExercises = pgTable("workout_exercises", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutId: integer()
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  exerciseId: integer()
    .notNull()
    .references(() => exercises.id),
  order: integer().notNull().default(0),
});

export const sets = pgTable("sets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutExerciseId: integer()
    .notNull()
    .references(() => workoutExercises.id, { onDelete: "cascade" }),
  setNumber: integer().notNull(),
  reps: integer().notNull(),
  weightLbs: numeric({ precision: 6, scale: 2 }),
  notes: text(),
});
