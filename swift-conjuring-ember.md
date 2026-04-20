# Gatherly — Next.js Build Plan (v3 — Vercel + Supabase)

## Context
Migrating a single-file Vite/React prototype (`gatherly/Alireza-Tehrani-main/`) into a
production-grade Next.js 14 App Router project (`gatherly-web/`).

**Deployment stack**:
| Concern | Service |
|---|---|
| Hosting | Vercel |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + Google OAuth) |
| File storage | Supabase Storage |
| Email | Resend |
| Scheduled jobs | Vercel Cron |
| Secrets | Vercel environment variables |
| AI text generation | Gemini 2.5 Flash (all text: analyze, event content, translate, curate) |
| AI image generation | Gemini image model (hero, details, rsvp, timeline) |

**Key architectural principle**: Users never see AI providers. Admin switches providers
app-wide from a dashboard. Config stored in Supabase `ai_config` table, cached 60s
in-memory.

---

## AI Provider Architecture

### Provider Abstraction

```
lib/ai/
├── types.ts              # TextAIProvider + ImageAIProvider interfaces
├── registry.ts           # maps provider name → implementation instance
├── config.ts             # getAIConfig() / setAIConfig() — 60s in-memory cache
│                         # reads Supabase ai_config table
│                         # fallback to process.env for Day 1-2 (no DB yet)
├── text/
│   ├── gemini-provider.ts     # FULL — port analyzePrompt + generateEventDetails verbatim
│   ├── claude-provider.ts     # STUB — throws "not yet implemented"
│   └── openai-provider.ts     # STUB — throws "not yet implemented"
└── image/
    └── gemini-image-provider.ts  # FULL — port generateEventImage verbatim
```

**Interfaces** (`lib/ai/types.ts`):
```typescript
interface TextAIProvider {
  analyzePrompt(prompt: string): Promise<PromptAnalysis>;
  generateEventDetails(prompt: string, date: string, time: string, location: string): Promise<Omit<EventData, 'images'>>;
}
interface ImageAIProvider {
  generateImage(prompt: string, aspectRatio: string): Promise<string>; // base64 data URL
}
```

**Config store** (`lib/ai/config.ts`):
- `getAIConfig()` → `{ textProvider: 'gemini'|'claude'|'openai', imageProvider: 'gemini-image' }`
- Reads Supabase `ai_config` table (row id=`current`). Falls back to
  `DEFAULT_TEXT_PROVIDER` / `DEFAULT_IMAGE_PROVIDER` env vars if table empty or
  Supabase unreachable.
- In-memory TTL cache: 60 seconds
- `setAIConfig(config)` → upserts Supabase row + invalidates cache

**Registry** (`lib/ai/registry.ts`):
- Maps provider name → instance
- Providers whose API key env var is absent are excluded from admin dropdown

---

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # server-only

# AI
GEMINI_API_KEY                   # required — only active provider Day 1-2
ANTHROPIC_API_KEY                # optional — unlocks claude stub in admin
OPENAI_API_KEY                   # optional — unlocks openai stub in admin
DEFAULT_TEXT_PROVIDER=gemini
DEFAULT_IMAGE_PROVIDER=gemini-image

# Auth / Admin
ADMIN_EMAILS                     # comma-separated

# Email
RESEND_API_KEY

# Cron security
CRON_SECRET                      # random string, checked by /api/cron/* handlers

