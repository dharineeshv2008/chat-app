# Private Realtime Chat

A modern, private two-user chat web app built with React, Vite, Tailwind CSS, and Supabase Realtime. Deploy-ready on Vercel.

## Features

- Secret access code gate (`1234VD`)
- Two predefined users: **John** and **Friend**
- WhatsApp-style dark UI with realtime text messaging
- **Delete for everyone** (within 1 minute, sender only) with realtime sync
- **Delete for me** (local hide per user via `localStorage`)
- Online presence and typing indicators
- Session persists until logout
- Mobile responsive

## Tech Stack

| Layer      | Technology        |
| ---------- | ----------------- |
| Frontend   | React + Vite + Tailwind CSS |
| Backend    | Supabase          |
| Realtime   | Supabase Realtime |
| Deployment | Vercel            |

## Project Structure

```
cht/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/       # UI components
│   ├── hooks/            # useMessages, usePresence, useTyping
│   ├── lib/              # Supabase client, auth, constants
│   ├── pages/            # Landing, UserSelect, Chat
│   └── types/
├── supabase/
│   ├── schema.sql                    # Full schema (new projects)
│   ├── setup.sql                     # Setup + migration columns
│   └── migration_message_deletion.sql # Add deletion columns (existing DB)
├── .env.example
├── vercel.json
└── README.md
```

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Open **SQL Editor** → **New query**.
3. Paste and run [`supabase/setup.sql`](supabase/setup.sql) (or `schema.sql` for a fresh project).
4. If the table already exists, also run [`supabase/migration_message_deletion.sql`](supabase/migration_message_deletion.sql).
5. Enable Realtime: **Database → Replication** → ensure `messages` is enabled (INSERT + UPDATE).

### 3. Environment variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
| -------- | ---------------- |
| `VITE_SUPABASE_URL` | Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Project Settings → API → **Publishable** key (`sb_publishable_...`) |

Use only the **publishable** key in the frontend. Keep the **secret** key (`sb_secret_...`) on the server only—never in `.env.local` for Vite or in Vercel env vars exposed to the browser.

### 4. Run locally

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

**Access code:** `1234VD`

## Usage Flow

1. Enter the secret access code on the landing page.
2. Choose **John** or **Friend**.
3. Chat in realtime; the other user should use the other identity in another browser or device.
4. **Logout** clears the session and returns to the landing page.

## Security Notes

- Access is gated by a client-side secret code stored in `sessionStorage`. This keeps the app simple and private but is not cryptographically strong—suitable for a small trusted pair, not high-security scenarios.
- Supabase RLS restricts `sender` to `John` or `Friend` and blocks empty messages at the database level.
- Never commit `.env.local` or expose service role keys in the frontend.

## Deploy to Vercel

1. Push the project to GitHub (or connect your repo in Vercel).
2. Import the project in [vercel.com](https://vercel.com).
3. Add environment variables in **Project Settings → Environment Variables** (all environments):
   - `VITE_SUPABASE_URL` — e.g. `https://xxxx.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` — publishable key (`sb_publishable_...`)
4. **Redeploy after adding env vars** — Vite bakes `VITE_*` into the build; changing env without redeploy leaves realtime broken.
5. Run `supabase/enable_realtime.sql` in Supabase SQL Editor.
6. In Supabase Dashboard: **Database → Replication** → enable **`messages`** under `supabase_realtime`.

### Realtime not working on Vercel?

| Check | Action |
| ----- | ------ |
| Env vars missing at build | Vercel → Settings → Env → **Redeploy** |
| Realtime not enabled | Run `enable_realtime.sql` + toggle Replication in dashboard |
| Messages only on refresh | Header shows "Syncing…" — realtime WebSocket is down; fix Supabase replication |

The included `vercel.json` handles SPA routing.

```bash
npm run build   # verify production build locally
```

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Start development server |
| `npm run build`| Production build         |
| `npm run preview` | Preview production build |

## License

MIT
