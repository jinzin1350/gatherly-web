-- ============================================================
-- Gatherly — Initial Schema
-- Run against: Supabase SQL Editor or `supabase db push`
-- ============================================================

-- ────────────────────────────────────────────
-- EVENTS
-- ────────────────────────────────────────────
create table if not exists events (
  id                          text        primary key,         -- ULID
  short_token                 text        unique not null,      -- 10-char nanoid, guest URL key
  host_id                     uuid        references auth.users(id) on delete set null,
  prompt                      text        not null,
  title                       text        not null,
  description                 text        not null,
  theme_name                  text        not null,
  theme_colors                jsonb       not null,            -- {primary,secondary,background,text}
  ui_style                    text        not null
                              check (ui_style in ('elegant','playful','minimal','bold','romantic')),
  is_rtl                      boolean     not null default false,
  date                        text        not null,            -- human-readable, AI-generated
  time                        text        not null,
  location                    text        not null,
  schedule                    jsonb       not null,            -- [{time,title,description}]
  vibe                        text        not null,
  welcome_message             text        not null,
  images                      jsonb       not null,            -- {hero,details,rsvp,timeline[]}
  plan                        text        not null default 'free'
                              check (plan in ('free','party','unlimited')),
  event_date_utc              timestamptz,                     -- parsed ISO, used by cron
  photo_collection_started_at timestamptz,                     -- set by cron after emails sent
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- Auto-update updated_at on every row change
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_updated_at
  before update on events
  for each row execute function set_updated_at();

-- ────────────────────────────────────────────
-- GUESTS (RSVPs)
-- ────────────────────────────────────────────
create table if not exists guests (
  id           text        primary key,                        -- ULID
  event_id     text        not null references events(id) on delete cascade,
  name         text        not null check (char_length(name) between 1 and 100),
  email        text        not null,
  attending    boolean     not null,
  bringing     text,
  upload_token text        unique,                             -- nanoid-20, photo upload link
  rsvp_at      timestamptz not null default now(),
  unique (event_id, email)                                     -- idempotency: one RSVP per email per event
);

-- ────────────────────────────────────────────
-- PHOTOS
-- ────────────────────────────────────────────
create table if not exists photos (
  id           text        primary key,                        -- ULID
  event_id     text        not null references events(id) on delete cascade,
  guest_id     text        references guests(id) on delete set null,
  storage_path text        not null,                           -- Supabase Storage object path
  public_url   text        not null,                           -- CDN URL
  uploaded_at  timestamptz not null default now(),
  ai_score     integer     check (ai_score between 0 and 100),
  ai_tags      text[],
  in_gallery   boolean     not null default false,
  is_blurry    boolean
);

-- ────────────────────────────────────────────
-- AI CONFIG (single row, admin-controlled)
-- ────────────────────────────────────────────
create table if not exists ai_config (
  id              text        primary key default 'current',
  text_provider   text        not null default 'gemini'
                  check (text_provider in ('gemini','claude','openai')),
  image_provider  text        not null default 'gemini-image'
                  check (image_provider in ('gemini-image')),
  updated_at      timestamptz not null default now()
);

-- Seed default row so getAIConfig() always finds something
insert into ai_config (id, text_provider, image_provider)
values ('current', 'gemini', 'gemini-image')
on conflict (id) do nothing;

-- ────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────
alter table events    enable row level security;
alter table guests    enable row level security;
alter table photos    enable row level security;
alter table ai_config enable row level security;

-- EVENTS: anyone can read; only the owning host (or anon insert) can write
create policy "events_public_read"
  on events for select
  using (true);

create policy "events_host_insert"
  on events for insert
  with check (host_id = auth.uid() or host_id is null);

create policy "events_host_update"
  on events for update
  using (host_id = auth.uid());

create policy "events_host_delete"
  on events for delete
  using (host_id = auth.uid());

-- GUESTS: anyone can insert (RSVP); host reads their own event's guests
create policy "guests_public_rsvp"
  on guests for insert
  with check (true);

create policy "guests_host_read"
  on guests for select
  using (
    exists (
      select 1 from events
      where events.id = guests.event_id
        and events.host_id = auth.uid()
    )
  );

create policy "guests_host_update"
  on guests for update
  using (
    exists (
      select 1 from events
      where events.id = guests.event_id
        and events.host_id = auth.uid()
    )
  );

-- PHOTOS: host reads their event's photos
create policy "photos_host_read"
  on photos for select
  using (
    exists (
      select 1 from events
      where events.id = photos.event_id
        and events.host_id = auth.uid()
    )
  );

-- AI_CONFIG: NO direct client access — all reads/writes go through
-- server route handlers using SUPABASE_SERVICE_ROLE_KEY which bypasses RLS
create policy "ai_config_service_role_only"
  on ai_config for all
  using (false)
  with check (false);

-- ────────────────────────────────────────────
-- INDEXES
-- ────────────────────────────────────────────
-- List events by host, newest first
create index if not exists events_host_id_created_at
  on events (host_id, created_at desc);

-- Find events ready for photo collection cron
create index if not exists events_cron_scan
  on events (event_date_utc)
  where photo_collection_started_at is null;

-- Guest lookup by upload_token (photo upload flow)
create index if not exists guests_upload_token
  on guests (upload_token)
  where upload_token is not null;

-- Photos gallery query per event
create index if not exists photos_event_gallery
  on photos (event_id, in_gallery, ai_score desc);
