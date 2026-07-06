# iklipse Central Hub — Developer Handoff

This is a **high-fidelity frontend prototype** of the iklipse Central Hub + public marketing landing.
It is **UI-complete in many areas but NOT wired to any backend.** Everything below tells you exactly
what is real, what is faked, and what must be built/connected from A to Z.

Read this whole file before touching code.

---

## 1. Stack & how to run

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (CSS-based config via `@theme` in `src/app/globals.css`, no `tailwind.config.js`)
- **Framer Motion** (`framer-motion`) and **motion** (`motion/react`, used by the testimonials)
- **lucide-react** icons
- Fonts: **Excon** (base) + **PP Editorial Old** (italic accents), self-hosted in `public/fonts` via `next/font/local`

```bash
cd iklipse-hub
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (currently passes clean)
```

> Node 18+ (built/tested on Node 24). If the dev server shows "offline", it simply isn't running —
> run `npm run dev` again. Nothing is hosted; this is local-only.

### Routes
- `/` landing (public) · `/launch` portal chooser · `/login` team login · `/portal` client portal
- `/test` Instagram mockup (off-nav experiment) · `/not-found` 404
- Hub (behind login): `/dashboard`, `/godmode`, `/tasks`, `/clients`, `/sales`, `/academy`,
  `/sop`, `/salary`, `/calendar`, `/settings`, `/profile`, `/admin/users`

---

## 2. THE BIG PICTURE — what is NOT connected

**Nothing persists server-side. There is no backend, no database, no real auth, no real integrations.**
All "data" is either hardcoded mock data or stored in the browser's `localStorage`. The intended
production architecture (per the original spec) is **Supabase** (Postgres + Auth + RLS + Edge Functions)
with **n8n** for automations. None of that exists yet.

### 2.1 Authentication & security — `src/lib/auth.tsx`  ⚠️ MUST REPLACE
- **Demo only.** Users live in `localStorage` (`iklipse.users.v1`); the session is just a stored id
  (`iklipse.session.v1`). Passwords are **base64-obfuscated, NOT hashed** — this is **insecure** and
  must never ship.
- A super-admin is **seeded in code**: username `Billy`, password `a7a3alayayad_` (`seedUsers()`).
  Move this out of code immediately.
- **To do:** replace with **Supabase Auth** (or similar): real hashed passwords, server sessions,
  email invites, password reset, and **Row-Level Security** so the 5 roles
  (`super_admin/admin/manager/member/client`) are enforced at the DB — currently roles are only
  checked in the UI, which is not secure.
- **Forgot-password** (`/login`) just shows "admins notified (Marshall, Omar)". Wire to real email.
- **Route gating** is client-side only (`AppShell` redirects if no localStorage session). Anyone can
  hit the routes directly in a real deploy; enforce on the server.

### 2.2 The data layer — `src/lib/data.ts`  ⚠️ ALL MOCK
Every list in the hub is a hardcoded array: `members`, `clients`, `tasks`, `leads`, `salary`,
`lessons`, `sops`, `calendar`, `notifications`. Replace each with real DB tables + queries.
SLA timers/deadlines are stored as **time offsets from page load** (so the demo ticks live) — in
production these become real timestamps.

### 2.3 ⚠️ Two identity stores are NOT unified (important)
There are **two separate concepts of "people"**:
1. **Auth users** (`auth.tsx`, localStorage) — who can log in.
2. **Team members** (`data.ts` `members`: Nabil, Biker, Kotb, Joe, Sama, Sameh, Yusuf, Mina,
   Omar VFX, Shams, Karim, Abdo, Fawzy) — shown in Godmode, Academy, Salary, assignment pickers.

These are **not linked.** Consequences the dev must fix:
- Logging in as a team member doesn't show "their" data — the logged-in account isn't a `members` row.
- Academy assignment "Assigned to me" can't truly filter per member yet (submissions record against
  `currentUser.id`, not the member id).
- **Fix:** one `users` table that IS the team roster, with role + seniority, referenced everywhere.

### 2.4 ⚠️ Cross-side reflection is NOT real
Actions on one side do **not** propagate to the other because there's no shared backend:
- **Client portal (`/portal`)** is fully self-contained mock data (`projects`, `deliverables` arrays in
  `src/app/portal/page.tsx`). It does **not** read from the team-side Client CRM (`/clients`), and the
  client sign-in is **fake** (any input logs in; no real client accounts).
- **Academy assignments** persist only in the creator's browser `localStorage` — another user on
  another device sees nothing.
