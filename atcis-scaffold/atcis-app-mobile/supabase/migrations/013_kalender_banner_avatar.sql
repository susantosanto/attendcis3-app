-- 013 RLS kalender + pengumuman + avatar (polish, 1 Nov 2026)
alter table schedules enable row level security;
alter table holidays enable row level security;

drop policy if exists "schedules_read" on schedules;
create policy "schedules_read" on schedules for select to authenticated using (true);
drop policy if exists "schedules_admin" on schedules;
create policy "schedules_admin" on schedules for all to authenticated
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('operator','kepsek')))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('operator','kepsek')));

drop policy if exists "holidays_read" on holidays;
create policy "holidays_read" on holidays for select to authenticated using (true);
drop policy if exists "holidays_admin" on holidays;
create policy "holidays_admin" on holidays for all to authenticated
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('operator','kepsek')))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('operator','kepsek')));

drop policy if exists "school_config_admin" on school_config;
create policy "school_config_admin" on school_config for update to authenticated
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('operator','kepsek')))
  with check (true);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  judul varchar(150) not null,
  isi varchar(500) not null,
  aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table announcements enable row level security;
drop policy if exists "ann_read" on announcements;
create policy "ann_read" on announcements for select to authenticated using (aktif = true);
drop policy if exists "ann_admin" on announcements;
create policy "ann_admin" on announcements for all to authenticated
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('operator','kepsek')))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('operator','kepsek')));

insert into storage.buckets (id, name, public)
values ('avatars','avatars', true)
on conflict (id) do nothing;
drop policy if exists "avatar_read" on storage.objects;
create policy "avatar_read" on storage.objects for select to anon, authenticated using (bucket_id = 'avatars');
drop policy if exists "avatar_owner_upsert" on storage.objects;
create policy "avatar_owner_upsert" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "avatar_owner_update" on storage.objects;
create policy "avatar_owner_update" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]) with check (bucket_id = 'avatars');
