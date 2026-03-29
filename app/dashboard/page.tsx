import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkoutsForDate } from "@/data/workouts";
import { getAllExercises } from "@/data/exercises";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { date } = await searchParams;
  const today = new Date().toISOString().split("T")[0];
  const selectedDate = date ?? today;

  const [workouts, exercises] = await Promise.all([
    getWorkoutsForDate(userId, selectedDate),
    getAllExercises(),
  ]);

  return (
    <DashboardClient
      workouts={workouts}
      exercises={exercises}
      selectedDate={selectedDate}
    />
  );
}
