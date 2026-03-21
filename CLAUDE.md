# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test runner is configured yet.

## Architecture

Next.js 16 App Router project with React 19, TypeScript, and Tailwind CSS 4.

- `app/` — App Router pages and layouts. `layout.tsx` is the root layout; `page.tsx` is the home route.
- `app/globals.css` — Tailwind imports and CSS custom properties for theming (light/dark via `prefers-color-scheme`).
- Path alias `@/*` maps to the project root.
- Fonts: Geist Sans and Geist Mono loaded via `next/font/google`.
