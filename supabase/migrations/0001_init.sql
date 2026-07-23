-- StreakFit 初期スキーマ(MVP)
-- 認証は Supabase auth.users を利用。全テーブルに RLS を設定し、自分のデータのみ参照/更新可。
-- ソーシャル(friendships / nudges)は v3 で追加予定。

-- ── profiles ─────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  name          text,
  timezone      text not null default 'Asia/Tokyo',
  reminder_time time,
  created_at    timestamptz not null default now()
);

-- ── videos(保存した YouTube 参照) ──────────────────────
create table if not exists public.videos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  video_id      text not null,
  title         text not null,
  thumbnail_url text,
  channel_name  text,
  duration_sec  integer,
  tags          text[] default '{}',
  added_at      timestamptz not null default now(),
  unique (user_id, video_id)
);
create index if not exists videos_user_idx on public.videos (user_id);

-- ── workout_logs(日々の達成記録) ──────────────────────
create table if not exists public.workout_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  date         date not null,
  video_id     text not null,
  completed_at timestamptz not null default now(),
  xp_earned    integer not null default 10,
  unique (user_id, date)  -- 1日1完了(緩め判定)
);
create index if not exists workout_logs_user_date_idx
  on public.workout_logs (user_id, date desc);

-- ── streaks ──────────────────────────────────────────────
create table if not exists public.streaks (
  user_id             uuid primary key references auth.users (id) on delete cascade,
  current             integer not null default 0,
  longest             integer not null default 0,
  last_completed_date date,
  freeze_count        integer not null default 2
);

-- ── RLS ──────────────────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.videos        enable row level security;
alter table public.workout_logs  enable row level security;
alter table public.streaks       enable row level security;

create policy "own profile"  on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own videos"   on public.videos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own logs"     on public.workout_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own streak"   on public.streaks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── 新規ユーザー登録時に profiles / streaks を自動作成 ───
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
    values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Athlete'));
  insert into public.streaks (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