# Maps
NEXT_PUBLIC_MAPS_API_KEY         # Google Maps embed
```

---

## 1. Folder Structure

```
gatherly-web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                          # Home (SSR static)
│   ├── globals.css                       # Tailwind v4 @theme + utilities
│   │
│   ├── e/[eventId]/
│   │   ├── page.tsx                      # SSR event page (Supabase read Day 3+)
│   │   ├── loading.tsx
│   │   └── not-found.tsx
│   │
│   ├── create/
│   │   └── page.tsx                      # Client — analyzing → wizard → generating
│   │
│   ├── dashboard/
│   │   ├── layout.tsx                    # Supabase Auth guard
│   │   └── page.tsx                      # Host event list (stub Day 1-2)
│   │
│   ├── admin/
│   │   ├── layout.tsx                    # isAdmin guard
│   │   └── ai-settings/page.tsx          # AI provider config UI
│   │
│   ├── login/page.tsx                    # Supabase Auth UI (stub Day 1-2)
│   ├── auth/callback/route.ts            # Supabase OAuth callback handler
│   │
│   └── api/
│       ├── events/
│       │   ├── analyze/route.ts          # POST → AI text provider
│       │   ├── create/route.ts           # POST → AI text + image providers
│       │   └── [eventId]/
│       │       ├── route.ts              # GET → Supabase (stub Day 1-2)
│       │       └── rsvp/route.ts         # POST → Supabase (stub Day 1-2)
│       ├── admin/
│       │   ├── ai-config/route.ts        # GET + PATCH — admin only
│       │   └── ai-config/providers/route.ts  # GET — available providers list
│       ├── cron/
│       │   └── post-event/route.ts       # GET — Vercel Cron, CRON_SECRET auth
│       └── health/route.ts
│
├── components/
│   ├── EventPage/
│   │   ├── EventPageView.tsx
│   │   ├── HeroSection.tsx
│   │   ├── DetailsBar.tsx
│   │   ├── DescriptionSplit.tsx
│   │   ├── Timeline.tsx
│   │   ├── LocationMap.tsx
│   │   ├── RsvpForm.tsx                  # "use client"
│   │   ├── ShareModal.tsx                # "use client"
│   │   └── getStyleConfig.ts             # Port verbatim from prototype
│   ├── Home/
│   │   ├── HeroPrompt.tsx                # "use client"
│   │   └── TestimonialCard.tsx
│   ├── Wizard/
│   │   └── WizardForm.tsx                # "use client"
│   ├── Admin/
│   │   └── AISettingsForm.tsx            # "use client"
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Spinner.tsx
│
├── lib/
│   ├── types.ts                          # From spec verbatim
│   ├── api-client.ts                     # From spec verbatim
│   ├── ai/
│   │   ├── types.ts
│   │   ├── registry.ts
│   │   ├── config.ts                     # reads ai_config table, 60s cache
│   │   ├── text/
│   │   │   ├── gemini-provider.ts        # FULL — port verbatim
│   │   │   ├── claude-provider.ts        # STUB
│   │   │   └── openai-provider.ts        # STUB
│   │   └── image/
│   │       └── gemini-image-provider.ts  # FULL — port verbatim
│   ├── supabase/
│   │   ├── client.ts                     # Browser Supabase client (@supabase/ssr)
│   │   └── server.ts                     # Server Supabase client (@supabase/ssr)
│   ├── email/
│   │   ├── resend.ts                     # send() wrapper around Resend SDK
│   │   └── templates/
│   │       ├── RsvpConfirmation.tsx      # @react-email/components JSX template
│   │       └── PhotoRequest.tsx          # @react-email/components JSX template
│   ├── storage/
│   │   └── supabase-storage.ts           # getSignedUploadUrl(), getPublicUrl()
│   ├── admin.ts                          # isAdmin(email) from ADMIN_EMAILS
│   └── fixture.ts                        # MOCK_EVENT for dev/mock mode
│
├── supabase/
│   └── migrations/
│       └── 0001_initial.sql              # Schema + RLS policies
│
├── middleware.ts                         # Supabase session refresh + route guards
├── vercel.json                           # Cron config
├── .env.example                          # All required vars documented
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 2. Database Schema (`supabase/migrations/0001_initial.sql`)

