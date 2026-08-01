# ShiftSpace

A Next.js app for shift scripting, journaling, and community features — backed by [Supabase](https://supabase.com).

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Copy `.env.local.example` to `.env.local` and fill in your Supabase URL and anon key.
3. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor.
4. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

## Backend

- **Auth** — Supabase Auth (email/password, username login via RPC)
- **Database** — PostgreSQL (profiles, app data, conversations, messages)
- **Storage** — Supabase Storage (`media` bucket for images)
- **Realtime** — Live message updates on conversations

## AI (optional)

Set `GEMINI_API_KEY` in `.env.local` for Genkit AI features.
