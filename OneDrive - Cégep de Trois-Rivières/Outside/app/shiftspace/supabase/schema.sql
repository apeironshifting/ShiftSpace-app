-- ShiftSpace Supabase schema
-- Run this in the Supabase SQL Editor for your project.

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  name text not null default '',
  bio text default '',
  avatar_url text default '',
  banner_url text default '',
  is_public boolean default false,
  following text[] default '{}',
  follower_count integer default 0,
  shifting_status text,
  liked_journal_ids text[] default '{}',
  affirmations jsonb default '[]',
  affirmation_interval integer default 5,
  current_affirmation_index integer default 0,
  last_affirmation_change bigint default (extract(epoch from now()) * 1000)::bigint,
  posters jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Per-user app data (scripts, journals, places, pages)
create table if not exists public.user_app_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  scripts jsonb default '[]',
  journal_entries jsonb default '[]',
  places jsonb default '[]',
  pages jsonb default '[]',
  updated_at timestamptz default now()
);

-- Chat conversations
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_ids uuid[] not null,
  created_at timestamptz default now()
);

-- Chat messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Info page sections (shared content)
create table if not exists public.info_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  blocks jsonb default '[]',
  sort_order integer default 0,
  updated_at timestamptz default now()
);

-- Auto-create profile + app data on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'name', '')
  );
  insert into public.user_app_data (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Username-based login helper (returns email for signInWithPassword)
create or replace function public.get_login_email(p_username text)
returns text
language sql
security definer
set search_path = public
as $$
  select u.email
  from auth.users u
  join public.profiles p on p.id = u.id
  where lower(p.username) = lower(p_username)
  limit 1;
$$;

-- Delete own account (called by authenticated user)
create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.user_app_data enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.info_sections enable row level security;

-- Profiles policies
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- User app data policies
create policy "Users can view own app data"
  on public.user_app_data for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can upsert own app data"
  on public.user_app_data for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own app data"
  on public.user_app_data for update
  to authenticated
  using (auth.uid() = user_id);

-- Conversations policies
create policy "Users can view own conversations"
  on public.conversations for select
  to authenticated
  using (auth.uid() = any(participant_ids));

create policy "Users can create conversations they participate in"
  on public.conversations for insert
  to authenticated
  with check (auth.uid() = any(participant_ids));

create policy "Users can delete own conversations"
  on public.conversations for delete
  to authenticated
  using (auth.uid() = any(participant_ids));

-- Messages policies
create policy "Users can view messages in their conversations"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and auth.uid() = any(c.participant_ids)
    )
  );

create policy "Users can send messages in their conversations"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and auth.uid() = any(c.participant_ids)
    )
  );

create policy "Users can update messages in their conversations"
  on public.messages for update
  to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and auth.uid() = any(c.participant_ids)
    )
  );

-- Info sections policies (readable/writable by all authenticated users)
create policy "Authenticated users can read info sections"
  on public.info_sections for select
  to authenticated
  using (true);

create policy "Authenticated users can manage info sections"
  on public.info_sections for all
  to authenticated
  using (true)
  with check (true);

-- Storage bucket for media uploads
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

create policy "Anyone can view media"
  on storage.objects for select
  to public
  using (bucket_id = 'media');

create policy "Users can update own media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media');

create policy "Users can delete own media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');

-- Enable realtime for messages
alter publication supabase_realtime add table public.messages;
