# DailyHabits — self-hosted

Your own habit tracker in the style of [dailyhabits.xyz](https://dailyhabits.xyz), with **unlimited habits, free forever** — because it runs on your own free Supabase project.

Built with **React (Vite)** + **Supabase** (auth + Postgres). No other backend needed.

## Features

- Monthly grid: habits as rows, days as columns, click a cell to check off a day
- Unlimited habits, each with its own pastel color and monthly goal
- Goal / Achieved columns with green "goal met" badges, exactly like the original
- Current & best **streaks** plus per-month statistics
- **Notes** — one journal note per day, listed under the grid
- **Dark mode** (remembered between visits)
- **Archive** habits (keeps all history) and **drag to reorder** them
- Multi-user: anyone who signs up gets their own private data (enforced by Postgres row-level security)

## Setup (about 5 minutes)

### 1. Create the database

1. Go to [supabase.com](https://supabase.com) → your project (or create one, the free tier is plenty).
2. Open **SQL Editor** in the left sidebar.
3. Paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.

### 2. Connect the app

1. In Supabase, open **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key.
3. Make a copy of `.env.example` named `.env` (in this folder), and put the two values in it:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key...
```

> The anon key is designed to be public — your data is protected by row-level security, not by hiding this key.

### 3. Run it

```bash
npm install
npm run dev
```

The app opens at **http://localhost:5173**. Sign up with an email + password and start adding habits.

### Optional: skip email confirmation

By default Supabase sends a confirmation email on signup. For a personal app it's easier to turn that off:
**Authentication → Sign In / Providers → Email → disable "Confirm email"**. Then signup logs you in instantly.

## Production build

```bash
npm run build
```

This creates a static site in `dist/` — host it anywhere (Netlify, Vercel, GitHub Pages, or an Apache/Nginx vhost in Laragon pointing at the `dist` folder). There is no server-side code; everything talks to Supabase directly.

> Note for Laragon users: the dev server is Node-based (`npm run dev`), it does not run through Apache. Only the built `dist/` folder is plain static files.

## Project structure

```
supabase/schema.sql     Database tables + row-level security (run once)
src/
  App.jsx               Auth state, theme, top-level routing
  components/           Grid, modals, notes, stats, auth page
  lib/                  Supabase client, date helpers, streak math
```

## Troubleshooting

- **"Invalid API key" / nothing loads** — the URL or anon key in `.env` is wrong, or you edited `.env` while the dev server was running (restart it).
- **"Email not confirmed" on login** — confirm the email Supabase sent you, or disable confirmation (see above).
- **Signed in but the grid stays empty after adding habits** — the schema probably wasn't run; do step 1 and check the three tables exist in **Table Editor** (habits, checkins, notes).
- **Password must be at least 6 characters** — Supabase's default minimum.
