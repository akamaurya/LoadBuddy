<h1 align="center">LoadBuddy</h1>

<p align="center">
  A training app that answers one question: <strong>should I push today, or recover?</strong>
</p>

<p align="center">
  <a href="https://loadbuddy.vercel.app"><strong>Live app →</strong></a>
  &nbsp;·&nbsp;
  <a href="#the-phase-math">How the math works</a>
  &nbsp;·&nbsp;
  <a href="#running-it-yourself">Run it yourself</a>
</p>

<p align="center">
  <img src="LoadTracker/public/iPhone%2017%20Load.png" alt="LoadBuddy in its Load state" width="220" />
  &nbsp;&nbsp;
  <img src="LoadTracker/public/iPhone%2017%20DeLoad.png" alt="LoadBuddy in its Deload state" width="220" />
</p>

---

Progressive overload only works if you periodically back off. Most lifters know this
and still skip deloads, because tracking them means remembering which week of which
cycle you're in. LoadBuddy removes the remembering: the whole screen turns green when
you should push and orange when you should recover, and a push notification lands a few
days before every switch.

No workout logs, no social feed, no streaks. One screen, two states.

## Features

- **The screen is the interface.** Green = Load, orange = Deload, plus one line telling
  you what that means for today's session.
- **Cycles you define.** Set a start date, a cycle length, and how many trailing weeks
  are deload. A 4/1 block and a 6/2 block are both just numbers — nothing is hardcoded.
- **Notifications with the right lead time.** Choose how many days ahead you want warning
  and at what local hour. The push states the actual timing ("tomorrow" vs "in 3 days").
- **Timezone-aware throughout.** Phase boundaries and send times are computed in the
  user's own zone, not the server's.
- **Accounts that sync.** Email/password and Google OAuth via Supabase, with password
  reset and self-serve account deletion.
- **Pause when life happens.** Injury or holiday — pause reminders and resume in place.
- **Installable PWA.** Add to Home Screen, which is also what iOS requires before it will
  grant web-push permission.
- **Bilingual landing page.** English ⇄ Hinglish toggle.

## Architecture

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + Vite 7 |
| Auth & database | Supabase (Postgres + Auth, Google OAuth) |
| Push delivery | OneSignal Web SDK |
| Scheduler | Supabase Edge Function (Deno), invoked hourly |
| Date logic | `date-fns` + `date-fns-tz` |
| PWA | `vite-plugin-pwa` |
| Analytics | Vercel Analytics + Microsoft Clarity |
| Hosting | Vercel (frontend), Supabase (edge function) |

```
LoadTracker/                       # the app (directory keeps the project's original name)
├── src/
│   ├── App.jsx                    # session/profile state and the Load/Deload screen
│   ├── components/                # landing page, auth, onboarding, settings, legal
│   └── lib/
│       ├── cycle.js               # shared form defaults, bounds, and profile mapping
│       ├── supabase.js
│       └── timezones.js
├── supabase/
│   ├── migrations/                # schema, RLS policies, delete_user()
│   └── functions/
│       ├── _shared/phase.ts       # the phase math — imported by app AND function
│       └── notify/index.ts        # hourly cron target
└── tests/                         # Playwright smoke test for the landing page
```

### One source of truth for the math

The load/deload calculation lives in `supabase/functions/_shared/phase.ts` and is
imported by *both* the React app and the Deno edge function. It is pure and
dependency-free specifically so the same file runs unchanged under Vite and Deno.

That matters because the failure mode here is silent: if the screen and the notifier
each had their own copy of the formula, a user could be told "deload starts tomorrow"
and then open the app to a green screen. Sharing the module makes that disagreement
impossible rather than merely unlikely.

### The `profiles` table

One row per authenticated user, protected by row-level security so a user can only
reach their own row. The edge function reads the table with the service role key.

| Column | Meaning |
| --- | --- |
| `id` | Supabase auth user id (PK, cascades from `auth.users`) |
| `email` | User email |
| `start_date` | First day of the training block (`YYYY-MM-DD`) |
| `cycle_length_weeks` | Total weeks per cycle |
| `deload_length_weeks` | Trailing weeks of each cycle that are deload |
| `timezone` | IANA timezone, e.g. `America/New_York` |
| `notification_hour` | Local hour (0–23) to send reminders |
| `notification_days_before` | Days of warning before a phase change |
| `paused` | When true, the notifier skips this user |

