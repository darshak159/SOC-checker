# SOC Checker — Setup Guide

A secure, multi-user web app: shared data, role-based access enforced by the
database, and **name + 6-digit PIN** login. Runs on any device with a browser
(iOS, Android, laptop).

There are two pieces:

1. **Supabase** — your free backend (database + login + security). You create this.
2. **`index.html`** — the app. You host it (e.g. Netlify Drop) and point it at Supabase.

Total time: ~15 minutes. No coding required.

---

## Part 1 — Create the Supabase project (5 min)

1. Go to **https://supabase.com** → sign up (free) → **New project**.
2. Pick a name and a strong database password (save it somewhere). Choose the region
   closest to your outlet. Click **Create** and wait ~2 minutes for it to finish.

## Part 2 — Create the database (2 min)

1. In your project, open **SQL Editor** (left sidebar) → **New query**.
2. Open `supabase/migrations/0001_init.sql` from this bundle, copy **all** of it,
   paste into the editor, and click **Run**.
3. You should see "Success". This creates the tables, the security rules, and loads
   your 13 SOC templates.

## Part 3 — Lower the password length to allow 6-digit PINs (1 min)

PINs are used as passwords, so Supabase must allow 6-character passwords.

1. Go to **Authentication → Sign In / Providers → Email** (or **Authentication → Policies → Passwords**).
2. Set **Minimum password length** to **6**.
3. Turn **Confirm email** **OFF** (staff don't have real email addresses; the app
   uses internal identifiers). Save.

## Part 4 — Add your team (choose ONE method)

Each staff member needs an account. Their "email" is just an internal ID — they only
ever type their **name + PIN**.

### Method A — In the Supabase dashboard (no extra tools) ✅ recommended to start

For each person:

1. **Authentication → Users → Add user → Create new user**.
2. **Email:** make one up, e.g. `rachel@brock.local` (must be unique; never used to log in).
3. **Password:** their 6-digit PIN, e.g. `481920`.
4. **Auto Confirm User:** **ON**.
5. Click **Create user**, then click the new user → **User Metadata** → add:
   ```json
   { "display_name": "Rachel C.", "role": "trainer", "outlet": "Brock" }
   ```
   `role` must be one of: `teamleader`, `trainer`, `manager`, `admin`.
   (Create at least one **admin** — that's the GM who manages everything.)

The app's profile for each person is created automatically.

### Method B — Manage staff inside the app (optional upgrade)

Deploy the included admin function so the GM can add/remove staff and set PINs from
the **Library → Team** tab. Requires the free **Supabase CLI**:

```bash
# install once: https://supabase.com/docs/guides/cli
supabase login
supabase link --project-ref <your-project-ref>
supabase functions deploy admin-users
```

After deploying, "Add Member" in the app works directly. (You still need at least one
admin created via Method A first, so you can log in to manage the rest.)

## Part 5 — Connect the app (2 min)

1. In Supabase: **Project Settings → API**. Copy two values:
   - **Project URL** (e.g. `https://abcdefgh.supabase.co`)
   - **anon public** key (the long `eyJ...` string — this one is safe to ship)
2. Open the app (`index.html`). The first screen is **Setup** — paste both values and
   click **Connect**. (Alternatively, paste them into the `window.SOC_CONFIG` block at
   the top of `index.html` before hosting.)

## Part 6 — Host it (5 min)

The app is a single static file. Easiest free option — **Netlify Drop**:

1. Rename/keep the file as `index.html`.
2. Go to **https://app.netlify.com/drop** and drag `index.html` on.
3. You get a live URL. Sign up (free) to keep it permanently and rename it.

Open the URL on any phone or laptop → pick your name → enter your PIN. Done.
On phones: **Share → Add to Home Screen** to pin it like an app.

---

## Live updates (real-time)

Every device updates **automatically** — when anyone submits a check, it appears on
all other signed-in devices within about a second, no refresh needed. A green
**● Live** badge in the top bar shows the connection is active.

This honours the same security rules: a trainer's device only receives live updates
for **their own** checks, while managers/GM see the whole team's activity stream live.

Realtime is turned on by the migration in Part 2. **If you already ran the migration
before this was added**, just run this once in the SQL Editor:

```sql
do $$ begin
  if exists (select 1 from pg_publication where pubname='supabase_realtime') then
    begin alter publication supabase_realtime add table public.checks;    exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.templates; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.profiles;  exception when duplicate_object then null; end;
  end if;
end $$;
```

---

## Security model (what's protected, and how)

Access is enforced by the database (**Row-Level Security**), not just hidden in the UI —
so it holds even if someone pokes at the API directly:

| Role | Can do |
|---|---|
| **Team Leader / Crew Trainer** | Create checks; see **only their own** checks |
| **Manager** | All of the above **+ see every check** and reports |
| **GM / Dept. Manager (admin)** | Everything **+ manage templates and team** |

- Nobody can submit a check **as someone else**, edit templates they don't own, or
  delete checks unless they're the GM. (These rules are tested in `rls_test`.)
- The **anon** key in the browser is public by design and safe. The powerful
  **service-role** key is **never** in the app — only the server-side `admin-users`
  function uses it.

### Honest limitations (you chose the simple option)

- **PINs are short.** A 6-digit PIN is convenient but weaker than a password. Supabase
  rate-limits sign-in attempts, which helps, but for stronger security you can later
  switch this to email + password (ask and it's a small change).
- **Use unique PINs**, avoid obvious ones (123456, birthdays), and change a PIN
  immediately if someone leaves (dashboard → that user → reset password, or the Team tab
  if you deployed Method B).
- Everything runs over HTTPS automatically on Netlify/Supabase.

---

## Files in this bundle

| File | What it is |
|---|---|
| `index.html` | The app (host this) |
| `supabase/migrations/0001_init.sql` | Database schema, security rules, and template seed |
| `supabase/functions/admin-users/index.ts` | Optional server function for in-app team management |
| `SOC Checker.html` | The original offline prototype (localStorage, no backend) — kept for reference |

## Troubleshooting

- **Login screen says "Could not reach the server"** → URL/anon key wrong, or the
  migration didn't run. Re-check Part 5 and that `login_directory` exists (SQL Editor:
  `select * from login_directory();`).
- **"Incorrect PIN"** but you're sure it's right → password min length isn't 6 (Part 3),
  or the user's metadata `role` is missing/typo'd.
- **Add Member fails in-app** → you haven't deployed the `admin-users` function
  (Method B). Use the dashboard (Method A) meanwhile.
- **Want to reset everything** → SQL Editor: `truncate public.checks;` (clears checks
  only). Deleting users is done in Authentication → Users.
