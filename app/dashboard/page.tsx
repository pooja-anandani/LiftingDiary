import { Suspense } from "react";
import DatePicker from "./DatePicker";
import { getWorkoutsForDate } from "./actions";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const today = new Date().toISOString().split("T")[0];
  const selectedDate = params.date ?? today;

  // Clamp to today if future date somehow supplied
  const clampedDate = selectedDate > today ? today : selectedDate;

  const workouts = await getWorkoutsForDate(clampedDate);

  const displayDate = new Date(clampedDate + "T00:00:00").toLocaleDateString(
    "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--foreground)" }}>
        Workout Dashboard
      </h1>

      <div className="flex items-center gap-4 mb-8">
        <label className="text-sm font-medium" style={{ color: "var(--foreground)", opacity: 0.7 }}>
          Select date:
        </label>
        <Suspense>
          <DatePicker selectedDate={clampedDate} />
        </Suspense>
      </div>

      <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--foreground)" }}>
        {displayDate}
      </h2>

      {workouts.length === 0 ? (
        <p style={{ color: "var(--foreground)", opacity: 0.5 }}>No workouts logged on this date.</p>
      ) : (
        <div className="space-y-6">
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className="rounded-lg p-4"
              style={{
                border: "1px solid color-mix(in srgb, var(--foreground) 15%, transparent)",
                background: "color-mix(in srgb, var(--foreground) 5%, transparent)",
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-base" style={{ color: "var(--foreground)" }}>
                  {workout.name ?? "Unnamed Workout"}
                </h3>
                <span className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                  {workout.startedAt.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {workout.endedAt &&
                    ` – ${workout.endedAt.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
                </span>
              </div>

              {workout.notes && (
                <p className="text-sm mb-3" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  {workout.notes}
                </p>
              )}

              {workout.exercises.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.4 }}>
                  No exercises recorded.
                </p>
              ) : (
                <div className="space-y-4">
                  {workout.exercises.map((exercise) => (
                    <div key={exercise.name}>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="font-medium text-sm" style={{ color: "var(--foreground)" }}>
                          {exercise.name}
                        </span>
                        {exercise.muscleGroup && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: "color-mix(in srgb, var(--foreground) 10%, transparent)",
                              color: "var(--foreground)",
                              opacity: 0.7,
                            }}
                          >
                            {exercise.muscleGroup}
                          </span>
                        )}
                      </div>
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr style={{ color: "var(--foreground)", opacity: 0.5 }}>
                            <th className="pr-4 pb-1 font-medium">Set</th>
                            <th className="pr-4 pb-1 font-medium">Reps</th>
                            <th className="pb-1 font-medium">Weight (lbs)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exercise.sets.map((s) => (
                            <tr
                              key={s.setNumber}
                              style={{
                                borderTop: "1px solid color-mix(in srgb, var(--foreground) 10%, transparent)",
                                color: "var(--foreground)",
                              }}
                            >
                              <td className="pr-4 py-1">{s.setNumber}</td>
                              <td className="pr-4 py-1">{s.reps}</td>
                              <td className="py-1">{s.weightLbs ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