## The phase math

Phases are derived from *days since the start date*, never from ISO week numbers, so
any cycle length works and cycles repeat indefinitely without bookkeeping:

```ts
phaseFor(daysSinceStart, cycleWeeks, deloadWeeks)
// → { isDeload, daysIntoCycle, daysUntilNextPhase, isPhaseStart }
```

- A cycle is `cycleWeeks * 7` days.
- The first `(cycleWeeks - deloadWeeks) * 7` days are **Load**; the remainder is **Deload**.
- `isPhaseStart` is true only on the first day of a block — that's the notifier's trigger.

With a 4-week cycle and a 1-week deload: weeks 1–3 load, week 4 deload, repeating from
the start date. A future start date counts down instead of computing a phase.

## The notification function

`supabase/functions/notify/index.ts` is designed to run **once per hour**. Each run it:

1. Rejects any request without `Authorization: Bearer <CRON_SECRET>`.
2. Pages through every non-paused profile and keeps those whose *current local hour*
   equals their `notification_hour`.
3. Looks `notification_days_before` days ahead and, via `phaseFor()`, keeps only users
   for whom that day is the **first day of a new phase**.
4. Buckets the survivors by phase and lead time, so a single OneSignal call per bucket
   sends copy with the correct wording, and reports how many pushes actually landed.

Running hourly rather than daily is what lets every user pick their own send hour
without the server needing a per-user scheduler.

## Running it yourself

### Prerequisites

- **Node.js** 18+
- A **Supabase** project (free tier is fine)
- A **OneSignal** app, for web push
- **Deno**, only if you want to run the phase tests

### 1. Install

```bash
git clone https://github.com/akamaurya/LoadBuddy.git
cd LoadBuddy/LoadTracker
npm install
```

### 2. Frontend environment

Create `LoadTracker/.env`. These are compiled into the browser bundle, so only public
keys belong here:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ONESIGNAL_APP_ID=your_onesignal_app_id
```

The app degrades gracefully if Supabase vars are missing and skips push init if the
OneSignal id is absent, so you can boot the landing page with no configuration at all.

### 3. Database

The schema, RLS policies, and the `delete_user()` function are committed as migrations:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Then enable the **Google** auth provider if you want Google sign-in, and add your local
and production URLs to the auth redirect allow-list.

### 4. Run

```bash
npm run dev      # http://localhost:5173
npm run lint
npm run build
```

To exercise the iOS Add-to-Home-Screen and web-push flow you need Safari on a real
iOS 16.4+ device reaching your machine over the network — desktop Safari won't do.

### 5. Deploy the notifier

```bash
supabase functions deploy notify
supabase secrets set \
  ONESIGNAL_APP_ID=... \
  ONESIGNAL_REST_API_KEY=... \
  CRON_SECRET=...
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected by the platform. Then
schedule the function hourly (pg_cron, Supabase scheduled functions, or any external
cron), passing `Authorization: Bearer <CRON_SECRET>`.

## Tests

The phase math — the part where a bug is both most likely and least visible — is
covered by a Deno test suite, including a brute-force check that the current formula
agrees with the original week-floor implementation across every cycle/deload
combination from 2 to 8 weeks:

```bash
cd LoadTracker
npm test          # deno test supabase/functions/_shared/
```

A Playwright smoke test covers the landing page and its language toggle. It asserts on
structure and on the *change* between languages rather than on exact copy, so wording
edits don't produce false failures:

```bash
cd LoadTracker/tests
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt && playwright install chromium
python test_landing.py    # expects the dev server on :5173
```

## A note on iOS push

Apple only supports web push on **iOS 16.4+**, and only after the user has added the
site to their Home Screen — Safari will not even show the permission prompt otherwise.
The in-app prompt walks users through that, which is why an "Add to Home Screen" modal
exists in what is otherwise a deliberately screen-free app.

## License

[MIT](LICENSE)
