# Data Fetching

## Rules — Non-Negotiable

### All data fetching MUST happen in Server Components

- **ONLY** fetch data in React Server Components
- **NEVER** fetch data in Client Components (`"use client"`)
- **NEVER** use Route Handlers (`app/api/`) for data fetching
- **NEVER** use `useEffect` + `fetch` or any client-side data fetching pattern
- **NEVER** use SWR, React Query, or similar client-side fetching libraries

If you need data in a Client Component, fetch it in a Server Component ancestor and pass it down as props.

### All database queries MUST go through `/data` helper functions

- **NEVER** write database queries inline in a page or component
- **ALWAYS** create a helper function in the `/data` directory for every query
- Helper functions **MUST** use [Drizzle ORM](https://orm.drizzle.team/) — **NO raw SQL**

### Every query MUST be scoped to the authenticated user

This is a security requirement. A logged-in user must **never** be able to read or modify another user's data.

- Every helper function that returns user-owned data **MUST** accept a `userId` parameter and filter by it
- The `userId` **MUST** come from the authenticated session — never from user input (URL params, request body, etc.)
- Always verify the session in the Server Component before calling data helpers, then pass `session.user.id` explicitly

## Example

```ts
// data/workouts.ts
import { db } from "@/db"
import { workouts } from "@/db/schema"
import { eq } from "drizzle-orm"

// userId always comes from the caller — never trust client input
export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId))
}
```

```tsx
// app/dashboard/page.tsx  (Server Component — no "use client")
import { auth } from "@/lib/auth"
import { getWorkoutsForUser } from "@/data/workouts"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  // userId comes from the verified session, not from any user-controlled input
  const workouts = await getWorkoutsForUser(session.user.id)

  return <WorkoutList workouts={workouts} />
}
```

## Summary Checklist

| Rule | Required |
|------|----------|
| Fetch data only in Server Components | YES |
| Use `/data` helper functions for all DB access | YES |
| Use Drizzle ORM (no raw SQL) | YES |
| Scope every query to `userId` from the session | YES |
| Fetch data in Client Components | NO |
| Fetch data in Route Handlers | NO |
| Trust `userId` from URL params or request body | NO |