```sql
-- Events
create table events (
  id           text primary key,          -- ULID
  short_token  text unique not null,       -- 10-char nanoid, guest URL key
  host_id      uuid references auth.users, -- null for anonymous events
  prompt       text not null,
  title        text not null,
  description  text not null,
  theme_name   text not null,
  theme_colors jsonb not null,            -- {primary,secondary,background,text}
  ui_style     text not null,             -- elegant|playful|minimal|bold|romantic
  is_rtl       boolean default false,
  date         text not null,
  time         text not null,
  location     text not null,
  schedule     jsonb not null,            -- [{time,title,description}]
  vibe         text not null,
  welcome_message text not null,
  images       jsonb not null,            -- {hero,details,rsvp,timeline[]}
  plan         text default 'free',       -- free|party|unlimited
  event_date_utc timestamptz,
  photo_collection_started_at timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Guests (RSVPs)
create table guests (
  id           text primary key,          -- ULID
  event_id     text references events(id) on delete cascade,
  name         text not null,
  email        text not null,
  attending    boolean not null,
  bringing     text,
  upload_token text unique,               -- nanoid-20, for photo upload link
  rsvp_at      timestamptz default now(),
  unique(event_id, email)                 -- idempotency: one RSVP per email
);

-- Photos
create table photos (
  id             text primary key,        -- ULID
  event_id       text references events(id) on delete cascade,
  guest_id       text references guests(id),
  storage_path   text not null,           -- Supabase Storage path
  public_url     text not null,           -- CDN URL
  uploaded_at    timestamptz default now(),
  ai_score       integer,                 -- 0-100
  ai_tags        text[],
  in_gallery     boolean default false,
  is_blurry      boolean
);

-- AI provider config (single row, upserted by admin)
create table ai_config (
  id               text primary key default 'current',
  text_provider    text not null default 'gemini',
  image_provider   text not null default 'gemini-image',
  updated_at       timestamptz default now()
);

-- RLS policies
alter table events enable row level security;
alter table guests enable row level security;
alter table photos enable row level security;
alter table ai_config enable row level security;

-- Events: public read, host write
create policy "events_public_read"  on events for select using (true);
create policy "events_host_insert"  on events for insert with check (host_id = auth.uid() or host_id is null);
create policy "events_host_update"  on events for update using (host_id = auth.uid());
create policy "events_host_delete"  on events for delete using (host_id = auth.uid());

-- Guests: host read, public insert (anyone can RSVP)
create policy "guests_host_read"   on guests for select using (
  exists (select 1 from events where events.id = guests.event_id and events.host_id = auth.uid())
);
create policy "guests_public_rsvp" on guests for insert with check (true);

-- Photos: host + guest read via upload_token (handled server-side)
create policy "photos_host_read"   on photos for select using (
  exists (select 1 from events where events.id = photos.event_id and events.host_id = auth.uid())
);

-- ai_config: service role only (admin API uses service role key)
create policy "ai_config_deny_all" on ai_config for all using (false);
```

---

## 3. Day 1–2 Task Breakdown (unchanged — UI + AI integration)

### Day 1 — Scaffold + Event Page (UI)

**Task 1.1 — Project init** (30 min)
- `npx create-next-app@latest gatherly-web --typescript --tailwind --app --no-src-dir`
- Deps: `motion`, `lucide-react`, `react-qr-code`, `@google/genai`, `nanoid`, `ulid`,
  `@supabase/supabase-js`, `@supabase/ssr`, `resend`, `@react-email/components`,
  `@react-email/render`
- Port `globals.css` — `@theme` block + `.glass-panel` + `.pill-button`
- Port fonts: Cormorant Garamond, Inter, Vazirmatn
- Write `.env.example` with all vars documented

**Task 1.2 — Types + stubs** (20 min)
- `lib/types.ts` — verbatim from spec
- `lib/api-client.ts` — verbatim from spec
- `lib/fixture.ts` — one hardcoded `EventData` matching prototype shape

**Task 1.3 — getStyleConfig** (15 min)
- Copy verbatim from prototype App.tsx → `components/EventPage/getStyleConfig.ts`

**Task 1.4 — EventPageView + sub-components** (3-4 hrs)
- `HeroSection.tsx` — hero image, overlay gradient, title/welcome motion
- `DetailsBar.tsx` — 3-col When/Time/Where, `-mt-10` overlap
- `DescriptionSplit.tsx` — text + image 2-col, scroll-triggered fade-up
- `Timeline.tsx` — alternating cards, zoom-on-hover images
- `LocationMap.tsx` — Google Maps iframe (lazy)
- `RsvpForm.tsx` — `"use client"`, idle→submitting→success
- `ShareModal.tsx` — `"use client"`, QR + clipboard, ESC close
- `EventPageView.tsx` — assembles all above

