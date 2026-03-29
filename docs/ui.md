# UI Coding Standards

## Component Library

**Only shadcn/ui components may be used for UI in this project.**

- Every UI element must be built using components from `@/components/ui/` (installed via `npx shadcn@latest add <component>`).
- **No custom UI components are permitted.** Do not create files under `components/` that are not shadcn/ui components.
- If a required component does not yet exist in the project, install it with the shadcn CLI:
  ```bash
  npx shadcn@latest add <component-name>
  ```
- Do not wrap, extend, or re-export shadcn components into new abstractions. Use them directly where needed.
- Tailwind utility classes may be used alongside shadcn components for layout and spacing, but never to build bespoke UI widgets.

## Date Formatting

All dates must be formatted using **date-fns**. Do not use `Date.prototype.toLocaleDateString`, `Intl.DateTimeFormat`, or any other formatting method.

### Required Format

Dates must be displayed in the following format, using an ordinal day suffix:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

### Implementation

Use `format` from `date-fns` with the `do` token for ordinal day:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy") // "1st Sep 2025"
```

### Installing date-fns

```bash
npm install date-fns
```
