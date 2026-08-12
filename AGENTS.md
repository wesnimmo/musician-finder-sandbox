# Project Overview
Musician Finder (`musician-finder`) is a location-aware web platform that helps local musicians discover and connect with each other based on ZIP code, instrument, genre, and band status (e.g., "seeking a band" vs. "band seeking a member"). Built as a responsive SPA-like experience using Next.js 16 (App Router, Server Components, Server Actions), React 19, TypeScript, Tanstack Query, Tailwind CSS v4, Jest + React Testing Library (TDD), and Supabase (PostgreSQL, Row-Level Security, Auth) deployed continuously on Vercel.


# Build & Test Commands
- **Dev Server:** `npm run dev`
- **Build Verification:** `npm run build`
- **Lint & Type Check:** `npm run lint && npx tsc --noEmit`
- **Run All Tests:** `npm run test`
- **Run Single Test File:** `npx jest path/to/file.test.ts`
- **Run Tests in Watch Mode:** `npx jest --watch`

# Code Style Guidelines
- **UI Boundary (v0 & Figma):** Visual UI shells reside under `components/ui/` (generated/styled via v0/Tailwind). AI agents must treat raw v0 UI files as presentation-only wrappers.
- **Logic & Data Boundary:** Never write direct database calls or complex state logic inside `components/ui/`. Abstract Supabase queries into Server Actions (`app/actions/`) or custom hooks (`hooks/`).
- **Server vs. Client Components:** Default to Server Components (`.tsx`). Add `'use client'` only to leaf components requiring interactive React state, browser APIs, or form submission handlers.
- **Type Safety:** Strict TypeScript everywhere. Database response types must be generated via Supabase CLI and imported from `@/types/supabase`. Do not use `any`.
- **Design Context (Figma MCP):** Use the Figma MCP server to inspect component tokens, spacing, and layouts directly from design frames.
- **UI Components (v0):** Use v0 for initial raw component generation. Use Cursor + Figma MCP to inspect, refine, and connect state to those components.
- **Styling Architecture:** Use Tailwind CSS utility classes and design tokens defined in `app/globals.css`. Do not hardcode hex values (e.g., `#3B82F6`) inside component files. Use semantic color tokens like `bg-primary`, `text-muted-foreground`, and `border-border`.
- **Typography & Layout:** Apply responsive Tailwind layout utilities (`flex`, `grid`, `gap-*`, `container`). Keep typography hierarchy consistent using standard HTML elements (`<h1>`-`<h3>`, `<p>`) styled with Tailwind text utilities.

# Testing Instructions
- **TDD Requirement:** Write a failing test in `__tests__/` or alongside the component (`*.test.tsx`) BEFORE implementing feature logic.
- **Test Runner:** Jest with React Testing Library and `jest-environment-jsdom`.
- **API & DB Isolation:** Never hit live Supabase servers during Jest runs. Mock all Supabase client calls (`@/lib/supabase/client` and `@/lib/supabase/server`) using Jest mocks or Mock Service Worker (MSW).

# Security Considerations
- **Environment Variables:** All secret keys (`SUPABASE_SERVICE_ROLE_KEY`) must reside in `.env.local` and NEVER be prefixed with `NEXT_PUBLIC_`.
- **Row-Level Security (RLS):** Every Supabase table must have RLS enabled. Never attempt to bypass RLS in client code.
- **Protected Files:** Do not read, log, or commit `.env`, `.env.local`, `.env.production`, or private SSH/GPG keys.

# Commit & PR Guidelines
- **Branch Strategy:** Never commit directly to `main`. Create short-lived feature branches (`feature/profile-search`, `fix/zipcode-filter`).
- **Commit Format:** Conventional Commits (e.g., `feat: add zipcode distance filter`, `fix: handle empty instrument query`, `test: add unit test for signup action`).
- **PR Workflow:** Open Pull Requests against `main`. All GitHub Actions CI checks (lint, type-check, unit tests) must pass before merging.