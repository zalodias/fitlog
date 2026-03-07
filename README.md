# Fitlog

A CrossFit workout tracker built with Next.js, TypeScript, TailwindCSS, shadcn/ui, and Supabase.

## Features

- **Exercise Library** — pre-built CrossFit movements + custom exercises, filterable by area (full/lower/upper) and type (strength/skill/conditioning)
- **Session Logger** — log strength blocks (sets × reps × weight × effort) and workout blocks (AMRAP / For Time / EMOM) in a single session
- **Calendar** — monthly view with session indicators; tap a day to see the session summary
- **Progress** — current streak, weekly volume, and personal records per exercise
- **Dark-first design** — system preference aware, neon lime accent

## Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, and run the migration file:

```
supabase/migrations/001_init.sql
```

in the Supabase SQL editor. This creates all tables and seeds the exercise library.

### 2. Configure environment variables

Copy `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLIC_KEY=your-public-key
NEXT_PUBLIC_SUPABASE_SECRET_KEY=your-secret-key
```

Both values are in your Supabase project settings under **API**.

Disable Row Level Security (RLS) on all tables in the Supabase dashboard, or keep it disabled (the migration doesn't enable it — single-user assumption).

### 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

| Layer      | Library                              |
| ---------- | ------------------------------------ |
| Framework  | Next.js 16 (App Router, Turbopack)   |
| Language   | TypeScript                           |
| Styling    | TailwindCSS v4 + shadcn/ui (base-ui) |
| Database   | Supabase (Postgres)                  |
| Date utils | date-fns                             |
| Theme      | next-themes (dark default)           |

## Database Schema

```
exercises        — id, name, area, type, custom, created_at
sessions         — id, date, type
strength_blocks  — id, session_id, exercise_id, position
sets             — id, strength_block_id, number, reps, weight, duration, effort
workouts         — id, session_id, format, cap, result, seconds, rounds, reps, position
workout_exercises — id, workout_id, exercise_id, reps, weight, distance, position
```
