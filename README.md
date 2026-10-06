# Gulaal 🥀

## 1. Supabase (your existing project)
SQL editor, in order: `supabase/schema.sql` (skip if already run), then `supabase/site_decor.sql` (skip if already run).
Kiting needs **no new tables**. It uses the existing ones and the existing `is_admin()` rule.

## 2. Create the Kiting account (once; re-run to rotate)
```
SUPABASE_URL=https://YOURPROJECT.supabase.co SUPABASE_SERVICE_ROLE_KEY=<service role key> npm run kiting:setup you@example.com
```
The service-role key is typed only into that one terminal command; never put it in `.env.local`, Vercel or any `NEXT_PUBLIC_` variable.
The script prints `KITING_SUPABASE_PASSWORD` (a long random secret) and one SQL statement (`is_admin()`) to run in the SQL editor.

## 3. Environment
```
cp .env.example .env.local
```
Fill `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public anon key) and the three server-only values:
`KITING_ADMIN_EMAIL`, `KITING_ADMIN_PASSWORD` (the password you type on /kiting), `KITING_SUPABASE_PASSWORD` (from step 2).
On Vercel add the same variables (without NEXT_PUBLIC_ on the last three).

## 4. Run
```
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```
Open the site → entrance page → small **Kiting** at the bottom-right → password.

## How Kiting is secured
- Your password is compared **on the server** (`/api/kiting/login`, constant-time) with `KITING_ADMIN_PASSWORD`. It is never in client code, API responses or the database. Only after it matches does the server sign into Supabase with the separate random `KITING_SUPABASE_PASSWORD`.
- Success sets two **httpOnly, SameSite=Strict** cookies (secure in production). JavaScript can't read them. Logout revokes the session in Supabase and deletes the cookies.
- Every list/save/delete call re-verifies the session on the server and runs **as the signed-in owner**, so Postgres RLS (`is_admin()`) is the final authority. Only allow-listed tables/columns can be written. Login is limited to 5 wrong tries per 10 minutes.
- Visitors keep only the existing public powers: read, comment, react.

## Backgrounds
`public/bg/1.webp … 5.webp`. To change them replace the files; for more or fewer edit `N` and `POS` in `components/Background.js`.

## Atmosphere (decor text)
Managed in Kiting → Atmosphere. Empty table = built-in wording. `/admin` now redirects to `/kiting`.

## Troubleshooting Kiting login
`Supabase sign-in failed` → run **`npm run kiting:fix`**. It checks your settings (never printing values), and if something is wrong it asks once (hidden) for your Supabase service-role key, resets the internal secret straight into `.env.local`, and re-checks. Then restart the server.
`npm run kiting:check` runs only the check. Manual alternative: Supabase → Authentication → Users → add your email with a long random password, and put that same password in `KITING_SUPABASE_PASSWORD`.