**Task 1.5 — Home page** (45 min)
- `app/page.tsx` — Server Component, 2-col desktop
- `HeroPrompt.tsx` — `"use client"`, input → `router.push('/create?prompt=...')`
- `TestimonialCard.tsx` — static glassmorphic card

**Task 1.6 — Stub event page** (20 min)
- `app/e/[eventId]/page.tsx` — renders fixture data via `<EventPageView>`
- `loading.tsx`, `not-found.tsx`

**Task 1.7 — ui/ primitives** (20 min)
- `Button.tsx`, `Input.tsx`, `Spinner.tsx`

**EOD 1**: `npm run dev` → `/e/test` renders full event page from fixture data.

---

### Day 2 — AI Integration + Create Flow + Admin Scaffold

**Task 2.1 — AI interfaces** (20 min)
- `lib/ai/types.ts`

**Task 2.2 — Gemini text provider** (45 min)
- `lib/ai/text/gemini-provider.ts` — port `analyzePrompt` + `generateEventDetails`
  verbatim from `geminiService.ts`, wrapped in `TextAIProvider`

**Task 2.3 — Gemini image provider** (20 min)
- `lib/ai/image/gemini-image-provider.ts` — port `generateEventImage` verbatim,
  wrapped in `ImageAIProvider`

**Task 2.4 — Stubs** (10 min)
- `claude-provider.ts` + `openai-provider.ts` — implement interface, all methods throw

**Task 2.5 — Registry + Config** (45 min)
- `lib/ai/registry.ts` — name → instance, excludes providers with missing API keys
- `lib/ai/config.ts`:
  - `getAIConfig()` — 60s in-memory cache → Supabase `ai_config` table → env var fallback
  - `setAIConfig(config)` — upserts Supabase row (service role key), clears cache
  - Supabase call fails gracefully in Day 1-2 (no table yet) → env var fallback

**Task 2.6 — Supabase clients** (20 min)
- `lib/supabase/client.ts` — `createBrowserClient()` from `@supabase/ssr`
- `lib/supabase/server.ts` — `createServerClient()` with cookie adapter for App Router

**Task 2.7 — Route handlers** (1 hr)
- `app/api/events/analyze/route.ts`
  - `POST` → `getAIConfig()` → `textProvider.analyzePrompt(prompt)`
  - `AI_MOCK=true` → fixture `PromptAnalysis`
- `app/api/events/create/route.ts`
  - `POST` → `generateEventDetails()` + `Promise.all` of image calls
  - Assembles `EventData` with base64 images (Day 1-2; Supabase Storage Day 3+)
  - `AI_MOCK=true` → fixture EventData
- `app/api/health/route.ts` — returns `{ ok: true }`

**Task 2.8 — Create flow page** (2 hrs)
- `app/create/page.tsx` — state machine:
  `analyzing → wizard? → generating → router.replace('/e/${id}?fresh=1')`
- Progressive messages: 0-3s / 3-8s / 8-20s / 20s+
- Store EventData in `sessionStorage[eventId]` (no DB yet)
- `?fresh=1` → celebration entrance animation

**Task 2.9 — Wire event page to sessionStorage** (30 min)
- `app/e/[eventId]/page.tsx` — client-side check of `sessionStorage`, fixture fallback

**Task 2.10 — Wizard** (30 min)
- `WizardForm.tsx` — missing fields only, glass-card

**Task 2.11 — Admin scaffold** (45 min)
- `lib/admin.ts` — `isAdmin(email)` from `ADMIN_EMAILS`
- `app/admin/layout.tsx` — redirect non-admins to `/login`
- `app/api/admin/ai-config/route.ts` — `GET` / `PATCH` (admin only)
- `app/api/admin/ai-config/providers/route.ts` — `GET` available providers
- `AISettingsForm.tsx` — `"use client"`, dropdowns, PATCH on submit, toast
- `app/admin/ai-settings/page.tsx`