- **CRM → portal account creation + email invite** (spec'd) is **not built.**
- **Fix:** shared DB + realtime (Supabase Realtime) so team actions reflect on the client portal and
  vice-versa.

---

## 3. INTEGRATIONS — none are connected (all need wiring)

| Integration | Where it's referenced | Status |
|---|---|---|
| **Supabase** (DB/Auth/RLS) | everywhere (mock) | NOT connected — the core backend to build |
| **LLM (Claude API)** | **Bolbol** chatbot (`components/shell/Bolbol.tsx`), Academy **AI assistant** (`AcademyLibrary`) | Simulated replies only. Wire to a real model w/ tool-calling for read/write actions |
| **Slack** | salary receipts, nudges, escalations, paid-confirmation | Not connected |
| **WhatsApp / Twilio** | escalation ladder, voice dials | Not connected |
| **Gmail / Google Calendar** | calendar, booking open slots, call visibility | Not connected (Calendar page is mock) |
| **n8n** | all automations (escalations, reminders) | Not connected |
| **ElevenLabs** | SOP narration (spec'd) | Not built |
| **Fireflies** | call summaries into client profiles (spec'd) | Not built |
| **MailChimp / Beehiiv** | newsletter sync for Won leads | Not connected |
| **Google Drive** | "links over storage" file refs | Links are placeholder URLs |
| **Vimeo/YouTube/Loom** | hero showreel + academy videos | Embeds work; data is hardcoded |

Recommended: put all keys in env vars; do LLM calls through a server route / Vercel AI Gateway; run
multi-step automations in n8n triggered by DB webhooks.

---

## 4. FEATURE-BY-FEATURE STATUS

### Landing (`/`, `src/app/page.tsx`) — visual only
- Hero, client marquee, testimonials, services, portfolio, footer: **done visually.**
- **Watch reel** popup → real Vimeo embeds (work). **Services** buttons → interstitial → main site (work).
- **Testimonials** = real Fiverr quotes found via search + representative ones (Fiverr blocks scraping);
  rating "4.9 / 210 reviews" is **hardcoded** — update or pull from an API.
- **Client logos / works** = real images from iklipseworld.com CDN (hotlinked). Consider self-hosting.
- Dark/light **theme toggle** works (persists in `localStorage`).
- Feature image is `public/feature.jpg` (swap the file to change it, no code change).

### Auth / launch / login — see §2.1 (demo, replace)

### Dashboard (`/dashboard`) — mostly display
- Greeting + KPI ring + bento (tasks, schedule, training) read **mock** data.
- **TODO from spec:** "summaries of everything" + let management **assign QC requests** to you (QC inbox) — not built.

### Panoptic Godmode (`/godmode`)
- Live Pulse Grid (real names + roles + seniority crowns/marks), KPI heatmap, bracket timers: **UI done, mock data.**
- **Nudge** button = toast only (no Slack/WhatsApp). KPI override / CSV export buttons = **non-functional.**

### Tasks (`/tasks`) — ⚠️ buttons/limited
- Board / List / Calendar **views render**, SLA timers tick.
- **NOT built (requested):** Notion-style **drag-and-drop** between columns + click-to-change-status.
  Current board is read-only. "New task" button = non-functional.

### Client CRM (`/clients`) — display only
- Client cards, SLA countdowns, escalation ladder visual: **UI done, mock.**
- **NOT built (requested):** "Onboard new client" journey (contract+invoice upload → **AI** parses
  deliverables/timeline/notes → task flow), account→team-members model, fields (Slack/WhatsApp/socials/
  website + **auto AI research**), call-recording/Fireflies summaries, the sprint/timeline view
  (official=black / secret buffer=red / team deadline=orange / before=green). "New client" button = non-functional.

### Sales CRM (`/sales`) — display only
- Kanban/List/Spreadsheet toggle works; data is mock.
- **NOT built (requested):** CSV / Google-Sheet **import**, source tabs/categories, saved email DB
  ("manychat emails"), **Event leads → "Doers Summit Limassol 2026"**, **Past clients** (CSV/manual/
  auto-archive on project complete; fields Project/Date/Company/Services). "New lead" button = non-functional.

### Academy (`/academy`) — assignment system works (localStorage)
- 16:9 tabbed library (Internal/External/Assigned), assignment **creator** (text/image/video/AI/member
  picker) and **watch+submit** detail: **functional but localStorage-only** (see §2.3, §2.4).
- **AI assistant** drafts text but is **simulated** (wire LLM). Image upload works; **file** (non-image)
  upload + **transcript-reading AI** not built.
- **NOT built (requested):** real per-member notifications & true "Assigned to me"; **"Retest"** button
  on team-progress bars (force retake within a day + nag); ElevenLabs SOP narration; "onboard into
  training" gating (lock new hires to A-Z training + 3 tricky questions per SOP).

### SOP Library (`/sop`) — works
- Search + category filter; **clicking an SOP opens the real PDF inline** (PDFs in `public/sops/`).
- Quiz-gating is cosmetic (a badge); no real gate. Presentation-format sub-tab not built.

### Salary & HR (`/salary`) — display only
- Register + receipt statuses + 10-day-policy notes: **UI done, mock numbers.**
- **NOT built (requested):** real salaries per person + clickable salary **profile/history**, Slack
  paid-confirmation reflection, the **escalation if unpaid after the 10th** (Slack nag → text Nabil+Biker).

### Calendar (`/calendar`) — display only
- Month grid + agenda are **mock.** **NOT built:** employee list auto-populated on onboarding +
  **Google Calendar** integration (see active calls + book open slots / Appointment Schedules).

### Profile (`/profile`) — works (local)
- Edit name/username/email/bio, **photo upload** (downscaled, persists in localStorage, reflects in
  sidebar), **change-password** modal. All local; moves to Supabase with real auth.

### User Management (`/admin/users`) — works (local)
- Admins add users (saved to localStorage). **TODO (requested):** seed accounts for all team members
  with default passwords + force-change on first login + **email the password**; **clone the admin
  dashboard for Biker & Sameh** (role-based views). Email + cloning not built.

### Bolbol AI (bottom-right, all hub pages) — UI only
- Floating assistant opens a chat; replies are **canned.** Must be wired to an LLM with **tool-calling**
  + read/write access to platform data to do what was asked (move leads, change statuses, set probation,
  answer about progress/QC/legal, voice in/out).

---

## 5. NON-FUNCTIONAL / PLACEHOLDER BUTTONS (quick list)
- Godmode: **Export CSV**, **Override mode**, KPI cell **Override score / View raw data**
- Tasks: **New task**; cards are **not draggable**; status pills don't change on click
- Clients: **New client**; Drive links are placeholders
- Sales: **New lead**
- Academy: **Review queue (3)** banner button; Bolbol/AI = simulated
- Salary: rows are not clickable to a profile; receipt actions don't call Slack
- TopBar: **Quick add (+)**, **Search/⌘K** (UI only, no real results), **Notifications** (static list)
- Settings: integration toggles are cosmetic (no real connect/OAuth)
- Client portal: **Approve / Request changes**, **Message the team** (no real chat), download buttons
  (files are placeholders), project cards (no real project page) — all spec'd but not wired

---

## 6. ASSETS & FONTS
- Fonts self-hosted in `public/fonts` (Excon\*, PPEditorialOld\*). Loaded in `src/app/layout.tsx`.
- `public/feature.jpg` (homepage feature image) and `public/sops/*.pdf` (the 17 SOPs) are real files.
- Brand images on the landing are **hotlinked** from `cdn.prod.website-files.com` (iklipseworld.com).
  For production, self-host them and configure `next.config.ts` `images` if switching to `next/image`.

---

## 7. SUGGESTED BUILD ORDER FOR THE DEV
1. **Supabase**: schema (users/clients/tasks/leads/salary/lessons/assignments/submissions/sops/
   calendar), Auth, RLS for the 5 roles. Replace `auth.tsx` + `data.ts` reads with real queries.
2. **Unify identity** (§2.3): one users table = team roster.
3. **Realtime / cross-side** (§2.4): client portal ↔ team CRM, assignments across devices.
4. **LLM** via a server route (Bolbol + Academy AI + CRM contract parsing + AI research).
5. **Integrations** (§3) through n8n + env keys: Slack, WhatsApp/Twilio, Google Calendar, Gmail,
   MailChimp/Beehiiv, Fireflies, ElevenLabs.
6. Build the remaining requested features (Tasks DnD, CRM onboarding journey + sprint timeline,
   Sales import/past-clients, Salary automation, Training onboarding, QC inbox, Biker/Sameh clones).

---

## 8. CONVENTIONS (so the UI stays consistent)
- **No em-dashes anywhere** (client preference) — use hyphens/commas.
- Brand orange `#F95338`; full palette: `#ffffff #bdccd4 #f95338 #ed1c24 #29abe2 #2e3192 #1b1464 #040238 #000000`
  (the user asked to align the dashboard to this palette — partially applied; finish it).
- Titles use **Excon Medium**, body **Excon Regular**; accent words use **PP Editorial Old italic**
  (`.font-editorial italic`).
- Glass surfaces via `.glass` / `.glass-inset`; theme is class-based dark/light (`.dark` on `<html>`).
