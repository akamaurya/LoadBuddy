# LoadBuddy 🏋️‍♂️

A hyper-minimalist, iOS-optimized Progressive Web App (PWA) that does one thing well: tell you whether you're in a **Load** or **Deload** training week, and warn you the day(s) before your phase changes.

No bloated workout logs, no social feeds — just a solid green screen for Load, a solid orange screen for Deload, a one-line prescription for what to do, and a push notification ahead of every switch.

> The app code lives under the `LoadTracker/` directory (its original name); the product is now branded **LoadBuddy**.

## Features

* **Zero-Friction UI:** The entire screen *is* the interface. Green = Load, Orange = Deload, with a short prescription line telling you whether to push volume or back off.
* **Your Body, Your Cycles:** Cycles are fully customizable per user — set your **start date**, **cycle length** (e.g. 4 weeks), and **deload length** (e.g. 1 week). The last N weeks of every cycle are deload; everything before is load. No more fixed "week 4 = deload" assumption.
* **Timezone-Aware:** Phase calculations and notifications respect each user's timezone (auto-detected during onboarding).
* **Smart Push Notifications:** Get a reminder a configurable number of **days before** each phase change, delivered at a configurable **hour** in your local time. The notification states the correct lead time ("Tomorrow…" vs "In 3 days…").
* **Accounts & Sync:** Email/password and **Google OAuth** sign-in via Supabase, with password reset and account deletion. Your cycle settings follow you across devices.
* **Guided Onboarding:** A short multi-step wizard captures your training block and notification preferences on first sign-in.
* **Bilingual Landing Page:** Marketing landing page with an English ⇄ Hinglish language toggle.
* **Pause Toggle:** Pause/resume notifications at any time.
* **Installable PWA:** "Add to Home Screen" prompt and Apple touch icons for an app-like iOS experience (required for iOS web push).

## Architecture

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + Vite 7 |
| Auth & Database | Supabase (Postgres + Auth, Google OAuth) |
| Push Notifications | OneSignal Web SDK |
| Scheduling / Backend | Supabase Edge Function (Deno), run hourly |
| Date Logic | `date-fns` + `date-fns-tz` |
| PWA | `vite-plugin-pwa` (manifest + service worker) |
| Analytics | Vercel Analytics + Microsoft Clarity |
| Hosting | Vercel (frontend) + Supabase (edge functions) |

The load/deload phase math lives in a single shared, dependency-free module — `supabase/functions/_shared/phase.ts` — imported by **both** the React app and the notify edge function, so the screen and the notifications can never disagree.

### The `profiles` table

Each authenticated user has one row in `profiles`:

| Column | Meaning |
| --- | --- |
| `id` | Supabase auth user id (PK) |
| `email` | User email |
| `start_date` | First day of the training block (`YYYY-MM-DD`) |
| `cycle_length_weeks` | Total weeks per cycle |
| `deload_length_weeks` | Trailing weeks of each cycle that are deload |
| `timezone` | IANA timezone (e.g. `America/New_York`) |
| `notification_hour` | Local hour (0–23) to send reminders |
| `notification_days_before` | How many days before a phase change to notify |

---

## Prerequisites

1. **Node.js** v18+ recommended.
2. A **Supabase** project (free tier is fine) — provides auth, the `profiles` table, and edge function hosting.
3. A **OneSignal** account (free tier) — provides web push.
4. A **Vercel** account (for hosting the frontend).

---

## Setup & Installation

### 1. Clone and install

```bash
git clone https://github.com/yourusername/LoadBuddy.git
cd LoadBuddy/LoadTracker
npm install
```

### 2. Configure environment variables

Create a `.env` file in `LoadTracker/` with the **frontend** keys (these are exposed to the browser via Vite, so only use public keys here):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ONESIGNAL_APP_ID=your_onesignal_app_id
```

### 3. Supabase setup

1. Create a project and a `profiles` table with the columns listed above (with row-level security so users can only read/write their own row).
2. Enable the **Google** auth provider if you want Google sign-in.
3. Add your local and production URLs to the auth redirect allow-list.

### 4. Run locally

```bash
npm run dev
```

Open `http://localhost:5173`. To test the iOS "Add to Home Screen" / web push flow, use Safari on an iOS 16.4+ device over your local network.

---

## The Notification Edge Function

The serverless logic lives in `supabase/functions/notify/index.ts` (Deno). It is designed to be **invoked once per hour** by a scheduler (e.g. Supabase scheduled functions / pg_cron, or any external cron hitting the function URL with the secret).

Each run it:

1. Rejects any request without `Authorization: Bearer <CRON_SECRET>`.
2. Loads all profiles and, for each, checks whether the **current local hour** matches that user's `notification_hour`.
3. Looks `notification_days_before` days into the future and, using the shared `phaseFor()` math, sends a push **only if** that look-ahead day is the first day of a new Load or Deload phase.
4. Buckets users by phase + lead time so every push states the correct timing, then fires them via the OneSignal API.

### Edge function secrets

Set these as secrets on the Supabase edge function (the service role and REST keys must **never** be exposed to the frontend):

```env
ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CRON_SECRET=a_long_random_string
```

### Deploy the function

```bash
cd LoadTracker
supabase functions deploy notify
supabase secrets set ONESIGNAL_APP_ID=... ONESIGNAL_REST_API_KEY=... CRON_SECRET=...
```

Then schedule it to run hourly, passing the `Authorization: Bearer <CRON_SECRET>` header.

---

## The Logic (Math)

Phases are computed from days since the user's `start_date`, not from ISO week numbers, so any cycle/deload length works:

```ts
phaseFor(daysSinceStart, cycleWeeks, deloadWeeks)
// → { isDeload, daysIntoCycle, daysUntilNextPhase, isPhaseStart }
```

* A cycle is `cycleWeeks * 7` days long.
* The first `(cycleWeeks - deloadWeeks) * 7` days are **Load**; the rest are **Deload**.
* `isPhaseStart` is true only on the first day of a load or deload block — that's what the notifier keys off of.

For example, with a 4-week cycle and a 1-week deload: weeks 1–3 are Load, week 4 is Deload, repeating indefinitely from the start date.

The module is pure and zero-dependency, with a built-in self-check you can run directly:

```bash
deno run supabase/functions/_shared/phase.ts
```

---

## Deployment (Frontend)

The Vite frontend is hosted on Vercel:

1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel` from `LoadTracker/` and link the project.
3. Add the `VITE_*` environment variables in the Vercel project dashboard.
4. Deploy: `vercel --prod`

---

## Tests

A Playwright smoke test for the landing page (including the EN/Hinglish toggle) lives in `LoadTracker/tests/`:

```bash
cd LoadTracker/tests
python3 -m venv venv && source venv/bin/activate
pip install playwright && playwright install
python test_landing.py   # requires the dev server running on :5173
```

---

## A Note on iOS Push Notifications

Apple restricts web push to **iOS 16.4+**, and the user **must** add the app to their Home Screen before Safari will allow notification permissions. The UI includes a prompt to guide users through this flow when they view the app in a normal mobile browser.

## License

MIT