**Task 2.12 — middleware + vercel.json** (20 min)
- `middleware.ts` — `@supabase/ssr` session refresh on all routes;
  redirect `/dashboard` and `/admin` to `/login` when unauthenticated/unauthorized
- `vercel.json`:
  ```json
  {
    "crons": [{ "path": "/api/cron/post-event", "schedule": "*/5 * * * *" }]
  }
  ```
- `app/api/cron/post-event/route.ts` — stub: verify `Authorization: Bearer ${CRON_SECRET}`,
  return 200 (full implementation Day 3+)

**EOD 2 checkpoint**:
1. `npm run dev`
2. Home → type prompt → `/create` → analyzing → generating → `/e/<id>` with real AI content + images
3. RTL test: Farsi prompt → page flips direction
4. Share modal: QR renders, clipboard works
5. `/admin/ai-settings` → Gemini shown, PATCH works (env var fallback)
6. `npm run build` — zero TypeScript errors

---

## 4. Persistence Layer (Day 3+, not Day 1-2)

Replaces sessionStorage bridge with real Supabase reads/writes.

**Day 3 tasks** (order):
1. Run `supabase/migrations/0001_initial.sql` against local Supabase
2. `app/api/events/create/route.ts` — after AI generation, upload base64 images to
   Supabase Storage (`events/<id>/<slot>.jpg`), replace base64 with public CDN URL,
   `insert` row into `events` table
3. `app/e/[eventId]/page.tsx` — restore as Server Component, fetch from Supabase
4. `app/api/events/[eventId]/rsvp/route.ts` — insert `guests` row, idempotency on
   `(event_id, email)`, send Resend confirmation email
5. `lib/email/resend.ts` + email templates (`RsvpConfirmation.tsx`, `PhotoRequest.tsx`)
6. `lib/storage/supabase-storage.ts` — `getSignedUploadUrl()`, `getPublicUrl()`
7. `app/api/cron/post-event/route.ts` — full: scan events where
   `event_date_utc < now() - 2h AND photo_collection_started_at IS NULL`, send
   `PhotoRequest` emails via Resend, update `photo_collection_started_at`
8. Dashboard — real event list from Supabase, auth via Supabase Auth

---

## 5. Service Swap Summary (AWS → Vercel/Supabase)

| Old (AWS) | New (Vercel/Supabase) |
|---|---|
| DynamoDB single-table | Supabase PostgreSQL (`events`, `guests`, `photos`, `ai_config`) |
| Cognito | Supabase Auth (email + Google OAuth) |
| S3 presigned POST | Supabase Storage signed upload URL |
| SES emails | Resend + `@react-email/components` JSX templates |
| EventBridge scheduled rules | Vercel Cron (`*/5 * * * *`) scanning for due events |
| Secrets Manager | Vercel environment variables |
| SAM / Lambda | Next.js App Router route handlers on Vercel |
| CloudFront | Supabase Storage CDN (built-in) |

---

## 6. Out of Scope for Day 1–2

- Supabase persistence (events, guests, photos)
- Supabase Auth UI / dashboard
- Resend emails
- Supabase Storage (images stay as base64)
- Stripe / billing
- Photo sharing / upload flow
- OG image generation
- Full Vercel Cron implementation

---

## 7. Verification

End-of-day-2 smoke test:
1. `cd gatherly-web && npm run dev`
2. `http://localhost:3000` → hero prompt
3. Type: "My daughter's 5th birthday, princess theme, Saturday Oct 24th 6pm at Royal Gardens"
4. Analyzing → (no wizard) → generating with timed messages → `/e/<id>`
5. Event page: themed hero, details bar, timeline, RSVP form
6. RTL: "جشن تولد دخترم، تم پرنسس..." → Farsi, right-to-left
7. Share modal: QR + copy works
8. `/admin/ai-settings`: Gemini active, PATCH saves
9. `curl localhost:3000/api/health` → `{"ok":true}`
10. `npm run build` — zero TS errors
